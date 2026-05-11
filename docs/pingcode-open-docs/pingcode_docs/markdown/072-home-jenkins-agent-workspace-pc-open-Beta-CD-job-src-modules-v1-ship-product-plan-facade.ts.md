# /home/jenkins/agent/workspace/pc-open-Beta-CD-job/src/modules/v1/ship/product/plan/facade.ts

### GetV1ShipProductsProduct_idPlansPlan_id

**接口:** `GET https://rest_api_root/v1/ship/products/{product_id}/plans/{plan_id}`

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 产品的id。 |
| `plan_id` | String | 是 | 需求排期id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "63bb744414bd13c9def24ce4",
    "url": "http://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e6/plans/63bb744414bd13c9def24ce4",
    "product": {
        "id": "6422711c3f12e6c1e46d40e6",
        "url": "http://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e6",
        "identifier": "SLC",
        "name": "示例产品",
        "is_archived": 0,
        "is_deleted": 0
    },
    "name": "账号管理",
    "assignee": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "start_at": 1672704000,
    "end_at": 1672963199
}
```
