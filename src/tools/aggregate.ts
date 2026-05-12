import { z } from "zod";
import type { PingCodeClient } from "../pingcode/client.js";
import type { JsonObject, PageResult, PingCodeMember, PingCodeWorkItem } from "../pingcode/types.js";
import { compactParams, jsonResponse, resourcePath, type ToolContext } from "./common.js";

const sprintStatuses = ["pending", "in_progress", "completed"] as const;
const releaseStatuses = ["pending", "in_progress", "published"] as const;
const writeActionSchema = z.enum([
  "create_work_item",
  "update_work_item",
  "batch_update_work_items",
  "assign_work_items",
  "assign_work_items_to_sprint",
  "delete_work_item",
  "create_sprint",
  "update_sprint",
  "create_release",
  "update_release",
]);

const propertyBagSchema = z.record(z.string(), z.unknown()).optional();
const previewChangeSchema = z.object({
  action: writeActionSchema.describe("Write action to preview."),
  project_id: z.string().optional().describe("Project id for validation or display."),
  work_item_id: z.string().optional().describe("Target work item id."),
  ids: z.array(z.string()).optional().describe("Target ids for batch actions."),
  assignee_id: z.string().optional().describe("Target assignee user id."),
  sprint_id: z.string().optional().describe("Target sprint id."),
  property_name: z.string().optional().describe("Batch update property name."),
  property_value: z.unknown().optional().describe("Batch update property value."),
  payload: z.record(z.string(), z.unknown()).optional().describe("Request body that would be sent by the write tool."),
  reason: z.string().optional().describe("Human-readable reason for the change."),
});

type StatusValue = (typeof sprintStatuses)[number] | (typeof releaseStatuses)[number];
type Entity = JsonObject;

interface FetchAllPagesResult<T> {
  values: T[];
  total?: number;
  page_count: number;
  truncated: boolean;
}

interface TypeSchemaDetail {
  type_id?: string;
  type_name?: string;
  type: Entity;
  states: Entity[];
  properties: Entity[];
  errors: string[];
}

interface ProjectSchemaData {
  project_id: string;
  members: PingCodeMember[];
  types: Entity[];
  priorities: Entity[];
  type_details: TypeSchemaDetail[];
  errors: string[];
}

interface ValidationIssue {
  field: string;
  code: string;
  message: string;
  value?: unknown;
}

interface WorkItemValidationInput {
  operation: "create" | "update";
  project_id: string;
  work_item_id?: string;
  title?: string;
  type_id?: string;
  state_id?: string;
  priority_id?: string;
  assignee_id?: string;
  parent_id?: string;
  sprint_id?: string;
  version_ids?: string[];
  board_id?: string;
  entry_id?: string;
  swimlane_id?: string;
  properties?: Record<string, unknown>;
  strict_properties: boolean;
  max_pages: number;
}

interface TreeNode {
  item: Record<string, unknown>;
  children: TreeNode[];
}

