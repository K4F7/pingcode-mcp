import { z } from "zod";
import type { PageResult, PingCodeMember, PingCodeWorkItem } from "../pingcode/types.js";
import { compactParams, jsonResponse, resourcePath, type ToolContext } from "./common.js";

const recommendationQuerySchema = z.object({
  work_item_ids: z.array(z.string()).optional().describe("Specific work item ids to recommend assignees for."),
  keywords: z.string().optional().describe("Keyword filter for work items when work_item_ids is not provided."),
  type_ids: z.array(z.string()).optional().describe("Work item type ids to include."),
  state_ids: z.array(z.string()).optional().describe("Work item state ids to include."),
  priority_ids: z.array(z.string()).optional().describe("Priority ids to include."),
  sprint_ids: z.array(z.string()).optional().describe("Sprint ids to include."),
  version_ids: z.array(z.string()).optional().describe("Release/version ids to include."),
}).optional();

export function registerAssignmentTools({ server, client }: ToolContext): void {
  server.tool(
    "pingcode_recommend_assignees",
    "Recommend assignees for PingCode work items without writing changes. Uses project members and current workload.",
    {
      project_id: z.string().min(1).describe("PingCode project id."),
      query: recommendationQuerySchema,
      candidate_member_ids: z.array(z.string()).optional().describe("Restrict recommendations to these member/user ids."),
      max_work_items: z.number().int().min(1).max(100).default(20).describe("Maximum queried work items to evaluate."),
      avoid_reassigning_assigned: z.boolean().default(true).describe("Avoid recommending changes for already assigned work."),
    },
    async ({ project_id, query, candidate_member_ids, max_work_items, avoid_reassigning_assigned }) => {
      const [membersResponse, workItemsResponse] = await Promise.all([
        client.get<PageResult<PingCodeMember>>(resourcePath("/v1/project/projects/{project_id}/members", { project_id })),
        client.get<PageResult<PingCodeWorkItem>>("/v1/project/work_items", buildWorkItemQuery(project_id, query)),
      ]);

      const members = normalizeMembers(membersResponse.values ?? [], candidate_member_ids);
      const workItems = filterQueriedWorkItems(workItemsResponse.values ?? [], query?.work_item_ids).slice(0, max_work_items);
      const workload = await getCurrentWorkload(client, project_id, members.map((member) => member.id));
      const recommendations = workItems.map((workItem) =>
        recommendAssignee(workItem, members, workload, avoid_reassigning_assigned),
      );

      return jsonResponse({
        project_id,
        recommendations,
        summary: {
          considered_work_items: workItems.length,
          candidate_members: members.length,
          writes_performed: 0,
        },
      });
    },
  );

  server.tool(
    "pingcode_assign_work_items",
    "Explicitly assign PingCode work items. This performs writes via PATCH /v1/project/work_items/{work_item_id}.",
    {
      assignments: z.array(
        z.object({
          work_item_id: z.string().min(1).describe("PingCode work item id."),
          assignee_id: z.string().min(1).describe("Target assignee user id."),
        }),
      ).min(1).max(100),
      reason: z.string().optional().describe("Human-readable reason for audit output."),
    },
    async ({ assignments, reason }) => {
      const results = await Promise.allSettled(
        assignments.map(async ({ work_item_id, assignee_id }) => ({
          work_item_id,
          assignee_id,
          result: await client.patch(
            resourcePath("/v1/project/work_items/{work_item_id}", { work_item_id }),
            { assignee_id },
          ),
        })),
      );

      return jsonResponse({
        reason,
        results: results.map((result, index) => {
          const assignment = assignments[index];
          if (result.status === "fulfilled") {
            return { ...assignment, ok: true, result: result.value.result };
          }
          return { ...assignment, ok: false, error: result.reason instanceof Error ? result.reason.message : String(result.reason) };
        }),
      });
    },
  );
}

