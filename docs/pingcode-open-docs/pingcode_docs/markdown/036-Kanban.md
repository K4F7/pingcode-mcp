# Kanban

### 创建一个泳道

**接口:** `POST https://rest_api_root/v1/project/projects/{project_id}/boards/{board_id}/swimlanes`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |
| `board_id` | String | 是 | 看板的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 泳道的名称。在同一看板下该名称是唯一的。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "一个泳道"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "5bb623f6a70571487ea44357",
    "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919/boards/5eb623f6a70571487ea47223/swimlanes/5bb623f6a70571487ea44357",
    "project": {
        "id": "5eb623f6a70571487ea41919",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919",
        "identifier": "KANBAN",
        "name": "kanban",
        "type": "kanban",
        "is_archived": 0,
        "is_deleted": 0
    },
    "board": {
        "id": "5eb623f6a70571487ea47223",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919/boards/5eb623f6a70571487ea47223",
        "name": "默认看板",
        "work_item_types": ["epic", "feature", "story"]
    },
    "name": "一个泳道",
    "is_system": false
}
```

### 创建一个看板

**接口:** `POST https://rest_api_root/v1/project/projects/{project_id}/boards`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 看板的名字。在同一个项目中该名字是唯一的。 |
| `work_item_types` | String[] | 否 | 看板支持的工作项类型列表。自定义工作项类型只支持hybrid类型项目里的看板。<br>可选值: `epic`, `feature`, `story`, `task`, `bug`, `issue`, `自定义工作项类型id` |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "一个看板",
    "work_item_types": ["epic", "feature", "story", "6385c650fef18f2d7222d15d"]
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "5eb623f6a70571487ea47222",
    "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919/boards/5eb623f6a70571487ea47222",
    "project": {
        "id": "5eb623f6a70571487ea41919",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919",
        "identifier": "KANBAN",
        "name": "kanban",
        "type": "kanban",
        "is_archived": 0,
        "is_deleted": 0
    },
    "name": "一个看板",
    "work_item_types": ["epic", "feature", "story", "6385c650fef18f2d7222d15d"]
}
```

### 创建一个看板栏

**接口:** `POST https://rest_api_root/v1/project/projects/{project_id}/boards/{board_id}/entries`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |
| `board_id` | String | 是 | 看板的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 看板栏的名称。在同一看板下该名称是唯一的。 |
| `wip_limit` | Number | 否 | 在制品数量。 |
| `is_split` | Boolean | 否 | 是否将看板栏拆分为进行中和已完成。<br>默认值: `false` |
| `definition_of_done` | String | 否 | 完成的定义。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "一个看板栏",
    "wip_limit": 1,
    "is_split": true,
    "definition_of_done": "Unit test passed"
}
```

#### Success Examples
**响应示例：**
```json
{
   "id": "5ab623f6a70571487ea45634",
   "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919/boards/5eb623f6a70571487ea47222/entries/5ab623f6a70571487ea45634",
   "project": {
      "id": "5eb623f6a70571487ea41919",
      "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919",
      "identifier": "KANBAN",
      "name": "kanban",
      "type": "kanban",
      "is_archived": 0,
      "is_deleted": 0
   },
   "board": {
      "id": "5eb623f6a70571487ea47222",
      "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919/boards/5eb623f6a70571487ea47222",
      "name": "kanban",
      "work_item_types": ["epic", "feature", "story"]
   },
   "name": "一个看板栏",
   "is_system": false,
   "is_split": true,
   "wip_limit": 1,
   "definition_of_done": "Unit test passed"
}
```

### 删除一个泳道

**接口:** `DELETE https://rest_api_root/v1/project/projects/{project_id}/boards/{board_id}/swimlanes/{swimlane_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |
| `board_id` | String | 是 | 看板的id。 |
| `swimlane_id` | String | 是 | 泳道的id. |

