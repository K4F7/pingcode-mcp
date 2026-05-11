import { z } from "zod";
import type { PageResult, PingCodeWorkItem } from "../pingcode/types.js";
import { compactParams, jsonResponse, resourcePath, type ToolContext } from "./common.js";

export function registerContextTools({ server, client }: ToolContext): void {
  server.tool(
    "pingcode_get_work_item_context",
    "Get aggregated development context for a work item: item details, comments, attachments, activities, relations, project releases, and sprints.",
    {
      work_item_id: z.string().min(1).describe("PingCode work item id."),
      project_id: z.string().optional().describe("Project id. If omitted, the tool tries to infer it from the work item."),
      include_comments: z.boolean().default(true).describe("Include comments."),
      include_attachments: z.boolean().default(true).describe("Include attachments."),
      include_activities: z.boolean().default(true).describe("Include activity timeline."),
      include_relations: z.boolean().default(true).describe("Include generic and work-item relations."),
      include_releases: z.boolean().default(true).describe("Include project releases when project_id is known."),
      include_sprints: z.boolean().default(true).describe("Include project sprints when project_id is known."),
    },
    async ({ work_item_id, project_id, ...options }) => {
      const workItemList = await client.get<PageResult<PingCodeWorkItem>>("/v1/project/work_items", {
        include_deleted: false,
        include_archived: false,
      });
      const workItem = (workItemList.values ?? []).find((item) => item.id === work_item_id) ?? null;
      const resolvedProjectId = project_id ?? resolveProjectId(workItem);

      const context: Record<string, unknown> = {
        work_item_id,
        project_id: resolvedProjectId,
        work_item: workItem,
      };

      const requests: Array<Promise<void>> = [];

      if (options.include_comments) {
        requests.push(
          client
            .get("/v1/comments", { principal_type: "work_item", principal_id: work_item_id })
            .then((value) => {
              context.comments = value;
            }),
        );
      }

      if (options.include_attachments) {
        requests.push(
          client
            .get("/v1/attachments", { principal_type: "work_item", principal_id: work_item_id })
            .then((value) => {
              context.attachments = value;
            }),
        );
      }

      if (options.include_activities) {
        requests.push(
          client
            .get("/v1/activities", { principal_type: "work_item", principal_id: work_item_id })
            .then((value) => {
              context.activities = value;
            }),
        );
      }

      if (options.include_relations) {
        requests.push(
          client
            .get(resourcePath("/v1/project/work_items/{work_item_id}/relations", { work_item_id }))
            .then((value) => {
              context.work_item_relations = value;
            }),
        );
      }

      if (resolvedProjectId && options.include_releases) {
        requests.push(
          client
            .get(resourcePath("/v1/project/projects/{project_id}/versions", { project_id: resolvedProjectId }))
            .then((value) => {
              context.releases = value;
            }),
        );
      }

      if (resolvedProjectId && options.include_sprints) {
        requests.push(
          client
            .get(resourcePath("/v1/project/projects/{project_id}/sprints", { project_id: resolvedProjectId }))
            .then((value) => {
              context.sprints = value;
            }),
        );
      }

      const settled = await Promise.allSettled(requests);
      const errors = settled
        .filter((result): result is PromiseRejectedResult => result.status === "rejected")
        .map((result) => (result.reason instanceof Error ? result.reason.message : String(result.reason)));

      return jsonResponse(compactParams({
        ...context,
        partial_errors: errors.length ? errors : undefined,
      }));
    },
  );
}

function resolveProjectId(workItem: PingCodeWorkItem | null): string | undefined {
  const project = workItem?.project;
  if (typeof project === "object" && project && "id" in project && typeof project.id === "string") {
    return project.id;
  }
  return undefined;
}