function buildWorkItemQuery(projectId: string, query: z.infer<typeof recommendationQuerySchema>): Record<string, unknown> {
  return compactParams({
    project_ids: [projectId],
    type_ids: query?.type_ids,
    state_ids: query?.state_ids,
    priority_ids: query?.priority_ids,
    sprint_ids: query?.sprint_ids,
    version_ids: query?.version_ids,
    keywords: query?.keywords,
    include_deleted: false,
    include_archived: false,
  });
}

function filterQueriedWorkItems(workItems: PingCodeWorkItem[], workItemIds?: string[]): PingCodeWorkItem[] {
  if (!workItemIds?.length) {
    return workItems;
  }

  const ids = new Set(workItemIds);
  return workItems.filter((workItem) => ids.has(workItem.id));
}

function normalizeMembers(members: PingCodeMember[], candidateMemberIds?: string[]): CandidateMember[] {
  const allowedIds = candidateMemberIds?.length ? new Set(candidateMemberIds) : undefined;
  return members
    .map((member) => {
      const userId = member.user?.id ?? member.id;
      return {
        id: userId,
        member_id: member.id,
        name: member.user?.display_name ?? member.user?.name ?? userId,
      };
    })
    .filter((member) => !allowedIds || allowedIds.has(member.id) || allowedIds.has(member.member_id));
}

async function getCurrentWorkload(
  client: ToolContext["client"],
  projectId: string,
  assigneeIds: string[],
): Promise<Map<string, number>> {
  const workload = new Map(assigneeIds.map((id) => [id, 0]));
  if (!assigneeIds.length) {
    return workload;
  }

  const response = await client.get<PageResult<PingCodeWorkItem>>("/v1/project/work_items", {
    project_ids: [projectId],
    assignee_ids: assigneeIds,
    include_deleted: false,
    include_archived: false,
  });

  for (const workItem of response.values ?? []) {
    const assigneeId = workItem.assignee?.id;
    if (assigneeId) {
      workload.set(assigneeId, (workload.get(assigneeId) ?? 0) + 1);
    }
  }

  return workload;
}

function recommendAssignee(
  workItem: PingCodeWorkItem,
  members: CandidateMember[],
  workload: Map<string, number>,
  avoidReassigningAssigned: boolean,
): AssignmentRecommendation {
  const currentAssigneeId = workItem.assignee?.id;
  if (avoidReassigningAssigned && currentAssigneeId) {
    return {
      work_item_id: workItem.id,
      identifier: workItem.identifier,
      title: workItem.title,
      current_assignee_id: currentAssigneeId,
      recommended_assignee_id: currentAssigneeId,
      confidence: 0.7,
      reasons: ["Work item already has an assignee; keeping existing ownership."],
    };
  }

  const sorted = [...members].sort((a, b) => (workload.get(a.id) ?? 0) - (workload.get(b.id) ?? 0));
  const recommended = sorted[0];

  if (!recommended) {
    return {
      work_item_id: workItem.id,
      identifier: workItem.identifier,
      title: workItem.title,
      current_assignee_id: currentAssigneeId,
      recommended_assignee_id: null,
      confidence: 0,
      reasons: ["No candidate project members were available."],
    };
  }

  return {
    work_item_id: workItem.id,
    identifier: workItem.identifier,
    title: workItem.title,
    current_assignee_id: currentAssigneeId,
    recommended_assignee_id: recommended.id,
    recommended_assignee_name: recommended.name,
    confidence: 0.55,
    reasons: [
      `Selected the candidate with the lowest current open workload (${workload.get(recommended.id) ?? 0} work items).`,
      "This is a recommendation only; use pingcode_assign_work_items to apply it explicitly.",
    ],
  };
}

interface CandidateMember {
  id: string;
  member_id: string;
  name: string;
}

interface AssignmentRecommendation {
  work_item_id: string;
  identifier?: string;
  title?: string;
  current_assignee_id?: string;
  recommended_assignee_id: string | null;
  recommended_assignee_name?: string;
  confidence: number;
  reasons: string[];
}
