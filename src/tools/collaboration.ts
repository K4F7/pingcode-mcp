import { stat, readFile } from "node:fs/promises";
import { basename } from "node:path";
import { z } from "zod";
import { compactParams, jsonResponse, resourcePath, type ToolContext } from "./common.js";

const snippetFormatSchema = z.enum([
  "clike",
  "css",
  "dart",
  "django",
  "dockerfile",
  "go",
  "markdown",
  "nginx",
  "python",
  "php",
  "shell",
  "sql",
  "swift",
  "html",
  "javascript",
  "jsx",
  "pascal",
  "sass",
  "stylus",
  "vue",
  "yaml",
  "haskell",
]);

export const principalTypeSchema = z.enum([
  "work_item",
  "test_case",
  "test_run",
  "ticket",
  "idea",
  "page",
]);

const uploadPrincipalTypeSchema = z.enum([
  "work_item",
  "work_item_deliverable",
  "test_case",
  "test_run",
  "ticket",
  "idea",
  "page",
]);

const defaultUploadMaxBytes = 10 * 1024 * 1024;
const hardUploadMaxBytes = 25 * 1024 * 1024;
const blockedUploadBasenames = new Set([".env", "id_rsa", "id_dsa", "id_ecdsa", "id_ed25519"]);

export function registerCollaborationTools({ server, client }: ToolContext): void {
  server.tool(
    "pingcode_list_comments",
    "List comments for a PingCode artifact. Wraps GET /v1/comments.",
    {
      principal_type: principalTypeSchema.describe("Artifact type, e.g. work_item, test_case, test_run, ticket, idea, page."),
      principal_id: z.string().min(1).describe("Artifact id."),
      review_id: z.string().optional().describe("Review id when listing review comments."),
    },
    async (args) => jsonResponse(await client.get("/v1/comments", compactParams(args))),
  );

  server.tool(
    "pingcode_create_comment",
    "Create a comment on a PingCode artifact. This writes to PingCode via POST /v1/comments.",
    {
      principal_type: principalTypeSchema.describe("Artifact type, e.g. work_item, test_case, test_run, ticket, idea, page."),
      principal_id: z.string().min(1).describe("Artifact id."),
      content: z.string().min(1).describe("Comment content."),
      review_id: z.string().optional().describe("Review id when creating a review comment."),
      created_at: z.number().int().optional().describe("Optional creation timestamp in seconds."),
      created_by: z.string().optional().describe("Optional creator user id."),
    },
    async (args) => jsonResponse(await client.post("/v1/comments", compactParams(args))),
  );

  server.tool(
    "pingcode_list_attachments",
    "List attachments for a PingCode artifact. Wraps GET /v1/attachments.",
    {
      principal_type: principalTypeSchema.describe("Artifact type, e.g. work_item, test_case, test_run, ticket, idea, page."),
      principal_id: z.string().min(1).describe("Artifact id."),
      comment_id: z.string().optional().describe("Optional comment id filter."),
    },
    async (args) => jsonResponse(await client.get("/v1/attachments", compactParams(args))),
  );

  server.tool(
    "pingcode_upload_code_snippet",
    "Upload a code snippet attachment to a PingCode artifact. Format must be one of PingCode's snippet enums; use pingcode_create_comment for plain text summaries and do not upload sensitive raw acceptance artifacts.",
    {
      principal_type: principalTypeSchema.describe("Artifact type, e.g. work_item, test_case, test_run, ticket, idea, page."),
      principal_id: z.string().min(1).describe("Artifact id."),
      title: z.string().min(1).describe("Snippet title."),
      format: snippetFormatSchema.describe("Snippet format enum. Unsupported examples include text and typescript; use markdown or javascript when appropriate."),
      content: z.string().min(1).describe("Snippet content."),
      comment_id: z.string().optional().describe("Optional comment id to attach to."),
    },
    async (args) => jsonResponse(await client.post("/v1/attachments", compactParams(args))),
  );

  server.tool(
    "pingcode_upload_attachment",
    "Upload a local file attachment to a PingCode artifact. This writes to PingCode via multipart POST /v1/attachments; do not upload sensitive raw acceptance artifacts, real subject data, videos, questionnaire content, or sensitive JSON.",
    {
      principal_type: uploadPrincipalTypeSchema.describe("Artifact type, e.g. work_item, work_item_deliverable, test_case, test_run, ticket, idea, page."),
      principal_id: z.string().min(1).describe("Artifact id."),
      file_path: z.string().min(1).describe("Local file path to upload."),
      filename: z.string().optional().describe("Optional uploaded filename override."),
      content_type: z.string().optional().describe("Optional MIME type."),
      comment_id: z.string().optional().describe("Optional comment id to attach to."),
      max_bytes: z.number().int().positive().max(hardUploadMaxBytes).optional().describe("Maximum allowed file size in bytes; defaults to 10485760 and cannot exceed 26214400."),
    },
    async ({ principal_type, principal_id, file_path, filename, content_type, comment_id, max_bytes }) => {
      const uploadName = filename ?? basename(file_path);
      if (blockedUploadBasenames.has(basename(file_path)) || blockedUploadBasenames.has(uploadName)) {
        throw new Error("Refusing to upload common secret file names.");
      }

      const fileStat = await stat(file_path);
      if (!fileStat.isFile()) {
        throw new Error("file_path must point to a regular file.");
      }

      const limit = max_bytes ?? defaultUploadMaxBytes;
      if (fileStat.size > limit) {
        throw new Error(`File size ${fileStat.size} exceeds max_bytes ${limit}.`);
      }

      const data = await readFile(file_path);
      return jsonResponse(
        await client.uploadMultipart(
          "/v1/attachments",
          { title: uploadName },
          {
            fieldName: "file",
            filename: uploadName,
            contentType: content_type,
            data,
          },
          compactParams({ principal_type, principal_id, comment_id }),
        ),
      );
    },
  );

  server.tool(
    "pingcode_list_activities",
    "List activity timeline for a PingCode artifact. Wraps GET /v1/activities.",
    {
      principal_type: principalTypeSchema.describe("Artifact type, e.g. work_item, test_case, test_run, ticket, idea."),
      principal_id: z.string().min(1).describe("Artifact id."),
    },
    async (args) => jsonResponse(await client.get("/v1/activities", compactParams(args))),
  );

  server.tool(
    "pingcode_delete_comment",
    "Delete a comment from a PingCode artifact. This writes to PingCode via DELETE /v1/comments/{comment_id}.",
    {
      comment_id: z.string().min(1).describe("Comment id."),
      principal_type: principalTypeSchema.describe("Artifact type."),
      principal_id: z.string().min(1).describe("Artifact id."),
      review_id: z.string().optional().describe("Review id when deleting a review comment."),
    },
    async ({ comment_id, ...query }) =>
      jsonResponse(await client.delete(resourcePath("/v1/comments/{comment_id}", { comment_id }), compactParams(query))),
  );

  server.tool(
    "pingcode_delete_attachment",
    "Delete an attachment from a PingCode artifact. This writes to PingCode via DELETE /v1/attachments/{attachment_id}.",
    {
      attachment_id: z.string().min(1).describe("Attachment id."),
      principal_type: principalTypeSchema.describe("Artifact type."),
      principal_id: z.string().min(1).describe("Artifact id."),
      comment_id: z.string().optional().describe("Optional comment id."),
    },
    async ({ attachment_id, ...query }) =>
      jsonResponse(await client.delete(resourcePath("/v1/attachments/{attachment_id}", { attachment_id }), compactParams(query))),
  );
}
