# Scrum

### 创建一个迭代

**接口:** `POST https://rest_api_root/v1/project/projects/{project_id}/sprints`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 迭代的名称。 |
| `start_at` | Number | 是 | 迭代开始的时间。 |
| `end_at` | Number | 是 | 迭代结束的时间。 |
| `assignee_id` | String | 是 | 迭代负责人的id。 |
| `description` | String | 否 | 迭代的描述。 |
| `status` | String | 否 | 迭代的状态。<br>可选值: `pending`, `in_progress`, `completed` |
| `category_ids` | String[] | 否 | 迭代类别的id数组。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "Sprint 2",
    "start_at": 1589791860,
    "end_at": 1589791860,
    "assignee_id": "a0417f68e846aae315c85d24643678a9",
    "description": "This is sprint 2",
    "status": "pending",
    "category_ids": ["676a460a0fd987b7ea320887"]
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "5ecf7b74eaab845a2aa53132",
    "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/sprints/5ecf7b74eaab845a2aa53132",
    "project": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
        "identifier": "SCR",
        "name": "Scrum项目",
        "type": "scrum",
        "is_archived": 0,
        "is_deleted": 0
    },
    "name": "Sprint 2",
    "status": "pending",
    "assignee": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "start_at": 1589791860,
    "end_at": 1589791860,
    "description": "This is sprint 2",
    "started_at": 1589791860,
    "completed_at": 1589791960,
    "total_story_points": 0,
    "started_story_points": 0,
    "completed_story_points": 0,
    "categories": [
        {
            "id": "676a460a0fd987b7ea320887",
            "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/sprint_categories/676a460a0fd987b7ea320887",
            "name": "Category 1"
        }
    ],
    "created_at": 1676454024,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1676454024,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    }
}
```

### 创建一个迭代分组

**接口:** `POST https://rest_api_root/v1/project/projects/{project_id}/sprint_sections`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 迭代分组的名称。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "Section 1"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "634f869a0fd987b7ea320833",
    "url": "http://rest_api_root/v1/project/projects/63560f3ad02cbc4f9df91236/sprint_sections/634f869a0fd987b7ea320833",
    "project": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
        "identifier": "SCR",
        "name": "Scrum项目",
        "type": "scrum",
        "is_archived": 0,
        "is_deleted": 0
    },
    "name": "Section 1"
}
```

### 创建一个迭代类别

**接口:** `POST https://rest_api_root/v1/project/projects/{project_id}/sprint_categories`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 迭代类别的名称。 |
| `section_id` | String | 否 | 迭代类别所属迭代分组id。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "Category 1",
    "section_id": "634f869a0fd987b7ea320833"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "676a460a0fd987b7ea320887",
    "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/sprint_categories/676a460a0fd987b7ea320887",
    "project": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
        "identifier": "SCR",
        "name": "Scrum项目",
        "type": "scrum",
        "is_archived": 0,
        "is_deleted": 0
    },
    "name": "Category 1",
    "section": {
        "id": "634f869a0fd987b7ea320833",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/sprint_sections/634f869a0fd987b7ea320833",
        "name": "Section 1"
    }
}
```

### 删除一个迭代分组

**接口:** `DELETE https://rest_api_root/v1/project/projects/{project_id}/sprint_sections/{section_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |
| `section_id` | String | 是 | 迭代分组的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "634f869a0fd987b7ea320834",
    "url": "http://rest_api_root/v1/project/projects/63560f3ad02cbc4f9df91236/sprint_sections/634f869a0fd987b7ea320834",
    "project": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
        "identifier": "SCR",
        "name": "Scrum项目",
        "type": "scrum",
        "is_archived": 0,
        "is_deleted": 0
    },
    "name": "Section 2"
}
```

### 删除一个迭代类别

**接口:** `DELETE https://rest_api_root/v1/project/projects/{project_id}/sprint_categories/{sprint_category_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |
| `sprint_category_id` | String | 是 | 迭代类别的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "676a460a0fd987b7ea320888",
    "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/sprint_categories/676a460a0fd987b7ea320888",
    "project": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
        "identifier": "SCR",
        "name": "Scrum项目",
        "type": "scrum",
        "is_archived": 0,
        "is_deleted": 0
    },
    "name": "Category 2",
    "section": {
        "id": "634f869a0fd987b7ea320833",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/sprint_sections/634f869a0fd987b7ea320833",
        "name": "Section 1"
    }
}
```

### 批量创建迭代

**接口:** `POST https://rest_api_root/v1/project/sprints/bulk`

