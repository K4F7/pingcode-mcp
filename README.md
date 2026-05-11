# PingCode MCP Server

在需要使用 PingCode MCP 的项目根目录创建或更新 `.mcp.json`。

## 使用 Access Token

```json
{
  "mcpServers": {
    "pingcode": {
      "type": "stdio",
      "command": "node",
      "args": ["D:/Documents/Workload/mcp/pingcode-mcp/dist/index.js"],
      "env": {
        "PINGCODE_ACCESS_TOKEN": "填入你的 PingCode Access Token"
      }
    }
  }
}
```

需要替换的地方：

- `args[0]`：填入本项目构建后的 `dist/index.js` 绝对路径。
- `PINGCODE_ACCESS_TOKEN`：填入你的 PingCode Access Token。

## 使用 Client ID / Secret

如果不直接使用 Access Token，也可以填写 Client ID 和 Client Secret：

```json
{
  "mcpServers": {
    "pingcode": {
      "type": "stdio",
      "command": "node",
      "args": ["D:/Documents/Workload/mcp/pingcode-mcp/dist/index.js"],
      "env": {
        "PINGCODE_CLIENT_ID": "填入你的 PingCode Client ID",
        "PINGCODE_CLIENT_SECRET": "填入你的 PingCode Client Secret"
      }
    }
  }
}
```

需要替换的地方：

- `args[0]`：填入本项目构建后的 `dist/index.js` 绝对路径。
- `PINGCODE_CLIENT_ID`：填入你的 PingCode Client ID。
- `PINGCODE_CLIENT_SECRET`：填入你的 PingCode Client Secret。

> 二选一配置即可：`PINGCODE_ACCESS_TOKEN` 或 `PINGCODE_CLIENT_ID` + `PINGCODE_CLIENT_SECRET`。
