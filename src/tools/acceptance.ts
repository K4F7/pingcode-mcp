import { z } from "zod";
import { compactParams, jsonResponse, type ToolContext } from "./common.js";

const acceptanceInputSchema = z.enum(["POC-1", "POC-2", "POC-3", "questionnaire", "manual"]);
const acceptanceConclusionSchema = z.enum(["通过", "需修复", "需复盘"]);
const acceptancePresetSchema = z.enum(["rating_platform_manual_acceptance"]);

const boundaryConfirmationSchema = z.object({
  non_diagnostic: z.boolean().default(true).describe("Confirms the task is non-diagnostic."),
  non_production: z.boolean().default(true).describe("Confirms the task is not production use."),
  no_cloud_upload: z.boolean().default(true).describe("Confirms raw artifacts are not uploaded to cloud services."),
});

const ratingPlatformChecklist = [
  "上传 POC-1 输出",
  "上传 POC-2 输出",
  "上传 POC-3 输出",
  "上传 mock questionnaire",
  "检查 W9 evidence matrix",
  "检查 run_manifest / runs_index",
];

export function registerAcceptanceTools({ server, client }: ToolContext): void {
  server.tool(
    "pingcode_create_manual_acceptance_task",
    "Create a PingCode manual acceptance work item with fixed fields for input, command, output directory, artifact list, conclusion, and boundary confirmation.",
    {
      project_id: z.string().min(1).describe("PingCode project id."),
      type_id: z.string().min(1).describe("Work item type id."),
      title: z.string().min(1).describe("Work item title."),
      acceptance_input: acceptanceInputSchema.describe("Acceptance input source."),
      acceptance_command: z.string().min(1).describe("Command used for local acceptance."),
      output_dir: z.string().min(1).describe("Local output directory, e.g. outputs/rating_platform/..."),
      artifacts: z.array(z.string().min(1)).default([]).describe("Artifact names or relative paths. Do not include raw sensitive content."),
      conclusion: acceptanceConclusionSchema.describe("Acceptance conclusion."),
      boundary_confirmation: boundaryConfirmationSchema.default({
        non_diagnostic: true,
        non_production: true,
        no_cloud_upload: true,
      }),
      description_prefix: z.string().optional().describe("Optional text prepended before the fixed acceptance template."),
      start_at: z.number().int().optional().describe("Start timestamp in seconds."),
      end_at: z.number().int().optional().describe("End timestamp in seconds."),
      priority_id: z.string().optional().describe("Priority id."),
      state_id: z.string().optional().describe("State id."),
      assignee_id: z.string().optional().describe("Assignee user id."),
      parent_id: z.string().optional().describe("Parent work item id."),
      version_ids: z.array(z.string()).optional().describe("Release/version ids."),
      estimated_workload: z.number().optional().describe("Estimated workload."),
      remaining_workload: z.number().optional().describe("Remaining workload."),
    },
    async ({
      acceptance_input,
      acceptance_command,
      output_dir,
      artifacts,
      conclusion,
      boundary_confirmation,
      description_prefix,
      ...workItem
    }) => {
      validateBoundaryConfirmation(boundary_confirmation);
      return jsonResponse(
        await client.post(
          "/v1/project/work_items",
          compactParams({
            ...workItem,
            description: buildAcceptanceDescription({
              description_prefix,
              acceptance_input,
              acceptance_command,
              output_dir,
              artifacts,
              conclusion,
              boundary_confirmation,
            }),
          }),
        ),
      );
    },
  );

  server.tool(
    "pingcode_create_acceptance_subtasks",
    "Create PingCode child work items from an acceptance checklist. The rating_platform_manual_acceptance preset expands to the standard six manual acceptance subtasks.",
    {
      project_id: z.string().min(1).describe("PingCode project id."),
      type_id: z.string().min(1).describe("Child work item type id."),
      parent_id: z.string().min(1).describe("Parent acceptance work item id."),
      preset: acceptancePresetSchema.optional().describe("Checklist preset to expand."),
      items: z.array(z.string().min(1)).optional().describe("Checklist items to create as child work items. Overrides preset when provided."),
      state_id: z.string().optional().describe("State id for child work items."),
      assignee_id: z.string().optional().describe("Assignee user id for child work items."),
      version_ids: z.array(z.string()).optional().describe("Release/version ids."),
      priority_id: z.string().optional().describe("Priority id."),
      estimated_workload: z.number().optional().describe("Estimated workload."),
      remaining_workload: z.number().optional().describe("Remaining workload."),
    },
    async ({ items, preset, ...base }) => {
      const checklist = resolveChecklist(items, preset);
      const results = await Promise.allSettled(
        checklist.map((title) => client.post("/v1/project/work_items", compactParams({ ...base, title }))),
      );

      return jsonResponse({
        parent_id: base.parent_id,
        preset: preset ?? null,
        created: results.map((result, index) => {
          const title = checklist[index];
          if (result.status === "fulfilled") {
            return { title, ok: true, result: result.value };
          }
          return { title, ok: false, error: result.reason instanceof Error ? result.reason.message : String(result.reason) };
        }),
      });
    },
  );

  server.tool(
    "pingcode_record_acceptance_evidence_summary",
    "Record a safe manual acceptance evidence summary as a PingCode comment. Do not include real subject data, raw videos, questionnaire content, or sensitive JSON.",
    {
      work_item_id: z.string().min(1).describe("PingCode work item id."),
      local_path: z.string().min(1).describe("Local evidence path, e.g. outputs/rating_platform/..."),
      run_id: z.string().min(1).describe("Run id."),
      preset_name: z.string().min(1).describe("Preset name."),
      conclusion: acceptanceConclusionSchema.describe("Summary conclusion."),
      has_warning: z.boolean().describe("Whether warnings exist."),
      warning_summary: z.string().optional().describe("Warning summary only; do not include sensitive raw data."),
      artifact_summary: z.array(z.string().min(1)).optional().describe("Artifact names or relative paths only."),
    },
    async ({ work_item_id, ...summary }) =>
      jsonResponse(
        await client.post("/v1/comments", {
          principal_type: "work_item",
          principal_id: work_item_id,
          content: buildEvidenceSummary(summary),
        }),
      ),
  );

  server.tool(
    "pingcode_describe_acceptance_status_mapping",
    "Describe recommended status mapping for manual acceptance workflows. This tool is read-only and does not change PingCode workflow configuration.",
    {},
    async () => jsonResponse({
      default_mapping: {
        打开: "待开始",
        进行中: "开发/实验中",
        已完成: "已验收通过",
        关闭: "暂不推进 / 已归档",
      },
      recommended_additions: ["待人工验收", "需复盘"],
      note: "Use pingcode_list_work_item_states to get actual state_id values, then pass state_id to create/update tools.",
    }),
  );
}