**权限:** 企业令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `sprints` | Object[] | 是 | 需要批量创建的迭代。该参数是一个对象数组（数组内对象不得超过100个）。 |
| `sprints.project_id` | String | 是 | 迭代所属项目的id。 |
| `sprints.name` | String | 是 | 迭代的名称。 |
| `sprints.start_at` | Number | 是 | 迭代开始的时间。 |
| `sprints.end_at` | Number | 是 | 迭代结束的时间。 |
| `sprints.assignee_id` | String | 是 | 迭代负责人的id。 |
| `sprints.description` | String | 否 | 迭代的描述。 |
| `sprints.status` | String | 否 | 迭代的状态。<br>可选值: `pending`, `in_progress`, `completed` |
| `sprints.category_ids` | String[] | 否 | 迭代类别的id列表。 |

#### Parameters Examples
**请求示例：**
```json
{
    "sprints": [
        {
            "project_id": "5eb623f6a70571487ea47000",
            "name": "Sprint 3",
            "start_at": 1589791860,
            "end_at": 1589791860,
            "assignee_id": "a0417f68e846aae315c85d24643678a9",
            "description": "This is sprint 3",
            "status": "pending",
            "category_ids": ["5e6b35de50ef8153c2062f70"]
        }
    ]
}
```

#### Success Examples
**响应示例：**
```json
[
    {
        "state": "success",
        "sprint": {
            "id": "5ecf7b74eaab845a2aa53134",
            "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/sprints/5ecf7b74eaab845a2aa53134",
            "project": {
                "id": "5eb623f6a70571487ea47000",
                "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
                "identifier": "SCR",
                "name": "Scrum项目",
                "type": "scrum",
                "is_archived": 0,
                "is_deleted": 0
            },
            "name": "Sprint 3",
            "status": "pending",
            "assignee": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "start_at": 1589791860,
            "end_at": 1589791860,
            "description": "This is sprint 3",
            "started_at": 1589791860,
            "completed_at": 1589791960,
            "total_story_points": 0,
            "started_story_points": 0,
            "completed_story_points": 0,
            "categories": [
                {
                    "id": "676a460a0fd987b7ea320887",
                    "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/sprint_categories/676a460a0fd987b7ea320887",
                    "name": "Category 1"
                }
            ],
            "created_at": 1676454024,
            "created_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "updated_at": 1676454024,
            "updated_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        }
    }
]
```

### 获取迭代分组列表

**接口:** `GET https://rest_api_root/v1/project/projects/{project_id}/sprint_sections`

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
    "total": 2,
    "values": [
        {
            "id": "634f869a0fd987b7ea320833",
            "url": "http://rest_api_root/v1/project/projects/63560f3ad02cbc4f9df91236/sprint_sections/634f869a0fd987b7ea320833",
            "project": {
                "id": "5eb623f6a70571487ea47000",
                "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
                "identifier": "SCR",
                "name": "Scrum项目",
                "type": "scrum",
                "is_archived": 0,
                "is_deleted": 0
            },
            "name": "Section 1"
        },
        {
            "id": "634f869a0fd987b7ea320834",
            "url": "http://rest_api_root/v1/project/projects/63560f3ad02cbc4f9df91236/sprint_sections/634f869a0fd987b7ea320834",
            "project": {
                "id": "5eb623f6a70571487ea47000",
                "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
                "identifier": "SCR",
                "name": "Scrum项目",
                "type": "scrum",
                "is_archived": 0,
                "is_deleted": 0
            },
            "name": "Section 2"
        }
    ]
}
```

### 获取迭代列表

**接口:** `GET https://rest_api_root/v1/project/projects/{project_id}/sprints`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |

