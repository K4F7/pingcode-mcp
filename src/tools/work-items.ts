import { z } from "zod";
import { compactParams, jsonResponse, paginationSchema, resourcePath, type ToolContext } from "./common.js";

type WorkItemSummary = {
  id: unknown;
  identifier: unknown;
  title: unknown;
  type: unknown;
  assignee: unknown;
  state: unknown;
  sprint: unknown;
  parent: unknown;
};

function summarizeWorkItem(item: Record<string, unknown>): WorkItemSummary {
  return {
    id: item.id,
    identifier: item.identifier,
    title: item.title,
    type: item.type,
    assignee: summarizeNamedObject(item.assignee),
    state: summarizeNamedObject(item.state),
    sprint: summarizeNamedObject(item.sprint),
    parent: summarizeParent(item.parent),
  };
}

function summarizeNamedObject(value: unknown): unknown {
  if (!value || typeof value !== "object") {
    return null;
  }
  const object = value as Record<string, unknown>;
  return {
    id: object.id,
    name: object.display_name ?? object.name,
    type: object.type,
  };
}

function summarizeParent(value: unknown): unknown {
  if (!value || typeof value !== "object") {
    return null;
  }
  const object = value as Record<string, unknown>;
  return {
    id: object.id,
    identifier: object.identifier,
    title: object.title,
  };
}

function summarizeWorkItemsResponse(response: unknown): unknown {
  if (!response || typeof response !== "object") {
    return response;
  }
  const data = response as Record<string, unknown>;
  const values = Array.isArray(data.values) ? data.values : [];
  return {
    page_index: data.page_index,
    page_size: data.page_size,
    total: data.total,
    values: values.map((item) => summarizeWorkItem(item as Record<string, unknown>)),
  };
}

function sprintProgressSummary(response: unknown): unknown {
  const compact = summarizeWorkItemsResponse(response) as Record<string, unknown>;
  const values = Array.isArray(compact.values) ? compact.values as WorkItemSummary[] : [];
  const byAssignee = new Map<string, { assignee: unknown; total: number; completed: number; remaining: number }>();
  let completed = 0;

  for (const item of values) {
    const state = item.state as Record<string, unknown> | null;
    const assignee = item.assignee as Record<string, unknown> | null;
    const assigneeName = String(assignee?.name ?? "未分配");
    const isCompleted = state?.type === "completed";
    if (isCompleted) {
      completed += 1;
    }

    const current = byAssignee.get(assigneeName) ?? { assignee: item.assignee, total: 0, completed: 0, remaining: 0 };
    current.total += 1;
    if (isCompleted) {
      current.completed += 1;
    } else {
      current.remaining += 1;
    }
    byAssignee.set(assigneeName, current);
  }

  return {
    total: values.length,
    completed,
    remaining: values.length - completed,
    by_assignee: [...byAssignee.values()],
    values,
  };
}

const stringList = z.array(z.string()).optional();
const propertiesSchema = z.record(z.string(), z.unknown()).optional();

const workItemListSchema = {
  identifier: z.string().optional().describe("Work item identifier."),
  project_ids: stringList.describe("Project ids; PingCode accepts up to 20."),
  type_ids: stringList.describe("Work item type ids; PingCode accepts up to 20."),
  parent_ids: stringList.describe("Parent work item ids; PingCode accepts up to 20."),
  assignee_ids: stringList.describe("Assignee ids; PingCode accepts up to 20."),
  state_ids: stringList.describe("State ids; PingCode accepts up to 20."),
  start_between: z.string().optional().describe("Start timestamp range, e.g. 1580000000,1590000000."),
  end_between: z.string().optional().describe("End timestamp range, e.g. 1580000000,1590000000."),
  priority_ids: stringList.describe("Priority ids; PingCode accepts up to 20."),
  bug_type_ids: stringList.describe("Bug type ids; PingCode accepts up to 20."),
  tag_ids: stringList.describe("Tag ids; PingCode accepts up to 20."),
  sprint_ids: stringList.describe("Sprint ids; PingCode accepts up to 20."),
  board_ids: stringList.describe("Board ids; PingCode accepts up to 20."),
  entry_ids: stringList.describe("Board entry ids; PingCode accepts up to 20."),
  swimlane_ids: stringList.describe("Swimlane ids; PingCode accepts up to 20."),
  phase_ids: stringList.describe("Plan/phase ids; PingCode accepts up to 20."),
  version_ids: stringList.describe("Release/version ids; PingCode accepts up to 20."),
  created_by_ids: stringList.describe("Creator ids; PingCode accepts up to 20."),
  created_between: z.string().optional().describe("Creation timestamp range."),
  updated_between: z.string().optional().describe("Update timestamp range."),
  participant_id: z.string().optional().describe("Participant/follower id."),
  keywords: z.string().optional().describe("Keyword; supports identifier and title."),
  include_public_image_token: z.string().optional().describe("Fields that need public image token, comma-separated."),
  include_deleted: z.boolean().optional().describe("Whether to include deleted work items."),
  include_archived: z.boolean().optional().describe("Whether to include archived work items."),
  ...paginationSchema,
};

