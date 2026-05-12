# PingCode MCP Server

在需要使用 PingCode MCP 的项目根目录创建或更新 `.mcp.json`。

默认通过 `npx` 拉取 GitHub 仓库源码运行，填入 `.mcp.json` 后即可直接使用：

```json
{
  "mcpServers": {
    "pingcode": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "github:K4F7/pingcode-mcp"]
    }
  }
}
```

## 使用 Access Token

```json
{
  "mcpServers": {
    "pingcode": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "github:K4F7/pingcode-mcp"],
      "env": {
        "PINGCODE_ACCESS_TOKEN": "填入你的 PingCode Access Token"
      }
    }
  }
}
```

需要替换的地方：

- `PINGCODE_ACCESS_TOKEN`：填入你的 PingCode Access Token。

## 使用 Client ID / Secret

如果不直接使用 Access Token，也可以填写 Client ID 和 Client Secret：

```json
{
  "mcpServers": {
    "pingcode": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "github:K4F7/pingcode-mcp"],
      "env": {
        "PINGCODE_CLIENT_ID": "填入你的 PingCode Client ID",
        "PINGCODE_CLIENT_SECRET": "填入你的 PingCode Client Secret"
      }
    }
  }
}
```

需要替换的地方：

- `PINGCODE_CLIENT_ID`：填入你的 PingCode Client ID。
- `PINGCODE_CLIENT_SECRET`：填入你的 PingCode Client Secret。

> 二选一配置即可：`PINGCODE_ACCESS_TOKEN` 或 `PINGCODE_CLIENT_ID` + `PINGCODE_CLIENT_SECRET`。

## 主要工具清单

写操作会直接修改 PingCode，请优先在非生产项目中验证。

### 项目

- `pingcode_list_projects`
- `pingcode_create_project`（写）
- `pingcode_update_project`（写）
- `pingcode_list_project_members`
- `pingcode_list_boards`
- `pingcode_list_board_entries`

### 工作项

- `pingcode_list_work_items`
- `pingcode_list_work_items_compact`
- `pingcode_summarize_sprint_work_items`
- `pingcode_create_work_item`（写）
- `pingcode_batch_create_work_items`（写，顺序创建）
- `pingcode_update_work_item`（写）
- `pingcode_batch_update_work_items`（写）
- `pingcode_delete_work_item`（写）
- `pingcode_list_work_item_types`
- `pingcode_list_work_item_states`
- `pingcode_list_work_item_priorities`
- `pingcode_list_work_item_properties`

### 发布和 Sprint

- `pingcode_list_releases`
- `pingcode_create_release`（写）
- `pingcode_update_release`（写）
- `pingcode_list_sprints`
- `pingcode_create_sprint`（写）
- `pingcode_update_sprint`（写）
- `pingcode_close_sprint`（写）
- `pingcode_assign_work_items_to_sprint`（写）

### 评论、附件和活动

- `pingcode_list_comments`
- `pingcode_create_comment`（写）
- `pingcode_delete_comment`（写）
- `pingcode_list_attachments`
- `pingcode_upload_code_snippet`（写）
- `pingcode_upload_attachment`（写）
- `pingcode_delete_attachment`（写）
- `pingcode_list_activities`

`pingcode_upload_attachment` 会把本地文件上传到 PingCode。不要上传真实对象信息、原始视频、问卷全文、敏感 JSON 或未脱敏验收原件；优先上传非敏感摘要、截图或报告。

### 测试管理

- `pingcode_list_test_plans`
- `pingcode_create_test_plan`（写）
- `pingcode_update_test_plan`（写）
- `pingcode_list_test_cases`
- `pingcode_create_test_case`（写）
- `pingcode_batch_create_test_cases`（写）
- `pingcode_list_test_runs`
- `pingcode_create_test_run`（写）
- `pingcode_batch_create_test_runs`（写）
- `pingcode_update_test_run_status`（写）

### Wiki 页面

- `pingcode_create_page`（写）
- `pingcode_list_pages`
- `pingcode_get_page_content`
- `pingcode_update_page`（写）