#### Success Examples
**响应示例：**
```json
{
    "id": "5bb623f6a70571487ea44357",
    "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919/boards/5eb623f6a70571487ea47223/swimlanes/5bb623f6a70571487ea44357",
    "project": {
        "id": "5eb623f6a70571487ea41919",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919",
        "identifier": "KANBAN",
        "name": "kanban",
        "type": "kanban",
        "is_archived": 0,
        "is_deleted": 0
    },
    "board": {
        "id": "5eb623f6a70571487ea47223",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919/boards/5eb623f6a70571487ea47223",
        "name": "默认看板",
        "work_item_types": ["epic", "feature", "story"]
    },
    "name": "一个泳道",
    "is_system": false
}
```

### 删除一个看板

**接口:** `DELETE https://rest_api_root/v1/project/projects/{project_id}/boards/{board_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |
| `board_id` | String | 是 | 看板的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "5eb623f6a70571487ea47222",
    "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919/boards/5eb623f6a70571487ea47222",
    "project": {
        "id": "5eb623f6a70571487ea41919",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919",
        "identifier": "KANBAN",
        "name": "kanban",
        "type": "kanban",
        "is_archived": 0,
        "is_deleted": 0
    },
    "name": "一个看板",
    "work_item_types": ["epic", "feature"]
}
```

### 删除一个看板栏

**接口:** `DELETE https://rest_api_root/v1/project/projects/{project_id}/boards/{board_id}/entries/{entry_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |
| `board_id` | String | 是 | 看板的id。 |
| `entry_id` | String | 是 | 看板栏的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "5ab623f6a70571487ea45634",
            "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919/boards/5eb623f6a70571487ea47223/entries/5ab623f6a70571487ea45634",
            "project": {
                "id": "5eb623f6a70571487ea41919",
                "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919",
                "identifier": "KANBAN",
                "name": "kanban",
                "type": "kanban",
                "is_archived": 0,
                "is_deleted": 0
            },
            "board": {
                "id": "5eb623f6a70571487ea47223",
                "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919/boards/5eb623f6a70571487ea47223",
                "name": "默认看板",
                "work_item_types": ["epic", "feature", "story"]
            },
            "name": "需求池",
            "is_system": false,
            "is_split": true,
            "wip_limit": 1,
            "definition_of_done": "Unit test passed"
        }
    ]
}
```

### 获取泳道列表

