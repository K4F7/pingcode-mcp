import { z } from "zod";
import { compactParams, jsonResponse, paginationSchema, resourcePath, type ToolContext } from "./common.js";

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

const testPlanCreateSchema = {
  library_id: z.string().min(1).describe("Test library id."),
  name: z.string().min(1).describe("Test plan name."),
  type_id: z.string().min(1).describe("Test plan type id."),
  start_at: z.number().int().describe("Plan start timestamp in seconds."),
  end_at: z.number().int().describe("Plan end timestamp in seconds."),
  assignee_id: z.string().min(1).describe("Plan assignee user id."),
  project_id: z.string().optional().describe("Project id; required when sprint_id or version_id is set."),
  sprint_id: z.string().optional().describe("Sprint id; valid for sprint test plans."),
  version_id: z.string().optional().describe("Release/version id; valid for release test plans."),
};

const testPlanUpdateSchema = {
  library_id: z.string().min(1).describe("Test library id."),
  plan_id: z.string().min(1).describe("Test plan id."),
  name: z.string().optional().describe("Test plan name."),
  type_id: z.string().optional().describe("Test plan type id."),
  project_id: z.string().optional().describe("Project id; required when sprint_id or version_id is set."),
  sprint_id: z.string().optional().describe("Sprint id; valid for sprint test plans."),
  version_id: z.string().optional().describe("Release/version id; valid for release test plans."),
  start_at: z.number().int().optional().describe("Plan start timestamp in seconds."),
  end_at: z.number().int().optional().describe("Plan end timestamp in seconds."),
  assignee_id: z.string().optional().describe("Plan assignee user id."),
  state_id: z.string().optional().describe("Test plan state id."),
  summary: z.string().optional().describe("Test plan summary."),
};

const testRunCreateSchema = {
  library_id: z.string().min(1).describe("Test library id."),
  plan_id: z.string().min(1).describe("Test plan id."),
  case_id: z.string().min(1).describe("Test case id."),
  executor_id: z.string().optional().describe("Executor user id."),
};

const testRunUpdateSchema = {
  run_id: z.string().min(1).describe("Test run id."),
  status_id: z.string().min(1).describe("Execution status id."),
  remark: z.string().optional().describe("Execution remark."),
  executor_id: z.string().optional().describe("Executor user id."),
  steps: z.array(testCaseStepSchema).optional().describe("Executed step results."),
};

export function registerTestManagementTools({ server, client }: ToolContext): void {
  server.tool(
    "pingcode_list_test_plans",
    "List PingCode test plans in a test library. Wraps GET /v1/testhub/libraries/{library_id}/plans.",
    {
      library_id: z.string().min(1).describe("Test library id."),
      name: z.string().optional().describe("Test plan name filter."),
      type_id: z.string().optional().describe("Test plan type id."),
      project_id: z.string().optional().describe("Project id filter."),
      sprint_id: z.string().optional().describe("Sprint id filter."),
      version_id: z.string().optional().describe("Release/version id filter."),
      assignee_id: z.string().optional().describe("Assignee user id filter."),
      state_id: z.string().optional().describe("Test plan state id filter."),
      created_between: z.string().optional().describe("Creation timestamp range."),
      updated_between: z.string().optional().describe("Update timestamp range."),
      ...paginationSchema,
    },
    async ({ library_id, ...query }) =>
      jsonResponse(
        await client.get(
          resourcePath("/v1/testhub/libraries/{library_id}/plans", { library_id }),
          compactParams(query),
        ),
      ),
  );

  server.tool(
    "pingcode_create_test_plan",
    "Create a PingCode test plan. This writes to POST /v1/testhub/libraries/{library_id}/plans.",
    testPlanCreateSchema,
    async ({ library_id, ...body }) =>
      jsonResponse(
        await client.post(
          resourcePath("/v1/testhub/libraries/{library_id}/plans", { library_id }),
          compactParams(body),
        ),
      ),
  );

  server.tool(
    "pingcode_update_test_plan",
    "Partially update a PingCode test plan. This writes to PATCH /v1/testhub/libraries/{library_id}/plans/{plan_id}.",
    testPlanUpdateSchema,
    async ({ library_id, plan_id, ...body }) =>
      jsonResponse(
        await client.patch(
          resourcePath("/v1/testhub/libraries/{library_id}/plans/{plan_id}", { library_id, plan_id }),
          compactParams(body),
        ),
      ),
  );

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

  server.tool(
    "pingcode_update_test_run_status",
    "Update a PingCode test run execution status. This writes to PATCH /v1/testhub/runs/{run_id}.",
    testRunUpdateSchema,
    async ({ run_id, ...body }) =>
      jsonResponse(
        await client.patch(
          resourcePath("/v1/testhub/runs/{run_id}", { run_id }),
          compactParams(body),
        ),
      ),
  );
}
