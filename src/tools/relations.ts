import { z } from "zod";
import { compactParams, jsonResponse, resourcePath, type ToolContext } from "./common.js";
import { principalTypeSchema } from "./collaboration.js";

const relationTargetTypeSchema = z.enum([
  "work_item",
  "test_case",
  "test_run",
  "ticket",
  "idea",
  "page",
]);

export function registerRelationTools({ server, client }: ToolContext): void {
  server.tool(
    "pingcode_list_relations",
    "List generic relations for a PingCode artifact. Wraps GET /v1/relations; use pingcode_list_work_item_relations for work_item-to-work_item relations.",
    {
      principal_type: principalTypeSchema.describe("Source artifact type."),
      principal_id: z.string().min(1).describe("Source artifact id."),
      target_type: relationTargetTypeSchema.describe("Target artifact type filter required by PingCode."),
    },
    async (args) => jsonResponse(await client.get("/v1/relations", compactParams(args))),
  );

  server.tool(
    "pingcode_create_relation",
    "Create a generic relation between two PingCode artifacts. This writes to PingCode via POST /v1/relations; use pingcode_link_work_items for work_item-to-work_item links.",
    {
      principal_type: principalTypeSchema.describe("Source artifact type."),
      principal_id: z.string().min(1).describe("Source artifact id."),
      target_type: relationTargetTypeSchema.describe("Target artifact type."),
      target_id: z.string().min(1).describe("Target artifact id."),
    },
    async (args) => jsonResponse(await client.post("/v1/relations", compactParams(args))),
  );

  server.tool(
    "pingcode_delete_relation",
    "Delete a PingCode artifact relation. This writes to PingCode via DELETE /v1/relations/{relation_id}.",
    {
      relation_id: z.string().min(1).describe("Relation id."),
    },
    async ({ relation_id }) =>
      jsonResponse(await client.delete(resourcePath("/v1/relations/{relation_id}", { relation_id }))),
  );

  server.tool(
    "pingcode_list_work_item_relations",
    "List work-item-to-work-item relations. Wraps GET /v1/project/work_items/{work_item_id}/relations.",
    {
      work_item_id: z.string().min(1).describe("Source work item id."),
      relation_type: z.string().optional().describe("Optional relation type filter."),
    },
    async ({ work_item_id, ...query }) =>
      jsonResponse(
        await client.get(
          resourcePath("/v1/project/work_items/{work_item_id}/relations", { work_item_id }),
          compactParams(query),
        ),
      ),
  );

  server.tool(
    "pingcode_link_work_items",
    "Create a relation between two PingCode work items. This writes to PingCode via POST /v1/project/work_items/{work_item_id}/relations.",
    {
      work_item_id: z.string().min(1).describe("Source work item id."),
      target_work_item_id: z.string().min(1).describe("Target work item id."),
      relation_type: z.string().min(1).describe("Relation type, e.g. relate."),
    },
    async ({ work_item_id, ...body }) =>
      jsonResponse(
        await client.post(
          resourcePath("/v1/project/work_items/{work_item_id}/relations", { work_item_id }),
          compactParams(body),
        ),
      ),
  );
}
