import { z } from "zod";
import { compactParams, jsonResponse, paginationSchema, resourcePath, type ToolContext } from "./common.js";

const releaseStatusSchema = z.enum(["pending", "in_progress", "published"]);
const sprintStatusSchema = z.enum(["pending", "in_progress", "completed"]);

const sprintCreateSchema = {
  project_id: z.string().min(1).describe("PingCode project id."),
  name: z.string().min(1).describe("Sprint name."),
  start_at: z.number().int().describe("Sprint start timestamp in seconds."),
  end_at: z.number().int().describe("Sprint end timestamp in seconds."),
  assignee_id: z.string().min(1).describe("Sprint assignee user id."),
  description: z.string().optional().describe("Sprint description."),
  status: sprintStatusSchema.optional().describe("Sprint status."),
  category_ids: z.array(z.string()).optional().describe("Sprint category ids."),
};

const sprintUpdateSchema = {
  project_id: z.string().min(1).describe("PingCode project id."),
  sprint_id: z.string().min(1).describe("PingCode sprint id."),
  name: z.string().optional().describe("Sprint name."),
  start_at: z.number().int().optional().describe("Sprint start timestamp in seconds."),
  end_at: z.number().int().optional().describe("Sprint end timestamp in seconds."),
  assignee_id: z.string().optional().describe("Sprint assignee user id."),
  description: z.string().optional().describe("Sprint description."),
  status: sprintStatusSchema.optional().describe("Sprint status."),
  category_ids: z.array(z.string()).optional().describe("Sprint category ids."),
};

