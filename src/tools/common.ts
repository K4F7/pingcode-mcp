import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PingCodeClient } from "../pingcode/client.js";

export interface ToolContext {
  server: McpServer;
  client: PingCodeClient;
}

export const paginationSchema = {
  page_size: z.number().int().min(1).max(100).optional().describe("Page size; PingCode maximum is 100."),
  page_index: z.number().int().min(0).optional().describe("Page index."),
};

export function jsonResponse(data: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

export function compactParams(input: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => {
      if (value === undefined || value === null || value === "") {
        return false;
      }
      if (Array.isArray(value) && value.length === 0) {
        return false;
      }
      return true;
    }),
  );
}

export function resourcePath(template: string, params: Record<string, string>): string {
  return Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`{${key}}`, encodeURIComponent(value)),
    template,
  );
}
