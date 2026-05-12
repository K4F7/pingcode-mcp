import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { PingCodeClient } from "../pingcode/client.js";
import { registerAcceptanceTools } from "./acceptance.js";
import { registerAssignmentTools } from "./assignment.js";
import { registerCollaborationTools } from "./collaboration.js";
import { registerContextTools } from "./context.js";
import { registerProjectTools } from "./projects.js";
import { registerRelationTools } from "./relations.js";
import { registerReleaseTools } from "./releases.js";
import { registerTestManagementTools } from "./test-management.js";
import { registerWorkItemTools } from "./work-items.js";

export function registerTools(server: McpServer, client: PingCodeClient): void {
  const context = { server, client };

  registerProjectTools(context);
  registerWorkItemTools(context);
  registerReleaseTools(context);
  registerTestManagementTools(context);
  registerAssignmentTools(context);
  registerCollaborationTools(context);
  registerRelationTools(context);
  registerContextTools(context);
  registerAcceptanceTools(context);
}
