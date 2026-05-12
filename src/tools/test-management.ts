import { z } from "zod";
import { compactParams, jsonResponse, paginationSchema, type ToolContext } from "./common.js";

const propertiesSchema = z.record(z.string(), z.unknown()).optional();

const testCaseStepSchema = z.object({
  step_id: z.string().optional().describe("Test case step id."),
  description: z.string().optional().describe("Step description."),
  expected_value: z.string().optional().describe("Expected value."),
  is_group: z.union([z.literal(0), z.literal(1)]).optional().describe("Whether this step is a group."),
  group_id: z.string().optional().describe("Parent group step id."),
});

const testCaseCreateSchema = {
  test_library_id: z.string().min(1).describe("Test library id."),
  title: z.string().min(1).max(200).describe("Test case title."),
  suite_id: z.string().optional().describe("Suite/module id."),
  type_id: z.string().optional().describe("Test case type id."),
  important_level_id: z.string().optional().describe("Important level id."),
  maintenance_id: z.string().optional().describe("Maintenance owner user id."),
  participant_ids: z.array(z.string()).optional().describe("Follower/participant ids."),
  properties: propertiesSchema.describe("Custom properties object."),
  description: z.string().optional().describe("Test case description."),
  precondition: z.string().optional().describe("Test case precondition."),
  steps: z.array(testCaseStepSchema).optional().describe("Test case steps."),
};

const testRunCreateSchema = {
  library_id: z.string().min(1).describe("Test library id."),
  plan_id: z.string().min(1).describe("Test plan id."),
  case_id: z.string().min(1).describe("Test case id."),
  executor_id: z.string().optional().describe("Executor user id."),
};

export function registerTestManagementTools({ server, client }: ToolContext): void {
  server.tool(
    "pingcode_list_test_cases",
    "List PingCode test cases. Wraps GET /v1/testhub/cases.",
    {
      library_id: z.string().optional().describe("Test library id."),
      maintenance_id: z.string().optional().describe("Maintenance owner id."),
      state_ids: z.array(z.string()).optional().describe("State ids; PingCode accepts up to 20."),
      important_level_ids: z.array(z.string()).optional().describe("Important level ids; PingCode accepts up to 20."),
      tag_ids: z.array(z.string()).optional().describe("Tag ids; PingCode accepts up to 20."),
      created_between: z.string().optional().describe("Creation timestamp range."),
      updated_between: z.string().optional().describe("Update timestamp range."),
      include_public_image_token: z.string().optional().describe("Fields that need public image token, comma-separated."),
      include_deleted: z.boolean().optional().describe("Whether to include deleted test cases."),
      include_archived: z.boolean().optional().describe("Whether to include archived test cases."),
      ...paginationSchema,
    },
    async (args) => jsonResponse(await client.get("/v1/testhub/cases", compactParams(args))),
  );

  server.tool(
    "pingcode_create_test_case",
    "Create a PingCode test case. This writes to PingCode via POST /v1/testhub/cases.",
    testCaseCreateSchema,
    async (args) => jsonResponse(await client.post("/v1/testhub/cases", compactParams(args))),
  );

  server.tool(
    "pingcode_batch_create_test_cases",
    "Batch create PingCode test cases. This writes to PingCode via POST /v1/testhub/cases/bulk.",
    {
      cases: z.array(z.object(testCaseCreateSchema)).min(1).max(100).describe("Test cases to create."),
    },
    async (args) => jsonResponse(await client.post("/v1/testhub/cases/bulk", compactParams(args))),
  );

  server.tool(
    "pingcode_list_test_runs",
    "List PingCode test runs. Wraps GET /v1/testhub/runs.",
    {
      plan_id: z.string().optional().describe("Test plan id."),
      case_id: z.string().optional().describe("Test case id."),
      suite_id: z.string().optional().describe("Suite id."),
      status_id: z.string().optional().describe("Execution status id."),
      ...paginationSchema,
    },
    async (args) => jsonResponse(await client.get("/v1/testhub/runs", compactParams(args))),
  );

  server.tool(
    "pingcode_create_test_run",
    "Create a PingCode test run. This writes to PingCode via POST /v1/testhub/runs.",
    testRunCreateSchema,
    async (args) => jsonResponse(await client.post("/v1/testhub/runs", compactParams(args))),
  );

  server.tool(
    "pingcode_batch_create_test_runs",
    "Batch create PingCode test runs. This writes to PingCode via POST /v1/testhub/runs/bulk.",
    {
      runs: z.array(z.object(testRunCreateSchema)).min(1).max(100).describe("Test runs to create."),
    },
    async (args) => jsonResponse(await client.post("/v1/testhub/runs/bulk", compactParams(args))),
  );
}