export function registerAggregateTools({ server, client }: ToolContext): void {
  server.tool(
    "pingcode_get_project_schema",
    "Get project members, work item types, states, priorities, and type-specific fields in one read-only call.",
    {
      project_id: z.string().min(1).describe("PingCode project id."),
      max_pages: z.number().int().min(1).max(20).default(5).describe("Maximum metadata pages to read where pagination is supported."),
    },
    async ({ project_id, max_pages }) => jsonResponse(formatProjectSchema(await getProjectSchema(client, project_id, max_pages))),
  );

  server.tool(
    "pingcode_list_sprints_all_statuses",
    "List pending, in_progress, and completed sprints for a project in one read-only call.",
    {
      project_id: z.string().min(1).describe("PingCode project id."),
      name: z.string().optional().describe("Sprint name filter."),
      created_between: z.string().optional().describe("Creation timestamp range."),
      updated_between: z.string().optional().describe("Update timestamp range."),
      page_size: z.number().int().min(1).max(100).default(100).describe("Page size per status; PingCode maximum is 100."),
      page_index: z.number().int().min(0).default(0).describe("Starting page index per status."),
      max_pages: z.number().int().min(1).max(20).default(5).describe("Maximum pages to read per status."),
    },
    async ({ project_id, page_size, page_index, max_pages, ...query }) =>
      jsonResponse(
        await listEntitiesAllStatuses(
          client,
          resourcePath("/v1/project/projects/{project_id}/sprints", { project_id }),
          sprintStatuses,
          query,
          page_size,
          page_index,
          max_pages,
          { project_id },
        ),
      ),
  );

  server.tool(
    "pingcode_list_releases_all_statuses",
    "List pending, in_progress, and published releases for a project in one read-only call.",
    {
      project_id: z.string().min(1).describe("PingCode project id."),
      name: z.string().optional().describe("Release name filter."),
      created_between: z.string().optional().describe("Creation timestamp range, e.g. 1580000000,1590000000."),
      updated_between: z.string().optional().describe("Update timestamp range, e.g. 1580000000,1590000000."),
      page_size: z.number().int().min(1).max(100).default(100).describe("Page size per status; PingCode maximum is 100."),
      page_index: z.number().int().min(0).default(0).describe("Starting page index per status."),
      max_pages: z.number().int().min(1).max(20).default(5).describe("Maximum pages to read per status."),
    },
    async ({ project_id, page_size, page_index, max_pages, ...query }) =>
      jsonResponse(
        await listEntitiesAllStatuses(
          client,
          resourcePath("/v1/project/projects/{project_id}/versions", { project_id }),
          releaseStatuses,
          query,
          page_size,
          page_index,
          max_pages,
          { project_id },
        ),
      ),
  );

  server.tool(
    "pingcode_get_sprint_health",
    "Get sprint health: total, completed, unassigned, missing priority, missing estimate, and deadline risk.",
    {
      project_id: z.string().min(1).describe("PingCode project id."),
      sprint_id: z.string().min(1).describe("Sprint id."),
      due_soon_days: z.number().int().min(0).max(30).default(3).describe("Days before end_at considered near deadline."),
      page_size: z.number().int().min(1).max(100).default(100).describe("Work item page size; PingCode maximum is 100."),
      max_pages: z.number().int().min(1).max(50).default(10).describe("Maximum work item pages to read."),
    },
    async ({ project_id, sprint_id, due_soon_days, page_size, max_pages }) =>
      jsonResponse(await getSprintHealth(client, project_id, sprint_id, due_soon_days, page_size, max_pages)),
  );

  server.tool(
    "pingcode_get_work_item_tree",
    "Get a work item hierarchy tree for a project, preserving parent-child backlog structure.",
    {
      project_id: z.string().min(1).describe("PingCode project id."),
      root_parent_ids: z.array(z.string()).optional().describe("Optional root work item ids; returns those subtrees when present."),
      type_ids: z.array(z.string()).optional().describe("Work item type ids to include."),
      sprint_ids: z.array(z.string()).optional().describe("Sprint ids to include."),
      version_ids: z.array(z.string()).optional().describe("Release/version ids to include."),
      include_completed: z.boolean().default(true).describe("Include completed work items."),
      page_size: z.number().int().min(1).max(100).default(100).describe("Work item page size; PingCode maximum is 100."),
      max_pages: z.number().int().min(1).max(50).default(10).describe("Maximum work item pages to read."),
    },
    async ({ project_id, page_size, max_pages, ...query }) =>
      jsonResponse(await getWorkItemTree(client, project_id, query, page_size, max_pages)),
  );

  server.tool(
    "pingcode_validate_work_item_payload",
    "Validate a work item create/update payload before writing: type, state, property, assignee, sprint, and release ids.",
    {
      operation: z.enum(["create", "update"]).default("create").describe("Payload operation to validate."),
      project_id: z.string().min(1).describe("PingCode project id."),
      work_item_id: z.string().optional().describe("Work item id for update validation."),
      title: z.string().optional().describe("Work item title."),
      type_id: z.string().optional().describe("Work item type id."),
      state_id: z.string().optional().describe("State id."),
      priority_id: z.string().optional().describe("Priority id."),
      assignee_id: z.string().optional().describe("Assignee user id."),
      parent_id: z.string().optional().describe("Parent work item id."),
      sprint_id: z.string().optional().describe("Sprint id."),
      version_ids: z.array(z.string()).optional().describe("Release/version ids."),
      board_id: z.string().optional().describe("Board id."),
      entry_id: z.string().optional().describe("Board entry id."),
      swimlane_id: z.string().optional().describe("Swimlane id."),
      properties: propertyBagSchema.describe("Custom properties object."),
      strict_properties: z.boolean().default(true).describe("Treat unknown custom property keys as errors instead of warnings."),
      max_pages: z.number().int().min(1).max(20).default(5).describe("Maximum metadata pages to read where pagination is supported."),
    },
    async (args) => jsonResponse(await validateWorkItemPayload(client, args)),
  );

  server.tool(
    "pingcode_preview_write_changes",
    "Generate a dry-run summary of planned PingCode writes without performing them.",
    {
      changes: z.array(previewChangeSchema).min(1).max(100).describe("Changes to preview."),
      validate_work_item_payloads: z.boolean().default(true).describe("Validate supported work item changes when project_id is supplied."),
      max_pages: z.number().int().min(1).max(20).default(5).describe("Maximum metadata pages to read during validation."),
    },
    async (args) => jsonResponse(await previewWriteChanges(client, args.changes, args.validate_work_item_payloads, args.max_pages)),
  );
}

