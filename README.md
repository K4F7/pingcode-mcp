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
