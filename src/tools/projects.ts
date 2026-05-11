import { z } from "zod";
import { compactParams, jsonResponse, resourcePath, type ToolContext } from "./common.js";

const projectTypeSchema = z.enum(["scrum", "kanban", "waterfall", "hybrid"]);

export function registerProjectTools({ server, client }: ToolContext): void {
  server.tool(
    "pingcode_list_projects",
    "List PingCode projects. Wraps GET /v1/project/projects.",
    {
      identifier: z.string().optional().describe("Project identifier."),
      type: projectTypeSchema.optional().describe("Project type."),
      include_deleted: z.boolean().optional().describe("Whether to include deleted projects."),
      include_archived: z.boolean().optional().describe("Whether to include archived projects."),
    },
    async (args) => jsonResponse(await client.get("/v1/project/projects", compactParams(args))),
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