const workItemCreateSchema = {
  project_id: z.string().min(1).describe("PingCode project id."),
  type_id: z.string().min(1).describe("Work item type id."),
  title: z.string().min(1).describe("Work item title."),
  description: z.string().optional().describe("Work item description."),
  start_at: z.number().int().optional().describe("Start timestamp in seconds."),
  end_at: z.number().int().optional().describe("End timestamp in seconds."),
  priority_id: z.string().optional().describe("Priority id."),
  state_id: z.string().optional().describe("State id."),
  assignee_id: z.string().optional().describe("Assignee user id."),
  parent_id: z.string().optional().describe("Parent work item id."),
  sprint_id: z.string().optional().describe("Sprint id for scrum/hybrid projects."),
  version_ids: z.array(z.string()).optional().describe("Release/version ids."),
  board_id: z.string().optional().describe("Board id for kanban/hybrid projects."),
  entry_id: z.string().optional().describe("Board entry id for kanban/hybrid projects."),
  swimlane_id: z.string().optional().describe("Swimlane id for kanban/hybrid projects."),
  story_points: z.number().optional().describe("Story points."),
  estimated_workload: z.number().optional().describe("Estimated workload."),
  remaining_workload: z.number().optional().describe("Remaining workload."),
  properties: propertiesSchema.describe("Custom properties object."),
  participant_ids: z.array(z.string()).optional().describe("Follower/participant ids."),
};

const workItemUpdateSchema = {
  work_item_id: z.string().min(1).describe("PingCode work item id."),
  title: z.string().optional().describe("Work item title."),
  description: z.string().optional().describe("Work item description."),
  start_at: z.number().int().optional().describe("Start timestamp in seconds."),
  end_at: z.number().int().optional().describe("End timestamp in seconds."),
  priority_id: z.string().optional().describe("Priority id."),
  state_id: z.string().optional().describe("State id."),
  assignee_id: z.string().optional().describe("Assignee user id."),
  parent_id: z.string().optional().describe("Parent work item id."),
  sprint_id: z.string().optional().describe("Sprint id for scrum/hybrid projects."),
  version_ids: z.array(z.string()).optional().describe("Release/version ids."),
  board_id: z.string().optional().describe("Board id for kanban/hybrid projects."),
  entry_id: z.string().optional().describe("Board entry id for kanban/hybrid projects."),
  swimlane_id: z.string().optional().describe("Swimlane id for kanban/hybrid projects."),
  phase_id: z.string().optional().describe("Phase id for waterfall/hybrid projects."),
  story_points: z.number().optional().describe("Story points."),
  estimated_workload: z.number().optional().describe("Estimated workload."),
  remaining_workload: z.number().optional().describe("Remaining workload."),
  properties: propertiesSchema.describe("Custom properties object."),
};