**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 迭代的名称。 |
| `status` | String | 否 | 迭代的状态。<br>可选值: `pending`, `in_progress`, `completed` |
| `created_between` | String | 否 | 创建时间介于的时间范围，通过','分割起始时间。 |
| `updated_between` | String | 否 | 更新时间介于的时间范围，通过','分割起始时间。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "5ecf7b74eaab845a2aa53138",
            "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/sprints/5ecf7b74eaab845a2aa53138",
            "project": {
                "id": "5eb623f6a70571487ea47000",
                "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
                "identifier": "SCR",
                "name": "Scrum项目",
                "type": "scrum",
                "is_archived": 0,
                "is_deleted": 0
            },
            "name": "Sprint 1",
            "status": "completed",
            "assignee": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "start_at": 1589791860,
            "end_at": 1589791860,
            "description": "This is sprint 1",
            "started_at": 1589791860,
            "completed_at": 1589791960,
            "total_story_points": 0,
            "started_story_points": 0,
            "completed_story_points": 0,
            "categories": [
                {
                    "id": "676a460a0fd987b7ea320887",
                    "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/sprint_categories/676a460a0fd987b7ea320887",
                    "name": "Category 1"
                }
            ],
            "created_at": 1676454024,
            "created_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "updated_at": 1676454024,
            "updated_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        }
    ]
}
```

### 获取迭代类别列表

**接口:** `GET https://rest_api_root/v1/project/projects/{project_id}/sprint_categories`

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
    "total": 2,
    "values": [
        {
            "id": "676a460a0fd987b7ea320887",
            "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/sprint_categories/676a460a0fd987b7ea320887",
            "project": {
                "id": "5eb623f6a70571487ea47000",
                "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
                "identifier": "SCR",
                "name": "Scrum项目",
                "type": "scrum",
                "is_archived": 0,
                "is_deleted": 0
            },
            "name": "Category 1",
            "section": {
                "id": "634f869a0fd987b7ea320833",
                "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/sprint_sections/634f869a0fd987b7ea320833",
                "name": "Section 1"
            }
        },
        {
            "id": "676a460a0fd987b7ea320888",
            "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/sprint_categories/676a460a0fd987b7ea320888",
            "project": {
                "id": "5eb623f6a70571487ea47000",
                "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
                "identifier": "SCR",
                "name": "Scrum项目",
                "type": "scrum",
                "is_archived": 0,
                "is_deleted": 0
            },
            "name": "Category 2",
            "section": {
                "id": "634f869a0fd987b7ea320833",
                "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/sprint_sections/634f869a0fd987b7ea320833",
                "name": "Section 1"
            }
        }
    ]
}
```

### 部分更新一个迭代

**接口:** `PATCH https://rest_api_root/v1/project/projects/{project_id}/sprints/{sprint_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |
| `sprint_id` | String | 是 | 迭代的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 迭代的名称。 |
| `start_at` | Number | 否 | 迭代开始的时间。 |
| `end_at` | Number | 否 | 迭代结束的时间。 |
| `assignee_id` | String | 否 | 迭代负责人的id。 |
| `description` | String | 否 | 迭代的描述。 |
| `status` | String | 否 | 迭代的状态。<br>可选值: `pending`, `in_progress`, `completed` |
| `category_ids` | String[] | 否 | 迭代类别的id列表。 |

#### Parameters Examples
**请求示例：**
```json
{
   "name": "Sprint 2",
   "start_at": 1589791860,
   "end_at": 1589791860,
   "assignee_id": "a0417f68e846aae315c85d24643678a9",
   "description": "This is sprint 2",
   "status": "in_progress",
   "category_ids": ["5e6b35de50ef8153c2062f70"]
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "5ecf7b74eaab845a2aa53132",
    "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/sprints/5ecf7b74eaab845a2aa53132",
    "project": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
        "identifier": "SCR",
        "name": "Scrum项目",
        "type": "scrum",
        "is_archived": 0,
        "is_deleted": 0
    },
    "name": "Sprint 2",
    "status": "in_progress",
    "assignee": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "start_at": 1589791860,
    "end_at": 1589791860,
    "description": "This is sprint 2",
    "started_at": 1589791860,
    "completed_at": 1589791960,
    "total_story_points": 0,
    "started_story_points": 0,
    "completed_story_points": 0,
    "categories": [
        {
            "id": "676a460a0fd987b7ea320887",
            "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/sprint_categories/676a460a0fd987b7ea320887",
            "name": "Category 1"
        }
    ],
    "created_at": 1676454024,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1676454024,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    }
}
```

### 部分更新一个迭代分组

**接口:** `PATCH https://rest_api_root/v1/project/projects/{project_id}/sprint_sections/{section_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |
| `section_id` | String | 是 | 迭代分组的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 迭代分组的名称。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "Section 1"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "634f869a0fd987b7ea320833",
    "url": "http://rest_api_root/v1/project/projects/63560f3ad02cbc4f9df91236/sprint_sections/634f869a0fd987b7ea320833",
    "project": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
        "identifier": "SCR",
        "name": "Scrum项目",
        "type": "scrum",
        "is_archived": 0,
        "is_deleted": 0
    },
    "name": "Section 1"
}
```

### 部分更新一个迭代类别

**接口:** `PATCH https://rest_api_root/v1/project/projects/{project_id}/sprint_categories/{sprint_category_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |
| `sprint_category_id` | String | 是 | 迭代类别的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 迭代类别的名称。 |
| `section_id` | String | 否 | 迭代类别所属迭代分组id。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "Category 2",
    "section_id": "634f869a0fd987b7ea320833"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "676a460a0fd987b7ea320888",
    "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/sprint_categories/676a460a0fd987b7ea320888",
    "project": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
        "identifier": "SCR",
        "name": "Scrum项目",
        "type": "scrum",
        "is_archived": 0,
        "is_deleted": 0
    },
    "name": "Category 2",
    "section": {
        "id": "634f869a0fd987b7ea320833",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/sprint_sections/634f869a0fd987b7ea320833",
        "name": "Section 1"
    }
}
```