### 关系、上下文和分配

- `pingcode_link_work_items`（写）
- `pingcode_list_work_item_relations`
- `pingcode_create_relation`（写）
- `pingcode_list_relations`
- `pingcode_delete_relation`（写）
- `pingcode_get_work_item_context`
- `pingcode_recommend_assignees`
- `pingcode_assign_work_items`（写）

## 暂未暴露的能力

以下能力在本地 OpenAPI 文档中没有确认可靠接口，因此暂不提供 MCP 工具：

- 项目归档/恢复。
- 工作项归档/恢复。
- 工作项状态流转接口；当前只能用 `pingcode_update_work_item` 设置 `state_id`。
- 看板列移动接口；当前只能查询 board 和 entry。
- 附件按 id 获取或由 MCP 直接下载；请先用 `pingcode_list_attachments` 获取元数据和 `download_url`。
- 评论更新和富文本评论。
- 通用跨域高级搜索；先使用各 list 工具的过滤条件和 `page_size` / `page_index` 分页。

## 人工验收任务

面向人工验收流程提供 4 个高层工具：

- `pingcode_create_manual_acceptance_task`：创建带固定字段的人工验收工作项。
- `pingcode_create_acceptance_subtasks`：把 checklist 创建为父工作项下的 PingCode 子任务。
- `pingcode_record_acceptance_evidence_summary`：以评论记录证据摘要，不上传附件。
- `pingcode_describe_acceptance_status_mapping`：返回推荐状态映射，不修改 PingCode 流程配置。

人工验收任务固定字段包括：

- 验收输入：`POC-1` / `POC-2` / `POC-3` / `questionnaire` / `manual`
- 验收命令
- 输出目录
- artifact 清单
- 结论：`通过` / `需修复` / `需复盘`
- 边界确认：非诊断、非生产、不上传云端

`pingcode_create_acceptance_subtasks` 支持 `rating_platform_manual_acceptance` preset，会创建：

- 上传 POC-1 输出
- 上传 POC-2 输出
- 上传 POC-3 输出
- 上传 mock questionnaire
- 检查 W9 evidence matrix
- 检查 run_manifest / runs_index

## 证据记录规范

PingCode 只记录摘要，不上传或粘贴原始敏感材料。`pingcode_record_acceptance_evidence_summary` 只写入：

- 本地路径，例如 `outputs/rating_platform/...`
- run id
- preset 名称
- 总结论
- 是否存在 warning
- artifact 摘要

不要在 PingCode 中记录真实对象信息、原始视频、问卷全文或敏感 JSON。

## 状态映射

如果不改 PingCode 流程，推荐先按现有状态理解：

- 打开 = 待开始
- 进行中 = 开发/实验中
- 已完成 = 已验收通过
- 关闭 = 暂不推进 / 已归档

如果可以调整流程，建议增加 `待人工验收` 和 `需复盘`。当前 MCP 不修改流程配置；先使用 `pingcode_list_work_item_states` 获取实际 `state_id`，再传给创建或更新工具。

## MCP 工具边界

工作项之间的关系使用：

- `pingcode_link_work_items`
- `pingcode_list_work_item_relations`

通用 relation 工具只用于非 work item-to-work item 的通用关系：

- `pingcode_create_relation`
- `pingcode_list_relations`
- `pingcode_delete_relation`

`pingcode_delete_relation` 只能删除 `/v1/relations` 关系，不能删除 `pingcode_link_work_items` 创建的工作项关系。

`pingcode_upload_code_snippet` 的 `format` 必须是 PingCode 支持的 snippet 枚举：`clike`, `css`, `dart`, `django`, `dockerfile`, `go`, `markdown`, `nginx`, `python`, `php`, `shell`, `sql`, `swift`, `html`, `javascript`, `jsx`, `pascal`, `sass`, `stylus`, `vue`, `yaml`, `haskell`。普通文本摘要请使用 `pingcode_create_comment` 或 `pingcode_record_acceptance_evidence_summary`。