export function registerWorkItemTools({ server, client }: ToolContext): void {
  server.tool(
    "pingcode_list_work_item_types",
    "List work item types for a project. Wraps GET /v1/project/work_item/types.",
    {
      project_id: z.string().min(1).describe("PingCode project id."),
    },
    async ({ project_id }) =>
      jsonResponse(await client.get("/v1/project/work_item/types", { project_id })),
  );

  server.tool(
    "pingcode_list_work_item_states",
    "List work item states for a project and type. Wraps GET /v1/project/work_item/states.",
    {
      project_id: z.string().min(1).describe("PingCode project id."),
      work_item_type_id: z.string().min(1).describe("Work item type id."),
    },
    async (args) => jsonResponse(await client.get("/v1/project/work_item/states", args)),
  );

  server.tool(
    "pingcode_list_work_item_priorities",
    "List work item priorities for a project. Wraps GET /v1/project/work_item/priorities.",
    {
      project_id: z.string().min(1).describe("PingCode project id."),
    },
    async ({ project_id }) =>
      jsonResponse(await client.get("/v1/project/work_item/priorities", { project_id })),
  );

  server.tool(
    "pingcode_list_work_item_properties",
    "List work item properties for a project and type. Wraps GET /v1/project/work_item/properties.",
    {
      project_id: z.string().min(1).describe("PingCode project id."),
      work_item_type_id: z.string().min(1).describe("Work item type id."),
    },
    async (args) => jsonResponse(await client.get("/v1/project/work_item/properties", args)),
  );

  server.tool(
    "pingcode_list_work_items",
    "List PingCode work items. Wraps GET /v1/project/work_items.",
    workItemListSchema,
    async (args) => jsonResponse(await client.get("/v1/project/work_items", compactParams(args))),
  );

  server.tool(
    "pingcode_list_work_items_compact",
    "List PingCode work items with compact fields: identifier, title, assignee, state, sprint, and parent.",
    workItemListSchema,
    async (args) => jsonResponse(summarizeWorkItemsResponse(await client.get("/v1/project/work_items", compactParams(args)))),
  );

  server.tool(
    "pingcode_summarize_sprint_work_items",
    "Summarize work item progress for a sprint by total, completed count, remaining count, and assignee.",
    {
      project_id: z.string().min(1).describe("PingCode project id."),
      sprint_id: z.string().min(1).describe("Sprint id."),
      page_size: z.number().int().min(1).max(100).optional().describe("Page size; PingCode maximum is 100."),
    },
    async ({ project_id, sprint_id, page_size }) =>
      jsonResponse(
        sprintProgressSummary(
          await client.get("/v1/project/work_items", {
            project_ids: project_id,
            sprint_ids: sprint_id,
            page_size: page_size ?? 100,
            page_index: 0,
          }),
        ),
      ),
  );

  server.tool(
    "pingcode_create_work_item",
    "Create a PingCode work item. This writes to PingCode via POST /v1/project/work_items.",
    workItemCreateSchema,
    async (args) => jsonResponse(await client.post("/v1/project/work_items", compactParams(args))),
  );

  server.tool(
    "pingcode_batch_create_work_items",
    "Create multiple PingCode work items sequentially. This writes to PingCode via repeated POST /v1/project/work_items calls.",
    {
      items: z.array(z.object(workItemCreateSchema)).min(1).max(50).describe("Work items to create sequentially."),
      continue_on_error: z.boolean().optional().describe("Continue creating remaining items after an item fails."),
    },
    async ({ items, continue_on_error }) => {
      const results = [];
      let createdCount = 0;
      let failedCount = 0;

      for (const [index, item] of items.entries()) {
        try {
          const result = await client.post("/v1/project/work_items", compactParams(item));
          createdCount += 1;
          results.push({ index, ok: true, result });
        } catch (error) {
          failedCount += 1;
          const message = error instanceof Error ? error.message : String(error);
          results.push({ index, ok: false, error: message });
          if (!continue_on_error) {
            throw error;
          }
        }
      }

      return jsonResponse({ created_count: createdCount, failed_count: failedCount, results });
    },
  );

  server.tool(
    "pingcode_delete_work_item",
    "Delete a PingCode work item. This writes to PingCode via DELETE /v1/project/work_items/{work_item_id}.",
    {
      work_item_id: z.string().min(1).describe("PingCode work item id."),
    },
    async ({ work_item_id }) =>
      jsonResponse(await client.delete(resourcePath("/v1/project/work_items/{work_item_id}", { work_item_id }))),
  );

  server.tool(
    "pingcode_update_work_item",
    "Partially update a PingCode work item. This writes to PingCode via PATCH /v1/project/work_items/{work_item_id}.",
    workItemUpdateSchema,
    async ({ work_item_id, ...body }) =>
      jsonResponse(
        await client.patch(
          resourcePath("/v1/project/work_items/{work_item_id}", { work_item_id }),
          compactParams(body),
        ),
      ),
  );

  server.tool(
    "pingcode_batch_update_work_items",
    "Batch update one PingCode work item property for up to 100 work items. Wraps PATCH /v1/project/work_items.",
    {
      ids: z.array(z.string().min(1)).min(1).max(100).describe("Work item ids."),
      property_name: z.string().min(1).describe("Property to update, e.g. assignee_id, state_id, priority_id, title."),
      property_value: z.unknown().describe("Property value."),
    },
    async (args) => {
      if (args.property_name === "sprint_id") {
        throw new Error(
          "PingCode batch work item update does not support sprint_id; use pingcode_assign_work_items_to_sprint or pingcode_update_work_item instead.",
        );
      }
      return jsonResponse(await client.patch("/v1/project/work_items", args));
    },
  );
}

export { workItemListSchema, workItemUpdateSchema };
