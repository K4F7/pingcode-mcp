import { z } from "zod";
import { compactParams, jsonResponse, resourcePath, type ToolContext } from "./common.js";

const releaseStatusSchema = z.enum(["pending", "in_progress", "published"]);
const sprintStatusSchema = z.enum(["pending", "in_progress", "completed"]);

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
    "Create a PingCode release/version. Wraps POST /v1/project/projects/{project_id}/versions.",
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
    "Partially update a PingCode release/version. Wraps PATCH /v1/project/projects/{project_id}/versions/{version_id}.",
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
    },
    async ({ project_id, ...query }) =>
      jsonResponse(
        await client.get(
          resourcePath("/v1/project/projects/{project_id}/sprints", { project_id }),
          compactParams(query),
        ),
      ),
  );
}