async function getProjectSchema(client: PingCodeClient, projectId: string, maxPages: number): Promise<ProjectSchemaData> {
  const errors: string[] = [];
  const [membersResult, typesResult, prioritiesResult] = await Promise.allSettled([
    client.get<PageResult<PingCodeMember>>(resourcePath("/v1/project/projects/{project_id}/members", { project_id: projectId })),
    fetchAllPages<Entity>(client, "/v1/project/work_item/types", { project_id: projectId }, 100, 0, maxPages),
    client.get<PageResult<Entity>>("/v1/project/work_item/priorities", { project_id: projectId }),
  ]);

  const members = settledPageValues<PingCodeMember>(membersResult, "members", errors);
  const types = settledFetchedValues(typesResult, "work_item_types", errors);
  const priorities = settledPageValues<Entity>(prioritiesResult, "priorities", errors);
  const typeDetails = await Promise.all(types.map((type) => getTypeSchemaDetail(client, projectId, type)));

  return {
    project_id: projectId,
    members,
    types,
    priorities,
    type_details: typeDetails,
    errors: errors.concat(typeDetails.flatMap((detail) => detail.errors.map((error) => `${detail.type_id ?? "unknown_type"}: ${error}`))),
  };
}

async function getTypeSchemaDetail(client: PingCodeClient, projectId: string, type: Entity): Promise<TypeSchemaDetail> {
  const typeId = entityId(type);
  if (!typeId) {
    return { type, states: [], properties: [], errors: ["Work item type did not include an id."] };
  }

  const errors: string[] = [];
  const [statesResult, propertiesResult] = await Promise.allSettled([
    client.get<PageResult<Entity>>("/v1/project/work_item/states", { project_id: projectId, work_item_type_id: typeId }),
    client.get<PageResult<Entity>>("/v1/project/work_item/properties", { project_id: projectId, work_item_type_id: typeId }),
  ]);

  return {
    type_id: typeId,
    type_name: entityName(type),
    type,
    states: settledPageValues<Entity>(statesResult, "states", errors),
    properties: settledPageValues<Entity>(propertiesResult, "properties", errors),
    errors,
  };
}

function formatProjectSchema(schema: ProjectSchemaData): Record<string, unknown> {
  return compactParams({
    project_id: schema.project_id,
    members: schema.members,
    work_item_types: schema.type_details,
    priorities: schema.priorities,
    summary: {
      member_count: schema.members.length,
      type_count: schema.types.length,
      priority_count: schema.priorities.length,
      partial_error_count: schema.errors.length,
    },
    partial_errors: schema.errors.length ? schema.errors : undefined,
  });
}

async function listEntitiesAllStatuses<T extends Entity>(
  client: PingCodeClient,
  path: string,
  statuses: readonly StatusValue[],
  query: Record<string, unknown>,
  pageSize: number,
  pageIndex: number,
  maxPages: number,
  extra: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const entries = await Promise.all(
    statuses.map(async (status) => {
      const result = await fetchAllPages<T>(client, path, { ...query, status }, pageSize, pageIndex, maxPages);
      return [status, { ...result, values: result.values }] as const;
    }),
  );
  const byStatus = Object.fromEntries(entries);
  const values = entries.flatMap(([, result]) => result.values);

  return {
    ...extra,
    statuses,
    total_loaded: values.length,
    truncated: entries.some(([, result]) => result.truncated),
    by_status: byStatus,
    values,
  };
}

async function getSprintHealth(
  client: PingCodeClient,
  projectId: string,
  sprintId: string,
  dueSoonDays: number,
  pageSize: number,
  maxPages: number,
): Promise<Record<string, unknown>> {
  const [sprintLookup, workItemsResult] = await Promise.all([
    findEntityAcrossStatuses(
      client,
      resourcePath("/v1/project/projects/{project_id}/sprints", { project_id: projectId }),
      sprintStatuses,
      sprintId,
      maxPages,
    ),
    fetchAllPages<PingCodeWorkItem>(
      client,
      "/v1/project/work_items",
      { project_ids: [projectId], sprint_ids: [sprintId], include_deleted: false, include_archived: false },
      pageSize,
      0,
      maxPages,
    ),
  ]);

  const workItems = workItemsResult.values;
  const completedItems = workItems.filter(isCompletedWorkItem);
  const remainingItems = workItems.filter((item) => !isCompletedWorkItem(item));
  const unassignedItems = workItems.filter((item) => !entityId(recordValue(item, "assignee")));
  const missingPriorityItems = workItems.filter((item) => !entityId(recordValue(item, "priority")));
  const missingEstimateItems = workItems.filter((item) => !hasPositiveNumber(recordValue(item, "estimated_workload")) && !hasPositiveNumber(recordValue(item, "story_points")));
  const now = Math.floor(Date.now() / 1000);
  const dueSoonSeconds = dueSoonDays * 24 * 60 * 60;
  const sprintEndAt = numberValue(recordValue(sprintLookup.entity, "end_at"));
  const deadline = buildDeadlineSummary(sprintEndAt, now, dueSoonSeconds, remainingItems.length);
  const dueSoonWorkItems = remainingItems.filter((item) => isDueSoon(numberValue(recordValue(item, "end_at")), now, dueSoonSeconds));
  const overdueWorkItems = remainingItems.filter((item) => {
    const endAt = numberValue(recordValue(item, "end_at"));
    return endAt !== undefined && endAt < now;
  });

  return compactParams({
    project_id: projectId,
    sprint_id: sprintId,
    sprint_status: sprintLookup.status,
    sprint: sprintLookup.entity,
    summary: {
      total: workItems.length,
      completed: completedItems.length,
      remaining: remainingItems.length,
      unassigned: unassignedItems.length,
      missing_priority: missingPriorityItems.length,
      missing_estimate: missingEstimateItems.length,
      due_soon: dueSoonWorkItems.length,
      overdue: overdueWorkItems.length,
      deadline,
      truncated: workItemsResult.truncated,
    },
    by_assignee: summarizeByNamedObject(workItems, "assignee"),
    by_state: summarizeByNamedObject(workItems, "state"),
    needs_attention: {
      unassigned: unassignedItems.map(summarizeWorkItem),
      missing_priority: missingPriorityItems.map(summarizeWorkItem),
      missing_estimate: missingEstimateItems.map(summarizeWorkItem),
      due_soon: dueSoonWorkItems.map(summarizeWorkItem),
      overdue: overdueWorkItems.map(summarizeWorkItem),
    },
  });
}