function validateBoundaryConfirmation(boundary: z.infer<typeof boundaryConfirmationSchema>): void {
  if (!boundary.non_diagnostic || !boundary.non_production || !boundary.no_cloud_upload) {
    throw new Error("Manual acceptance tasks require boundary_confirmation.non_diagnostic, non_production, and no_cloud_upload to be true.");
  }
}

function buildAcceptanceDescription(input: {
  description_prefix?: string;
  acceptance_input: z.infer<typeof acceptanceInputSchema>;
  acceptance_command: string;
  output_dir: string;
  artifacts: string[];
  conclusion: z.infer<typeof acceptanceConclusionSchema>;
  boundary_confirmation: z.infer<typeof boundaryConfirmationSchema>;
}): string {
  const sections = [
    input.description_prefix?.trim(),
    "## 人工验收任务",
    `- 验收输入：${input.acceptance_input}`,
    `- 验收命令：\`${input.acceptance_command}\``,
    `- 输出目录：\`${input.output_dir}\``,
    "- artifact 清单：",
    ...formatList(input.artifacts),
    `- 结论：${input.conclusion}`,
    "- 边界确认：",
    `  - 非诊断：${formatBoolean(input.boundary_confirmation.non_diagnostic)}`,
    `  - 非生产：${formatBoolean(input.boundary_confirmation.non_production)}`,
    `  - 不上传云端：${formatBoolean(input.boundary_confirmation.no_cloud_upload)}`,
  ];

  return sections.filter(Boolean).join("\n");
}

function buildEvidenceSummary(input: {
  local_path: string;
  run_id: string;
  preset_name: string;
  conclusion: z.infer<typeof acceptanceConclusionSchema>;
  has_warning: boolean;
  warning_summary?: string;
  artifact_summary?: string[];
}): string {
  return [
    "## 人工验收证据摘要",
    `- 本地路径：\`${input.local_path}\``,
    `- run id：${input.run_id}`,
    `- preset 名称：${input.preset_name}`,
    `- 总结论：${input.conclusion}`,
    `- 是否存在 warning：${formatBoolean(input.has_warning)}`,
    input.warning_summary ? `- warning 摘要：${input.warning_summary}` : undefined,
    "- artifact 摘要：",
    ...formatList(input.artifact_summary ?? []),
    "- 边界：PingCode 仅记录摘要；不记录真实对象信息，不上传原始视频、问卷或敏感 JSON。",
  ].filter(Boolean).join("\n");
}

function resolveChecklist(items?: string[], preset?: z.infer<typeof acceptancePresetSchema>): string[] {
  if (items?.length) {
    return items;
  }
  if (preset === "rating_platform_manual_acceptance") {
    return ratingPlatformChecklist;
  }
  throw new Error("Provide checklist items or preset: rating_platform_manual_acceptance.");
}

function formatList(items: string[]): string[] {
  return items.length ? items.map((item) => `  - ${item}`) : ["  - 未记录"];
}

function formatBoolean(value: boolean): string {
  return value ? "是" : "否";
}