**接口:** `GET https://rest_api_root/v1/project/projects/{project_id}/boards/{board_id}/swimlanes`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |
| `board_id` | String | 是 | 看板的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "5bb623f6a70571487ea44357",
            "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919/boards/5eb623f6a70571487ea47223/swimlanes/5bb623f6a70571487ea44357",
            "project": {
                "id": "5eb623f6a70571487ea41919",
                "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919",
                "identifier": "KANBAN",
                "name": "kanban",
                "type": "kanban",
                "is_archived": 0,
                "is_deleted": 0
            },
            "board": {
                "id": "5eb623f6a70571487ea47223",
                "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919/boards/5eb623f6a70571487ea47223",
                "name": "默认看板",
                "work_item_types": ["epic", "feature", "story"]
            },
            "name": "一个泳道",
            "is_system": false
        }
    ]
}
```

### 获取看板列表

**接口:** `GET https://rest_api_root/v1/project/projects/{project_id}/boards`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "5eb623f6a70571487ea47222",
            "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919/boards/5eb623f6a70571487ea47222",
            "project": {
                "id": "5eb623f6a70571487ea41919",
                "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919",
                "identifier": "KANBAN",
                "name": "kanban",
                "type": "kanban",
                "is_archived": 0,
                "is_deleted": 0
            },
            "name": "kanban",
            "work_item_types": ["epic", "feature", "story"]
        }
    ]
}
```

### 获取看板栏列表

**接口:** `GET https://rest_api_root/v1/project/projects/{project_id}/boards/{board_id}/entries`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |
| `board_id` | String | 是 | 看板的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "5ab623f6a70571487ea45634",
            "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919/boards/5eb623f6a70571487ea47223/entries/5ab623f6a70571487ea45634",
            "project": {
                "id": "5eb623f6a70571487ea41919",
                "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919",
                "identifier": "KANBAN",
                "name": "kanban",
                "type": "kanban",
                "is_archived": 0,
                "is_deleted": 0
            },
            "board": {
                "id": "5eb623f6a70571487ea47223",
                "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919/boards/5eb623f6a70571487ea47223",
                "name": "默认看板",
                "work_item_types": ["epic", "feature", "story"]
            },
            "name": "需求池",
            "is_system": false,
            "is_split": true,
            "wip_limit": 1,
            "definition_of_done": "Unit test passed"
        }
    ]
}
```

### 部分更新一个泳道

**接口:** `PATCH https://rest_api_root/v1/project/projects/{project_id}/boards/{board_id}/swimlanes/{swimlane_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |
| `board_id` | String | 是 | 看板的id。 |
| `swimlane_id` | String | 是 | 泳道的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 泳道的名称。在同一看板下该名称是唯一的。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "一个泳道"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "5bb623f6a70571487ea44357",
    "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919/boards/5eb623f6a70571487ea47223/swimlanes/5bb623f6a70571487ea44357",
    "project": {
        "id": "5eb623f6a70571487ea41919",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919",
        "identifier": "KANBAN",
        "name": "kanban",
        "type": "kanban",
        "is_archived": 0,
        "is_deleted": 0
    },
    "board": {
        "id": "5eb623f6a70571487ea47223",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919/boards/5eb623f6a70571487ea47223",
        "name": "默认看板",
        "work_item_types": ["epic", "feature", "story"]
    },
    "name": "一个泳道",
    "is_system": false
}
```

### 部分更新一个看板

**接口:** `PATCH https://rest_api_root/v1/project/projects/{project_id}/boards/{board_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |
| `board_id` | String | 是 | 看板的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 看板的名字。在同一个项目中该名字是唯一的。 |
| `work_item_types` | String[] | 否 | 看板支持的工作项类型列表。<br>可选值: `epic`, `feature`, `story`, `task`, `bug`, `issue`, `自定义工作项类型id` |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "一个看板",
    "work_item_types": ["epic", "feature", "6385c650fef18f2d7222d15d"]
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "5eb623f6a70571487ea47222",
    "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919/boards/5eb623f6a70571487ea47222",
    "project": {
        "id": "5eb623f6a70571487ea41919",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919",
        "identifier": "KANBAN",
        "name": "kanban",
        "type": "kanban",
        "is_archived": 0,
        "is_deleted": 0
    },
    "name": "一个看板",
    "work_item_types": ["epic", "feature", "6385c650fef18f2d7222d15d"]
}
```

### 部分更新一个看板栏

**接口:** `PATCH https://rest_api_root/v1/project/projects/{project_id}/boards/{board_id}/entries/{entry_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |
| `board_id` | String | 是 | 看板的id。 |
| `entry_id` | String | 是 | 看板栏的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 看板栏的名称。在同一看板下该名称是唯一的。 |
| `wip_limit` | Number | 否 | 在制品数量。 |
| `is_split` | Boolean | 否 | 是否将看板栏拆分为进行中和已完成<br>默认值: `false` |
| `definition_of_done` | String | 否 | 完成的定义。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "需求池",
    "wip_limit": 1,
    "is_split": true,
    "definition_of_done": "Unit test passed"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "5ab623f6a70571487ea45634",
    "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919/boards/5eb623f6a70571487ea47223/entries/5ab623f6a70571487ea45634",
    "project": {
        "id": "5eb623f6a70571487ea41919",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919",
        "identifier": "KANBAN",
        "name": "kanban",
        "type": "kanban",
        "is_archived": 0,
        "is_deleted": 0
    },
    "board": {
        "id": "5eb623f6a70571487ea47223",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919/boards/5eb623f6a70571487ea47223",
        "name": "默认看板",
        "work_item_types": ["epic", "feature", "story"]
    },
    "name": "需求池",
    "is_system": false,
    "is_split": true,
    "wip_limit": 1,
    "definition_of_done": "Unit test passed"
}
```
