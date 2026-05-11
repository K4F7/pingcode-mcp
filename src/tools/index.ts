import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { PingCodeClient } from "../pingcode/client.js";
import { registerAssignmentTools } from "./assignment.js";
import { registerProjectTools } from "./projects.js";
import { registerReleaseTools } from "./releases.js";
import { registerWorkItemTools } from "./work-items.js";

export function registerTools(server: McpServer, client: PingCodeClient): void {
  const context = { server, client };

  registerProjectTools(context);
  registerWorkItemTools(context);
  registerReleaseTools(context);
  registerAssignmentTools(context);
}
