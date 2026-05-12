import { z } from "zod";
import { compactParams, jsonResponse, paginationSchema, resourcePath, type ToolContext } from "./common.js";

const pageFormatSchema = z.enum(["text", "markdown", "html"]);

const pageCreateSchema = {
  space_id: z.string().min(1).describe("Wiki space id."),
  name: z.string().min(1).describe("Page name."),
  parent_id: z.string().optional().describe("Parent page id."),
  content: z.string().optional().describe("Page content."),
  format_type: pageFormatSchema.optional().describe("Content format type."),
};

export function registerWikiTools({ server, client }: ToolContext): void {
  server.tool(
    "pingcode_create_page",
    "Create a PingCode Wiki page. This writes to POST /v1/wiki/pages.",
    pageCreateSchema,
    async (args) => jsonResponse(await client.post("/v1/wiki/pages", compactParams(args))),
  );

  server.tool(
    "pingcode_list_pages",
    "List PingCode Wiki pages in a space. Wraps GET /v1/wiki/pages.",
    {
      space_id: z.string().min(1).describe("Wiki space id."),
      parent_id: z.string().optional().describe("Parent page id filter."),
      name: z.string().optional().describe("Page name filter."),
      include_deleted: z.boolean().optional().describe("Whether to include deleted pages."),
      include_archived: z.boolean().optional().describe("Whether to include archived pages."),
      ...paginationSchema,
    },
    async (args) => jsonResponse(await client.get("/v1/wiki/pages", compactParams(args))),
  );

  server.tool(
    "pingcode_get_page_content",
    "Get PingCode Wiki page content. Wraps GET /v1/wiki/pages/{page_id}/content.",
    {
      page_id: z.string().min(1).describe("Wiki page id."),
      format_type: pageFormatSchema.optional().describe("Content format type; defaults to text."),
      version_id: z.string().optional().describe("Page version id; defaults to current version."),
    },
    async ({ page_id, ...query }) =>
      jsonResponse(
        await client.get(
          resourcePath("/v1/wiki/pages/{page_id}/content", { page_id }),
          compactParams(query),
        ),
      ),
  );

  server.tool(
    "pingcode_update_page",
    "Partially update a PingCode Wiki page. This writes to PATCH /v1/wiki/pages/{page_id}.",
    {
      page_id: z.string().min(1).describe("Wiki page id."),
      name: z.string().optional().describe("Page name."),
      parent_id: z.string().optional().describe("Parent page id."),
      lock: z.boolean().optional().describe("Whether the page is locked."),
    },
    async ({ page_id, ...body }) =>
      jsonResponse(
        await client.patch(
          resourcePath("/v1/wiki/pages/{page_id}", { page_id }),
          compactParams(body),
        ),
      ),
  );
}