export function registerReleaseTools({ server, client }: ToolContext): void {
  server.tool(
    "pingcode_list_releases",
    "List PingCode releases/versions for a project. Wraps GET /v1/project/projects/{project_id}/versions.",
    {
      project_id: z.string().min(1).describe("PingCode project id."),
      name: z.string().optional().describe("Release name filter."),
      status: releaseStatusSchema.optional().describe("Release status."),
      created_between: z.string().optional().describe("Creation timestamp range, e.g. 1580000000,1590000000."),
      updated_between: z.string().optional().describe("Update timestamp range, e.g. 1580000000,1590000000."),
      ...paginationSchema,
    },
    async ({ project_id, ...query }) =>
      jsonResponse(
        await client.get(
          resourcePath("/v1/project/projects/{project_id}/versions", { project_id }),
          compactParams(query),
        ),
      ),
  );

  server.tool(
    "pingcode_create_release",
    "Create a PingCode release/version. This writes to PingCode via POST /v1/project/projects/{project_id}/versions.",
    {
      project_id: z.string().min(1).describe("PingCode project id."),
      name: z.string().min(1).describe("Release name."),
      start_at: z.number().int().describe("Release start timestamp in seconds."),
      end_at: z.number().int().describe("Release end timestamp in seconds."),
      assignee_id: z.string().min(1).describe("Release assignee user id."),
      stage_id: z.string().optional().describe("Release stage id."),
      category_ids: z.array(z.string()).optional().describe("Release category ids."),
    },
    async ({ project_id, ...body }) =>
      jsonResponse(await client.post(resourcePath("/v1/project/projects/{project_id}/versions", { project_id }), compactParams(body))),
  );

  server.tool(
    "pingcode_update_release",
    "Partially update a PingCode release/version. This writes to PingCode via PATCH /v1/project/projects/{project_id}/versions/{version_id}.",
    {
      project_id: z.string().min(1).describe("PingCode project id."),
      version_id: z.string().min(1).describe("PingCode release/version id."),
      name: z.string().optional().describe("Release name."),
      start_at: z.number().int().optional().describe("Release start timestamp in seconds."),
      end_at: z.number().int().optional().describe("Release end timestamp in seconds."),
      assignee_id: z.string().optional().describe("Release assignee user id."),
      stage_id: z.string().optional().describe("Release stage id."),
      operate_at: z.number().int().optional().describe("Stage operation timestamp in seconds; pass with stage_id."),
      category_ids: z.array(z.string()).optional().describe("Release category ids."),
    },
    async ({ project_id, version_id, ...body }) =>
      jsonResponse(
        await client.patch(
          resourcePath("/v1/project/projects/{project_id}/versions/{version_id}", { project_id, version_id }),
          compactParams(body),
        ),
      ),
  );

  server.tool(
    "pingcode_list_sprints",
    "List PingCode sprints for a project. Wraps GET /v1/project/projects/{project_id}/sprints.",
    {
      project_id: z.string().min(1).describe("PingCode project id."),
      name: z.string().optional().describe("Sprint name filter."),
      status: sprintStatusSchema.optional().describe("Sprint status."),
      created_between: z.string().optional().describe("Creation timestamp range."),
      updated_between: z.string().optional().describe("Update timestamp range."),
      ...paginationSchema,
    },
    async ({ project_id, ...query }) =>
      jsonResponse(
        await client.get(
          resourcePath("/v1/project/projects/{project_id}/sprints", { project_id }),
          compactParams(query),
        ),
      ),
  );

  server.tool(
    "pingcode_create_sprint",
    "Create a PingCode sprint. This writes to PingCode via POST /v1/project/projects/{project_id}/sprints.",
    sprintCreateSchema,
    async ({ project_id, ...body }) =>
      jsonResponse(
        await client.post(
          resourcePath("/v1/project/projects/{project_id}/sprints", { project_id }),
          compactParams(body),
        ),
      ),
  );

  server.tool(
    "pingcode_update_sprint",
    "Partially update a PingCode sprint. This writes to PingCode via PATCH /v1/project/projects/{project_id}/sprints/{sprint_id}.",
    sprintUpdateSchema,
    async ({ project_id, sprint_id, ...body }) =>
      jsonResponse(
        await client.patch(
          resourcePath("/v1/project/projects/{project_id}/sprints/{sprint_id}", { project_id, sprint_id }),
          compactParams(body),
        ),
      ),
  );

  server.tool(
    "pingcode_close_sprint",
    "Close a PingCode sprint by setting status to completed. This writes to PingCode via PATCH /v1/project/projects/{project_id}/sprints/{sprint_id}.",
    {
      project_id: z.string().min(1).describe("PingCode project id."),
      sprint_id: z.string().min(1).describe("PingCode sprint id."),
    },
    async ({ project_id, sprint_id }) =>
      jsonResponse(
        await client.patch(
          resourcePath("/v1/project/projects/{project_id}/sprints/{sprint_id}", { project_id, sprint_id }),
          { status: "completed" },
        ),
      ),
  );

  server.tool(
    "pingcode_assign_work_items_to_sprint",
    "Assign work items to a sprint. This writes to PingCode via PATCH /v1/project/work_items.",
    {
      ids: z.array(z.string().min(1)).min(1).max(100).describe("Work item ids."),
      sprint_id: z.string().min(1).describe("Sprint id to assign."),
    },
    async ({ ids, sprint_id }) => {
      const results = [];
      let updatedCount = 0;
      let failedCount = 0;

      for (const [index, work_item_id] of ids.entries()) {
        try {
          const result = await client.patch(
            resourcePath("/v1/project/work_items/{work_item_id}", { work_item_id }),
            { sprint_id },
          );
          updatedCount += 1;
          results.push({ index, work_item_id, ok: true, result });
        } catch (error) {
          failedCount += 1;
          const message = error instanceof Error ? error.message : String(error);
          results.push({ index, work_item_id, ok: false, error: message });
        }
      }

      if (updatedCount === 0) {
        throw new Error(
          `No work items were assigned to sprint ${sprint_id}. Check that the sprint and work items are in a scrum/hybrid project, the IDs belong to the same project, the work item types support sprints, and the token can update work items.`,
        );
      }

      return jsonResponse({ updated_count: updatedCount, failed_count: failedCount, results });
    },
  );
}