async function getWorkItemTree(
  client: PingCodeClient,
  projectId: string,
  query: {
    root_parent_ids?: string[];
    type_ids?: string[];
    sprint_ids?: string[];
    version_ids?: string[];
    include_completed: boolean;
  },
  pageSize: number,
  maxPages: number,
): Promise<Record<string, unknown>> {
  const result = await fetchAllPages<PingCodeWorkItem>(
    client,
    "/v1/project/work_items",
    compactParams({
      project_ids: [projectId],
      type_ids: query.type_ids,
      sprint_ids: query.sprint_ids,
      version_ids: query.version_ids,
      include_deleted: false,
      include_archived: false,
    }),
    pageSize,
    0,
    maxPages,
  );
  const items = query.include_completed ? result.values : result.values.filter((item) => !isCompletedWorkItem(item));
  const nodes = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  for (const item of items) {
    const id = entityId(item);
    if (id) {
      nodes.set(id, { item: summarizeWorkItem(item), children: [] });
    }
  }

  for (const item of items) {
    const id = entityId(item);
    const node = id ? nodes.get(id) : undefined;
    if (!node) {
      continue;
    }
    const parentId = parentWorkItemId(item);
    const parentNode = parentId ? nodes.get(parentId) : undefined;
    if (parentNode) {
      parentNode.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const selectedRoots = query.root_parent_ids?.length ? selectTreeRoots(query.root_parent_ids, nodes, roots) : roots;
  for (const root of selectedRoots) {
    sortTree(root);
  }

  return {
    project_id: projectId,
    total_loaded: result.values.length,
    total_in_tree: countTreeNodes(selectedRoots),
    truncated: result.truncated,
    filters: compactParams(query),
    roots: selectedRoots,
  };
}

async function validateWorkItemPayload(
  client: PingCodeClient,
  input: WorkItemValidationInput,
): Promise<Record<string, unknown>> {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const checks: Record<string, unknown>[] = [];
  const schema = await getProjectSchema(client, input.project_id, input.max_pages);
  const partialErrors = [...schema.errors];

  if (input.operation === "create") {
    if (!input.title) {
      errors.push({ field: "title", code: "missing_required", message: "title is required when creating a work item." });
    }
    if (!input.type_id) {
      errors.push({ field: "type_id", code: "missing_required", message: "type_id is required when creating a work item." });
    }
  }

  validateId(input.type_id, "type_id", idSet(schema.types), errors, checks);
  validateId(input.priority_id, "priority_id", idSet(schema.priorities), errors, checks);
  validateAssigneeId(input.assignee_id, schema.members, errors, warnings, checks);
  validateStateId(input.state_id, input.type_id, schema.type_details, errors, warnings, checks);
  validateProperties(input.properties, input.type_id, input.strict_properties, schema.type_details, errors, warnings, checks);

  if (input.sprint_id) {
    await validateEntityAcrossStatuses(
      client,
      resourcePath("/v1/project/projects/{project_id}/sprints", { project_id: input.project_id }),
      sprintStatuses,
      "sprint_id",
      input.sprint_id,
      input.max_pages,
      errors,
      checks,
    );
  }

  if (input.version_ids?.length) {
    for (const versionId of input.version_ids) {
      await validateEntityAcrossStatuses(
        client,
        resourcePath("/v1/project/projects/{project_id}/versions", { project_id: input.project_id }),
        releaseStatuses,
        "version_ids",
        versionId,
        input.max_pages,
        errors,
        checks,
      );
    }
  }

  await validateBoardFields(client, input, errors, warnings, checks);

  if (input.parent_id) {
    warnings.push({
      field: "parent_id",
      code: "not_strictly_validated",
      message: "parent_id is not strictly validated by this tool; verify the parent belongs to the same project and supports the child type.",
      value: input.parent_id,
    });
  }

  if (input.swimlane_id) {
    warnings.push({
      field: "swimlane_id",
      code: "not_strictly_validated",
      message: "swimlane_id is not strictly validated because no swimlane metadata endpoint is exposed by this MCP server.",
      value: input.swimlane_id,
    });
  }

  const payload = compactParams({
    work_item_id: input.work_item_id,
    title: input.title,
    type_id: input.type_id,
    state_id: input.state_id,
    priority_id: input.priority_id,
    assignee_id: input.assignee_id,
    parent_id: input.parent_id,
    sprint_id: input.sprint_id,
    version_ids: input.version_ids,
    board_id: input.board_id,
    entry_id: input.entry_id,
    swimlane_id: input.swimlane_id,
    properties: input.properties,
  });

  return compactParams({
    operation: input.operation,
    project_id: input.project_id,
    valid: errors.length === 0,
    safe_to_write: errors.length === 0 && partialErrors.length === 0,
    validation_complete: partialErrors.length === 0,
    errors,
    warnings,
    checks,
    normalized_payload: payload,
    partial_errors: partialErrors.length ? partialErrors : undefined,
    writes_performed: 0,
  });
}

async function previewWriteChanges(
  client: PingCodeClient,
  changes: z.infer<typeof previewChangeSchema>[],
  validateWorkItems: boolean,
  maxPages: number,
): Promise<Record<string, unknown>> {
  const previews = [];
  const byAction = new Map<string, number>();

  for (const [index, change] of changes.entries()) {
    byAction.set(change.action, (byAction.get(change.action) ?? 0) + 1);
    const validation = validateWorkItems ? await validatePreviewChange(client, change, maxPages) : undefined;
    previews.push(compactParams({
      index,
      action: change.action,
      risk_level: writeRiskLevel(change),
      summary: summarizeWriteChange(change),
      target_count: change.ids?.length ?? (change.work_item_id ? 1 : undefined),
      reason: change.reason,
      payload: change.payload,
      validation,
    }));
  }

  return {
    writes_performed: 0,
    change_count: changes.length,
    by_action: Object.fromEntries(byAction),
    previews,
  };
}

async function validatePreviewChange(
  client: PingCodeClient,
  change: z.infer<typeof previewChangeSchema>,
  maxPages: number,
): Promise<Record<string, unknown> | undefined> {
  if (!change.project_id) {
    return { skipped: true, reason: "project_id is required for validation." };
  }

  if (change.action === "create_work_item" || change.action === "update_work_item") {
    return validateWorkItemPayload(client, validationInputFromChange(change, maxPages));
  }

  if (change.action === "assign_work_items") {
    return validateWorkItemPayload(client, {
      operation: "update",
      project_id: change.project_id,
      assignee_id: change.assignee_id,
      strict_properties: true,
      max_pages: maxPages,
    });
  }

  if (change.action === "assign_work_items_to_sprint") {
    return validateWorkItemPayload(client, {
      operation: "update",
      project_id: change.project_id,
      sprint_id: change.sprint_id,
      strict_properties: true,
      max_pages: maxPages,
    });
  }

  if (change.action === "batch_update_work_items" && (change.property_name === "state_id" || change.property_name === "priority_id" || change.property_name === "assignee_id" || change.property_name === "sprint_id")) {
    return validateWorkItemPayload(client, {
      operation: "update",
      project_id: change.project_id,
      [change.property_name]: typeof change.property_value === "string" ? change.property_value : undefined,
      strict_properties: true,
      max_pages: maxPages,
    } as WorkItemValidationInput);
  }

  return { skipped: true, reason: "This action has no supported dry-run validator yet." };
}

function validationInputFromChange(change: z.infer<typeof previewChangeSchema>, maxPages: number): WorkItemValidationInput {
  const payload = change.payload ?? {};
  return {
    operation: change.action === "create_work_item" ? "create" : "update",
    project_id: change.project_id ?? "",
    work_item_id: stringField(payload, "work_item_id") ?? change.work_item_id,
    title: stringField(payload, "title"),
    type_id: stringField(payload, "type_id"),
    state_id: stringField(payload, "state_id"),
    priority_id: stringField(payload, "priority_id"),
    assignee_id: stringField(payload, "assignee_id"),
    parent_id: stringField(payload, "parent_id"),
    sprint_id: stringField(payload, "sprint_id"),
    version_ids: stringArrayField(payload, "version_ids"),
    board_id: stringField(payload, "board_id"),
    entry_id: stringField(payload, "entry_id"),
    swimlane_id: stringField(payload, "swimlane_id"),
    properties: recordField(payload, "properties"),
    strict_properties: true,
    max_pages: maxPages,
  };
}

async function fetchAllPages<T>(
  client: PingCodeClient,
  path: string,
  query: Record<string, unknown>,
  pageSize: number,
  startPageIndex: number,
  maxPages: number,
): Promise<FetchAllPagesResult<T>> {
  const values: T[] = [];
  let total: number | undefined;
  let pageCount = 0;

  for (let pageOffset = 0; pageOffset < maxPages; pageOffset += 1) {
    const response = await client.get<PageResult<T>>(path, compactParams({
      ...query,
      page_size: pageSize,
      page_index: startPageIndex + pageOffset,
    }));
    const pageValues = valuesFromResponse<T>(response);
    pageCount += 1;
    values.push(...pageValues);
    total = typeof response.total === "number" ? response.total : total;

    if (!pageValues.length || pageValues.length < pageSize || (total !== undefined && values.length >= total)) {
      break;
    }
  }

  return {
    values,
    total,
    page_count: pageCount,
    truncated: total !== undefined ? values.length < total : pageCount === maxPages,
  };
}

function valuesFromResponse<T>(response: unknown): T[] {
  if (Array.isArray(response)) {
    return response as T[];
  }
  if (response && typeof response === "object" && Array.isArray((response as PageResult<T>).values)) {
    return (response as PageResult<T>).values ?? [];
  }
  return [];
}

function settledPageValues<T>(result: PromiseSettledResult<unknown>, label: string, errors: string[]): T[] {
  if (result.status === "fulfilled") {
    return valuesFromResponse<T>(result.value);
  }
  errors.push(`${label}: ${formatError(result.reason)}`);
  return [];
}

function settledFetchedValues<T>(result: PromiseSettledResult<FetchAllPagesResult<T>>, label: string, errors: string[]): T[] {
  if (result.status === "fulfilled") {
    if (result.value.truncated) {
      errors.push(`${label}: result was truncated by max_pages.`);
    }
    return result.value.values;
  }
  errors.push(`${label}: ${formatError(result.reason)}`);
  return [];
}

async function findEntityAcrossStatuses(
  client: PingCodeClient,
  path: string,
  statuses: readonly StatusValue[],
  targetId: string,
  maxPages: number,
): Promise<{ entity?: Entity; status?: StatusValue }> {
  for (const status of statuses) {
    const result = await fetchAllPages<Entity>(client, path, { status }, 100, 0, maxPages);
    const entity = result.values.find((value) => entityId(value) === targetId);
    if (entity) {
      return { entity, status };
    }
  }
  return {};
}

async function validateEntityAcrossStatuses(
  client: PingCodeClient,
  path: string,
  statuses: readonly StatusValue[],
  field: string,
  targetId: string,
  maxPages: number,
  errors: ValidationIssue[],
  checks: Record<string, unknown>[],
): Promise<void> {
  const result = await findEntityAcrossStatuses(client, path, statuses, targetId, maxPages);
  checks.push({ field, value: targetId, ok: Boolean(result.entity), status: result.status });
  if (!result.entity) {
    errors.push({ field, code: "unknown_id", message: `${field} was not found in any supported lifecycle status.`, value: targetId });
  }
}

async function validateBoardFields(
  client: PingCodeClient,
  input: WorkItemValidationInput,
  errors: ValidationIssue[],
  warnings: ValidationIssue[],
  checks: Record<string, unknown>[],
): Promise<void> {
  if (!input.board_id && !input.entry_id) {
    return;
  }

  const boardsResponse = await client.get<PageResult<Entity>>(resourcePath("/v1/project/projects/{project_id}/boards", { project_id: input.project_id }));
  const boards = valuesFromResponse<Entity>(boardsResponse);
  validateId(input.board_id, "board_id", idSet(boards), errors, checks);

  if (input.entry_id && !input.board_id) {
    warnings.push({ field: "entry_id", code: "needs_board_id", message: "entry_id validation requires board_id.", value: input.entry_id });
    return;
  }

  if (input.entry_id && input.board_id && idSet(boards).has(input.board_id)) {
    const entriesResponse = await client.get<PageResult<Entity>>(
      resourcePath("/v1/project/projects/{project_id}/boards/{board_id}/entries", { project_id: input.project_id, board_id: input.board_id }),
    );
    validateId(input.entry_id, "entry_id", idSet(valuesFromResponse<Entity>(entriesResponse)), errors, checks);
  }
}

function validateId(
  value: string | undefined,
  field: string,
  validIds: Set<string>,
  errors: ValidationIssue[],
  checks: Record<string, unknown>[],
): void {
  if (!value) {
    return;
  }
  const ok = validIds.has(value);
  checks.push({ field, value, ok });
  if (!ok) {
    errors.push({ field, code: "unknown_id", message: `${field} was not found in project metadata.`, value });
  }
}

function validateAssigneeId(
  assigneeId: string | undefined,
  members: PingCodeMember[],
  errors: ValidationIssue[],
  warnings: ValidationIssue[],
  checks: Record<string, unknown>[],
): void {
  if (!assigneeId) {
    return;
  }

  const userIds = new Set(members.map((member) => member.user?.id).filter(isString));
  const memberIds = new Set(members.map((member) => member.id).filter(isString));
  const ok = userIds.has(assigneeId) || memberIds.has(assigneeId);
  checks.push({ field: "assignee_id", value: assigneeId, ok });
  if (!ok) {
    errors.push({ field: "assignee_id", code: "unknown_id", message: "assignee_id was not found among project members.", value: assigneeId });
  } else if (!userIds.has(assigneeId) && memberIds.has(assigneeId)) {
    warnings.push({ field: "assignee_id", code: "member_id_used", message: "assignee_id matches a project member id; PingCode write APIs usually expect the nested user id.", value: assigneeId });
  }
}

function validateStateId(
  stateId: string | undefined,
  typeId: string | undefined,
  details: TypeSchemaDetail[],
  errors: ValidationIssue[],
  warnings: ValidationIssue[],
  checks: Record<string, unknown>[],
): void {
  if (!stateId) {
    return;
  }

  const relevantDetails = typeId ? details.filter((detail) => detail.type_id === typeId) : details;
  const matchingTypes = relevantDetails.filter((detail) => idSet(detail.states).has(stateId));
  const ok = matchingTypes.length > 0;
  checks.push({ field: "state_id", value: stateId, type_id: typeId, ok, matching_type_ids: matchingTypes.map((detail) => detail.type_id) });
  if (!ok) {
    errors.push({ field: "state_id", code: "unknown_or_invalid_for_type", message: "state_id was not found for the selected work item type.", value: stateId });
  } else if (!typeId) {
    warnings.push({ field: "state_id", code: "type_id_recommended", message: "state_id matched at least one type; provide type_id for strict type-specific validation.", value: stateId });
  }
}

function validateProperties(
  properties: Record<string, unknown> | undefined,
  typeId: string | undefined,
  strict: boolean,
  details: TypeSchemaDetail[],
  errors: ValidationIssue[],
  warnings: ValidationIssue[],
  checks: Record<string, unknown>[],
): void {
  const propertyKeys = Object.keys(properties ?? {});
  if (!propertyKeys.length) {
    return;
  }

  const relevantDetails = typeId ? details.filter((detail) => detail.type_id === typeId) : details;
  const validKeys = new Set(relevantDetails.flatMap((detail) => detail.properties.flatMap(propertyAliases)));
  for (const key of propertyKeys) {
    const ok = validKeys.has(key);
    checks.push({ field: "properties", key, type_id: typeId, ok });
    if (ok) {
      continue;
    }
    const issue = { field: "properties", code: "unknown_property", message: `properties.${key} was not found in type-specific fields.`, value: key };
    if (strict) {
      errors.push(issue);
    } else {
      warnings.push(issue);
    }
  }

  if (!typeId) {
    warnings.push({ field: "properties", code: "type_id_recommended", message: "Provide type_id for strict type-specific property validation." });
  }
}

function idSet(values: unknown[]): Set<string> {
  return new Set(values.map(entityId).filter(isString));
}

function propertyAliases(property: Entity): string[] {
  return ["id", "key", "code", "name", "identifier", "property_key"]
    .map((field) => recordValue(property, field))
    .filter(isString);
}

function summarizeByNamedObject(items: PingCodeWorkItem[], field: string): Record<string, unknown>[] {
  const buckets = new Map<string, { value: unknown; total: number; completed: number; remaining: number }>();
  for (const item of items) {
    const value = summarizeNamedObject(recordValue(item, field));
    const object = asRecord(value);
    const key = String(object?.id ?? object?.name ?? "未设置");
    const bucket = buckets.get(key) ?? { value, total: 0, completed: 0, remaining: 0 };
    bucket.total += 1;
    if (isCompletedWorkItem(item)) {
      bucket.completed += 1;
    } else {
      bucket.remaining += 1;
    }
    buckets.set(key, bucket);
  }
  return [...buckets.values()];
}

function summarizeWorkItem(item: PingCodeWorkItem): Record<string, unknown> {
  return compactParams({
    id: recordValue(item, "id"),
    identifier: recordValue(item, "identifier"),
    title: recordValue(item, "title"),
    type: summarizeNamedObject(recordValue(item, "type")),
    assignee: summarizeNamedObject(recordValue(item, "assignee")),
    state: summarizeNamedObject(recordValue(item, "state")),
    priority: summarizeNamedObject(recordValue(item, "priority")),
    sprint: summarizeNamedObject(recordValue(item, "sprint")),
    parent: summarizeParent(recordValue(item, "parent")),
    start_at: recordValue(item, "start_at"),
    end_at: recordValue(item, "end_at"),
    story_points: recordValue(item, "story_points"),
    estimated_workload: recordValue(item, "estimated_workload"),
    remaining_workload: recordValue(item, "remaining_workload"),
  });
}

function summarizeNamedObject(value: unknown): unknown {
  if (typeof value === "string") {
    return { id: value, name: value };
  }
  const object = asRecord(value);
  if (!object) {
    return null;
  }
  return compactParams({
    id: object.id,
    name: object.display_name ?? object.name ?? object.title,
    type: object.type,
  });
}

function summarizeParent(value: unknown): unknown {
  const object = asRecord(value);
  if (!object) {
    return null;
  }
  return compactParams({ id: object.id, identifier: object.identifier, title: object.title });
}

function selectTreeRoots(rootParentIds: string[], nodes: Map<string, TreeNode>, fallbackRoots: TreeNode[]): TreeNode[] {
  const selected = rootParentIds.flatMap((id) => {
    const node = nodes.get(id);
    if (node) {
      return [node];
    }
    return fallbackRoots.filter((root) => parentWorkItemId(root.item) === id);
  });
  return selected.length ? selected : fallbackRoots.filter((root) => rootParentIds.includes(String(root.item.id ?? "")));
}

function sortTree(node: TreeNode): void {
  node.children.sort(compareTreeNodes);
  for (const child of node.children) {
    sortTree(child);
  }
}

function compareTreeNodes(a: TreeNode, b: TreeNode): number {
  const aText = `${String(a.item.identifier ?? "")} ${String(a.item.title ?? "")}`;
  const bText = `${String(b.item.identifier ?? "")} ${String(b.item.title ?? "")}`;
  return aText.localeCompare(bText, "zh-Hans-CN");
}

function countTreeNodes(nodes: TreeNode[]): number {
  return nodes.reduce((count, node) => count + 1 + countTreeNodes(node.children), 0);
}

function parentWorkItemId(item: unknown): string | undefined {
  const object = asRecord(item);
  if (!object) {
    return undefined;
  }
  const parent = asRecord(object.parent);
  return stringValue(parent?.id) ?? stringValue(object.parent_id);
}

function buildDeadlineSummary(endAt: number | undefined, now: number, dueSoonSeconds: number, remaining: number): Record<string, unknown> | undefined {
  if (endAt === undefined) {
    return undefined;
  }
  const secondsRemaining = endAt - now;
  return {
    end_at: endAt,
    days_remaining: Math.ceil(secondsRemaining / (24 * 60 * 60)),
    overdue: remaining > 0 && secondsRemaining < 0,
    near_deadline: remaining > 0 && secondsRemaining >= 0 && secondsRemaining <= dueSoonSeconds,
  };
}

function isDueSoon(endAt: number | undefined, now: number, dueSoonSeconds: number): boolean {
  return endAt !== undefined && endAt >= now && endAt - now <= dueSoonSeconds;
}

function isCompletedWorkItem(item: PingCodeWorkItem): boolean {
  const state = asRecord(recordValue(item, "state"));
  return state?.type === "completed";
}

function writeRiskLevel(change: z.infer<typeof previewChangeSchema>): "low" | "medium" | "high" {
  if (change.action === "delete_work_item") {
    return "high";
  }
  if (change.ids && change.ids.length > 20) {
    return "high";
  }
  if (change.ids && change.ids.length > 1) {
    return "medium";
  }
  return "low";
}

function summarizeWriteChange(change: z.infer<typeof previewChangeSchema>): string {
  const payload = change.payload ?? {};
  switch (change.action) {
    case "create_work_item":
      return `Create work item${stringField(payload, "title") ? ` \"${stringField(payload, "title")}\"` : ""}.`;
    case "update_work_item":
      return `Update work item ${change.work_item_id ?? stringField(payload, "work_item_id") ?? "<unknown>"}: ${Object.keys(payload).join(", ") || "no payload fields"}.`;
    case "batch_update_work_items":
      return `Batch update ${change.ids?.length ?? 0} work items: ${change.property_name ?? "<property>"}.`;
    case "assign_work_items":
      return `Assign ${change.ids?.length ?? 0} work items to ${change.assignee_id ?? "<assignee_id>"}.`;
    case "assign_work_items_to_sprint":
      return `Assign ${change.ids?.length ?? 0} work items to sprint ${change.sprint_id ?? "<sprint_id>"}.`;
    case "delete_work_item":
      return `Delete work item ${change.work_item_id ?? "<unknown>"}.`;
    case "create_sprint":
      return `Create sprint${stringField(payload, "name") ? ` \"${stringField(payload, "name")}\"` : ""}.`;
    case "update_sprint":
      return `Update sprint ${change.sprint_id ?? "<unknown>"}: ${Object.keys(payload).join(", ") || "no payload fields"}.`;
    case "create_release":
      return `Create release${stringField(payload, "name") ? ` \"${stringField(payload, "name")}\"` : ""}.`;
    case "update_release":
      return `Update release ${stringField(payload, "version_id") ?? "<unknown>"}: ${Object.keys(payload).join(", ") || "no payload fields"}.`;
  }
}

function recordValue(value: unknown, key: string): unknown {
  return asRecord(value)?.[key];
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" ? value as Record<string, unknown> : undefined;
}

function entityId(value: unknown): string | undefined {
  return stringValue(recordValue(value, "id"));
}

function entityName(value: unknown): string | undefined {
  const object = asRecord(value);
  return stringValue(object?.display_name) ?? stringValue(object?.name) ?? stringValue(object?.title) ?? stringValue(object?.identifier);
}

function stringField(record: Record<string, unknown>, key: string): string | undefined {
  return stringValue(record[key]);
}

function stringArrayField(record: Record<string, unknown>, key: string): string[] | undefined {
  const value = record[key];
  return Array.isArray(value) && value.every(isString) ? value : undefined;
}

function recordField(record: Record<string, unknown>, key: string): Record<string, unknown> | undefined {
  return asRecord(record[key]);
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function hasPositiveNumber(value: unknown): boolean {
  return typeof value === "number" && value > 0;
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
