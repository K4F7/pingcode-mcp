# /home/jenkins/agent/workspace/pc-open-Beta-CD-job/src/modules/v1/ship/configuration/ticket/solution/facade.ts

### GetV1ShipTicket_solutions

**接口:** `GET https://rest_api_root/v1/ship/ticket_solutions`

**权限:** 企业令牌/用户令牌

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "6422711c3f12e6c1e46d40e9",
            "url": "https://rest_api_root/v1/ship/ticket_solutions/6422711c3f12e6c1e46d40e9",
            "name": "进入需求池"
        }
    ]
}
```

### GetV1ShipTicket_solutionsTicket_solution_id

**接口:** `GET https://rest_api_root/v1/ship/ticket_solutions/{ticket_solution_id}`

#### Success Examples
**响应示例：**
```json
{
    "id": "6422711c3f12e6c1e46d40e9",
    "url": "https://rest_api_root/v1/ship/ticket_solutions/6422711c3f12e6c1e46d40e9",
    "name": "进入需求池"
}
```
