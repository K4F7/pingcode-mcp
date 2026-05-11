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

const genericRelationSchema = {
  principal_type: principalTypeSchema.describe("Source artifact type."),
  principal_id: z.string().min(1).describe("Source artifact id."),
  target_type: relationTargetTypeSchema.describe("Target artifact type."),
};

const genericRelationCreateSchema = {
  ...genericRelationSchema,
  target_id: z.string().min(1).describe("Target artifact id."),
};

function isWorkItemRelation(args: { principal_type: string; target_type: string }): boolean {
  return args.principal_type === "work_item" && args.target_type === "work_item";
}

function rejectWorkItemRelation() {
  return jsonResponse({
    ok: false,
    error: "Generic relation tools do not support work_item-to-work_item relations. Use pingcode_link_work_items and pingcode_list_work_item_relations instead.",
  });
}

export function registerRelationTools({ server, client }: ToolContext): void {
  server.tool(
    "pingcode_list_relations",
    "List generic non-work_item-to-work_item relations for a PingCode artifact. Wraps GET /v1/relations; use pingcode_list_work_item_relations for work item links.",
    genericRelationSchema,
    async (args) => {
      if (isWorkItemRelation(args)) {
        return rejectWorkItemRelation();
      }
      return jsonResponse(await client.get("/v1/relations", compactParams(args)));
    },
  );

  server.tool(
    "pingcode_create_relation",
    "Create a generic non-work_item-to-work_item relation between PingCode artifacts. Wraps POST /v1/relations; use pingcode_link_work_items for work item links.",
    genericRelationCreateSchema,
    async (args) => {
      if (isWorkItemRelation(args)) {
        return rejectWorkItemRelation();
      }
      return jsonResponse(await client.post("/v1/relations", compactParams(args)));
    },
  );

  server.tool(
    "pingcode_delete_relation",
    "Delete a generic /v1/relations relation. This cannot delete work item links created by pingcode_link_work_items.",
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
