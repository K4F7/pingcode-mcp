import { z } from "zod";
import { compactParams, jsonResponse, paginationSchema, resourcePath, type ToolContext } from "./common.js";

const projectTypeSchema = z.enum(["scrum", "kanban", "waterfall", "hybrid"]);
const projectScopeTypeSchema = z.enum(["organization", "user_group"]);
const projectVisibilitySchema = z.enum(["public", "private"]);
const projectMemberSchema = z.object({
  id: z.string().min(1).describe("Enterprise user or user group id."),
  type: z.enum(["user", "user_group"]).describe("Project member type."),
});
const projectPropertiesSchema = z.record(z.string(), z.unknown()).optional();

export function registerProjectTools({ server, client }: ToolContext): void {
  server.tool(
    "pingcode_list_projects",
    "List PingCode projects. Wraps GET /v1/project/projects.",
    {
      identifier: z.string().optional().describe("Project identifier."),
      type: projectTypeSchema.optional().describe("Project type."),
      include_deleted: z.boolean().optional().describe("Whether to include deleted projects."),
      include_archived: z.boolean().optional().describe("Whether to include archived projects."),
      ...paginationSchema,
    },
    async (args) => jsonResponse(await client.get("/v1/project/projects", compactParams(args))),
  );

  server.tool(
    "pingcode_create_project",
    "Create a PingCode project. This writes to PingCode via POST /v1/project/projects.",
    {
      scope_type: projectScopeTypeSchema.optional().describe("Project scope type; defaults to organization."),
      scope_id: z.string().optional().describe("Scope id; required when scope_type is user_group."),
      name: z.string().min(1).max(255).describe("Project name."),
      visibility: projectVisibilitySchema.optional().describe("Project visibility; defaults to private."),
      type: projectTypeSchema.describe("Project type."),
      identifier: z.string().min(1).max(15).describe("Unique project identifier."),
      description: z.string().optional().describe("Project description."),
      members: z.array(projectMemberSchema).optional().describe("Initial project members."),
      start_at: z.number().int().optional().describe("Project start timestamp in seconds."),
      end_at: z.number().int().optional().describe("Project end timestamp in seconds."),
      assignee_id: z.string().optional().describe("Project assignee user id."),
    },
    async (args) => jsonResponse(await client.post("/v1/project/projects", compactParams(args))),
  );

  server.tool(
    "pingcode_update_project",
    "Partially update a PingCode project. This writes to PingCode via PATCH /v1/project/projects/{project_id}.",
    {
      project_id: z.string().min(1).describe("PingCode project id."),
      name: z.string().min(1).max(255).optional().describe("Project name."),
      identifier: z.string().min(1).max(15).optional().describe("Unique project identifier."),
      description: z.string().optional().describe("Project description."),
      start_at: z.number().int().optional().describe("Project start timestamp in seconds."),
      end_at: z.number().int().optional().describe("Project end timestamp in seconds."),
      assignee_id: z.string().optional().describe("Project assignee user id."),
      state_id: z.string().optional().describe("Project state id."),
      properties: projectPropertiesSchema.describe("Project custom properties object."),
    },
    async ({ project_id, ...body }) =>
      jsonResponse(
        await client.patch(
          resourcePath("/v1/project/projects/{project_id}", { project_id }),
          compactParams(body),
        ),
      ),
  );

  server.tool(
    "pingcode_list_project_members",
    "List members in a PingCode project. Wraps GET /v1/project/projects/{project_id}/members.",
    {
      project_id: z.string().min(1).describe("PingCode project id."),
    },
    async ({ project_id }) =>
      jsonResponse(await client.get(resourcePath("/v1/project/projects/{project_id}/members", { project_id }))),
  );
}
