# REST API

## 概述

### URI结构

**接口:** ` URI结构`

PingCode REST API通过URI路径提供对资源的访问，使用{}将URI路径的一部分标记为可使用参数替换的部分，URI路径遵循以下规则： https://rest_api_root/v1[/{area}]/{resource}
 例如： https://open.pingcode.com/v1/scm/products
https://open.pingcode.com/v1/scm/products/{product_id}/repositories
https://open.pingcode.com/v1/release/environments
 rest_api_root表示REST API的根路径，在不同的环境中rest_api_root值有所不同： 公有云环境的rest_api_root值为：https://open.pingcode.com
私有部署环境的rest_api_root值为：https://xxxxxx/open
 oauth2_root表示OAuth2页面的根路径，在不同的环境中oauth2_root值也有所不同： 公有云环境的oauth2_root值为：https://open.pingcode.com/oauth2
私有部署环境的oauth2_root值为：https://xxxxxx/oauth2

### 使用方式

**接口:** ` 使用方式`

PingCode REST API支持 OPTIONS/GET/PUT/PATCH/POST/DELETE等标准的HTTP请求。 对于GET/DELETE请求，通过querystring传递参数；对于POST/PUT/PATCH请求，需要在headers中添加"content-type": "application/json"，然后通过body传递参数。 PingCode REST API使用HTTP状态码指示已执行操作的状态； 使用response body传递数据。 单个资源 当创建、更新、获取、删除单个资源成功时，会返回当前操作的资源。 HTTP状态码：201
Body：
{
     "id": "5e05d8448f8461dada9ba29c",
     "url": "https://rest_api_root/v1/{resource}",
     "name": "资源名称",
     "desc": "资源简介",
     "created_at": 1578897962
}
 分页数据 当请求多条数据时，默认每一页返回30条，最大返回100条。 通过在querystring中设置page_size和page_index，指定每一页的数据量和第几页的数据（page_index为0时，表示第一页）。 在返回的数据结构中，page_size表示当前每页的数据量，page_index表示当前在第几页，total表示资源总数量，values表示资源的数组。 HTTP状态码：200
Body：
{
     "page_size": 30,
     "page_index": 0,
     "total": 100,
     "values": [
         {
             "id": "5e05d8448f8461dada9ba29c",
             "url": "https://rest_api_root/v1/{resource}",
             "name": "资源名称",
             "desc": "资源简介",
             "created_at": 1578897962
         },
         ...
     ]
}
 错误 当请求失败时，会返回错误码和错误信息。 HTTP状态码：500
Body：
{
     "code": "100000",
     "message": "Internal Server Error"
}

### 数据结构

**接口:** ` 数据结构`

PingCode REST API使用json作为通讯格式，所有时间均使用10位数字组成的时间戳。 PingCode REST API为每一种资源定义两种数据结构，全量结构和引用结构。 全量结构包含资源的所有属性，引用结构只包含必要属性。当获取单个资源或分页获取资源列表时，PingCode REST API将返回全量结构； 当获取其他资源引用当前资源时，PingCode REST API将返回引用结构。 全量结构 {
     "id": "5e05d8448f8461dada9ba29c",
     "url": "https://rest_api_root/v1/{resource}",
     "name": "资源名称",
     "desc": "资源简介",
     "created_at": 1578897962
}
 引用结构 {
     "id": "5e05d8448f8461dada9ba29c",
     "url": "https://rest_api_root/v1/{resource}",
     "name": "资源名称"
}

### 欢迎使用

**接口:** ` 欢迎使用`

欢迎使用PingCode Representational State Transfer APIs （简称PingCode REST API）。 PingCode REST API用于通过HTTP与PingCode服务端进行远程交互，例如创建、修改、查询、删除PingCode的资源。

### 频率限制

**接口:** ` 频率限制`

PingCode REST API限制使用者的请求频率，目的是保障核心服务的可靠且响应迅速。频率限制不用于区分客户和服务级别。 具体策略 根据使用者的身份标识，PingCode REST API最多允许每位使用者每分钟请求200次，单位分钟内超出限制数量的HTTP请求将统一返回错误信息。 HTTP状态码：429
Headers：
{
     "x-pc-retry-after": 50
}
Body：
{
     "code": "100038",
     "message": "请求频率过高"
}
 x-pc-retry-after指示使用者在重新请求之前必须等待的秒数。如果使用者在到期之前重新发出请求，则请求会再次失败并返回相同的HTTP状态码和response body。 合理请求 由于频率限制的存在，最小化请求将十分必要，一个显而易见的策略是缓存不会轻易变更的数据。 另外使用PingCode Flow中的发送Webhook和发送HTTP请求来将PingCode中发生变更的数据发送给订阅者，也可以有效降低 PingCode REST API的请求数量，从而降低遇到频率限制的风险。

## 鉴权

### 客户端凭据

**接口:** ` 客户端凭据`

客户端凭据（OAuth2 Client Credentials）是最简单、最直接的授权方式，通过客户端凭据获取的访问令牌（access_token）不区分用户身份， 在PingCode中将这类访问令牌称为“企业令牌”，企业令牌具有系统管理员的权限，主要用于访问和操作全局的数据，请谨慎管理。 获取企业令牌时，需要提供client_id和client_secret， 您可以在PingCode企业后台的凭据管理中创建一个应用，配置数据范围，然后拿到client_id和client_secret。 使用企业令牌时，只需要在HTTP请求在headers中添加"authorization": "Bearer {access_token}"，即可访问受保护的数据。

### 授权码

**接口:** ` 授权码`

授权码（OAuth2 Authorization Code）是最常用的授权方式，主要用于企业员工管理自己的数据。 通过授权码获取的访问令牌（access_token）在PingCode中称为“用户令牌”，用户令牌属于某个用户所有，仅能访问这个用户有权限操作的数据。 第三方应用可以通过用户的手动授权获得该用户的用户令牌，然后通过用户令牌访问该用户有权限操作的数据。 在通过授权码的方式获取用户令牌时，需要提供client_id和code， 您可以在PingCode企业后台的凭据管理中创建一个应用，配置数据范围，然后拿到client_id和redirect_uri。 在您的第三方应用中引导用户访问请求授权页面，PingCode会询问该用户是否授权给您的应用。 得到用户许可后，浏览器会跳转redirect_uri页面，并在URL的参数中包含一个临时的code，然后您的应用可以根据client_id和code获取该用户的用户令牌。 使用用户令牌时，只需要在HTTP请求在headers中添加"authorization": "Bearer {access_token}"，即可访问受保护的数据。

## 客户端凭据

### 获取企业令牌

**接口:** `get https://rest_api_root/v1/auth/token?grant_type=client_credentials`

access_token的有效期为30天，删除PingCode的应用或重置应用的Secret都会导致access_token失效。

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `grant_type` | String | 是 | OAuth2的授予类型，这里固定为：client_credentials。 |
| `client_id` | String | 是 | PingCode应用的Client ID |
| `client_secret` | String | 是 | PingCode应用的Secret |

#### Parameters Examples
**请求示例：**
```json
{
   "grant_type": "client_credentials",
   "client_id": "CVMTTGAwaYiz",
   "client_secret": "QjssecMkBwTzVDaNJsOIUvPp"
}
```

#### Success Examples
**响应示例：**
```json
{
   "access_token": "e7321ca8-f724-4abd-9169-d76d095c6acf",
   "token_type": "Bearer",
   "expires_in": 1577808000
}
```

## 授权码

### 刷新用户令牌

**接口:** `get https://rest_api_root/v1/auth/token?grant_type=refresh_token`

通过refresh_token重新获取access_token，可以避免用户频繁重新授权。refresh_token的有效期为90天，删除PingCode的应用或重置应用的Secret都会导致refresh_token失效。

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `grant_type` | String | 是 | OAuth2的授予类型，这里固定为：refresh_token。 |
| `refresh_token` | String | 是 | 通过authorization_code获取access_token时，一起返回的refresh_token。 |

#### Parameters Examples
**请求示例：**
```json
{
   "grant_type": "refresh_token",
   "refresh_token": "f724-4abd-9169-e7321ca8-d76d095c6acf"
}
```

#### Success Examples
**响应示例：**
```json
{
   "access_token": "e7321ca8-f724-4abd-9169-d76d095c6acf",
   "token_type": "Bearer",
   "expires_in": 1577808000
}
```

### 获取用户令牌

**接口:** `get https://rest_api_root/v1/auth/token?grant_type=authorization_code`

access_token的有效期为30天，删除PingCode的应用或重置应用的Secret都会导致access_token失效。

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `grant_type` | String | 是 | OAuth2的授予类型，这里固定为：authorization_code。 |
| `client_id` | String | 是 | PingCode应用的Client ID |
| `client_secret` | String | 是 | PingCode应用的Secret |
| `code` | String | 是 | 用户授权后，在回调地址中拿到的code值。 |

#### Parameters Examples
**请求示例：**
```json
{
   "grant_type": "authorization_code",
   "client_id": "CVMTTGAwaYiz",
   "client_secret": "QjssecMkBwTzVDaNJsOIUvPp",
   "code": "9169-d76d095c6acf-f724-4abd-e7321ca8"
}
```

#### Success Examples
**响应示例：**
```json
{
   "access_token": "e7321ca8-f724-4abd-9169-d76d095c6acf",
   "refresh_token": "f724-4abd-9169-e7321ca8-d76d095c6acf",
   "token_type": "Bearer",
   "expires_in": 1577808000
}
```

### 请求授权

**接口:** `get https://oauth2_root/authorize?response_type=code`

用户访问请求授权页面前，需要登录PingCode，否则页面自动跳转到PingCode的登录页面。需要注意，私有环境的授权页面地址为：https://xxxxxx/oauth2/authorize 。

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `response_type` | String | 是 | 响应类型，这里固定为code类型。 |
| `client_id` | String | 是 | PingCode应用的Client ID |

## 全局

### 个人

**接口:** ` 个人`

用于查看和管理个人的基本信息。

### 安全

**接口:** ` 安全`

### 组织

**接口:** ` 组织`

### 组织

**接口:** ` 组织`

### 组织

**接口:** ` 组织`

### 组织

**接口:** ` 组织`

### 组织

**接口:** ` 组织`

### 组织

**接口:** ` 组织`

### 通用

**接口:** ` 通用`

## 个人

### 获取个人信息

**接口:** `GET https://rest_api_root/v1/myself`

**权限:** 用户令牌

#### Success Examples
**响应示例：**
```json
{
    "id": "a0417f68e846aae315c85d24643678a9",
    "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
    "name": "john",
    "display_name": "John",
    "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png",
    "email": "terry@pingcode.com",
    "mobile": "15000000000",
    "status": "enabled",
    "preferences": {
        "locale": "zh-cn",
        "timezone": "Asia/Shanghai"
    },
    "permissions": {
        "agile_create_project": true,
        "agile_configuration": true,
        "create_user": true
    }
}
```

## 组织

### 企业

**接口:** ` 企业`

用于查看企业的基本信息。

#### Success
**资源属性**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 企业的id。 |
| `url` | String | 是 | 企业的资源地址。 |
| `name` | String | 是 | 企业的名称。 |
| `secondary_domain` | String | 是 | 企业的二级域名。 |

#### Success Examples
**全量数据示例：**
```json
{
     "id": "56ba35de87ad7153c2062f65",
     "url": "https://rest_api_root/v1/directory/team",
     "name": "YCtech",
     "secondary_domain": "yctech"
 }
```

**引用数据示例：**
```json
{
     "id": "56ba35de87ad7153c2062f65",
     "url": "https://rest_api_root/v1/directory/team",
     "name": "YCtech",
     "secondary_domain": "yctech"
 }
```

### 企业成员

**接口:** ` 企业成员`

用于查看和管理企业成员的基本信息。
 资源地址：{GET} https://rest_api_root/v1/directory/users/{user_id}

#### Success
**资源属性**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 企业成员的id。 |
| `url` | String | 是 | 企业成员的资源地址。 |
| `name` | String | 是 | 企业成员的名称。 |
| `display_name` | String | 是 | 企业成员的显示名。 |
| `avatar` | String | 是 | 企业成员的头像地址。 |
| `department` | Object | 是 | 企业成员的部门。 |
| `job` | Object | 是 | 企业成员的职位。 |
| `email` | String | 是 | 企业成员的邮箱地址。 |
| `mobile` | String | 是 | 企业成员的手机号。 |
| `status` | String | 是 | 企业成员的状态。<br>可选值: `enabled`, `disabled` |
| `employee_number` | String | 是 | 企业成员的工号。 |

#### Success Examples
**全量数据示例：**
```json
{
    "id": "a0417f68e846aae315c85d24643678a9",
    "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
    "name": "john",
    "display_name": "John",
    "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png",
    "department": {
        "id": "6422711c3f12e6c1e46d40e6",
        "url": "https://rest_api_root/v1/directory/departments/6422711c3f12e6c1e46d40e6",
        "name": "技术支持"
    },
    "job": {
        "id": "6440c881c56f557eb1aff6e5",
        "url": "https://rest_api_root/v1/directory/jobs/6440c881c56f557eb1aff6e5",
        "name": "后端工程师"
    },
    "email": "john@email.com",
    "mobile": "15000000000",
    "status": "enabled",
    "employee_number": "zxv"
}
```

**引用数据示例：**
```json
{
    "id": "a0417f68e846aae315c85d24643678a9",
    "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
    "name": "john",
    "display_name": "John",
    "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
}
```

### 团队

**接口:** ` 团队`

用于查看企业的团队信息。
 资源地址：{GET} https://rest_api_root/v1/directory/groups/{group_id}

#### Success
**资源属性**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 团队的id。 |
| `url` | String | 是 | 团队的资源地址。 |
| `name` | String | 是 | 团队的名称。 |
| `visibility` | String | 是 | 团队的可见性。<br>可选值: `private`, `public` |
| `description` | String | 是 | 团队的描述。 |

#### Success Examples
**全量数据示例：**
```json
{
    "id": "63c8fb32729dee3334d96af7",
    "url": "https://rest_api_root/v1/directory/groups/63c8fb32729dee3334d96af7",
    "name": "Open Team",
    "visibility": "private",
    "description": "This is Open Team."
}
```

**引用数据示例：**
```json
{
    "id": "63c8fb32729dee3334d96af7",
    "url": "https://rest_api_root/v1/directory/groups/63c8fb32729dee3334d96af7",
    "name": "Open Team"
}
```

### 团队

**接口:** ` 团队`

用于查看和管理团队成员的信息。

### 职位

**接口:** ` 职位`

用于查看企业的职位信息。
 资源地址：{GET} https://rest_api_root/v1/directory/jobs/{job_id}

#### Success
**资源属性**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 职位的id。 |
| `url` | String | 是 | 职位的资源地址。 |
| `name` | String | 是 | 职位的名称。 |
| `is_system` | Boolean | 是 | 职位是否为系统内置。<br>可选值: `true`, `false` |

#### Success Examples
**全量数据示例：**
```json
{
    "id": "6422711c3f12e6c1e46d40e6",
    "url": "https://rest_api_root/v1/directory/jobs/6422711c3f12e6c1e46d40e6",
    "name": "技术总监",
    "is_system": true
}
```

**引用数据示例：**
```json
{
    "id": "6422711c3f12e6c1e46d40e6",
    "url": "https://rest_api_root/v1/directory/jobs/6422711c3f12e6c1e46d40e6",
    "name": "技术总监"
}
```

### 角色

**接口:** ` 角色`

用于查看企业的角色信息。
 资源地址：{GET} https://rest_api_root/v1/directory/roles/{role_id}

#### Success
**资源属性**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 角色的id。 |
| `url` | String | 是 | 角色的资源地址。 |
| `name` | String | 是 | 角色的名称。 |
| `is_system` | Boolean | 是 | 角色是否为系统内置。<br>可选值: `true`, `false` |

#### Success Examples
**全量数据示例：**
```json
{
    "id": "6422711c3f12e6c1e46d40e6",
    "url": "https://rest_api_root/v1/directory/roles/6422711c3f12e6c1e46d40e6",
    "name": "管理员",
    "is_system": true
}
```

**引用数据示例：**
```json
{
    "id": "6422711c3f12e6c1e46d40e6",
    "url": "https://rest_api_root/v1/directory/roles/6422711c3f12e6c1e46d40e6",
    "name": "管理员"
}
```

### 部门

**接口:** ` 部门`

用于查看和管理企业的部门信息。
 资源地址：{GET} https://rest_api_root/v1/directory/departments/{department_id}

#### Success
**资源属性**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 部门的id。 |
| `url` | String | 是 | 部门的资源地址。 |
| `name` | String | 是 | 部门的名称。 |
| `head` | Object | 是 | 部门的负责人。 |
| `parent` | Object | 是 | 父部门。 |

#### Success Examples
**全量数据示例：**
```json
{
    "id": "6422711c3f12e6c1e46d40e6",
    "url": "https://rest_api_root/v1/directory/departments/6422711c3f12e6c1e46d40e6",
    "name": "技术支持",
    "head": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "parent": {
        "id": "6422711c3f12e6c1e46d40e2",
        "url": "https://rest_api_root/v1/directory/departments/6422711c3f12e6c1e46d40e2",
        "name": "技术中心"
    }
}
```

**引用数据示例：**
```json
{
    "id": "6422711c3f12e6c1e46d40e6",
    "url": "https://rest_api_root/v1/directory/departments/6422711c3f12e6c1e46d40e6",
    "name": "技术支持"
}
```

## 企业

### 获取企业信息

**接口:** `GET https://rest_api_root/v1/directory/team`

**权限:** 企业令牌/用户令牌

#### Success Examples
**响应示例：**
```json
{
    "id": "56ba35de87ad7153c2062f65",
    "url": "https://rest_api_root/v1/directory/team",
    "name": "YCtech",
    "secondary_domain": "yctech"
}
```

## 企业成员

### 创建一个企业成员

**接口:** `POST https://rest_api_root/v1/directory/users`

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 企业成员的名称，在一个企业中这个名称是唯一的。 |
| `display_name` | String | 是 | 企业成员的显示名。 |
| `email` | String | 否 | 企业成员的邮箱地址，在一个企业中这个邮箱地址是唯一的，邮箱地址和手机号其中一个必填。 |
| `mobile` | String | 否 | 企业成员的手机号，在一个企业中这个手机号是唯一，邮箱地址和手机号其中一个必填。 |
| `password` | String | 否 | 企业成员的密码，长度为6～200的字符串(包含6和200)。 |
| `department_id` | String | 否 | 企业成员的部门id。 |
| `job_id` | String | 否 | 企业成员的职位id。 |
| `employee_number` | String | 否 | 企业成员的工号。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "john",
    "display_name": "John",
    "email": "john@email.com",
    "mobile": "15000000000",
    "password": "123456",
    "department_id": "6422711c3f12e6c1e46d40e6",
    "job_id": "6440c881c56f557eb1aff6e5",
    "employee_number": "zxv"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "a0417f68e846aae315c85d24643678a9",
    "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
    "name": "john",
    "display_name": "John",
    "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png",
    "department": {
        "id": "6422711c3f12e6c1e46d40e6",
        "url": "https://rest_api_root/v1/directory/departments/6422711c3f12e6c1e46d40e6",
        "name": "技术支持"
    },
    "job": {
        "id": "6440c881c56f557eb1aff6e5",
        "url": "https://rest_api_root/v1/directory/jobs/6440c881c56f557eb1aff6e5",
        "name": "后端工程师"
    },
    "email": "john@email.com",
    "mobile": "15000000000",
    "status": "init",
    "employee_number": "zxv"
}
```

### 批量更新企业成员属性

**接口:** `PATCH https://rest_api_root/v1/directory/users/bulk`

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `user_ids` | String[] | 是 | 企业成员的id数组，不能包含自己和团队拥有者。 |
| `property_name` | String | 是 | 需要更新的企业成员属性名，目前仅支持：status（可选值为：enabled、disabled） |
| `property_value` | String | 是 | 需要更新的企业成员属性值。 |

#### Parameters Examples
**请求示例：**
```json
{
    "user_ids": [
        "a0417f68e846aae315c85d24643678a9",
        "a0417f68e846aae315c85d24643678a8"
    ],
    "property_name": "status",
    "property_value": "enabled"
}
```

#### Success Examples
**响应示例：**
```json
[
    {
        "state": "success",
        "user_id": "a0417f68e846aae315c85d24643678a9"
    },
    {
        "state": "failure",
        "user_id": "a0417f68e846aae315c85d24643678a8",
        "message": "failure reason.."
    }
]
```

### 获取企业成员列表

**接口:** `GET https://rest_api_root/v1/directory/users`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 企业成员的名称，在一个企业中这个名称是唯一的。 |
| `keywords` | String | 否 | 关键词模糊搜索，支持姓名、用户名。 |
| `emails` | String | 否 | 企业成员的邮箱地址，使用','分割，最多只能20个。 |
| `mobiles` | String | 否 | 企业成员的手机号，使用','分割，最多只能20个。 |
| `department_ids` | String | 否 | 企业成员的部门id，使用','分割，最多只能20个。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
            "name": "john",
            "display_name": "John",
            "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png",
            "department": {
                "id": "6422711c3f12e6c1e46d40e6",
                "url": "https://rest_api_root/v1/directory/departments/6422711c3f12e6c1e46d40e6",
                "name": "技术支持"
            },
            "job": {
                "id": "6440c881c56f557eb1aff6e5",
                "url": "https://rest_api_root/v1/directory/jobs/6440c881c56f557eb1aff6e5",
                "name": "后端工程师"
            },
            "email": "john@email.com",
            "mobile": "15000000000",
            "status": "enabled",
            "employee_number": "zxv"
        }
    ]
}
```

### 部分更新一个企业成员

**接口:** `PATCH https://rest_api_root/v1/directory/users/{user_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 企业成员的名称，在一个企业中这个名称是唯一的。 |
| `display_name` | String | 否 | 企业成员的显示名。 |
| `email` | String | 否 | 企业成员的邮箱地址，在一个企业中这个邮箱地址是唯一的。 |
| `mobile` | String | 否 | 企业成员的手机号，在一个企业中这个手机号是唯一的。 |
| `status` | String | 否 | 企业成员的状态。<br>可选值: `enabled`, `disabled` |
| `employee_number` | String | 否 | 企业成员的工号。 |
| `department_id` | String | 否 | 企业成员的部门id。 |
| `job_id` | String | 否 | 企业成员的职位id。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "john",
    "display_name": "John",
    "email": "john@email.com",
    "mobile": "15000000000",
    "status": "enabled",
    "employee_number": "zxv",
    "department_id": "6422711c3f12e6c1e46d40e6",
    "job_id": "6440c881c56f557eb1aff6e5"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "a0417f68e846aae315c85d24643678a9",
    "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
    "name": "john",
    "display_name": "John",
    "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png",
    "department": {
        "id": "6422711c3f12e6c1e46d40e6",
        "url": "https://rest_api_root/v1/directory/departments/6422711c3f12e6c1e46d40e6",
        "name": "技术支持"
    },
    "job": {
        "id": "6440c881c56f557eb1aff6e5",
        "url": "https://rest_api_root/v1/directory/jobs/6440c881c56f557eb1aff6e5",
        "name": "后端工程师"
    },
    "email": "john@email.com",
    "mobile": "15000000000",
    "status": "enabled",
    "employee_number": "zxv"
}
```

## 部门

### 创建一个部门

**接口:** `POST https://rest_api_root/v1/directory/departments`

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 部门的名称，在一个企业中这个名称是唯一的。 |
| `parent_id` | String | 否 | 父部门的id。 |
| `head_id` | String | 否 | 部门负责人的id。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "技术支持",
    "parent_id": "6422711c3f12e6c1e46d40e2",
    "head_id": "70e9933e5e7948779b9b8978b6489038"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "6422711c3f12e6c1e46d40e6",
    "url": "https://rest_api_root/v1/directory/departments/6422711c3f12e6c1e46d40e6",
    "name": "技术支持",
    "head": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "parent": {
        "id": "6422711c3f12e6c1e46d40e2",
        "url": "https://rest_api_root/v1/directory/departments/6422711c3f12e6c1e46d40e2",
        "name": "技术中心"
    }
}
```

### 删除一个部门

**接口:** `DELETE https://rest_api_root/v1/directory/departments/{department_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `department_id` | String | 是 | 部门id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "6422711c3f12e6c1e46d40e6",
    "url": "https://rest_api_root/v1/directory/departments/6422711c3f12e6c1e46d40e6",
    "name": "技术支持",
    "head": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "parent": {
        "id": "6422711c3f12e6c1e46d40e2",
        "url": "https://rest_api_root/v1/directory/departments/6422711c3f12e6c1e46d40e2",
        "name": "技术中心"
    }
}
```

### 获取部门列表

**接口:** `GET https://rest_api_root/v1/directory/departments`

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
            "id": "6422711c3f12e6c1e46d40e6",
            "url": "https://rest_api_root/v1/directory/departments/6422711c3f12e6c1e46d40e6",
            "name": "技术支持",
            "head": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "parent": {
                "id": "6422711c3f12e6c1e46d40e2",
                "url": "https://rest_api_root/v1/directory/departments/6422711c3f12e6c1e46d40e2",
                "name": "技术中心"
            }
        }
    ]
}
```

### 部分更新一个部门

**接口:** `PATCH https://rest_api_root/v1/directory/departments/{department_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `department_id` | String | 是 | 部门id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 部门的名称，在一个企业中这个名称是唯一的。 |
| `parent_id` | String | 否 | 父部门的id。 |
| `head_id` | String | 否 | 部门负责人的id。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "技术支持",
    "parent_id": "6422711c3f12e6c1e46d40e2",
    "head_id": "70e9933e5e7948779b9b8978b6489038"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "6422711c3f12e6c1e46d40e6",
    "url": "https://rest_api_root/v1/directory/departments/6422711c3f12e6c1e46d40e6",
    "name": "技术支持",
    "head": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "parent": {
        "id": "6422711c3f12e6c1e46d40e2",
        "url": "https://rest_api_root/v1/directory/departments/6422711c3f12e6c1e46d40e2",
        "name": "技术中心"
    }
}
```

## 团队

### 创建一个团队

**接口:** `POST https://rest_api_root/v1/directory/groups`

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 团队的名称，在一个企业中这个名称是唯一的。 |
| `visibility` | String | 否 | 团队的可见范围。<br>默认值: `private`<br>可选值: `private`, `public` |
| `description` | String | 否 | 团队的描述。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "Open Team",
    "visibility": "private",
    "description": "This is Open Team."
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "63c8fb32729dee3334d96af7",
    "url": "https://rest_api_root/v1/directory/groups/63c8fb32729dee3334d96af7",
    "name": "Open Team",
    "visibility": "private",
    "description": "This is Open Team."
}
```

### 向团队中添加一个成员

**接口:** `POST https://rest_api_root/v1/directory/groups/{group_id}/members`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `group_id` | String | 是 | 团队id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `user_id` | String | 是 | 用户id。 |
| `role` | String | 是 | 团队角色。<br>可选值: `manager`, `member` |

#### Parameters Examples
**请求示例：**
```json
{
    "user_id": "a0417f68e846aae315c85d24643678a9",
    "role": "manager"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "a0417f68e846aae315c85d24643678a9",
    "url": "https://rest_api_root/v1/directory/groups/64ca0f67cb78a0a80e1a999e/members/a0417f68e846aae315c85d24643678a9",
    "group": {
        "id": "64ca0f67cb78a0a80e1a999e",
        "url": "https://rest_api_root/v1/directory/groups/64ca0f67cb78a0a80e1a999e",
        "name": "PingCode"
    },
    "user": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "role": "manager"
}
```

### 在团队中移除一个成员

**接口:** `DELETE https://rest_api_root/v1/directory/groups/{group_id}/members/{member_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `group_id` | String | 是 | 团队id。 |
| `member_id` | String | 是 | 团队成员id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "a0417f68e846aae315c85d24643678a9",
    "url": "https://rest_api_root/v1/directory/groups/64ca0f67cb78a0a80e1a999e/members/a0417f68e846aae315c85d24643678a9",
    "group": {
        "id": "64ca0f67cb78a0a80e1a999e",
        "url": "https://rest_api_root/v1/directory/groups/64ca0f67cb78a0a80e1a999e",
        "name": "PingCode"
    },
    "user": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "role": "manager"
}
```

### 获取团队中的成员列表

**接口:** `GET https://rest_api_root/v1/directory/groups/{group_id}/members`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `group_id` | String | 是 | 团队id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/directory/groups/64ca0f67cb78a0a80e1a999e/members/a0417f68e846aae315c85d24643678a9",
            "group": {
                "id": "64ca0f67cb78a0a80e1a999e",
                "url": "https://rest_api_root/v1/directory/groups/64ca0f67cb78a0a80e1a999e",
                "name": "PingCode"
            },
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "role": "manager"
        }
    ]
}
```

### 获取团队列表

**接口:** `GET https://rest_api_root/v1/directory/groups`

**权限:** 企业令牌/用户令牌

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 2,
    "values": [
        {
            "id": "63c8fb32729dee3334d96af7",
            "url": "https://rest_api_root/v1/directory/groups/63c8fb32729dee3334d96af7",
            "name": "Open Team",
            "visibility": "private",
            "description": "This is Open Team."
        },
        {
            "id": "64ca0f67cb78a0a80e1a999e",
            "url": "https://rest_api_root/v1/directory/groups/64ca0f67cb78a0a80e1a999e",
            "name": "PingCode",
            "visibility": "public",
            "description": "This is PingCode."
        }
    ]
}
```

### 部分更新一个团队

**接口:** `PATCH https://rest_api_root/v1/directory/groups/{group_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `group_id` | String | 是 | 团队id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 团队的名称，在一个企业中这个名称是唯一的。 |
| `visibility` | String | 否 | 团队的可见范围。<br>可选值: `private`, `public` |
| `description` | String | 否 | 团队的描述。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "Open Team Update",
    "visibility": "public",
    "description": "This is Update Open Team."
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "63c8fb32729dee3334d96af7",
    "url": "https://rest_api_root/v1/directory/groups/63c8fb32729dee3334d96af7",
    "name": "Open Team Update",
    "visibility": "public",
    "description": "This is Update Open Team."
}
```

## 角色

### 获取角色列表

**接口:** `GET https://rest_api_root/v1/directory/roles`

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
            "id": "6422711c3f12e6c1e46d40e6",
            "url": "https://rest_api_root/v1/directory/roles/6422711c3f12e6c1e46d40e6",
            "name": "管理员",
            "is_system": true
        }
    ]
}
```

## 职位

### 获取职位列表

**接口:** `GET https://rest_api_root/v1/directory/jobs`

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
            "id": "6422711c3f12e6c1e46d40e6",
            "url": "https://rest_api_root/v1/directory/jobs/6422711c3f12e6c1e46d40e6",
            "name": "技术总监",
            "is_system": true
        }
    ]
}
```

## 安全

### 日志

**接口:** ` 日志`

用于查看企业的日志信息。

### 日志

**接口:** ` 日志`

用于查看企业的日志信息。

## 日志

### 获取审计日志列表

**接口:** `GET https://rest_api_root/v1/security/audit_logs`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `operated_between` | String | 是 | 操作时间介于的时间范围，通过','分割起始时间。 |
| `operated_bys` | String | 否 | 操作人的列表，使用','分割，最多只能20个。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "5fca7b74efab845a2fa53181",
            "url": "https://rest_api_root/v1/security/audit_logs/5fca7b74efab845a2fa53181",
            "operated_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "operated_at": 1676454024,
            "operate_object": "规则",
            "application": "自动化",
            "ip": "45.251.20.42",
            "summary": "修改规则",
            "detail": "规则：规则1\n类型：自动化规则\n描述：-"
        }
    ]
}
```

### 获取登录日志列表

**接口:** `GET https://rest_api_root/v1/security/login_logs`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `logged_between` | String | 是 | 登录时间介于的时间范围，通过','分割起始时间。 |
| `user_ids` | String | 否 | 成员id的列表，使用','分割，最多只能20个。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "5fca7b74efab845a2fa53181",
            "url": "https://rest_api_root/v1/security/login_logs/5fca7b74efab845a2fa53181",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "login_method": "账号密码",
            "region": "北京海淀区",
            "ip": "45.251.20.42",
            "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "created_at": 1676454024
        }
    ]
}
```

## 通用

### 关注人

**接口:** ` 关注人`

用于查看和管理关注人的基本信息。
 资源地址：{GET} https://rest_api_root/v1/participants/{participant_id}

#### Success
**资源属性**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 关注人的id。 |
| `url` | String | 是 | 关注人的资源地址。 |
| `type` | String | 是 | 关注人的类型。<br>可选值: `user`, `user_group` |
| `user` | Object | 否 | 关注的用户。当type为user时，该字段返回。 |
| `user_group` | Object | 否 | 关注的团队。当type为user_group时，该字段返回。 |

#### Success Examples
**全量数据示例（用户类型）:**
```json
{
    "id": "a0417f68e846aae315c85d24643678a9",
    "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=work_item&principal_id=63e1bf51760505c8795ebccc",
    "type": "user",
    "user": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    }
}
```

**全量数据示例（评审用户类型）:**
```json
{
    "id": "a0417f68e846aae315c85d24643678a9",
    "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=idea&review_id=6f168f764eba01a5278b87cd",
    "type": "user",
    "user": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    }
}
```

**全量数据示例（团队类型）:**
```json
{
    "id": "63c8fb32729dee3334d96af7",
    "url": "https://rest_api_root/v1/participants/63c8fb32729dee3334d96af7?principal_type=work_item&principal_id=63e1bf51760505c8795ebccc",
    "type": "user_group",
    "user_group": {
        "id": "63c8fb32729dee3334d96af7",
        "url": "https://rest_api_root/v1/directory/groups/63c8fb32729dee3334d96af7",
        "name": "Open Team"
    }
}
```

**引用数据示例（用户类型）:**
```json
{
    "id": "a0417f68e846aae315c85d24643678a9",
    "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=work_item&principal_id=63e1bf51760505c8795ebccc",
    "type": "user",
    "user": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    }
}
```

**引用数据示例（团队类型）:**
```json
{
    "id": "63c8fb32729dee3334d96af7",
    "url": "https://rest_api_root/v1/participants/63c8fb32729dee3334d96af7?principal_type=work_item&principal_id=63e1bf51760505c8795ebccc",
    "type": "user_group",
    "user_group": {
        "id": "63c8fb32729dee3334d96af7",
        "url": "https://rest_api_root/v1/directory/groups/63c8fb32729dee3334d96af7",
        "name": "Open Team"
    }
}
```

### 关联

**接口:** ` 关联`

用于查看和管理关联的基本信息。
 资源地址：{GET} https://rest_api_root/v1/relations/{relation_id}

#### Success
**资源属性**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 关联的id。 |
| `url` | String | 是 | 关联的资源地址。 |
| `principal_type` | String | 是 | 关联主体的类型。<br>可选值: `idea`, `ticket`, `work_item`, `test_plan`, `test_run`, `test_case`, `page` |
| `principal` | Object | 是 | 关联的主体。 |
| `target_type` | String | 是 | 关联的目标类型。<br>可选值: `ticket`, `work_item`, `test_case`, `idea`, `page` |
| `target` | Object | 是 | 关联的目标。 |

#### Success Examples
**全量数据示例（工作项关联需求）：**
```json
{
    "id": "653b1b4a3113be5bb040e4c5",
    "url": "https://rest_api_root/v1/relations/653b1b4a3113be5bb040e4c5",
    "principal_type": "work_item",
    "principal": {
        "id": "5edca524cad2fa1125cb0630",
        "url": "https://rest_api_root/v1/project/work_items/5edca524cad2fa1125cb0630",
        "identifier": "SCR-5",
        "title": "这是一个缺陷",
        "type": "bug",
        "start_at": 1583290309,
        "end_at": 1583290347,
        "parent_id": "5edca524cad2fa112b06105c",
        "short_id": "c9WqLmTO",
        "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
        "properties": {
            "prop_a": "prop_a_value",
            "prop_b": "prop_b_value"
        }
    },
    "target_type": "idea",
    "target": {
        "id": "64b4d70ba368e6594360ea24",
        "url": "https://rest_api_root/v1/ship/ideas/64b4d70ba368e6594360ea24",
        "identifier": "SLC-1",
        "title": "示例需求",
        "short_id": "Ogf1EYey",
        "html_url": "https://yctech.pingcode.com/ship/ideas/Ogf1EYey"
    }
}
```

**全量数据示例（测试计划关联工作项）：**
```json
{
    "id": "fa1125cb06305edca524cad2",
    "url": "https://rest_api_root/v1/relations/fa1125cb06305edca524cad2",
    "principal_type": "test_plan",
    "principal": {
        "id": "5eb6a70571487623fea47000",
        "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/plans/5eb6a70571487623fea47000",
        "name": "测试计划",
        "status": "in_progress",
        "start_at": 1589791860,
        "end_at": 1589791870
    },
    "target_type": "work_item",
    "target": {
        "id": "5edca524cad2fa1125cb0630",
        "url": "https://rest_api_root/v1/project/work_items/5edca524cad2fa1125cb0630",
        "identifier": "SCR-5",
        "title": "这是一个缺陷",
        "type": "bug",
        "start_at": 1583290309,
        "end_at": 1583290347,
        "parent_id": "5edca524cad2fa112b06105c",
        "short_id": "c9WqLmTO",
        "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
        "properties": {
            "prop_a": "prop_a_value",
            "prop_b": "prop_b_value"
        }
    }
}
```

**全量数据示例（工单关联测试用例）：**
```json
{
    "id": "6552d7ab1bffb252b82645ba",
    "url": "https://rest_api_root/v1/relations/6552d7ab1bffb252b82645ba",
    "principal_type": "ticket",
    "principal": {
        "id": "63eca888a0a13a3efc8d4a43",
        "url": "https://rest_api_root/v1/ship/tickets/63eca888a0a13a3efc8d4a43",
        "identifier": "SLC-T1",
        "title": "希望新增支持第三方账号注册",
        "short_id": "pdMUgQzZ",
        "html_url": "https://yctech.pingcode.com/ship/tickets/pdMUgQzZ"
    },
    "target_type": "test_case",
    "target": {
        "id": "5edca524cad2fa112b06305c",
        "url": "https://rest_api_root/v1/testhub/cases/5edca524cad2fa112b06305c",
        "identifier": "CSK-10",
        "title": "这是一个测试用例",
        "level": "P1",
        "short_id": "fdUw3C",
        "html_url": "https://yctech.pingcode.com/testhub/cases/fdUw3C",
        "properties": {
            "prop_a": "prop_a_value",
            "prop_b": "prop_b_value"
        }
    }
}
```

**全量数据示例（工作项关联页面）：**
```json
{
    "id": "6552d9da1bffb252b8276cf7",
    "url": "https://rest_api_root/v1/relations/6552d9da1bffb252b8276cf7",
    "principal_type": "work_item",
    "principal": {
        "id": "5edca524cad2fa1125cb0630",
        "url": "https://rest_api_root/v1/project/work_items/5edca524cad2fa1125cb0630",
        "identifier": "SCR-5",
        "title": "这是一个缺陷",
        "type": "bug",
        "start_at": 1583290309,
        "end_at": 1583290347,
        "parent_id": "5edca524cad2fa112b06105c",
        "short_id": "c9WqLmTO",
        "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
        "properties": {
            "prop_a": "prop_a_value",
            "prop_b": "prop_b_value"
        }
    },
    "target_type": "page",
    "target": {
        "id": "63e1bf51760505c8795ebccc",
        "url": "https://rest_api_root/v1/wiki/pages/63e1bf51760505c8795ebccc",
        "name": "示例页面",
        "type": "document",
        "short_id": "5-x6NN",
        "html_url": "https://yctech.pingcode.com/wiki/pages/5-x6NN"
    }
}
```

**引用数据示例:**
```json
{
    "id": "fa1125cb06305edca524cad2",
    "url": "https://rest_api_root/v1/relations/fa1125cb06305edca524cad2"
}
```

### 工时

**接口:** ` 工时`

用于查看和管理工时的基本信息。
 资源地址：{GET} https://rest_api_root/v1/workloads/{workload_id}

#### Success
**资源属性**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 工时的id。 |
| `url` | String | 是 | 工时的资源地址。 |
| `principal_type` | String | 是 | 工时主体的类型。<br>可选值: `work_item` |
| `principal` | Object | 是 | 工时的主体。 |
| `type` | Object | 是 | 工时的类型。 |
| `duration` | Number | 是 | 工时的时长。单位是小时，数值可以是为0-24之间，最多包含一位小数的正数。 |
| `review_state` | String | 是 | 工时的评审状态。<br>可选值: `no_review`, `pending`, `in_progress`, `approved`, `rejected`, `terminated` |
| `description` | String | 是 | 工时的说明。 |
| `report_at` | Number | 是 | 工时的登记日期。该值为十位数字组成的时间戳，会被转换为该时间当天的零点零分零秒。 |
| `report_by` | Object | 是 | 工时的登记人。 |
| `created_at` | Number | 是 | 工时的创建日期。该值为十位数字组成的时间戳。 |
| `created_by` | Object | 是 | 工时的创建人。 |

#### Success Examples
**全量数据示例：**
```json
{
    "id": "5f168f764eba01a5278b87cd",
    "url": "https://rest_api_root/v1/workloads/5f168f764eba01a5278b87cd",
    "principal_type": "work_item",
    "principal": {
        "id": "5edca524cad2fa1125cb0630",
        "url": "https://rest_api_root/v1/project/work_items/5edca524cad2fa1125cb0630",
        "identifier": "SCR-5",
        "title": "这是一个缺陷",
        "type": "bug",
        "start_at": 1583290309,
        "end_at": 1583290347,
        "parent_id": "5edca524cad2fa1125cb0629",
        "short_id": "c9WqLmTO",
        "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
        "properties": {
            "prop_a": "prop_a_value",
            "prop_b": "prop_b_value"
        }
    },
    "type": {
        "id": "5a86eaf6a72585327ea46fge0",
        "url": "https://rest_api_root/v1/workload_types/5a86eaf6a72585327ea46fge0",
        "name": "研发"
    },
    "duration": 8,
    "review_state": "approved",
    "description": "这是一个工时",
    "report_at": 1593290347,
    "report_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "created_at": 1593290347,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    }
}
```

**引用数据示例：**
```json
{
    "id": "5f168f764eba01a5278b87cd",
    "url": "https://rest_api_root/v1/workloads/5f168f764eba01a5278b87cd",
    "type": {
        "id": "5a86eaf6a72585327ea46fge0",
        "url": "https://rest_api_root/v1/workload_types/5a86eaf6a72585327ea46fge0",
        "name": "研发"
    },
    "duration": 8,
    "description": "这是一个工时",
    "report_at": 1593290347,
    "report_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    }
}
```

### 活动记录

**接口:** ` 活动记录`

用于查看和管理活动记录的基本信息。
 资源地址：{GET} https://rest_api_root/v1/activitys/{activity_id}?principal_type={principal_type}&principal_id={principal_id}

#### Success
**资源属性**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 活动记录的id。 |
| `url` | String | 是 | 活动记录的资源地址。 |
| `template` | String | 是 | 活动记录的模板。 |
| `type` | String | 是 | 活动记录的操作类型。 |
| `summary` | String | 是 | 活动记录的摘要。 |
| `content` | Object | 是 | 活动记录的内容。 |
| `client` | String | 是 | 活动记录的客户端。<br>可选值: `"unknown"`, `"web"`, `"mail"`, `"iphone"`, `"ipad"`, `"android"`, `"android_hd"`, `"winphone"`, `"win8"`, `"wap"`, `"weixin"`, `"api"`, `"hook"`, `"fetch"`, `"windows"`, `"mac"`, `"h5"`, `"flow"` |
| `created_at` | Number | 是 | 活动记录的创建时间。 |
| `created_by` | Object | 是 | 活动记录的创建者。 |

#### Success Examples
**全量数据示例：**
```json
{
    "id": "694ae20fdb8e0baef70f7ddb",
    "url": "https://rest_api_root/v1/activities/694ae20fdb8e0baef70f7ddb?principal_type=idea&principal_id=683562430d684517b06b814b",
    "template": "update-property",
    "type": "update",
    "summary": "修改了引用多选",
    "content": {
        "property_key": "yinyongduoxuan",
        "origin": null,
        "target": [
            {
                "id": "65fa797d8f0358d376233220",
                "name": "REST API 产品"
            }
        ]
    },
    "client": "web",
    "created_at": 1766515215,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    }
}
```

**引用数据示例：**
```json
{
    "id": "694ae20fdb8e0baef70f7ddb",
    "url": "https://rest_api_root/v1/activities/694ae20fdb8e0baef70f7ddb?principal_type=idea&principal_id=683562430d684517b06b814b",
    "summary": "修改了引用多选"
}
```

### 评审

**接口:** ` 评审`

用于查看和管理评审的基本信息。
 资源地址：{GET} https://rest_api_root/v1/reviews/{review_id}?principal_type={principal_type}

#### Success
**资源属性**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 评审的 id。 |
| `url` | String | 是 | 评审的资源地址。 |
| `identifier` | String | 是 | 评审的标识符。 |
| `title` | String | 是 | 评审的标题。 |
| `status` | String | 是 | 评审状态。<br>可选值: `pending`, `in_progress`, `completed`, `repealed` |
| `principal_type` | String | 是 | 评审主体的类型。<br>可选值: `idea`, `work_item`, `test_case` |
| `short_id` | String | 是 | 评审的短id。 |
| `html_url` | String | 是 | 评审的html地址。 |
| `pilot` | Object | 是 | 评审所在的产品、项目或测试库。 |
| `description` | String | 是 | 评审的描述。 |
| `participants` | Object[] | 是 | 评审的关注人列表。 |
| `submitted_at` | Number | 是 | 评审的提交时间。 |
| `submitted_by` | Object | 是 | 评审的提交人。 |
| `completed_at` | Number | 是 | 评审的完成时间。 |
| `completed_by` | Object | 是 | 评审的完成人。 |
| `created_at` | Number | 是 | 评审的创建时间。 |
| `created_by` | Object | 是 | 评审的创建人。 |
| `updated_at` | Number | 是 | 评审的更新时间。 |
| `updated_by` | Object | 是 | 评审的更新人。 |

#### Success Examples
**全量数据示例：**
```json
{
    "id": "6f168f764eba01a5278b87cd",
    "url": "https://rest_api_root/v1/reviews/6f168f764eba01a5278b87cd?principal_type=idea",
    "identifier": "SCR-R5",
    "title": "这是一个评审",
    "status": "completed",
    "principal_type": "idea",
    "short_id": "LsEy8mZF",
    "html_url": "https://yctech.pingcode.com/reviews/LsEy8mZF",
    "pilot": {
        "id": "63bb744314bd13c9def24cb4",
        "url": "https://rest_api_root/v1/ship/products/63bb744314bd13c9def24cb4",
        "name": "示例产品",
        "identifier": "SLC",
        "is_archived": 0,
        "is_deleted": 0
    },
    "description": "这是一个评审的描述",
    "participants": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=idea&review_id=6f168f764eba01a5278b87cd",
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        }
    ],
    "submitted_at": 1593290347,
    "submitted_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/avatar.png"
    },
    "completed_at": 1593291347,
    "completed_by": {
        "id": "b2417f68e846aae315c85d24643678b0",
        "url": "https://rest_api_root/v1/directory/users/b2417f68e846aae315c85d24643678b0",
        "name": "mary",
        "display_name": "Mary",
        "avatar": "https://s3.amazonaws.com/bucket/avatar2.png"
    },
    "created_at": 1593290347,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/avatar.png"
    },
    "updated_at": 1593291347,
    "updated_by": {
        "id": "b2417f68e846aae315c85d24643678b0",
        "url": "https://rest_api_root/v1/directory/users/b2417f68e846aae315c85d24643678b0",
        "name": "mary",
        "display_name": "Mary",
        "avatar": "https://s3.amazonaws.com/bucket/avatar2.png"
    }
}
```

**引用数据示例：**
```json
{
    "id": "6f168f764eba01a5278b87cd",
    "url": "https://rest_api_root/v1/reviews/6f168f764eba01a5278b87cd?principal_type=idea",
    "identifier": "SCR-R5",
    "title": "这是一个评审",
    "status": "completed",
    "principal_type": "idea",
    "short_id": "LsEy8mZF",
    "html_url": "https://yctech.pingcode.com/reviews/LsEy8mZF"
}
```

### 评论

**接口:** ` 评论`

用于查看和管理评论的基本信息。
 资源地址：{GET} https://rest_api_root/v1/comments/{comment_id}

#### Success
**资源属性**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 评论的id。 |
| `url` | String | 是 | 评论的资源地址。 |
| `content` | String | 是 | 评论的内容。被删除的评论content字段会被置空，is_deleted字段为1。 |
| `attachment_count` | Number | 是 | 评论的附件数量。 |
| `attachments` | Object[] | 是 | 评论的附件列表。 |
| `is_reply_comment` | Boolean | 是 | 是否是回复评论。<br>可选值: `true`, `false` |
| `replied_comment` | Object | 是 | 被回复的评论。 |
| `created_at` | Number | 是 | 评论的创建时间。 |
| `created_by` | Object | 是 | 评论的创建人。 |
| `is_deleted` | Number | 是 | 评论是否被删除。<br>可选值: `0`, `1` |

#### Success Examples
**全量数据示例：**
```json
{
    "id": "59f72dfaeadb5b5197b7da6d",
    "url": "https://rest_api_root/v1/comments/59f72dfaeadb5b5197b7da6d?principal_type=work_item&principal_id=5edca524cad2fa1125cb0630",
    "content": "这是一个工作项评论",
    "attachment_count": 1,
    "attachments": [
        {
            "id": "5da588ca84c7377a5d327e6d",
            "url": "https://rest_api_root/v1/attachments/5da588ca84c7377a5d327e6d?principal_type=work_item&principal_id=5edca524cad2fa1125cb0630&comment_id=59f72dfaeadb5b5197b7da6d",
            "title": "这是一个代码片段",
            "size": 16,
            "type": "snippet"
        }
    ],
    "is_reply_comment": false,
    "replied_comment": null,
    "created_at": 1565255712,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_deleted": 0
}
```

**引用数据示例：**
```json
{
    "id": "59f72dfaeadb5b5197b7da6d",
    "url": "https://rest_api_root/v1/comments/59f72dfaeadb5b5197b7da6d?principal_type=work_item&principal_id=5edca524cad2fa1125cb0630",
    "content": "这是一个工作项评论",
    "is_deleted": 0
}
```

### 附件

**接口:** ` 附件`

用于查看和管理附件的基本信息。
 资源地址：{GET} https://rest_api_root/v1/attachments/{attachment_id}

#### Success
**资源属性**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 附件的id。 |
| `url` | String | 是 | 附件的资源地址。 |
| `title` | String | 是 | 附件的标题。 |
| `size` | Number | 是 | 附件的大小。 |
| `type` | String | 是 | 附件的类型。<br>可选值: `file`, `snippet` |
| `file_type` | String | 否 | 文件的类型。当附件的类型type为file时，该字段会返回。<br>可选值: `image`, `other` |
| `ext` | String | 否 | 文件的拓展名。当附件的类型type为file时，该字段会返回。 |
| `download_url` | String | 否 | 文件的下载地址。当附件的类型type为file时，该字段会返回。 |
| `format` | String | 否 | 代码的格式。当附件的类型type为snippet时，该字段会返回。<br>可选值: `clike`, `css`, `dart`, `django`, `dockerfile`, `go`, `markdown`, `nginx`, `python`, `php`, `shell`, `sql`, `swift`, `html`, `javascript`, `jsx`, `pascal`, `sass`, `stylus`, `vue`, `yaml`, `haskell` |
| `content` | String | 否 | 代码的内容。当附件的类型type为snippet时，该字段会返回。 |
| `line` | String | 否 | 代码的行数。当附件的类型type为snippet时，该字段会返回。 |
| `created_at` | Number | 是 | 附件的创建时间。 |
| `created_by` | Object | 是 | 附件的创建人。 |

#### Success Examples
**全量数据示例（文件）:**
```json
{
    "id": "5da588ca84c7377a5d327e6c",
    "url": "https://rest_api_root/v1/attachments/5da588ca84c7377a5d327e6c?principal_type=work_item&principal_id=5edca524cad2fa1125cb0630",
    "title": "这是一个图片类型的附件",
    "size": 1024,
    "type": "file",
    "file_type": "image",
    "ext": "png",
    "download_url": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a.png",
    "created_at": 1583290347,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    }
}
```

**全量数据示例（代码段）:**
```json
{
    "id": "5da588ca84c7377a5d327e6d",
    "url": "https://rest_api_root/v1/attachments/5da588ca84c7377a5d327e6d?principal_type=work_item&principal_id=5edca524cad2fa1125cb0630&comment_id=59f72dfaeadb5b5197b7da6d",
    "title": "这是一个代码片段",
    "size": 16,
    "type": "snippet",
    "format": "javascript",
    "content": "const a = 'abc';",
    "line": 1,
    "created_at": 1583290347,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    }
}
```

**引用数据示例：**
```json
{
    "id": "5da588ca84c7377a5d327e6d",
    "url": "https://rest_api_root/v1/attachments/5da588ca84c7377a5d327e6d?principal_type=work_item&principal_id=5edca524cad2fa1125cb0630&comment_id=59f72dfaeadb5b5197b7da6d",
    "title": "这是一个代码片段",
    "size": 16,
    "type": "snippet"
}
```

## 评论

### 创建一个评论

**接口:** `POST https://rest_api_root/v1/comments`

**权限:** 企业令牌/用户令牌

#### Parameters
**请求参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `principal_type` | String | 是 | 评论主体的类型。<br>可选值: `work_item`, `test_run`, `test_case`, `ticket`, `idea`, `page` |
| `principal_id` | String | 否 | 评论主体的id。 |
| `review_id` | String | 否 | 评论评审的id。principal_id和review_id至少存在一个，若同时存在，则忽略review_id。 |
| `content` | String | 是 | 评论的内容。 |
| `created_at` | Number | 否 | 评论的创建时间。 |
| `created_by` | String | 否 | 评论的创建人。 |

#### Parameters Examples
**请求示例：**
```json
{
    "principal_type": "work_item",
    "principal_id": "5edca524cad2fa1125cb0630",
    "content": "这是一个工作项评论",
    "created_at": 1565255712,
    "created_by": "a0417f68e846aae315c85d24643678a9"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "59f72dfaeadb5b5197b7da6d",
    "url": "https://rest_api_root/v1/comments/59f72dfaeadb5b5197b7da6d?principal_type=work_item&principal_id=5edca524cad2fa1125cb0630",
    "content": "这是一个工作项评论",
    "attachment_count": 0,
    "attachments": [],
    "is_reply_comment": false,
    "replied_comment": null,
    "created_at": 1565255712,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_deleted": 0
}
```

### 删除一个评论

**接口:** `DELETE https://rest_api_root/v1/comments/{comment_id}?principal_type={principal_type}&principal_id={principal_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `comment_id` | String | 是 | 评论的id。 |

**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `principal_type` | String | 是 | 评论主体的类型。<br>可选值: `work_item`, `test_run`, `test_case`, `ticket`, `idea`, `page` |
| `principal_id` | String | 否 | 评论主体的id。 |
| `review_id` | String | 否 | 评论评审的id。principal_id和review_id至少存在一个，若同时存在，则忽略review_id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "59f72dfaeadb5b5197b7da6d",
    "url": "https://rest_api_root/v1/comments/59f72dfaeadb5b5197b7da6d?principal_type=work_item&principal_id=5edca524cad2fa1125cb0630",
    "content": "",
    "attachment_count": 0,
    "attachments": [],
    "is_reply_comment": false,
    "replied_comment": null,
    "created_at": 1565255712,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_deleted": 1
}
```

### 获取评论列表

**接口:** `GET https://rest_api_root/v1/comments?principal_type={principal_type}&principal_id={principal_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `principal_type` | String | 是 | 评论主体的类型。<br>可选值: `work_item`, `test_run`, `test_case`, `ticket`, `idea`, `page` |
| `principal_id` | String | 否 | 评论主体的id。 |
| `review_id` | String | 否 | 评论评审的id。principal_id和review_id至少存在一个，若同时存在，则忽略review_id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "59f72dfaeadb5b5197b7da6d",
            "url": "https://rest_api_root/v1/comments/59f72dfaeadb5b5197b7da6d?principal_type=work_item&principal_id=5edca524cad2fa1125cb0630",
            "content": "这是一个工作项评论",
            "attachment_count": 0,
            "attachments": [],
            "is_reply_comment": false,
            "replied_comment": null,
            "created_at": 1565255712,
            "created_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "is_deleted": 0
        },
        {
            "id": "50f72dfaeadb5b5197b7da6e",
            "url": "https://rest_api_root/v1/comments/59f72dfaeadb5b5197b7da6d?principal_type=work_item&principal_id=50f72dfaeadb5b5197b7da6e",
            "content": "这是一个工作项评论回复",
            "attachment_count": 0,
            "attachments": [],
            "is_reply_comment": true,
            "replied_comment": {
                "id": "59f72dfaeadb5b5197b7da6d",
                "url": "https://rest_api_root/v1/comments/59f72dfaeadb5b5197b7da6d?principal_type=work_item&principal_id=5edca524cad2fa1125cb0630",
                "content": "这是一个工作项评论",
                "is_deleted": 0
            },
            "created_at": 1565255712,
            "created_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "is_deleted": 0
        }
    ]
}
```

## 附件

### 上传一个代码段

**接口:** `POST https://rest_api_root/v1/attachments`

**权限:** 企业令牌/用户令牌

#### Headers
**Header**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `content-type` | String | 是 | application/json。 |

#### Parameters
**请求参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `principal_type` | String | 是 | 附件主体的类型。<br>可选值: `work_item`, `test_case`, `test_run`, `idea`, `ticket`, `page` |
| `principal_id` | String | 是 | 附件主体的id。 |
| `comment_id` | String | 否 | 附件主体的评论id。当需要向附件主体的评论上传文件或者代码段时，需要传入该参数。 |
| `title` | String | 是 | 代码段的标题。 |
| `format` | String | 是 | 代码段的语言。<br>可选值: `clike`, `css`, `dart`, `django`, `dockerfile`, `go`, `markdown`, `nginx`, `python`, `php`, `shell`, `sql`, `swift`, `html`, `javascript`, `jsx`, `pascal`, `sass`, `stylus`, `vue`, `yaml`, `haskell` |
| `content` | String | 是 | 代码段的内容。 |

#### Parameters Examples
**请求示例：**
```json
{
     "principal_type": "work_item",
     "principal_id": "5edca524cad2fa1125cb0630",
     "comment_id": "59f72dfaeadb5b5197b7da6d",
     "title": "这是一个代码片段",
     "format": "javascript",
     "content": "const a = 'abc';"
}
```

**响应示例：**
```json
{
     "id": "5da588ca84c7377a5d327e6d",
     "url": "https://rest_api_root/v1/attachments/5da588ca84c7377a5d327e6d?principal_type=work_item&principal_id=5edca524cad2fa1125cb0630&comment_id=59f72dfaeadb5b5197b7da6d",
     "title": "这是一个代码片段",
     "size": 16,
     "type": "snippet",
     "format": "javascript",
     "content": "const a = 'abc';",
     "line": 1,
     "created_at": 1583290347,
     "created_by": {
         "id": "a0417f68e846aae315c85d24643678a9",
         "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
         "name": "john",
         "display_name": "John",
         "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
     }
 }
```

### 上传一个文件

**接口:** `POST https://rest_api_root/v1/attachments?principal_type={principal_type}&principal_id={principal_id}`

**权限:** 企业令牌/用户令牌

#### Headers
**Header**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `content-type` | String | 是 | multipart/form-data。 |

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `principal_type` | String | 是 | 附件主体的类型。<br>可选值: `work_item`, `work_item_deliverable`, `test_case`, `test_run`, `idea`, `ticket`, `page` |
| `principal_id` | String | 是 | 附件主体的id。 |
| `comment_id` | String | 否 | 附件主体的评论id。当需要向附件主体的评论上传文件或者代码段时，需要传入该参数。 |

**请求参数 form-data**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `title` | String | 是 | 这是一个图片类型的附件.png |
| `file` | File | 是 | /Users/ping-code/这是一个图片类型的附件.png |

#### Parameters Examples
**响应示例：**
```json
{
    "id": "5da588ca84c7377a5d327e6c",
    "url": "https://rest_api_root/v1/attachments/5da588ca84c7377a5d327e6c?principal_type=work_item&principal_id=5edca524cad2fa1125cb0630",
    "title": "这是一个图片类型的附件",
    "size": 1024,
    "type": "file",
    "file_type": "image",
    "ext": "png",
    "download_url": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a.png",
    "created_at": 1583290347,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    }
}
```

### 删除一个附件

**接口:** `DELETE https://rest_api_root/v1/attachments/{attachment_id}?principal_type={principal_type}&principal_id={principal_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `attachment_id` | String | 是 | 附件的id。 |

**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `principal_type` | String | 是 | 附件主体的类型。<br>可选值: `work_item`, `test_case`, `test_run`, `idea`, `ticket`, `page` |
| `principal_id` | String | 是 | 附件主体的id。 |
| `comment_id` | String | 否 | 附件主体的评论id。当需要获取附件主体的评论附件时，需要传入该参数。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "5da588ca84c7377a5d327e6c",
    "url": "https://rest_api_root/v1/attachments/5da588ca84c7377a5d327e6c?principal_type=work_item&principal_id=5edca524cad2fa1125cb0630",
    "title": "这是一个图片类型的附件",
    "size": 1024,
    "type": "file",
    "file_type": "image",
    "ext": "png",
    "download_url": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a.png",
    "created_at": 1583290347,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    }
}
```

### 获取附件列表

**接口:** `GET https://rest_api_root/v1/attachments?principal_type={principal_type}&principal_id={principal_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `principal_type` | String | 是 | 附件主体的类型。<br>可选值: `work_item`, `test_case`, `test_run`, `idea`, `ticket`, `page` |
| `principal_id` | String | 是 | 附件主体的id。 |
| `comment_id` | String | 否 | 附件主体的评论id。当需要获取附件主体的评论附件时，需要传入该参数。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 2,
    "values": [
        {
            "id": "5da588ca84c7377a5d327e6d",
            "url": "https://rest_api_root/v1/attachments/5da588ca84c7377a5d327e6d?principal_type=work_item&principal_id=5edca524cad2fa1125cb0630&comment_id=59f72dfaeadb5b5197b7da6d",
            "title": "这是一个代码片段",
            "size": 16,
            "type": "snippet",
            "format": "javascript",
            "content": "const a = 'abc';",
            "line": 1,
            "created_at": 1583290347,
            "created_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        },
        {
            "id": "5da588ca84c7377a5d327e6f",
            "url": "https://rest_api_root/v1/attachments/5da588ca84c7377a5d327e6f?principal_type=work_item&principal_id=5edca524cad2fa1125cb0630&comment_id=59f72dfaeadb5b5197b7da6d",
            "title": "这是一个图片类型的附件",
            "size": 1024,
            "type": "file",
            "file_type": "image",
            "ext": "png",
            "download_url": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839b.png",
            "created_at": 1583290347,
            "created_by": {
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

## 关注人

### 添加一个关注人

**接口:** `POST https://rest_api_root/v1/participants`

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `principal_type` | String | 是 | 关注人主体的类型。<br>可选值: `work_item`, `test_case`, `idea`, `ticket`, `page` |
| `principal_id` | String | 否 | 关注人主体的id。 |
| `review_id` | String | 否 | 关注人评审主体的id。principal_id和review_id至少存在一个，若同时存在，则忽略review_id。 |
| `type` | String | 是 | 关注人的类型。<br>可选值: `user`, `user_group` |
| `participant_id` | String | 是 | 关注人的id。用户的id或者团队的id。 |

#### Parameters Examples
**请求示例（工作项）：**
```json
{
    "principal_type": "work_item",
    "principal_id": "63e1bf51760505c8795ebccc",
    "type": "user",
    "participant_id": "a0417f68e846aae315c85d24643678a9"
}
```

**请求示例（产品需求评审）：**
```json
{
    "principal_type": "idea",
    "review_id": "6f168f764eba01a5278b87cd",
    "type": "user",
    "participant_id": "a0417f68e846aae315c85d24643678a9"
}
```

#### Success Examples
**响应示例（工作项）：**
```json
{
    "id": "a0417f68e846aae315c85d24643678a9",
    "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=work_item&principal_id=63e1bf51760505c8795ebccc",
    "type": "user",
    "user": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    }
}
```

**响应示例（产品需求评审）：**
```json
{
    "id": "a0417f68e846aae315c85d24643678a9",
    "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=idea&review_id=6f168f764eba01a5278b87cd",
    "type": "user",
    "user": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    }
}
```

### 移除一个关注人

**接口:** `DELETE https://rest_api_root/v1/participants/{participant_id}?principal_type={principal_type}&principal_id={principal_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `participant_id` | String | 是 | 关注人的id。用户的id或者团队的id。 |

**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `principal_type` | String | 是 | 关注人主体的类型。<br>可选值: `work_item`, `test_case`, `idea`, `ticket`, `page` |
| `principal_id` | String | 否 | 关注人主体的id。 |
| `review_id` | String | 否 | 注人评审主体的id。principal_id和review_id至少存在一个，若同时存在，则忽略review_id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "a0417f68e846aae315c85d24643678a9",
    "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=work_item&principal_id=63e1bf51760505c8795ebccc",
    "type": "user",
    "user": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    }
}
```

### 获取关注人列表

**接口:** `GET https://rest_api_root/v1/participants?principal_type={principal_type}&principal_id={principal_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `principal_type` | String | 是 | 关注人主体的类型。<br>可选值: `work_item`, `test_case`, `idea`, `ticket`, `page` |
| `principal_id` | String | 否 | 关注人主体的id。 |
| `review_id` | String | 否 | 关注人评审主体的id。principal_id和review_id至少存在一个，若同时存在，则忽略review_id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 2,
    "values": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=work_item&principal_id=63e1bf51760505c8795ebccc",
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        },
        {
            "id": "63c8fb32729dee3334d96af7",
            "url": "https://rest_api_root/v1/participants/63c8fb32729dee3334d96af7?principal_type=work_item&principal_id=63e1bf51760505c8795ebccc",
            "type": "user_group",
            "user_group": {
                "id": "63c8fb32729dee3334d96af7",
                "url": "https://rest_api_root/v1/directory/groups/63c8fb32729dee3334d96af7",
                "name": "Open Team"
            }
        }
    ]
}
```

## 关联

### 创建一个关联

**接口:** `POST https://rest_api_root/v1/relations`

**权限:** 企业令牌/用户令牌

#### Parameters
**请求参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `principal_type` | String | 是 | 关联主体的类型。关联主体的类型和关联的目标类型需要搭配使用，比如： 需求关联工单，principal_type为idea，target_type为ticket； 需求关联工作项，principal_type为idea，target_type为work_item； 需求关联测试用例，principal_type为idea，target_type为test_case； 需求关联需求，principal_type为idea，target_type为idea； 需求关联页面，principal_type为idea，target_type为page； 工单关联需求，principal_type为ticket，target_type为idea； 工单关联工作项，principal_type为ticket，target_type为work_item； 工单关联工单，principal_type为ticket，target_type为ticket； 工单关联页面，principal_type为ticket，target_type为page； 工作项关联测试用例，principal_type为work_item，target_type为test_case； 工作项关联需求，principal_type为work_item，target_type为idea； 工作项关联工单，principal_type为work_item，target_type为ticket； 工作项关联页面，principal_type为work_item，target_type为page； 测试计划关联缺陷，principal_type为test_plan，target_type为work_item； 执行用例关联缺陷，principal_type为test_run，target_type为work_item； 测试用例关联需求，principal_type为test_case，target_type为idea； 测试用例关联工作项，principal_type为test_case，target_type为work_item； 测试用例关联页面，principal_type为test_case，target_type为page； 页面关联需求，暂不开放； 页面关联工单，暂不开放； 页面关联工作项，暂不开放； 页面关联测试用例，暂不开放； |
| `principal_id` | String | 是 | 关联主体的id。 |
| `target_type` | String | 是 | 关联的目标类型。 |
| `target_id` | String | 是 | 关联的目标id。 |

#### Parameters Examples
**请求示例：**
```json
{
    "principal_id": "547000eb6a70571487623fea",
    "principal_type": "test_run",
    "target_type": "work_item",
    "target_id": "5edca524cad2fa1125cb0630"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "fa1125cb06305edca524cad2",
    "url": "https://rest_api_root/v1/relations/fa1125cb06305edca524cad2",
    "principal_type": "test_run",
    "principal": {
        "id": "547000eb6a70571487623fea",
        "url": "https://rest_api_root/v1/testhub/runs/547000eb6a70571487623fea",
        "status": "failure",
        "short_id": "Aq1u38yX",
        "html_url": "https://yctech.pingcode.com/testhub/runs/Aq1u38yX"
    },
    "target_type": "work_item",
    "target": {
        "id": "5edca524cad2fa1125cb0630",
        "url": "https://rest_api_root/v1/project/work_items/5edca524cad2fa1125cb0630",
        "identifier": "SCR-5",
        "title": "这是一个缺陷",
        "type": "bug",
        "start_at": 1583290309,
        "end_at": 1583290347,
        "parent_id": "5edca524cad2fa112b06105c",
        "short_id": "c9WqLmTO",
        "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
        "properties": {
            "prop_a": "prop_a_value",
            "prop_b": "prop_b_value"
        }
    }
}
```

### 删除一个关联

**接口:** `DELETE https://rest_api_root/v1/relations/{relation_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `relation_id` | String | 是 | 关联的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "fa1125cb06305edca524cad2",
    "url": "https://rest_api_root/v1/relations/fa1125cb06305edca524cad2",
    "principal_type": "test_plan",
    "principal": {
        "id": "5eb6a70571487623fea47000",
        "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/plans/5eb6a70571487623fea47000",
        "name": "测试计划",
        "status": "in_progress",
        "start_at": 1589791860,
        "end_at": 1589791870
    },
    "target_type": "work_item",
    "target": {
        "id": "5edca524cad2fa1125cb0630",
        "url": "https://rest_api_root/v1/project/work_items/5edca524cad2fa1125cb0630",
        "identifier": "SCR-5",
        "title": "这是一个缺陷",
        "type": "bug",
        "start_at": 1583290309,
        "end_at": 1583290347,
        "parent_id": "5edca524cad2fa112b06105c",
        "short_id": "c9WqLmTO",
        "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
        "properties": {
            "prop_a": "prop_a_value",
            "prop_b": "prop_b_value"
        }
    }
}
```

### 获取关联列表

**接口:** `GET https://rest_api_root/v1/relations?principal_type={principal_type}&principal_id={principal_id}&target_type={target_type}`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `principal_type` | String | 是 | 关联主体的类型。关联主体的类型和关联的目标类型需要搭配使用，比如： 需求关联工单，principal_type为idea，target_type为ticket； 需求关联工作项，principal_type为idea，target_type为work_item； 需求关联测试用例，principal_type为idea，target_type为test_case； 需求关联需求，principal_type为idea，target_type为idea； 需求关联页面，principal_type为idea，target_type为page； 工单关联需求，principal_type为ticket，target_type为idea； 工单关联工作项，principal_type为ticket，target_type为work_item； 工单关联工单，principal_type为ticket，target_type为ticket； 工单关联页面，principal_type为ticket，target_type为page； 工作项关联测试用例，principal_type为work_item，target_type为test_case； 工作项关联需求，principal_type为work_item，target_type为idea； 工作项关联工单，principal_type为work_item，target_type为ticket； 工作项关联页面，principal_type为work_item，target_type为page； 测试计划关联缺陷，principal_type为test_plan，target_type为work_item； 执行用例关联缺陷，principal_type为test_run，target_type为work_item 测试用例关联需求，principal_type为test_case，target_type为idea； 测试用例关联工作项，principal_type为test_case，target_type为work_item  测试用例关联页面，principal_type为test_case，target_type为page； 页面关联需求，principal_type为page，target_type为idea； 页面关联工单，principal_type为page，target_type为ticket； 页面关联工作项，principal_type为page，target_type为work_item； 页面关联测试用例，principal_type为page，target_type为test_case； |
| `principal_id` | String | 是 | 关联主体的id。 |
| `target_type` | String | 是 | 关联的目标类型。 |

#### Success Examples
**Success-Response**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "64b4d70ba368e6594360ea79",
            "url": "https://rest_api_root/v1/relations/64b4d70ba368e6594360ea79",
            "principal_type": "idea",
            "principal": {
                "id": "64b4d70ba368e6594360ea24",
                "url": "https://rest_api_root/v1/ship/ideas/64b4d70ba368e6594360ea24",
                "identifier": "SLC-1",
                "title": "示例需求",
                "short_id": "Ogf1EYey",
                "html_url": "https://yctech.pingcode.com/ship/ideas/Ogf1EYey"
            },
            "target_type": "ticket",
            "target": {
                "id": "63eca888a0a13a3efc8d4a43",
                "url": "https://rest_api_root/v1/ship/tickets/63eca888a0a13a3efc8d4a43",
                "identifier": "SLC-T1",
                "title": "希望新增支持第三方账号注册",
                "short_id": "pdMUgQzZ",
                "html_url": "https://yctech.pingcode.com/ship/tickets/pdMUgQzZ"
            }
        }
    ]
}
```

## 活动记录

### 获取活动记录列表

**接口:** `GET https://rest_api_root/v1/activities?principal_type={principal_type}&principal_id={principal_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `principal_type` | String | 是 | 主体的类型。<br>可选值: `work_item`, `test_run`, `test_case`, `ticket`, `idea` |
| `principal_id` | String | 是 | 主体的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_index": 0,
    "page_size": 30,
    "total": 1,
    "values": [
        {
            "id": "694ae20fdb8e0baef70f7ddb",
            "url": "https://rest_api_root/v1/activities/694ae20fdb8e0baef70f7ddb?principal_type=idea&principal_id=683562430d684517b06b814b",
            "template": "update-property",
            "type": "update",
            "summary": "修改了引用多选",
            "content": {
                "property_key": "yinyongduoxuan",
                "origin": null,
                "target": [
                    {
                        "id": "65fa797d8f0358d376233220",
                        "name": "REST API 产品"
                    }
                ]
            },
            "client": "web",
            "created_at": 1766515215,
            "created_by": {
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

## 工时

### 创建一个工时

**接口:** `POST https://rest_api_root/v1/workloads`

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `principal_type` | String | 是 | 工时主体的类型。<br>可选值: `work_item`, `idea`, `test_case` |
| `principal_id` | String | 是 | 工时主体的id。 |
| `type_id` | String | 否 | 工时类型的id。 |
| `duration` | Number | 是 | 工时的时长。单位是小时，数值可以是为0-24之间，最多包含一位小数的正数。 |
| `report_at` | Number | 是 | 工时的登记日期。该值为十位数字组成的时间戳，会被转换为该时间当天的零点零分零秒。 |
| `report_by_id` | String | 否 | 工时的登记人，企业鉴权时必填。个人鉴权时不需要传递，即使传递了也会被忽略。 |
| `recorded_at` | String | 否 | 工时的登记时间，默认是当前时间。 |
| `description` | String | 否 | 工时的说明。 |

#### Parameters Examples
**请求示例：**
```json
{
    "principal_id": "5edca524cad2fa1125cb0630",
    "principal_type": "work_item",
    "type_id": "5a86eaf6a72585327ea46fge0",
    "duration": 8,
    "report_at": 1593290347,
    "report_by_id": "a0417f68e846aae315c85d24643678a9",
    "recorded_at": 1593290347,
    "description": "这是一个工时"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "5f168f764eba01a5278b87cd",
    "url": "https://rest_api_root/v1/workloads/5f168f764eba01a5278b87cd",
    "principal_type": "work_item",
    "principal": {
        "id": "5edca524cad2fa1125cb0630",
        "url": "https://rest_api_root/v1/project/work_items/5edca524cad2fa1125cb0630",
        "identifier": "SCR-5",
        "title": "这是一个缺陷",
        "type": "bug",
        "start_at": 1583290309,
        "end_at": 1583290347,
        "parent_id": "5edca524cad2fa1125cb0629",
        "short_id": "c9WqLmTO",
        "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
        "properties": {
            "prop_a": "prop_a_value",
            "prop_b": "prop_b_value"
        }
    },
    "type": {
        "id": "5a86eaf6a72585327ea46fge0",
        "url": "https://rest_api_root/v1/workload_types/5a86eaf6a72585327ea46fge0",
        "name": "研发"
    },
    "duration": 8,
    "review_state": "approved",
    "description": "这是一个工时",
    "report_at": 1593290347,
    "report_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "created_at": 1593290347,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    }
}
```

### 删除一个工时

**接口:** `DELETE https://rest_api_root/v1/workloads/{workload_id}`

用户令牌只能删除用户自己登记的工时记录。

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `workload_id` | String | 是 | 工时的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "5f168f764eba01a5278b87cd",
    "url": "https://rest_api_root/v1/workloads/5f168f764eba01a5278b87cd",
    "principal_type": "work_item",
    "principal": {
        "id": "5edca524cad2fa1125cb0630",
        "url": "https://rest_api_root/v1/project/work_items/5edca524cad2fa1125cb0630",
        "identifier": "SCR-5",
        "title": "这是一个缺陷",
        "type": "bug",
        "start_at": 1583290309,
        "end_at": 1583290347,
        "parent_id": "5edca524cad2fa1125cb0629",
        "short_id": "c9WqLmTO",
        "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
        "properties": {
            "prop_a": "prop_a_value",
            "prop_b": "prop_b_value"
        }
    },
    "type": {
        "id": "5a86eaf6a72585327ea46fge0",
        "url": "https://rest_api_root/v1/workload_types/5a86eaf6a72585327ea46fge0",
        "name": "研发"
    },
    "duration": 8,
    "review_state": "approved",
    "description": "这是一个工时",
    "report_at": 1593290347,
    "report_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "created_at": 1593290347,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    }
}
```

### 获取工时列表

**接口:** `GET https://rest_api_root/v1/workloads`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `principal_type` | String | 否 | 工时主体的类型。当查询参数含有pilot_id或principal_id时，principal_type参数必填。<br>可选值: `idea`, `work_item`, `test_case` |
| `pilot_id` | String | 否 | 工时主体所在产品、项目或测试库的id。使用该参数过滤数据时，登记日期查询的起始时间和登记日期查询的结束时间的跨度最大为3个月。 |
| `principal_id` | String | 否 | 工时主体的id。 |
| `start_at` | Number | 否 | 登记日期查询的起始时间。开始时间会转换为对应日期的开始时间点。开始时间和结束时间须同时存在。 |
| `end_at` | Number | 否 | 登记日期查询的结束时间。结束时间会转换为对应日期的结束时间点。 |
| `report_by_id` | String | 否 | 登记人的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
         {
             "id": "5f168f764eba01a5278b87cd",
             "url": "https://rest_api_root/v1/workloads/5f168f764eba01a5278b87cd",
             "principal_type": "work_item",
             "principal": {
                 "id": "5edca524cad2fa1125cb0630",
                 "url": "https://rest_api_root/v1/project/work_items/5edca524cad2fa1125cb0630",
                 "identifier": "SCR-5",
                 "title": "这是一个缺陷",
                 "type": "bug",
                 "start_at": 1583290309,
                 "end_at": 1583290347,
                 "parent_id": "5edca524cad2fa1125cb0629",
                 "short_id": "c9WqLmTO",
                 "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
                 "properties": {
                     "prop_a": "prop_a_value",
                     "prop_b": "prop_b_value"
                 }
             },
             "type": {
                 "id": "5a86eaf6a72585327ea46fge0",
                 "url": "https://rest_api_root/v1/workload_types/5a86eaf6a72585327ea46fge0",
                 "name": "研发"
             },
             "duration": 8,
             "review_state": "approved",
             "description": "这是一个工时",
             "report_at": 1593290347,
             "report_by": {
                 "id": "a0417f68e846aae315c85d24643678a9",
                 "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                 "name": "john",
                 "display_name": "John",
                 "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
             },
             "created_at": 1593290347,
             "created_by": {
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

### 获取工时类型列表

**接口:** `GET https://rest_api_root/v1/workload_types`

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
            "id": "5a86eaf6a72585327ea46fge0",
            "url": "https://rest_api_root/v1/workload_types/5a86eaf6a72585327ea46fge0",
            "name": "研发"
        }
    ]
}
```

### 部分更新一个工时

**接口:** `PATCH https://rest_api_root/v1/workloads/{workload_id}`

用户令牌只能更新属于用户自己登记的工时记录。

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `workload_id` | String | 是 | 工时的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `type_id` | String | 否 | 工时类型的id。 |
| `duration` | Number | 否 | 工时的时长。单位是小时，数值可以是为0-24之间，最多包含一位小数的正数。 |
| `report_at` | Number | 否 | 工时的登记日期。该值为十位数字组成的时间戳，会被转换为该时间当天的零点零分零秒。 |
| `description` | String | 否 | 工时的说明。 |

#### Parameters Examples
**请求示例：**
```json
{
    "type_id": "5a86eaf6a72585327ea46fge0",
    "duration": 8,
    "report_at": 1593290347,
    "description": "这是一个工时"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "5f168f764eba01a5278b87cd",
    "url": "https://rest_api_root/v1/workloads/5f168f764eba01a5278b87cd",
    "principal_type": "work_item",
    "principal": {
        "id": "5edca524cad2fa1125cb0630",
        "url": "https://rest_api_root/v1/project/work_items/5edca524cad2fa1125cb0630",
        "identifier": "SCR-5",
        "title": "这是一个缺陷",
        "type": "bug",
        "start_at": 1583290309,
        "end_at": 1583290347,
        "parent_id": "5edca524cad2fa1125cb0629",
        "short_id": "c9WqLmTO",
        "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
        "properties": {
            "prop_a": "prop_a_value",
            "prop_b": "prop_b_value"
        }
    },
    "type": {
        "id": "5a86eaf6a72585327ea46fge0",
        "url": "https://rest_api_root/v1/workload_types/5a86eaf6a72585327ea46fge0",
        "name": "研发"
    },
    "duration": 8,
    "review_state": "approved",
    "description": "这是一个工时",
    "report_at": 1593290347,
    "report_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "created_at": 1593290347,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    }
}
```

## 评审

### 创建一个评审

**接口:** `POST https://rest_api_root/v1/reviews`

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `title` | String | 是 | 评审的标题。 |
| `pilot_id` | String | 是 | 评审主体所在产品、项目或测试库的id。 |
| `principal_type` | String | 是 | 评审主体的类型。<br>可选值: `idea`, `work_item`, `test_case` |
| `description` | String | 否 | 评审的描述。 |

#### Parameters Examples
**请求示例：**
```json
{
    "title": "这是一个评审",
    "pilot_id": "63bb744314bd13c9def24cb4",
    "principal_type": "idea",
    "description": "这是一个评审的描述"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "5f168f764eba01a5278b87cd",
    "url": "https://rest_api_root/v1/reviews/5f168f764eba01a5278b87cd?principal_type=idea",
    "identifier": "SCR-R5",
    "title": "这是一个评审",
    "status": "pending",
    "principal_type": "idea",
    "short_id": "LsEy8mZF",
    "html_url": "https://yctech.pingcode.com/reviews/LsEy8mZF",
    "pilot": {
        "id": "63bb744314bd13c9def24cb4",
        "url": "https://rest_api_root/v1/ship/products/63bb744314bd13c9def24cb4",
        "name": "示例产品",
        "identifier": "SLC",
        "is_archived": 0,
        "is_deleted": 0
    },
    "description": "这是一个评审的描述",
    "participants": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=idea&review_id=6f168f764eba01a5278b87cd",
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        }
    ],
    "submitted_at": null,
    "submitted_by": null,
    "completed_at": null,
    "completed_by": null,
    "created_at": 1593290347,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/avatar.png"
    },
    "updated_at": 1593291347,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/avatar.png"
    }
}
```

### 删除一个评审

**接口:** `DELETE https://rest_api_root/v1/reviews/{review_id}?principal_type={principal_type}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `review_id` | String | 是 | 评审的id。 |

**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `principal_type` | String | 是 | 评审主体的类型。<br>可选值: `idea`, `work_item`, `test_case` |

#### Success Examples
**响应示例：**
```json
{
    "id": "5f168f764eba01a5278b87cd",
    "url": "https://rest_api_root/v1/reviews/5f168f764eba01a5278b87cd?principal_type=idea",
    "identifier": "SCR-R5",
    "title": "这是一个评审",
    "status": "pending",
    "principal_type": "idea",
    "short_id": "LsEy8mZF",
    "html_url": "https://yctech.pingcode.com/reviews/LsEy8mZF",
    "pilot": {
        "id": "63bb744314bd13c9def24cb4",
        "url": "https://rest_api_root/v1/ship/products/63bb744314bd13c9def24cb4",
        "name": "示例产品",
        "identifier": "SLC",
        "is_archived": 0,
        "is_deleted": 0
    },
    "description": "这是一个评审的描述",
    "participants": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=idea&review_id=6f168f764eba01a5278b87cd",
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        }
    ],
    "submitted_at": null,
    "submitted_by": null,
    "completed_at": null,
    "completed_by": null,
    "created_at": 1593290347,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/avatar.png"
    },
    "updated_at": 1593291347,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/avatar.png"
    }
}
```

### 向评审中添加一个评审内容

**接口:** `POST https://rest_api_root/v1/reviews/{review_id}/principals`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `review_id` | String | 是 | 评审的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `principal_id` | String | 是 | 评审内容的id。 |
| `principal_type` | String | 是 | 评审主体的类型。<br>可选值: `idea`, `work_item`, `test_case` |

#### Parameters Examples
**请求示例：**
```json
{
    "principal_id": "63bb744514bd13c9def24ceb",
    "principal_type": "idea"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "63bb744514bd13c9def24ceb",
    "url": "https://rest_api_root/v1/reviews/68ccfe6b3eef8131da564e4a/principals/63bb744514bd13c9def24ceb?principal_type=idea",
    "review": {
        "id": "68ccfe6b3eef8131da564e4a",
        "url": "https://rest_api_root/v1/reviews/68ccfe6b3eef8131da564e4a?principal_type=idea",
        "identifier": "SLC-R11",
        "title": "这是一个需求评审",
        "status": "pending",
        "principal_type": "idea",
        "short_id": "LK7Qy-NA",
        "html_url": "https://yctech.pingcode.com/ship/reviews/LK7Qy-NA"
    },
    "principal_type": "idea",
    "principal": {
        "id": "63bb744514bd13c9def24ceb",
        "url": "https://rest_api_root/v1/ship/ideas/63bb744514bd13c9def24ceb",
        "identifier": "SLC-1",
        "title": "这是一个产品需求",
        "short_id": "Omi8PFL0",
        "html_url": "https://yctech.pingcode.com/ship/ideas/Omi8PFL0"
    }
}
```

### 在评审中移除一个评审内容

**接口:** `DELETE https://rest_api_root/v1/reviews/{review_id}/principals/{principal_id}?principal_type={principal_type}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `review_id` | String | 是 | 评审的id。 |
| `principal_id` | String | 是 | 评审内容的id。 |

**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `principal_type` | String | 是 | 评审主体的类型。<br>可选值: `idea`, `work_item`, `test_case` |

#### Success Examples
**响应示例：**
```json
{
    "id": "63bb744514bd13c9def24ceb",
    "url": "https://rest_api_root/v1/reviews/68ccfe6b3eef8131da564e4a/principals/63bb744514bd13c9def24ceb?principal_type=idea",
    "review": {
        "id": "68ccfe6b3eef8131da564e4a",
        "url": "https://rest_api_root/v1/reviews/68ccfe6b3eef8131da564e4a?principal_type=idea",
        "identifier": "SLC-R11",
        "title": "这是一个需求评审",
        "status": "pending",
        "principal_type": "idea",
        "short_id": "LK7Qy-NA",
        "html_url": "https://yctech.pingcode.com/ship/reviews/LK7Qy-NA"
    },
    "principal_type": "idea",
    "principal": {
        "id": "63bb744514bd13c9def24ceb",
        "url": "https://rest_api_root/v1/ship/ideas/63bb744514bd13c9def24ceb",
        "identifier": "SLC-1",
        "title": "这是一个产品需求",
        "short_id": "Omi8PFL0",
        "html_url": "https://yctech.pingcode.com/ship/ideas/Omi8PFL0"
    }
}
```

### 获取一个评审内容

**接口:** `GET https://rest_api_root/v1/reviews/{review_id}/principals/{principal_id}?principal_type={principal_type}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `review_id` | String | 是 | 评审的id。 |
| `principal_id` | String | 是 | 评审内容的id。 |

**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `principal_type` | String | 是 | 评审主体的类型。<br>可选值: `idea`, `work_item`, `test_case` |

#### Success Examples
**响应示例：**
```json
{
    "id": "63bb744514bd13c9def24ceb",
    "url": "https://rest_api_root/v1/reviews/68ccfe6b3eef8131da564e4a/principals/63bb744514bd13c9def24ceb?principal_type=idea",
    "review": {
        "id": "68ccfe6b3eef8131da564e4a",
        "url": "https://rest_api_root/v1/reviews/68ccfe6b3eef8131da564e4a?principal_type=idea",
        "identifier": "SLC-R11",
        "title": "这是一个需求评审",
        "status": "pending",
        "principal_type": "idea",
        "short_id": "LK7Qy-NA",
        "html_url": "https://yctech.pingcode.com/ship/reviews/LK7Qy-NA"
    },
    "principal_type": "idea",
    "principal": {
        "id": "63bb744514bd13c9def24ceb",
        "url": "https://rest_api_root/v1/ship/ideas/63bb744514bd13c9def24ceb",
        "identifier": "SLC-1",
        "title": "这是一个产品需求",
        "short_id": "Omi8PFL0",
        "html_url": "https://yctech.pingcode.com/ship/ideas/Omi8PFL0"
    }
}
```

### 获取评审内容列表

**接口:** `GET https://rest_api_root/v1/reviews/{review_id}/principals?principal_type={principal_type}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `review_id` | String | 是 | 评审的id。 |

**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `principal_type` | String | 是 | 评审主体的类型。<br>可选值: `idea`, `work_item`, `test_case` |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "63bb744514bd13c9def24ceb",
            "url": "https://rest_api_root/v1/reviews/68ccfe6b3eef8131da564e4a/principals/63bb744514bd13c9def24ceb?principal_type=idea",
            "review": {
                "id": "68ccfe6b3eef8131da564e4a",
                "url": "https://rest_api_root/v1/reviews/68ccfe6b3eef8131da564e4a?principal_type=idea",
                "identifier": "SLC-R11",
                "title": "这是一个需求评审",
                "status": "pending",
                "principal_type": "idea",
                "short_id": "LK7Qy-NA",
                "html_url": "https://yctech.pingcode.com/ship/reviews/LK7Qy-NA"
            },
            "principal_type": "idea",
            "principal": {
                "id": "63bb744514bd13c9def24ceb",
                "url": "https://rest_api_root/v1/ship/ideas/63bb744514bd13c9def24ceb",
                "identifier": "SLC-1",
                "title": "这是一个产品需求",
                "short_id": "Omi8PFL0",
                "html_url": "https://yctech.pingcode.com/ship/ideas/Omi8PFL0"
            }
        }
    ]
}
```

### 获取评审列表

**接口:** `GET https://rest_api_root/v1/reviews?principal_type={principal_type}&pilot_id={pilot_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `principal_type` | String | 是 | 评审主体的类型。<br>可选值: `idea`, `work_item`, `test_case` |
| `pilot_id` | String | 是 | 评审主体所在产品、项目或测试库的id。 |
| `status` | String | 否 | 评审的状态。<br>可选值: `pending`, `in_progress`, `completed`, `repealed` |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "5f168f764eba01a5278b87cd",
            "url": "https://rest_api_root/v1/reviews/5f168f764eba01a5278b87cd?principal_type=idea",
            "identifier": "SCR-R5",
            "title": "这是一个评审",
            "status": "completed",
            "principal_type": "idea",
            "short_id": "LsEy8mZF",
            "html_url": "https://yctech.pingcode.com/reviews/LsEy8mZF",
            "pilot": {
                "id": "63bb744314bd13c9def24cb4",
                "url": "https://rest_api_root/v1/ship/products/63bb744314bd13c9def24cb4",
                "name": "示例产品",
                "identifier": "SLC",
                "is_archived": 0,
                "is_deleted": 0
            },
            "description": "这是一个评审的描述",
            "participants": [
                {
                    "id": "a0417f68e846aae315c85d24643678a9",
                    "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=idea&review_id=6f168f764eba01a5278b87cd",
                    "type": "user",
                    "user": {
                        "id": "a0417f68e846aae315c85d24643678a9",
                        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                        "name": "john",
                        "display_name": "John",
                        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
                    }
                }
            ],
            "submitted_at": 1593290347,
            "submitted_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/avatar.png"
            },
            "completed_at": 1593291347,
            "completed_by": {
                "id": "b2417f68e846aae315c85d24643678b0",
                "url": "https://rest_api_root/v1/directory/users/b2417f68e846aae315c85d24643678b0",
                "name": "mary",
                "display_name": "Mary",
                "avatar": "https://s3.amazonaws.com/bucket/avatar2.png"
            },
            "created_at": 1593290347,
            "created_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/avatar.png"
            },
            "updated_at": 1593291347,
            "updated_by": {
                "id": "b2417f68e846aae315c85d24643678b0",
                "url": "https://rest_api_root/v1/directory/users/b2417f68e846aae315c85d24643678b0",
                "name": "mary",
                "display_name": "Mary",
                "avatar": "https://s3.amazonaws.com/bucket/avatar2.png"
            }
        }
    ]
}
```

## 产品管理

### 产品

**接口:** ` 产品`

用于查看和管理产品相关的基本信息。
 资源地址：{GET} /v1/ship/products/{product_id}

#### Success
**资源属性**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 产品的id。 |
| `url` | String | 是 | 产品的资源地址。 |
| `identifier` | String | 是 | 产品的标识。 |
| `name` | String | 是 | 产品的名称。 |
| `scope_type` | String | 是 | 产品的所属类型。<br>可选值: `organization`, `user_group` |
| `scope_id` | String | 是 | 产品的所属id。 |
| `visibility` | String | 是 | 产品的可见性。<br>可选值: `private`, `public` |
| `color` | String | 是 | 产品的主题色。 |
| `description` | String | 是 | 产品的描述。 |
| `members` | Object[] | 是 | 产品的成员列表。 |
| `created_at` | Number | 是 | 产品的创建时间。 |
| `created_by` | Object | 是 | 产品的创建人。 |
| `updated_at` | Number | 是 | 产品的更新时间。 |
| `updated_by` | Object | 是 | 产品的更新人。 |
| `is_archived` | Number | 是 | 是否已归档。<br>可选值: `0`, `1` |
| `is_deleted` | Number | 是 | 是否已删除。<br>可选值: `0`, `1` |

#### Success Examples
**全量数据示例：**
```json
{
    "id": "6422711c3f12e6c1e46d40e9",
    "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9",
    "identifier": "SLC",
    "name": "示例产品",
    "scope_type": "user_group",
    "scope_id": "6422711c3f12e6c1e46d40e9",
    "visibility": "private",
    "color": "#FA8888",
    "description": "示例产品描述",
    "members": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9/members/a0417f68e846aae315c85d24643678a9",
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        },
        {
            "id": "63c8fb32729dee3334d96af7",
            "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9/members/63c8fb32729dee3334d96af7",
            "type": "user_group",
            "user_group": {
                "id": "63c8fb32729dee3334d96af7",
                "url": "https://rest_api_root/v1/directory/groups/63c8fb32729dee3334d96af7",
                "name": "Open Team"
            }
        }
    ],
    "created_at": 1583290300,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1583290300,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_archived": 0,
    "is_deleted": 0
}
```

**引用数据示例：**
```json
{
    "id": "6422711c3f12e6c1e46d40e9",
    "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9",
    "identifier": "SLC",
    "name": "示例产品",
    "is_archived": 0,
    "is_deleted": 0
}
```

### 产品配置中心

**接口:** ` 产品配置中心`

用于查看和管理产品相关的配置信息。

### 外部用户

**接口:** ` 外部用户`

用于查看和管理外部用户相关的基本信息。
 资源地址：{GET} /v1/ship/products/{product_id}/users/{user_id}

#### Success
**资源属性**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 外部用户的id。 |
| `url` | String | 是 | 外部用户的资源地址。 |
| `name` | String | 是 | 外部用户的名称。 |
| `display_name` | String | 是 | 外部用户的显示名。 |
| `avatar` | String | 是 | 外部用户的头像地址。 |
| `email` | String | 是 | 外部用户的邮箱地址。 |
| `mobile` | String | 是 | 外部用户的手机号。 |
| `product` | Object | 是 | 外部用户所属的产品。 |
| `customer` | Object | 是 | 外部用户所属的客户。 |

#### Success Examples
**全量数据示例：**
```json
{
    "id": "64a2b61c3a12e6c2e46d41e9",
    "url": "https://rest_api_root/v1/ship/products/64a2b61c3a12e6c2e46d41e9/users/64a2b61c3a12e6c2e46d41e9",
    "name": "jack",
    "display_name": "Jack",
    "avatar": "https://s3.amazonaws.com/bucket/a46ef40c-e21e-48cf-a579-cace9fba839a_160x160.png",
    "email": "jack@email.com",
    "mobile": null,
    "product": {
        "id": "6422711c3f12e6c1e46d40e9",
        "url": "http://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9",
        "identifier": "SLC",
        "name": "示例产品",
        "is_archived": 0,
        "is_deleted": 0
    },
    "customer": {
        "id": "64dd899e3f6383ba72ec2a01",
        "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9/customers/64dd899e3f6383ba72ec2a01",
        "name": "深圳XX新零售有限公司"
    }
}
```

**引用数据示例：**
```json
{
    "id": "64a2b61c3a12e6c2e46d41e9",
    "url": "https://rest_api_root/v1/ship/products/64a2b61c3a12e6c2e46d41e9/users/64a2b61c3a12e6c2e46d41e9",
    "name": "jack",
    "display_name": "Jack",
    "avatar": "https://s3.amazonaws.com/bucket/a46ef40c-e21e-48cf-a579-cace9fba839a_160x160.png"
}
```

### 客户

**接口:** ` 客户`

用于查看和管理客户相关的基本信息。
 资源地址：{GET} https://rest_api_root/v1/ship/products/{product_id}/customers/{customer_id}

#### Success
**资源属性**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 客户的id。 |
| `url` | String | 是 | 客户的资源地址。 |
| `product` | Object | 是 | 客户的所属产品。 |
| `name` | String | 是 | 客户的名称。 |
| `assignee` | Object | 是 | 客户的负责人。 |
| `scale` | Number | 是 | 客户的规模。 |
| `description` | String | 是 | 客户的描述。 |
| `created_at` | Number | 是 | 客户的创建时间。 |
| `created_by` | Object | 是 | 客户的创建人。 |
| `updated_at` | Number | 是 | 客户的更新时间。 |
| `updated_by` | Object | 是 | 客户的更新人。 |
| `is_archived` | Number | 是 | 是否已归档。<br>可选值: `0`, `1` |
| `is_deleted` | Number | 是 | 是否已删除。<br>可选值: `0`, `1` |

#### Success Examples
**全量数据示例：**
```json
{
    "id": "64dd899e3f6383ba72ec2a0d",
    "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e6/customers/64dd899e3f6383ba72ec2a0d",
    "product": {
        "id": "6422711c3f12e6c1e46d40e6",
        "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e6",
        "identifier": "SLC",
        "name": "示例产品",
        "is_archived": 0,
        "is_deleted": 0
    },
    "name": "上海XX新零售有限公司",
    "assignee": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "scale": 200,
    "description": "上海XX新零售有限公司的描述",
    "created_at": 1692240286,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1692240286,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_archived": 0,
    "is_deleted": 0
}
```

**引用数据示例：**
```json
{
    "id": "64dd899e3f6383ba72ec2a0d",
    "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e6/customers/64dd899e3f6383ba72ec2a0d",
    "name": "上海XX新零售有限公司"
}
```

### 工单

**接口:** ` 工单`

用于查看和管理工单相关的基本信息。
 资源地址：{GET} /v1/ship/tickets/{ticket_id}

#### Success
**资源属性**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 工单的id。 |
| `url` | String | 是 | 工单的资源地址。 |
| `product` | Object | 是 | 工单的所属产品。 |
| `identifier` | String | 是 | 工单的标识。 |
| `title` | String | 是 | 工单的标题。 |
| `short_id` | String | 是 | 工单的短id。 |
| `html_url` | String | 是 | 工单的html地址。 |
| `assignee` | Object | 是 | 工单的负责人。 |
| `state` | Object | 是 | 工单的状态。 |
| `type` | Object | 是 | 工单的类型。 |
| `customer` | Object | 是 | 工单的客户。 |
| `solution` | Object | 是 | 工单的解决方案。 |
| `priority` | Object | 是 | 工单的优先级。 |
| `channel` | Object/String | 是 | 工单的渠道。外部渠道提交的工单的渠道是Object类型，内部工单的渠道是 internal 字符串。 |
| `description` | String | 是 | 工单的描述。 |
| `properties` | Object | 是 | 工单的自定义属性。 |
| `properties.prop_a` | Object | 是 | 工单的自定义属性prop_a。 |
| `properties.prop_b` | Object | 是 | 工单的自定义属性prop_b。 |
| `estimated_at` | Object | 是 | 工单的预计时间。 |
| `estimated_at.from` | Number | 是 | 预计时间的开始时间。 |
| `estimated_at.to` | Number | 是 | 预计时间的结束时间。 |
| `estimated_at.granularity` | String | 是 | 预计时间的周期单位。<br>可选值: `year`, `quarter`, `month`, `day` |
| `tags` | Object[] | 是 | 工单的标签列表。 |
| `participants` | Object[] | 是 | 工单的关注人列表。 |
| `public_image_token` | String | 是 | 工单描述和自定义多行文本类型属性里获取图片资源token。获取一个工单和获取工单列表参数include_public_image_token值有效时返回。 |
| `submitted_at` | Number | 是 | 工单的提交时间。 |
| `submitted_by` | Object | 是 | 工单的提交人。 |
| `completed_at` | Number | 是 | 工单的完成时间。 |
| `completed_by` | Object | 是 | 工单的完成人。 |
| `created_at` | Number | 是 | 工单的创建时间。 |
| `created_by` | Object | 是 | 工单的创建人。 |
| `updated_at` | Number | 是 | 工单的更新时间。 |
| `updated_by` | Object | 是 | 工单的更新人。 |
| `is_archived` | Number | 是 | 是否已归档。<br>可选值: `0`, `1` |
| `is_deleted` | Number | 是 | 是否已删除。<br>可选值: `0`, `1` |

#### Success Examples
**全量数据示例：**
```json
{
    "id": "63eca888a0a13a3efc8d4a43",
    "url": "https://rest_api_root/v1/ship/tickets/63eca888a0a13a3efc8d4a43",
    "product": {
        "id": "6422711c3f12e6c1e46d40e9",
        "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9",
        "identifier": "SLC",
        "name": "示例产品",
        "is_archived": 0,
        "is_deleted": 0
    },
    "identifier": "SLC-T1",
    "title": "希望新增支持第三方账号注册",
    "short_id": "pdMUgQzZ",
    "html_url": "https://yctech.pingcode.com/ship/tickets/pdMUgQzZ",
    "assignee": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "state": {
        "id": "63eca880a0a13a3efc8d49d9",
        "url": "https://rest_api_root/v1/ship/ticket_states/63eca880a0a13a3efc8d49d9",
        "name": "待处理",
        "type": "pending"
    },
    "estimated_at": {
        "from": 1701619200,
        "to": 1702742399,
        "granularity": "day"
    },
    "type": {
        "id": "63eca880a0a13a3efc8d49e0",
        "url": "https://rest_api_root/v1/ship/ticket_types/63eca880a0a13a3efc8d49e0",
        "name": "需求"
    },
    "customer": {
        "id": "63eca881a0a13a3efc8d49fc",
        "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9/customers/63eca881a0a13a3efc8d49fc",
        "name": "北京XX科技有限公司"
    },
    "solution": {
        "id": "62f217ae16e3661a20124330",
        "url": "https://rest_api_root/v1/ship/ticket_solutions/62f217ae16e3661a20124330",
        "name": "进入需求池"
    },
    "priority": {
        "url": "https://rest_api_root/v1/ship/ticket_priorities/5cb9466afda1ce4ca0090004",
        "id": "5cb9466afda1ce4ca0090004",
        "name": "P1"
    },
    "channel": {
        "id": "64550d9ec696b249b5fc607d",
        "url": "https://rest_api_root/v1/ship/channels/64550d9ec696b249b5fc607d",
        "name": "channel-1"
    },
    "description": "<p>希望支持其他更多第三方平台的账号注册，以便用第三方账号登录找回更换了手机号的账号，保障账号安全</p>",
    "properties": {
        "prop_a": "prop_a_value",
        "prop_b": "prop_b_value"
    },
    "tags": [
        {
            "id": "63eca881a0a13a3efc8d49f1",
            "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9/tags/63eca881a0a13a3efc8d49f1",
            "name": "已确认"
        }
    ],
    "participants": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=ticket&principal_id=63eca888a0a13a3efc8d4a43",
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        },
        {
            "id": "63c8fb32729dee3334d96af7",
            "url": "https://rest_api_root/v1/participants/63c8fb32729dee3334d96af7?principal_type=ticket&principal_id=63eca888a0a13a3efc8d4a43",
            "type": "user_group",
            "user_group": {
                "id": "63c8fb32729dee3334d96af7",
                "url": "https://rest_api_root/v1/directory/groups/63c8fb32729dee3334d96af7",
                "name": "Open Team"
            }
        }
    ],
    "public_image_token": "N96GlJ4AMQoBCw9pZQ2EMl-AprLN_V_DYlghupBNkJA",
    "submitted_at": 1676454024,
    "submitted_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "completed_at": 1689579131,
    "completed_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
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
    },
    "is_archived": 0,
    "is_deleted": 0
}
```

**引用数据示例：**
```json
{
    "id": "63eca888a0a13a3efc8d4a43",
    "url": "https://rest_api_root/v1/ship/tickets/63eca888a0a13a3efc8d4a43",
    "identifier": "SLC-T1",
    "title": "希望新增支持第三方账号注册",
    "short_id": "pdMUgQzZ",
    "html_url": "https://yctech.pingcode.com/ship/tickets/pdMUgQzZ"
}
```

### 需求

**接口:** ` 需求`

用于查看和管理需求相关的基本信息。
 资源地址：{GET} /v1/ship/ideas/{idea_id}

#### Success
**资源属性**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 需求的id。 |
| `url` | String | 是 | 需求的资源地址。 |
| `product` | Object | 是 | 需求的所属产品。 |
| `identifier` | String | 是 | 需求的标识。 |
| `title` | String | 是 | 需求的标题。 |
| `short_id` | String | 是 | 需求的短id。 |
| `html_url` | String | 是 | 需求的html地址。 |
| `assignee` | Object | 是 | 需求的负责人。 |
| `state` | Object | 是 | 需求的状态。 |
| `priority` | Object | 是 | 需求的优先级。 |
| `plan` | Object | 是 | 需求的计划。 |
| `suite` | Object | 是 | 需求的模块。 |
| `plan_at` | Object | 是 | 需求的计划时间范围。 |
| `plan_at.from` | Number | 是 | 需求的计划开始时间。 |
| `plan_at.to` | Number | 是 | 需求的计划结束时间。 |
| `plan_at.granularity` | String | 是 | 需求的计划时间周期单位。<br>可选值: `year`, `quarter`, `month`, `day` |
| `real_at` | Object | 是 | 需求的实际时间范围。 |
| `real_at.from` | Number | 是 | 需求的实际开始时间。 |
| `real_at.to` | Number | 是 | 需求的实际结束时间。 |
| `real_at.granularity` | String | 是 | 需求的计划时间周期单位。<br>可选值: `year`, `quarter`, `month`, `day` |
| `score` | Number | 是 | 需求的分数。 |
| `progress` | Number | 是 | 需求的进度。 |
| `description` | String | 是 | 需求的描述。 |
| `properties` | Object | 是 | 需求的自定义属性。 |
| `properties.prop_a` | Object | 是 | 需求的自定义属性prop_a。 |
| `properties.prop_b` | Object | 是 | 需求的自定义属性prop_b。 |
| `participants` | Object[] | 是 | 需求的关注人列表。 |
| `public_image_token` | String | 是 | 需求描述和自定义多行文本类型属性里获取图片资源token。获取一个需求和获取需求列表参数include_public_image_token值有效时返回。 |
| `completed_at` | Number | 是 | 需求的完成时间。 |
| `completed_by` | Object | 是 | 需求的完成人。 |
| `created_at` | Number | 是 | 需求的创建时间。 |
| `created_by` | Object | 是 | 需求的创建人。 |
| `updated_at` | Number | 是 | 需求的更新时间。 |
| `updated_by` | Object | 是 | 需求的更新人。 |
| `is_archived` | Number | 是 | 是否已归档。<br>可选值: `0`, `1` |
| `is_deleted` | Number | 是 | 是否已删除。<br>可选值: `0`, `1` |

#### Success Examples
**全量数据示例：**
```json
{
    "id": "64b4d70ba368e6594360ea24",
    "url": "https://rest_api_root/v1/ship/ideas/64b4d70ba368e6594360ea24",
    "product": {
        "id": "6422711c3f12e6c1e46d40e9",
        "url": "http://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9",
        "identifier": "SLC",
        "name": "示例产品",
        "is_archived": 0,
        "is_deleted": 0
    },
    "identifier": "SLC-1",
    "title": "示例需求",
    "short_id": "Ogf1EYey",
    "html_url": "https://yctech.pingcode.com/ship/ideas/Ogf1EYey",
    "assignee": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "state": {
        "id": "63e1bf51898a0be5a2d21b2a",
        "url": "https://rest_api_root/v1/ship/idea_states/63e1bf51898a0be5a2d21b2a",
        "name": "待评审",
        "type": "pending"
    },
    "priority": {
        "id": "5cb9466afda1ce4ca0090005",
        "url": "https://rest_api_root/v1/ship/idea_priorities/5cb9466afda1ce4ca0090005",
        "name": "P0"
    },
    "plan": {
        "id": "63bb744414bd13c9def24ce4",
        "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9/plans/63bb744414bd13c9def24ce4",
        "name": "账号管理"
    },
    "suite": {
        "id": "63bb744414bd13c9def24ce4",
        "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9/suites/63bb744414bd13c9def24ce4",
        "name": "需求模块",
        "type": "module"
    },
    "plan_at": {
        "from": 1690732800,
        "to": 1691337599,
        "granularity": "day"
    },
    "real_at": {
        "from": 1690732800,
        "to": 1691337599,
        "granularity": "day"
    },
    "score": 0,
    "progress": 0.60,
    "description": "这是一段描述",
    "properties": {
        "backlog_from": "5cb7e6e2fda1ce4ca0000001",
        "backlog_type": "5cb7e763fda1ce4ca0010002"
    },
    "participants": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=idea&principal_id=64b4d70ba368e6594360ea24",
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        },
        {
            "id": "63c8fb32729dee3334d96af7",
            "url": "https://rest_api_root/v1/participants/63c8fb32729dee3334d96af7?principal_type=idea&principal_id=64b4d70ba368e6594360ea24",
            "type": "user_group",
            "user_group": {
                "id": "63c8fb32729dee3334d96af7",
                "url": "https://rest_api_root/v1/directory/groups/63c8fb32729dee3334d96af7",
                "name": "Open Team"
            }
        }
    ],
    "public_image_token": "-fkvANQ2dcVECK6Xg45L3kG8VCbOTK8NrNckGkxljQD",
    "completed_at": 1689579131,
    "completed_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "created_at": 1689573131,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1689579131,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_archived": 0,
    "is_deleted": 0
}
```

**引用数据示例：**
```json
{
    "id": "64b4d70ba368e6594360ea24",
    "url": "https://rest_api_root/v1/ship/ideas/64b4d70ba368e6594360ea24",
    "identifier": "SLC-1",
    "title": "示例需求",
    "short_id": "Ogf1EYey",
    "html_url": "https://yctech.pingcode.com/ship/ideas/Ogf1EYey"
}
```

## 产品

### 创建一个产品

**接口:** `POST https://rest_api_root/v1/ship/products`

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 产品的名称（不超过32个字符）。 |
| `identifier` | String | 是 | 产品的标识。在一个企业中这个标识是唯一的。产品的标识由大写英文字母/数字/下划线/连接线组成（不超过15个字符）。 |
| `description` | String | 否 | 产品的描述。 |
| `members` | Object[] | 否 | 产品成员的列表。 |
| `members.id` | String | 是 | 企业成员或团队的id。 |
| `members.type` | String | 是 | 产品成员的类型。<br>可选值: `user`, `user_group` |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "示例产品",
    "identifier": "SLC",
    "description": "示例产品描述",
    "members": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "type": "user"
        },
        {
            "id": "63c8fb32729dee3334d96af7",
            "type": "user_group"
        }
    ]
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "6422711c3f12e6c1e46d40e9",
    "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9",
    "identifier": "SLC",
    "name": "示例产品",
    "visibility": "private",
    "scope_type": "user_group",
    "scope_id": "6422711c3f12e6c1e46d40e9",
    "color": "#FA8888",
    "description": "示例产品描述",
    "members": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9/members/a0417f68e846aae315c85d24643678a9",
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        },
        {
            "id": "63c8fb32729dee3334d96af7",
            "url": "https://rest_api_root/v1/wiki/spaces/642fd641209b56920a6c6e5e/members/63c8fb32729dee3334d96af7",
            "type": "user_group",
            "user_group": {
                 "id": "63c8fb32729dee3334d96af7",
                 "url": "https://rest_api_root/v1/directory/groups/63c8fb32729dee3334d96af7",
                 "name": "Open Team"
            }
        }
    ],
    "created_at": 1583290300,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1583290300,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_archived": 0,
    "is_deleted": 0
}
```

### 向产品中添加一个成员

**接口:** `POST https://rest_api_root/v1/ship/products/{product_id}/members`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 产品的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `member` | Object | 是 | 产品的成员。 |
| `member.id` | String | 是 | 企业成员或团队的id。 |
| `member.type` | String | 是 | 项目成员的类型。<br>可选值: `user`, `user_group` |
| `role_id` | String | 否 | 角色的id。 |

#### Parameters Examples
**请求示例：**
```json
{
    "member": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "type": "user"
    },
    "role_id": "6422711c3f12e6c1e46d40e6"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "a0417f68e846aae315c85d24643678a9",
    "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9/members/a0417f68e846aae315c85d24643678a9",
    "product": {
        "id": "6422711c3f12e6c1e46d40e9",
        "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9",
        "name": "示例产品",
        "identifier": "SLC",
        "is_archived": 0,
        "is_deleted": 0
    },
    "type": "user",
    "user": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "role": {
        "id": "6422711c3f12e6c1e46d40e6",
        "url": "https://rest_api_root/v1/directory/roles/6422711c3f12e6c1e46d40e6",
        "name": "管理员"
    }
}
```

### 向产品中添加一个标签

**接口:** `POST https://rest_api_root/v1/ship/products/{product_id}/tags`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 产品的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 标签的名称。在一个产品中这个名称是唯一的。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "标签-1"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "63eca881a0a13a3efc8d49f0",
    "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e6/tags/63eca881a0a13a3efc8d49f0",
    "product": {
        "id": "6422711c3f12e6c1e46d40e6",
        "url": "http://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e6",
        "identifier": "SLC",
        "name": "示例产品",
        "is_archived": 0,
        "is_deleted": 0
    },
    "name": "标签-1",
    "color": "#56ABFB"
}
```

### 向产品中添加一个需求模块

**接口:** `POST https://rest_api_root/v1/ship/products/{product_id}/suites`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 产品的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 模块名称。需求模块为树形结构，同一层次下的名称不能重复。 |
| `type` | String | 是 | 模块类型。允许值分别表示子产品和模块。<br>可选值: `product`, `module` |
| `parent_id` | String | 否 | 父模块的id。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "技术支持确认",
    "type": "module",
    "parent_id": "63bb744414bd13c9def24ce3"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "63eca881a0a13a3efc8d49f0",
    "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e6/suites/63eca881a0a13a3efc8d49f0",
    "product": {
        "id": "6422711c3f12e6c1e46d40e6",
        "url": "http://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e6",
        "identifier": "SLC",
        "name": "示例产品",
        "is_archived": 0,
        "is_deleted": 0
    },
    "name": "技术支持确认",
    "type": "module",
    "parent": {
        "id": "63bb744414bd13c9def24ce3",
        "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e6/suites/63bb744414bd13c9def24ce3",
        "name": "父级产品模块",
        "type": "module"
    }
}
```

### 在产品中移除一个成员

**接口:** `DELETE https://rest_api_root/v1/ship/products/{product_id}/members/{member_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 产品的id。 |
| `member_id` | String | 是 | 企业成员或团队的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "a0417f68e846aae315c85d24643678a9",
    "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9/members/a0417f68e846aae315c85d24643678a9",
    "product": {
        "id": "6422711c3f12e6c1e46d40e9",
        "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9",
        "name": "示例产品",
        "identifier": "SLC",
        "is_archived": 0,
        "is_deleted": 0
    },
    "type": "user",
    "user": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "role": {
        "id": "6422711c3f12e6c1e46d40e6",
        "url": "https://rest_api_root/v1/directory/roles/6422711c3f12e6c1e46d40e6",
        "name": "管理员"
    }
}
```

### 在产品中移除一个标签

**接口:** `DELETE https://rest_api_root/v1/ship/products/{product_id}/tags/{tag_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 产品的id。 |
| `tag_id` | String | 是 | 标签的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "63eca881a0a13a3efc8d49f0",
    "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e6/tags/63eca881a0a13a3efc8d49f0",
    "product": {
        "id": "6422711c3f12e6c1e46d40e6",
        "url": "http://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e6",
        "identifier": "SLC",
        "name": "示例产品",
        "is_archived": 0,
        "is_deleted": 0
    },
    "name": "技术支持确认",
    "color": "#56ABFB"
}
```

### 在产品中移除一个需求模块

**接口:** `DELETE https://rest_api_root/v1/ship/products/{product_id}/suites/{suite_id}`

请注意，删除一个模块会自动删除其所有的子模块。

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 产品的id。 |
| `suite_id` | String | 是 | 模块id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "63eca881a0a13a3efc8d49f0",
    "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e6/suites/63eca881a0a13a3efc8d49f0",
    "product": {
        "id": "6422711c3f12e6c1e46d40e6",
        "url": "http://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e6",
        "identifier": "SLC",
        "name": "示例产品",
        "is_archived": 0,
        "is_deleted": 0
    },
    "name": "技术支持确认",
    "type": "module",
    "parent": {
        "id": "63bb744414bd13c9def24ce3",
        "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e6/suites/63bb744414bd13c9def24ce3",
        "name": "父级产品模块",
        "type": "module"
    }
}
```

### 获取产品中的工单渠道列表

**接口:** `GET https://rest_api_root/v1/ship/products/{product_id}/channels`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 产品的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "63eca881a0a13a3efc8d49ed",
            "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e6/channels/63eca881a0a13a3efc8d49ed",
            "name": "客户反馈Web渠道",
            "product": {
                "id": "6422711c3f12e6c1e46d40e6",
                "url": "http://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e6",
                "identifier": "SLC",
                "name": "示例产品",
                "is_archived": 0,
                "is_deleted": 0
            },
            "description": "收集客户反馈意见的Web渠道"
        }
    ]
}
```

### 获取产品中的工单类型列表

**接口:** `GET https://rest_api_root/v1/ship/products/{product_id}/ticket_types`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 产品的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "63bb744214bd13c9def24ca9",
            "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9/ticket_types/63bb744214bd13c9def24ca9",
            "product": {
                "id": "6422711c3f12e6c1e46d40e9",
                "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9",
                "name": "自动化",
                "identifier": "FLOW",
                "is_archived": 0,
                "is_deleted": 0
            },
            "ticket_type": {
                "id": "63bb744214bd13c9def24ca9",
                "url": "https://rest_api_root/v1/ship/ticket_types/63bb744214bd13c9def24ca9",
                "name": "需求"
            }
        }
    ]
}
```

### 获取产品中的成员列表

**接口:** `GET https://rest_api_root/v1/ship/products/{product_id}/members`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 产品的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 2,
    "values": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9/members/a0417f68e846aae315c85d24643678a9",
            "type": "user",
            "product": {
                "id": "6422711c3f12e6c1e46d40e9",
                "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9",
                "name": "示例产品",
                "identifier": "SLC",
                "is_archived": 0,
                "is_deleted": 0
             },
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "role": {
                "id": "6422711c3f12e6c1e46d40e6",
                "url": "https://rest_api_root/v1/directory/roles/6422711c3f12e6c1e46d40e6",
                "name": "管理员"
            }
        },
        {
            "id": "63c8fb32729dee3334d96af7",
            "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9/members/63c8fb32729dee3334d96af7",
            "product": {
                "id": "6422711c3f12e6c1e46d40e9",
                "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9",
                "name": "示例产品",
                "identifier": "SLC",
                "is_archived": 0,
                "is_deleted": 0
             },
            "type": "user_group",
            "user_group": {
                "id": "63c8fb32729dee3334d96af7",
                "url": "https://rest_api_root/v1/directory/groups/63c8fb32729dee3334d96af7",
                "name": "Open Team"
            },
            "role": {
                "id": "6422711c3f12e6c1e46d40e6",
                "url": "https://rest_api_root/v1/directory/roles/6422711c3f12e6c1e46d40e6",
                "name": "管理员"
            }
        }
    ]
}
```

### 获取产品中的标签列表

**接口:** `GET https://rest_api_root/v1/ship/products/{product_id}/tags`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 产品的id。 |

#### Success Examples
**响应示例：**
```json
{
     "page_size": 30,
     "page_index": 0,
     "total": 1,
     "values": [
         {
             "id": "63eca881a0a13a3efc8d49f0",
             "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e6/tags/63eca881a0a13a3efc8d49f0",
             "product": {
                 "id": "6422711c3f12e6c1e46d40e6",
                 "url": "http://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e6",
                 "identifier": "SLC",
                 "name": "示例产品",
                 "is_archived": 0,
                 "is_deleted": 0
             },
             "name": "技术支持确认",
             "color": "#56ABFB"
         }
     ]
 }
```

### 获取产品中的需求排期列表

**接口:** `GET https://rest_api_root/v1/ship/products/{product_id}/plans`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 产品的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
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
    ]
}
```

### 获取产品中的需求模块列表

**接口:** `GET https://rest_api_root/v1/ship/products/{product_id}/suites`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 产品的id。 |

#### Success Examples
**响应示例：**
```json
{
     "page_size": 30,
     "page_index": 0,
     "total": 1,
     "values": [
         {
             "id": "63eca881a0a13a3efc8d49f0",
             "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e6/suites/63eca881a0a13a3efc8d49f0",
             "product": {
                 "id": "6422711c3f12e6c1e46d40e6",
                 "url": "http://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e6",
                 "identifier": "SLC",
                 "name": "示例产品",
                 "is_archived": 0,
                 "is_deleted": 0
             },
            "name": "技术支持确认",
            "type": "module",
            "parent": {
                "id": "63bb744414bd13c9def24ce3",
                "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e6/suites/63bb744414bd13c9def24ce3",
                "name": "父级产品模块",
                "type": "module"
            }
         }
     ]
 }
```

### 获取产品列表

**接口:** `GET https://rest_api_root/v1/ship/products`

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
            "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9",
            "identifier": "SLC",
            "name": "示例产品",
            "visibility": "private",
            "scope_type": "user_group",
            "scope_id": "6422711c3f12e6c1e46d40e9",
            "color": "#FA8888",
            "description": "示例产品描述",
            "members": [
                {
                    "id": "a0417f68e846aae315c85d24643678a9",
                    "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9/members/a0417f68e846aae315c85d24643678a9",
                    "type": "user",
                    "user": {
                        "id": "a0417f68e846aae315c85d24643678a9",
                        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                        "name": "john",
                        "display_name": "John",
                        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
                    }
                },
                {
                     "id": "63c8fb32729dee3334d96af7",
                     "url": "https://rest_api_root/v1/wiki/spaces/642fd641209b56920a6c6e5e/members/63c8fb32729dee3334d96af7",
                     "type": "user_group",
                     "user_group": {
                         "id": "63c8fb32729dee3334d96af7",
                         "url": "https://rest_api_root/v1/directory/groups/63c8fb32729dee3334d96af7",
                         "name": "Open Team"
                     }
                }
            ],
            "created_at": 1583290300,
            "created_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "updated_at": 1583290300,
            "updated_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "is_archived": 0,
            "is_deleted": 0
        }
    ]
}
```

### 部分更新一个产品

**接口:** `PATCH https://rest_api_root/v1/ship/products/{product_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 产品的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 产品的名称（不超过32个字符）。 |
| `identifier` | String | 否 | 产品的标识。在一个企业中这个标识是唯一的。产品的标识由大写英文字母/数字/下划线/连接线组成（不超过15个字符）。 |
| `description` | String | 否 | 产品的描述。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "示例产品",
    "identifier": "SLC",
    "description": "示例产品描述"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "6422711c3f12e6c1e46d40e9",
    "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9",
    "identifier": "SLC",
    "name": "示例产品",
    "scope_type": "user_group",
    "scope_id": "6422711c3f12e6c1e46d40e9",
    "visibility": "private",
    "color": "#FA8888",
    "description": "示例产品描述",
    "members": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9/members/a0417f68e846aae315c85d24643678a9",
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        },
        {
            "id": "63c8fb32729dee3334d96af7",
            "url": "https://rest_api_root/v1/wiki/spaces/642fd641209b56920a6c6e5e/members/63c8fb32729dee3334d96af7",
            "type": "user_group",
            "user_group": {
                 "id": "63c8fb32729dee3334d96af7",
                 "url": "https://rest_api_root/v1/directory/groups/63c8fb32729dee3334d96af7",
                 "name": "Open Team"
            }
        }
    ],
    "created_at": 1583290300,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1583293300,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_archived": 0,
    "is_deleted": 0
}
```

## 客户

### 创建一个客户

**接口:** `POST https://rest_api_root/v1/ship/products/{product_id}/customers`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 产品的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 客户的名称。 |
| `assignee_id` | String | 否 | 客户的负责人id。 |
| `scale` | Number | 否 | 客户的规模。 |
| `description` | String | 否 | 客户的描述。 |

#### Parameters Examples
**请求示例：**
```json
{
   "name": "上海XX新零售有限公司",
   "assignee_id": "a0417f68e846aae315c85d24643678a9",
   "scale": 200,
   "description": "上海XX新零售有限公司的描述"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "64dd899e3f6383ba72ec2a0d",
    "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e6/customers/64dd899e3f6383ba72ec2a0d",
    "product": {
        "id": "6422711c3f12e6c1e46d40e6",
        "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e6",
        "identifier": "SLC",
        "name": "示例产品",
        "is_archived": 0,
        "is_deleted": 0
    },
    "name": "上海XX新零售有限公司",
    "assignee": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "scale": 200,
    "description": "上海XX新零售有限公司的描述",
    "created_at": 1692240286,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1692240286,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_archived": 0,
    "is_deleted": 0
}
```

### 获取客户列表

**接口:** `GET https://rest_api_root/v1/ship/products/{product_id}/customers`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 产品的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "64dd899e3f6383ba72ec2a0d",
            "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e6/customers/64dd899e3f6383ba72ec2a0d",
            "product": {
                "id": "6422711c3f12e6c1e46d40e6",
                "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e6",
                "identifier": "SLC",
                "name": "示例产品",
                "is_archived": 0,
                "is_deleted": 0
            },
            "name": "上海XX新零售有限公司",
            "assignee": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "scale": 200,
            "description": "上海XX新零售有限公司的描述",
            "created_at": 1692240286,
            "created_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "updated_at": 1692240286,
            "updated_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "is_archived": 0,
            "is_deleted": 0
        }
    ]
}
```

### 部分更新一个客户

**接口:** `PATCH https://rest_api_root/v1/ship/products/{product_id}/customers/{customer_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 产品的id。 |
| `customer_id` | String | 是 | 客户的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 客户的名称。 |
| `assignee_id` | String | 否 | 客户的负责人id。 |
| `scale` | Number | 否 | 客户的规模。 |
| `description` | String | 否 | 客户的描述。 |

#### Parameters Examples
**请求示例：**
```json
{
   "name": "上海XX新零售有限公司",
   "assignee_id": "a0417f68e846aae315c85d24643678a9",
   "scale": 200,
   "description": "上海XX新零售有限公司的描述"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "64dd899e3f6383ba72ec2a0d",
    "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e6/customers/64dd899e3f6383ba72ec2a0d",
    "product": {
        "id": "6422711c3f12e6c1e46d40e6",
        "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e6",
        "identifier": "SLC",
        "name": "示例产品",
        "is_archived": 0,
        "is_deleted": 0
    },
    "name": "上海XX新零售有限公司",
    "assignee": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "scale": 200,
    "description": "上海XX新零售有限公司的描述",
    "created_at": 1692240286,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1692241286,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_archived": 0,
    "is_deleted": 0
}
```

## 外部用户

### 创建一个外部用户

**接口:** `POST https://rest_api_root/v1/ship/products/{product_id}/users`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 产品的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 外部用户的名称。 |
| `email` | String | 否 | 外部用户的邮箱地址，邮箱地址和手机号其中一个必填。 |
| `mobile` | String | 否 | 外部用户的手机号，邮箱地址和手机号其中一个必填，如果同时存在，以手机号为准。 |
| `customer_id` | String | 否 | 外部用户所属客户的id。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "jack",
    "email": "jack@email.com",
    "customer_id": "64dd899e3f6383ba72ec2a01"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "64a2b61c3a12e6c2e46d41e9",
    "url": "https://rest_api_root/v1/ship/products/64a2b61c3a12e6c2e46d41e9/users/64a2b61c3a12e6c2e46d41e9",
    "name": "jack",
    "display_name": "Jack",
    "avatar": "https://s3.amazonaws.com/bucket/a46ef40c-e21e-48cf-a579-cace9fba839a_160x160.png",
    "email": "jack@email.com",
    "mobile": null,
    "product": {
        "id": "6422711c3f12e6c1e46d40e9",
        "url": "http://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9",
        "identifier": "SLC",
        "name": "示例产品",
        "is_archived": 0,
        "is_deleted": 0
    },
    "customer": {
        "id": "64dd899e3f6383ba72ec2a01",
        "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9/customers/64dd899e3f6383ba72ec2a01",
        "name": "深圳XX新零售有限公司"
    }
}
```

### 删除一个外部用户

**接口:** `DELETE https://rest_api_root/v1/ship/products/{product_id}/users/{user_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 产品的id。 |
| `user_id` | String | 是 | 外部用户的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "64a2b61c3a12e6c2e46d41e9",
    "url": "https://rest_api_root/v1/ship/products/64a2b61c3a12e6c2e46d41e9/users/64a2b61c3a12e6c2e46d41e9",
    "name": "jack",
    "display_name": "Jack",
    "avatar": "https://s3.amazonaws.com/bucket/a46ef40c-e21e-48cf-a579-cace9fba839a_160x160.png",
    "email": "jack@email.com",
    "mobile": null,
    "product": {
        "id": "6422711c3f12e6c1e46d40e9",
        "url": "http://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9",
        "identifier": "SLC",
        "name": "示例产品",
        "is_archived": 0,
        "is_deleted": 0
    },
    "customer": {
        "id": "64dd899e3f6383ba72ec2a01",
        "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9/customers/64dd899e3f6383ba72ec2a01",
        "name": "深圳XX新零售有限公司"
    }
}
```

### 获取外部用户列表

**接口:** `GET https://rest_api_root/v1/ship/products/{product_id}/users`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 产品的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "64a2b61c3a12e6c2e46d41e9",
            "url": "https://rest_api_root/v1/ship/products/64a2b61c3a12e6c2e46d41e9/users/64a2b61c3a12e6c2e46d41e9",
            "name": "jack",
            "display_name": "Jack",
            "avatar": "https://s3.amazonaws.com/bucket/a46ef40c-e21e-48cf-a579-cace9fba839a_160x160.png",
            "email": "jack@email.com",
            "mobile": null,
            "product": {
                "id": "6422711c3f12e6c1e46d40e9",
                "url": "http://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9",
                "identifier": "SLC",
                "name": "示例产品",
                "is_archived": 0,
                "is_deleted": 0
            },
            "customer": {
                "id": "64dd899e3f6383ba72ec2a01",
                "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9/customers/64dd899e3f6383ba72ec2a01",
                "name": "深圳XX新零售有限公司"
            }
        }
    ]
}
```

### 部分更新一个外部用户

**接口:** `PATCH https://rest_api_root/v1/ship/products/{product_id}/users/{user_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 产品的id。 |
| `user_id` | String | 是 | 外部用户的id。 |

#### Parameters Examples
**请求示例：**
```json
{
    "customer_id": "64dd899e3f6383ba72ec2a01"
}
```

#### Success
**Success 200**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `customer_id` | String | 否 | 外部用户所属客户的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "64a2b61c3a12e6c2e46d41e9",
    "url": "https://rest_api_root/v1/ship/products/64a2b61c3a12e6c2e46d41e9/users/64a2b61c3a12e6c2e46d41e9",
    "name": "jack",
    "display_name": "Jack",
    "avatar": "https://s3.amazonaws.com/bucket/a46ef40c-e21e-48cf-a579-cace9fba839a_160x160.png",
    "email": "jack@email.com",
    "mobile": null,
    "product": {
        "id": "6422711c3f12e6c1e46d40e9",
        "url": "http://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9",
        "identifier": "SLC",
        "name": "示例产品",
        "is_archived": 0,
        "is_deleted": 0
    },
    "customer": {
        "id": "64dd899e3f6383ba72ec2a01",
        "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9/customers/64dd899e3f6383ba72ec2a01",
        "name": "深圳XX新零售有限公司"
    }
}
```

## 工单

### 创建一个工单

**接口:** `POST https://rest_api_root/v1/ship/tickets`

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 工单的产品id。 |
| `title` | String | 是 | 工单的标题，最大长度为255。 |
| `type_id` | String | 是 | 工单的类型id，您可以在 “获取工单类型列表” API获取。 |
| `description` | String | 否 | 工单的描述。 |
| `submitter_id` | String | 否 | 工单的提交人id，企业授权时，该值有效；个人鉴权时，指定无效。 |
| `customer_id` | String | 否 | 工单的客户id，您可以在 “获取产品客户列表” API获取。 |
| `channel_id` | String | 否 | 工单的渠道id，您可以在 “获取渠道列表” API获取。 |
| `assignee_id` | String | 否 | 工单的负责人id。 |
| `priority_id` | String | 否 | 工单的优先级id，您可以在 “获取工单优先级列表” API获取。 |
| `properties` | Object | 否 | 工单的自定义属性。 |
| `properties.prop_a` | Object | 否 | 工单的自定义属性prop_a。 |
| `properties.prop_b` | Object | 否 | 工单的自定义属性prop_b。 |

#### Parameters Examples
**请求示例：**
```json
{
    "product_id": "6422711c3f12e6c1e46d40e9",
    "title": "希望新增支持第三方账号注册",
    "type_id": "63eca880a0a13a3efc8d49e0",
    "description": "<p>希望支持其他更多第三方平台的账号注册，以便用第三方账号登录找回更换了手机号的账号，保障账号安全</p>",
    "submitter_id": "a0417f68e846aae315c85d24643678a9",
    "customer_id": "63eca881a0a13a3efc8d49fc",
    "channel_id": "64550d9ec696b249b5fc607d",
    "assignee_id": "a0417f68e846aae315c85d24643678a9",
    "priority_id": "5cb9466afda1ce4ca0090004",
    "properties": {
        "prop_a": "prop_a_value",
        "prop_b": "prop_b_value"
    }
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "63eca888a0a13a3efc8d4a43",
    "url": "https://rest_api_root/v1/ship/tickets/63eca888a0a13a3efc8d4a43",
    "product": {
        "id": "6422711c3f12e6c1e46d40e9",
        "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9",
        "identifier": "SLC",
        "name": "示例产品",
        "is_archived": 0,
        "is_deleted": 0
    },
    "identifier": "SLC-T1",
    "title": "希望新增支持第三方账号注册",
    "short_id": "pdMUgQzZ",
    "html_url": "https://yctech.pingcode.com/ship/tickets/pdMUgQzZ",
    "assignee": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "state": {
        "id": "63eca880a0a13a3efc8d49d9",
        "url": "https://rest_api_root/v1/ship/ticket_states/63eca880a0a13a3efc8d49d9",
        "name": "待处理",
        "type": "pending"
    },
    "type": {
        "id": "63eca880a0a13a3efc8d49e0",
        "url": "https://rest_api_root/v1/ship/ticket_types/63eca880a0a13a3efc8d49e0",
        "name": "需求"
    },
    "customer": {
        "id": "63eca881a0a13a3efc8d49fc",
        "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9/customers/63eca881a0a13a3efc8d49fc",
        "name": "北京XX科技有限公司"
    },
    "solution": {
        "id": "62f217ae16e3661a20124330",
        "url": "https://rest_api_root/v1/ship/ticket_solutions/62f217ae16e3661a20124330",
        "name": "进入需求池"
    },
    "priority": {
        "url": "https://rest_api_root/v1/ship/ticket_priorities/5cb9466afda1ce4ca0090004",
        "id": "5cb9466afda1ce4ca0090004",
        "name": "P1"
    },
    "channel": {
        "id": "64550d9ec696b249b5fc607d",
        "url": "https://rest_api_root/v1/ship/channels/64550d9ec696b249b5fc607d",
        "name": "channel-1"
    },
    "description": "<p>希望支持其他更多第三方平台的账号注册，以便用第三方账号登录找回更换了手机号的账号，保障账号安全</p>",
    "properties": {
        "prop_a": "prop_a_value",
        "prop_b": "prop_b_value"
    },
    "estimated_at": null,
    "tags": [],
    "participants": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=ticket&principal_id=63eca888a0a13a3efc8d4a43",
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        },
        {
            "id": "63c8fb32729dee3334d96af7",
            "url": "https://rest_api_root/v1/participants/63c8fb32729dee3334d96af7?principal_type=ticket&principal_id=63eca888a0a13a3efc8d4a43",
            "type": "user_group",
            "user_group": {
                "id": "63c8fb32729dee3334d96af7",
                "url": "https://rest_api_root/v1/directory/groups/63c8fb32729dee3334d96af7",
                "name": "Open Team"
            }
        }
    ],
    "submitted_at": 1676454024,
    "submitted_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "completed_at": 1689579131,
    "completed_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
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
    },
    "is_archived": 0,
    "is_deleted": 0
}
```

### 获取工单优先级列表

**接口:** `GET https://rest_api_root/v1/ship/ticket/priorities?product_id={product_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 产品的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "5cb9466afda1ce4ca0090005",
            "url": "https://rest_api_root/v1/ship/ticket_priorities/5cb9466afda1ce4ca0090005",
            "name": "P0"
        }
    ]
}
```

### 获取工单列表

**接口:** `GET https://rest_api_root/v1/ship/tickets`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 否 | 产品的id。 |
| `type_id` | String | 否 | 工单类型id。 |
| `state_id` | String | 否 | 工单状态id。 |
| `priority_id` | String | 否 | 工单优先级id。 |
| `created_between` | String | 否 | 创建时间介于的时间范围，通过','分割起始时间。 |
| `updated_between` | String | 否 | 更新时间介于的时间范围，通过','分割起始时间。 |
| `keywords` | String | 否 | 关键字。支持工单编号和工单标题。 |
| `include_public_image_token` | String | 否 | 包含获取图片资源token的属性。使用','分割，最多只能20个，支持description和自定义多行文本类型的属性。参数示例description,properties.prop_b。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "63eca888a0a13a3efc8d4a43",
            "url": "https://rest_api_root/v1/ship/tickets/63eca888a0a13a3efc8d4a43",
            "product": {
                "id": "6422711c3f12e6c1e46d40e9",
                "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9",
                "identifier": "SLC",
                "name": "示例产品",
                "is_archived": 0,
                "is_deleted": 0
            },
            "identifier": "SLC-T1",
            "title": "希望新增支持第三方账号注册",
            "short_id": "pdMUgQzZ",
            "html_url": "https://yctech.pingcode.com/ship/tickets/pdMUgQzZ",
            "assignee": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "state": {
                "id": "63eca880a0a13a3efc8d49d9",
                "url": "https://rest_api_root/v1/ship/ticket_states/63eca880a0a13a3efc8d49d9",
                "name": "待处理",
                "type": "pending"
            },
            "estimated_at": {
                "from": 1701619200,
                "to": 1702742399,
                "granularity": "day"
            },
            "type": {
                "id": "63eca880a0a13a3efc8d49e0",
                "url": "https://rest_api_root/v1/ship/ticket_types/63eca880a0a13a3efc8d49e0",
                "name": "需求"
            },
            "customer": {
                "id": "63eca881a0a13a3efc8d49fc",
                "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9/customers/63eca881a0a13a3efc8d49fc",
                "name": "北京XX科技有限公司"
            },
            "solution": {
                "id": "62f217ae16e3661a20124330",
                "url": "https://rest_api_root/v1/ship/ticket_solutions/62f217ae16e3661a20124330",
                "name": "进入需求池"
            },
            "priority": {
                "url": "https://rest_api_root/v1/ship/ticket_priorities/5cb9466afda1ce4ca0090004",
                "id": "5cb9466afda1ce4ca0090004",
                "name": "P1"
            },
            "channel": {
                "id": "64550d9ec696b249b5fc607d",
                "url": "https://rest_api_root/v1/ship/channels/64550d9ec696b249b5fc607d",
                "name": "channel-1"
            },
            "description": "<p>希望支持其他更多第三方平台的账号注册，以便用第三方账号登录找回更换了手机号的账号，保障账号安全</p>",
            "properties": {
                "prop_a": "prop_a_value",
                "prop_b": "prop_b_value"
            },
            "tags": [
                {
                    "id": "63eca881a0a13a3efc8d49f1",
                    "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9/tags/63eca881a0a13a3efc8d49f1",
                    "name": "已确认"
                }
            ],
            "participants": [
                {
                    "id": "a0417f68e846aae315c85d24643678a9",
                    "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=ticket&principal_id=63eca888a0a13a3efc8d4a43",
                    "type": "user",
                    "user": {
                        "id": "a0417f68e846aae315c85d24643678a9",
                        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                        "name": "john",
                        "display_name": "John",
                        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
                    }
                },
                {
                    "id": "63c8fb32729dee3334d96af7",
                    "url": "https://rest_api_root/v1/participants/63c8fb32729dee3334d96af7?principal_type=ticket&principal_id=63eca888a0a13a3efc8d4a43",
                    "type": "user_group",
                    "user_group": {
                        "id": "63c8fb32729dee3334d96af7",
                        "url": "https://rest_api_root/v1/directory/groups/63c8fb32729dee3334d96af7",
                        "name": "Open Team"
                    }
                }
            ],
            "public_image_token": "N96GlJ4AMQoBCw9pZQ2EMl-AprLN_V_DYlghupBNkJA",
            "submitted_at": 1676454024,
            "submitted_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "completed_at": 1689579131,
            "completed_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
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
            },
            "is_archived": 0,
            "is_deleted": 0
        }
    ]
}
```

### 获取工单属性列表

**接口:** `GET https://rest_api_root/v1/ship/ticket/properties?product_id={product_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 产品的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 2,
    "values": [
        {
            "id": "solution",
            "url": "https://rest_api_root/v1/ship/ticket_properties/solution",
            "name": "解决方案",
            "type": "select",
            "options": [
                {
                    "_id": "6422711c3f12e6c1e46d40e9",
                    "text": "进入需求池"
                }
            ]
        },
        {
            "id": "identifier",
            "url": "https://rest_api_root/v1/ship/ticket_properties/identifier",
            "name": "编号",
            "type": "text",
            "options": null
        }
    ]
}
```

### 获取工单标签列表

**接口:** `GET https://rest_api_root/v1/ship/ticket/tags?product_id={product_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 产品的id。 |

#### Success Examples
**响应示例：**
```json
{
     "page_size": 30,
     "page_index": 0,
     "total": 1,
     "values": [
         {
             "id": "63eca881a0a13a3efc8d49f0",
             "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e6/tags/63eca881a0a13a3efc8d49f0",
             "name": "技术支持确认"
         }
     ]
 }
```

### 获取工单流转记录列表

**接口:** `GET https://rest_api_root/v1/ship/tickets/{ticket_id}/transition_histories`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `ticket_id` | String | 是 | 工单的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 2,
    "values": [
        {
            "id": "64c3676c983bb9481ee1eea5",
            "url": "https://rest_api_root/v1/ship/tickets/5edca524cad2fa1125cb0630/transition_histories/64c3676c983bb9481ee1eea5",
            "ticket": {
                "id": "63eca888a0a13a3efc8d4a43",
                "url": "https://rest_api_root/v1/ship/tickets/63eca888a0a13a3efc8d4a43",
                "identifier": "SLC-T1",
                "title": "希望新增支持第三方账号注册",
                "short_id": "pdMUgQzZ",
                "html_url": "https://yctech.pingcode.com/ship/tickets/pdMUgQzZ"
            },
            "from_state": null,
            "to_state": {
                "id": "63e1bf51898a0be5a2d21b29",
                "url": "https://rest_api_root/v1/ship/ticket_states/63e1bf51898a0be5a2d21b29",
                "name": "待处理",
                "type": "pending"
            },
            "created_at": 1674528614,
            "created_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        },
        {
            "id": "658bdb79e5839f556562accf",
            "url": "https://rest_api_root/v1/ship/tickets/5edca524cad2fa1125cb0630/transition_histories/658bdb79e5839f556562accf",
            "ticket": {
                "id": "63eca888a0a13a3efc8d4a43",
                "url": "https://rest_api_root/v1/ship/tickets/63eca888a0a13a3efc8d4a43",
                "identifier": "SLC-T1",
                "title": "希望新增支持第三方账号注册",
                "short_id": "pdMUgQzZ",
                "html_url": "https://yctech.pingcode.com/ship/tickets/pdMUgQzZ"
            },
            "from_state": {
                "id": "63e1bf51898a0be5a2d21b29",
                "url": "https://rest_api_root/v1/ship/ticket_states/63e1bf51898a0be5a2d21b29",
                "name": "待处理",
                "type": "pending"
            },
            "to_state": {
                "id": "63e1bf51898a0be5a2d21b2b",
                "url": "https://rest_api_root/v1/ship/ticket_states/63e1bf51898a0be5a2d21b2b",
                "name": "处理中",
                "type": "in_progress"
            },
            "created_at": 1674528614,
            "created_by": {
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

### 获取工单渠道列表

**接口:** `GET https://rest_api_root/v1/ship/ticket/channels?product_id={product_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 产品的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "63eca881a0a13a3efc8d49ed",
            "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e6/channels/63eca881a0a13a3efc8d49ed",
            "name": "客户反馈Web渠道"
        }
    ]
}
```

### 获取工单状态列表

**接口:** `GET https://rest_api_root/v1/ship/ticket/states?product_id={product_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 产品的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "6422711c3f12e6c1e46d40f2",
            "url": "https://rest_api_root/v1/ship/ticket_states/6422711c3f12e6c1e46d40f2",
            "name": "处理中",
            "type": "pending"
        }
    ]
}
```

### 获取工单类型列表

**接口:** `GET https://rest_api_root/v1/ship/ticket/types?product_id={product_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 产品的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "63bb744214bd13c9def24ca9",
            "url": "https://rest_api_root/v1/ship/ticket_types/63bb744214bd13c9def24ca9",
            "name": "需求"
        }
    ]
}
```

### 获取工单解决方案列表

**接口:** `GET https://rest_api_root/v1/ship/ticket/solutions?product_id={product_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 产品的id。 |

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

### 部分更新一个工单

**接口:** `PATCH https://rest_api_root/v1/ship/tickets/{ticket_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `ticket_id` | String | 是 | 工单id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `title` | String | 否 | 工单的标题，最大长度为255。 |
| `description` | String | 否 | 工单的描述。 |
| `type_id` | String | 否 | 工单的类型id，您可以在 “获取工单类型列表” API获取。 |
| `state_id` | String | 否 | 工单的状态id，您可以在 “获取工单状态列表” API获取。 |
| `assignee_id` | String | 否 | 工单的负责人id。 |
| `submitter_id` | String | 否 | 工单的提交人id，企业授权时，该值有效；个人鉴权时，指定无效。 |
| `solution_id` | String | 否 | 工单的解决方案id，您可以在 “获取工单解决方案列表” API获取。 |
| `priority_id` | String | 否 | 工单的优先级id，您可以在 “获取工单优先级列表” API获取。 |
| `customer_id` | String | 否 | 工单的客户id，您可以在 “获取产品客户列表” API获取。 |
| `properties` | Object | 否 | 工单的自定义属性。 |
| `properties.prop_a` | Object | 否 | 工单的自定义属性prop_a。 |
| `properties.prop_b` | Object | 否 | 工单的自定义属性prop_b。 |

#### Parameters Examples
**请求示例：**
```json
{
    "title": "希望新增支持第三方账号注册",
    "description": "<p>希望支持其他更多第三方平台的账号注册，以便用第三方账号登录找回更换了手机号的账号，保障账号安全</p>",
    "type_id": "63eca880a0a13a3efc8d49e0",
    "state_id": "63eca880a0a13a3efc8d49e0",
    "assignee_id": "a0417f68e846aae315c85d24643678a9",
    "submitter_id": "a0417f68e846aae315c85d24643678a9",
    "solution_id": "62f217ae16e3661a20124330",
    "priority_id": "5cb9466afda1ce4ca0090004",
    "customer_id": "63eca881a0a13a3efc8d49fc",
    "properties": {
        "prop_a": "prop_a_value",
        "prop_b": "prop_b_value"
    }
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "63eca888a0a13a3efc8d4a43",
    "url": "https://rest_api_root/v1/ship/tickets/63eca888a0a13a3efc8d4a43",
    "product": {
        "id": "6422711c3f12e6c1e46d40e9",
        "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9",
        "identifier": "SLC",
        "name": "示例产品",
        "is_archived": 0,
        "is_deleted": 0
    },
    "identifier": "SLC-T1",
    "title": "希望新增支持第三方账号注册",
    "short_id": "pdMUgQzZ",
    "html_url": "https://yctech.pingcode.com/ship/tickets/pdMUgQzZ",
    "assignee": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "state": {
        "id": "63eca880a0a13a3efc8d49d9",
        "url": "https://rest_api_root/v1/ship/ticket_states/63eca880a0a13a3efc8d49d9",
        "name": "待处理",
        "type": "pending"
    },
    "estimated_at": {
        "from": 1701619200,
        "to": 1702742399,
        "granularity": "day"
    },
    "type": {
        "id": "63eca880a0a13a3efc8d49e0",
        "url": "https://rest_api_root/v1/ship/ticket_types/63eca880a0a13a3efc8d49e0",
        "name": "需求"
    },
    "customer": {
        "id": "63eca881a0a13a3efc8d49fc",
        "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9/customers/63eca881a0a13a3efc8d49fc",
        "name": "北京XX科技有限公司"
    },
    "solution": {
        "id": "62f217ae16e3661a20124330",
        "url": "https://rest_api_root/v1/ship/ticket_solutions/62f217ae16e3661a20124330",
        "name": "进入需求池"
    },
    "priority": {
        "id": "5cb9466afda1ce4ca0090004",
        "url": "https://rest_api_root/v1/ship/ticket_priorities/5cb9466afda1ce4ca0090004",
        "name": "P1"
    },
    "channel": {
        "id": "64550d9ec696b249b5fc607d",
        "url": "https://rest_api_root/v1/ship/channels/64550d9ec696b249b5fc607d",
        "name": "channel-1"
    },
    "description": "<p>希望支持其他更多第三方平台的账号注册，以便用第三方账号登录找回更换了手机号的账号，保障账号安全</p>",
    "properties": {
        "prop_a": "prop_a_value",
        "prop_b": "prop_b_value"
    },
    "tags": [],
    "participants": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=ticket&principal_id=63eca888a0a13a3efc8d4a43",
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        },
        {
            "id": "63c8fb32729dee3334d96af7",
            "url": "https://rest_api_root/v1/participants/63c8fb32729dee3334d96af7?principal_type=ticket&principal_id=63eca888a0a13a3efc8d4a43",
            "type": "user_group",
            "user_group": {
                "id": "63c8fb32729dee3334d96af7",
                "url": "https://rest_api_root/v1/directory/groups/63c8fb32729dee3334d96af7",
                "name": "Open Team"
            }
        }
    ],
    "submitted_at": 1676454024,
    "submitted_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "completed_at": 1689579131,
    "completed_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "created_at": 1676454024,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1676455024,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_archived": 0,
    "is_deleted": 0
}
```

## 需求

### 创建一个需求

**接口:** `POST https://rest_api_root/v1/ship/ideas`

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 需求的产品id。 |
| `title` | String | 是 | 需求的标题，最大长度为255。 |
| `assignee_id` | String | 否 | 需求负责人的id。 |
| `description` | String | 否 | 需求的描述。 |
| `suite_id` | String | 否 | 需求的产品模块id。 |
| `properties` | Object | 否 | 需求属性的键值对集合。要注意的是，当前产品的需求属性视图需要包含这些需求属性，例如需求属性视图中包含prop_a和prop_b。 |
| `properties.prop_a` | Object | 否 | 需求项属性prop_a。 |
| `properties.prop_b` | Object | 否 | 需求项属性prop_b。 |

#### Parameters Examples
**请求示例：**
```json
{
    "product_id": "6422711c3f12e6c1e46d40e9",
    "title": "示例需求",
    "assignee_id": "a0417f68e846aae315c85d24643678a9",
    "description": "这是一段描述",
    "suite_id": "63bb744414bd13c9def24ce4",
    "properties": {
        "prop_a": "prop_a_value",
        "prop_b": "prop_b_value"
    }
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "64b4d70ba368e6594360ea24",
    "url": "https://rest_api_root/v1/ship/ideas/64b4d70ba368e6594360ea24",
    "product": {
        "id": "6422711c3f12e6c1e46d40e9",
        "url": "http://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9",
        "identifier": "SLC",
        "name": "示例产品",
        "is_archived": 0,
        "is_deleted": 0
    },
    "identifier": "SLC-1",
    "title": "示例需求",
    "short_id": "Ogf1EYey",
    "html_url": "https://yctech.pingcode.com/ship/ideas/Ogf1EYey"
    "assignee": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "state": {
        "id": "63e1bf51898a0be5a2d21b2a",
        "url": "https://rest_api_root/v1/ship/idea_states/63e1bf51898a0be5a2d21b2a",
        "name": "待评审",
        "type": "pending"
    },
    "priority": {
        "id": "5cb9466afda1ce4ca0090001",
        "url": "https://rest_api_root/v1/ship/idea_priorities/5cb9466afda1ce4ca0090001",
        "name": "P4"
    },
    "plan": null,
    "suite": {
        "id": "63bb744414bd13c9def24ce4",
        "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9/suites/63bb744414bd13c9def24ce4",
        "name": "需求模块",
        "type": "module"
     },
    "plan_at": null,
    "real_at": null,
    "score": 0,
    "progress": 0,
    "description": "这是一段描述",
    "properties": {
        "backlog_from": "5cb7e6e2fda1ce4ca0000001",
        "backlog_type": "5cb7e763fda1ce4ca0010002",
        "prop_a": "prop_a_value",
        "prop_b": "prop_b_value"
    },
    "participants": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=idea&principal_id=64b4d70ba368e6594360ea24",
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        }
    ],
    "completed_at": null,
    "completed_by": null,
    "created_at": 1689573131,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1689573131,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_archived": 0,
    "is_deleted": 0
}
```

### 获取需求优先级列表

**接口:** `GET https://rest_api_root/v1/ship/idea/priorities?product_id={product_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 产品的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "5cb9466afda1ce4ca0090005",
            "url": "https://rest_api_root/v1/ship/idea_priorities/5cb9466afda1ce4ca0090005",
            "name": "P0"
        }
    ]
}
```

### 获取需求列表

**接口:** `GET https://rest_api_root/v1/ship/ideas`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 否 | 产品的id。 |
| `state_id` | String | 否 | 需求状态id。 |
| `priority_id` | String | 否 | 需求优先级id。 |
| `created_between` | String | 否 | 创建时间介于的时间范围，通过','分割起始时间。 |
| `updated_between` | String | 否 | 更新时间介于的时间范围，通过','分割起始时间。 |
| `keywords` | String | 否 | 搜索关键字。支持需求编号和需求标题。 |
| `include_public_image_token` | String | 否 | 包含获取图片资源token的属性。使用','分割，最多只能20个，支持description和自定义多行文本类型的属性。参数示例description,properties.xxx。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "64b4d70ba368e6594360ea24",
            "url": "https://rest_api_root/v1/ship/ideas/64b4d70ba368e6594360ea24",
            "product": {
                "id": "6422711c3f12e6c1e46d40e9",
                "url": "http://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9",
                "identifier": "SLC",
                "name": "示例产品",
                "is_archived": 0,
                "is_deleted": 0
            },
            "identifier": "SLC-1",
            "title": "示例需求",
            "short_id": "Ogf1EYey",
            "html_url": "https://yctech.pingcode.com/ship/ideas/Ogf1EYey",
            "assignee": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "state": {
                "id": "63e1bf51898a0be5a2d21b2a",
                "url": "https://rest_api_root/v1/ship/idea_states/63e1bf51898a0be5a2d21b2a",
                "name": "待评审",
                "type": "pending"
            },
            "priority": {
                "id": "5cb9466afda1ce4ca0090005",
                "url": "https://rest_api_root/v1/ship/idea_priorities/5cb9466afda1ce4ca0090005",
                "name": "P0"
            },
            "plan": {
                "id": "63bb744414bd13c9def24ce4",
                "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9/plans/63bb744414bd13c9def24ce4",
                "name": "账号管理"
            },
            "suite": {
                "id": "63bb744414bd13c9def24ce4",
                "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9/suites/63bb744414bd13c9def24ce4",
                "name": "需求模块",
                "type": "module"
            },
            "plan_at": {
                "from": 1690732800,
                "to": 1691337599,
                "granularity": "day"
            },
            "real_at": {
                "from": 1690732800,
                "to": 1691337599,
                "granularity": "day"
            },
            "score": 0,
            "progress": 0.60,
            "description": "这是一段描述",
            "properties": {
                "backlog_from": "5cb7e6e2fda1ce4ca0000001",
                "backlog_type": "5cb7e763fda1ce4ca0010002"
            },
            "public_image_token": "-fkvANQ2dcVECK6Xg45L3kG8VCbOTK8NrNckGkxljQd",
            "participants": [
                {
                    "id": "a0417f68e846aae315c85d24643678a9",
                    "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=idea&principal_id=64b4d70ba368e6594360ea24",
                    "type": "user",
                    "user": {
                        "id": "a0417f68e846aae315c85d24643678a9",
                        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                        "name": "john",
                        "display_name": "John",
                        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
                    }
                },
                {
                    "id": "63c8fb32729dee3334d96af7",
                    "url": "https://rest_api_root/v1/participants/63c8fb32729dee3334d96af7?principal_type=idea&principal_id=64b4d70ba368e6594360ea24",
                    "type": "user_group",
                    "user_group": {
                        "id": "63c8fb32729dee3334d96af7",
                        "url": "https://rest_api_root/v1/directory/groups/63c8fb32729dee3334d96af7",
                        "name": "Open Team"
                    }
                }
            ],
           "completed_at": 1689573131,
           "completed_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "created_at": 1689573131,
            "created_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "updated_at": 1689579131,
            "updated_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "is_archived": 0,
            "is_deleted": 0
        }
    ]
}
```

### 获取需求属性列表

**接口:** `GET https://rest_api_root/v1/ship/idea/properties?product_id={product_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 产品的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 2,
    "values": [
        {
            "id": "backlog_type",
            "url": "https://rest_api_root/v1/ship/idea_properties/backlog_type",
            "name": "需求类型",
            "type": "select",
            "options": [
                {
                    "_id": "5cb7e763fda1ce4ca0010002",
                    "text": "功能需求"
                },
                {
                    "_id": "5cb7e763fda1ce4ca0010004",
                    "text": "体验优化"
                }
            ]
        },
        {
            "id": "identifier",
            "url": "https://rest_api_root/v1/ship/idea_properties/identifier",
            "name": "编号",
            "type": "text",
            "options": null
        }
    ]
}
```

### 获取需求排期列表

**接口:** `GET https://rest_api_root/v1/ship/idea/plans?product_id={product_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 产品的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "63bb744414bd13c9def24ce4",
            "url": "http://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e6/plans/63bb744414bd13c9def24ce4",
            "name": "账号管理"
        }
    ]
}
```

### 获取需求模块列表

**接口:** `GET https://rest_api_root/v1/ship/idea/suites?product_id={product_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 产品的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "63bb744414bd13c9def24ce4",
            "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9/suites/63bb744414bd13c9def24ce4",
            "name": "需求模块",
            "type": "module"
        }
    ]
}
```

### 获取需求流转记录列表

**接口:** `GET https://rest_api_root/v1/ship/ideas/{idea_id}/transition_histories`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `idea_id` | String | 是 | 需求的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 2,
    "values": [
        {
            "id": "64c3676c983bb9481ee1eea5",
            "url": "https://rest_api_root/v1/ship/ideas/64b4d70ba368e6594360ea24/transition_histories/64c3676c983bb9481ee1eea5",
            "idea": {
                "id": "64b4d70ba368e6594360ea24",
                "url": "https://rest_api_root/v1/ship/ideas/64b4d70ba368e6594360ea24",
                "identifier": "SLC-1",
                "title": "示例需求",
                "short_id": "Ogf1EYey",
                "html_url": "https://yctech.pingcode.com/ship/ideas/Ogf1EYey"
            },
            "from_state": null,
            "to_state": {
                "id": "63e1bf51898a0be5a2d21b29",
                "url": "https://rest_api_root/v1/ship/idea_states/63e1bf51898a0be5a2d21b29",
                "name": "待处理",
                "type": "pending"
            },
            "created_at": 1674528614,
            "created_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        },
        {
            "id": "658bdb79e5839f556562accf",
            "url": "https://rest_api_root/v1/ship/ideas/64b4d70ba368e6594360ea24/transition_histories/658bdb79e5839f556562accf",
            "idea": {
                "id": "64b4d70ba368e6594360ea24",
                "url": "https://rest_api_root/v1/ship/ideas/64b4d70ba368e6594360ea24",
                "identifier": "SLC-1",
                "title": "示例需求",
                "short_id": "Ogf1EYey",
                "html_url": "https://yctech.pingcode.com/ship/ideas/Ogf1EYey"
            },
            "from_state": {
                "id": "63e1bf51898a0be5a2d21b29",
                "url": "https://rest_api_root/v1/ship/idea_states/63e1bf51898a0be5a2d21b29",
                "name": "待处理",
                "type": "pending"
            },
            "to_state": {
                "id": "63e1bf51898a0be5a2d21b2b",
                "url": "https://rest_api_root/v1/ship/idea_states/63e1bf51898a0be5a2d21b2b",
                "name": "处理中",
                "type": "in_progress"
            },
            "created_at": 1674528614,
            "created_by": {
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

### 获取需求状态列表

**接口:** `GET https://rest_api_root/v1/ship/idea/states?product_id={product_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 产品的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "63e1bf51898a0be5a2d21b2a",
            "url": "https://rest_api_root/v1/ship/idea_states/63e1bf51898a0be5a2d21b2a",
            "name": "待评审",
            "type": "pending"
        }
    ]
}
```

### 部分更新一个需求

**接口:** `PATCH https://rest_api_root/v1/ship/ideas/{idea_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `idea_id` | String | 是 | 需求id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `title` | String | 否 | 需求的标题，最大长度为255。 |
| `description` | String | 否 | 需求的描述。 |
| `state_id` | String | 否 | 需求状态的id，您可以在 获取需求状态列表 API获取。 |
| `priority_id` | String | 否 | 需求优先级的id，您可以在 获取需求优先级列表 API获取。 |
| `assignee_id` | String | 否 | 需求负责人的id。 |
| `progress` | Number | 否 | 需求的进度，取值范围为：0到1的两位小数。 |
| `plan_at` | Object | 否 | 需求的计划时间。plan_at是整体更新的，其中包含from、to、granularity三个属性，均为必填。 |
| `plan_at.from` | Number | 是 | 需求的计划开始时间。为秒级时间戳。 |
| `plan_at.to` | Number | 是 | 需求的计划结束时间。为秒级时间戳。 |
| `plan_at.granularity` | String | 是 | 需求的计划时间周期单位。<br>可选值: `year`, `quarter`, `month`, `day` |
| `real_at` | Object | 否 | 需求的实际时间，参数格式同plan_at。 |
| `plan_id` | String | 否 | 产品排期的id，您可以在 获取产品排期列表 API获取。 |
| `suite_id` | String | 否 | 产品模块的id，您可以在 获取产品模块列表 API获取。 |
| `properties` | Object | 否 | 需求的自定义属性。 |
| `properties.prop_a` | Object | 否 | 需求的自定义属性prop_a。 |
| `properties.prop_b` | Object | 否 | 需求的自定义属性prop_b。 |

#### Parameters Examples
**请求示例：**
```json
{
    "title": "示例需求",
    "description": "这是一段描述",
    "state_id": "63e1bf51898a0be5a2d21b2a",
    "priority_id": "5cb9466afda1ce4ca0090005",
    "assignee_id": "a0417f68e846aae315c85d24643678a9",
    "progress": 0.88,
    "plan_at": {
        "from": 1690732800,
        "to": 1691337599,
        "granularity": "day"
    },
    "real_at": {
        "from": 1690732800,
        "to": 1691337599,
        "granularity": "day"
    },
    "plan_id": "63bb744414bd13c9def24ce4",
    "suite_id": "63bb744414bd13c9def24ce4",
    "properties": {
        "prop_a": "prop_a_value",
        "prop_b": "prop_b_value"
    }
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "64b4d70ba368e6594360ea24",
    "url": "https://rest_api_root/v1/ship/ideas/64b4d70ba368e6594360ea24",
    "product": {
        "id": "6422711c3f12e6c1e46d40e9",
        "url": "http://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9",
        "identifier": "SLC",
        "name": "示例产品",
        "is_archived": 0,
        "is_deleted": 0
    },
    "identifier": "SLC-1",
    "title": "示例需求",
    "short_id": "Ogf1EYey",
    "html_url": "https://yctech.pingcode.com/ship/ideas/Ogf1EYey",
    "assignee": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "state": {
        "id": "63e1bf51898a0be5a2d21b2a",
        "url": "https://rest_api_root/v1/ship/idea_states/63e1bf51898a0be5a2d21b2a",
        "name": "待评审",
        "type": "pending"
    },
    "priority": {
        "id": "5cb9466afda1ce4ca0090005",
        "url": "https://rest_api_root/v1/ship/idea_priorities/5cb9466afda1ce4ca0090005",
        "name": "P0"
    },
    "plan": {
        "id": "63bb744414bd13c9def24ce4",
        "url": "http://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9/plans/63bb744414bd13c9def24ce4",
        "name": "账号管理"
    },
    "suite": {
        "id": "63bb744414bd13c9def24ce4",
        "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9/suites/63bb744414bd13c9def24ce4",
        "name": "需求模块",
        "type": "module"
     },
    "plan_at": {
        "from": 1690732800,
        "to": 1691337599,
        "granularity": "day"
    },
    "real_at": {
        "from": 1690732800,
        "to": 1691337599,
        "granularity": "day"
    },
    "score": 0,
    "progress": 0.88,
    "description": "这是一段描述",
    "properties": {
        "backlog_from": "5cb7e6e2fda1ce4ca0000001",
        "backlog_type": "5cb7e763fda1ce4ca0010002",
        "prop_a": "prop_a_value",
        "prop_b": "prop_b_value"
    },
    "participants": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=idea&principal_id=64b4d70ba368e6594360ea24",
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        }
    ],
    "completed_at": 1689578888,
    "completed_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "created_at": 1689573131,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1689578888,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_archived": 0,
    "is_deleted": 0
}
```

## 产品配置中心

### 工单配置

**接口:** ` 工单配置`

用于查看和管理工单相关的配置信息。

### 需求配置

**接口:** ` 需求配置`

用于查看和管理需求相关的配置信息。

## 工单配置

### 创建一个工单属性

**接口:** `POST https://rest_api_root/v1/ship/ticket_properties`

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 工单属性的名称。在一个企业中这个名称是唯一的。 |
| `type` | String | 是 | 工单属性的类型。<br>可选值: `text`, `textarea`, `select`, `multi_select`, `cascade_select`, `cascade_multi_select`, `member`, `members`, `date`, `number`, `progress`, `rate`, `link` |
| `options` | Object[] | 否 | 选择项列表。当工单属性类型为select,multi_select,cascade_select,cascade_multi_select时可选填此项。 |
| `options._id` | String | 否 | 选择项id。该值在选择项中是唯一的。 |
| `options.text` | String | 是 | 选择项内容。该值在选择项中是唯一的。 |
| `options.parent_id` | String | 否 | 选择项父级id。当属性类型为cascade_select,cascade_multi_select时，parent_id参数有效，用于构建级联类型选择项之间的父子关系，最多存在4级。 |

#### Parameters Examples
**请求示例（select）：**
```json
{
    "name": "严重程度",
    "type": "select",
    "options": [
        {
            "text": "严重"
        },
        {
            "text": "一般"
        }
    ]
}
```

**请求示例（cascade_select）：**
```json
{
    "name": "级联单选",
    "type": "cascade_select",
    "options": [
        {
            "_id": "64b9f741eec7fd94e63b411e",
            "text": "父"
        },
        {
            "text": "子",
            "parent_id": "64b9f741eec7fd94e63b411e"
        }
    ]
}
```

#### Success Examples
**响应示例（select）：**
```json
{
    "id": "severity",
    "url": "https://rest_api_root/v1/ship/ticket_properties/severity",
    "name": "严重程度",
    "type": "select",
    "options": [
        {
            "_id": "5efb1859110533727a82c603",
            "text": "严重"
        },
        {
            "_id": "5efb1859110533727a82c604",
            "text": "一般"
        }
    ],
    "is_removable": true,
    "is_name_editable": true,
    "is_options_editable": true,
    "select_all_level": false,
    "display_all_level": false,
    "display_separator": null
}
```

**响应示例（cascade_select）：**
```json
{
    "id": "jiliandanxuan",
    "url": "https://rest_api_root/v1/ship/ticket_properties/jiliandanxuan",
    "name": "级联单选",
    "type": "cascade_select",
    "options": [
        {
            "_id": "64b9f741eec7fd94e63b411e",
            "text": "父"
        },
        {
            "_id": "64b9f741eec7fd94e63b411f",
            "text": "子",
            "parent_id": "64b9f741eec7fd94e63b411e"
        }
    ],
    "is_removable": true,
    "is_name_editable": true,
    "is_options_editable": true,
    "select_all_level": false,
    "display_all_level": false,
    "display_separator": "/"
}
```

### 创建一个工单状态

**接口:** `POST https://rest_api_root/v1/ship/ticket_states`

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 工单状态的名称，在一个企业中这个名称是唯一的。 |
| `type` | String | 是 | 工单状态的类型。<br>可选值: `pending`, `in_progress`, `completed`, `closed` |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "处理中",
    "type": "pending"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "6422711c3f12e6c1e46d40f2",
    "url": "https://rest_api_root/v1/ship/ticket_states/6422711c3f12e6c1e46d40f2",
    "name": "处理中",
    "type": "pending",
    "color": "#56ABFB"
}
```

### 向工单属性方案中添加一个工单属性

**接口:** `POST https://rest_api_root/v1/ship/ticket_property_plans/{property_plan_id}/ticket_properties`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `property_plan_id` | String | 是 | 工单属性方案的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `property_id` | String | 是 | 工单属性的id。 |

#### Parameters Examples
**请求示例：**
```json
{
    "property_id": "solution"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "solution",
    "url": "https://rest_api_root/v1/ship/ticket_property_plans/5f8a21f18ef715265de90c21/ticket_properties/solution",
    "property_plan": {
        "id": "5f8a21f18ef715265de90c21",
        "url": "https://rest_api_root/v1/ship/ticket_property_plans/5f8a21f18ef715265de90c21"
    },
    "property": {
        "id": "solution",
        "url": "https://rest_api_root/v1/ship/ticket_properties/solution",
        "name": "解决方案",
        "type": "select"
    }
}
```

### 向状态方案中添加一个工单状态

**接口:** `POST https://rest_api_root/v1/ship/ticket_state_plans/{state_plan_id}/ticket_states`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `state_plan_id` | String | 是 | 工单状态方案的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `state_id` | String | 是 | 工单状态的id。 |

#### Parameters Examples
**请求示例：**
```json
{
    "state_id": "63bb744214bd13c9def24ca2"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "63bb744214bd13c9def24ca2",
    "url": "https://rest_api_root/v1/ship/ticket_state_plans/63feb3da9cc1ead1d2be93f4/ticket_states/63bb744214bd13c9def24ca2",
    "state_plan": {
        "id": "63feb3da9cc1ead1d2be93f4",
        "url": "https://rest_api_root/v1/ship/ticket_state_plans/63feb3da9cc1ead1d2be93f4"
    },
    "state": {
        "id": "63bb744214bd13c9def24ca2",
        "url": "https://rest_api_root/v1/ship/ticket_states/63bb744214bd13c9def24ca2",
        "name": "待处理",
        "type": "pending"
    }
}
```

### 向状态方案中添加一个工单状态流转

**接口:** `POST https://rest_api_root/v1/ship/ticket_state_plans/{state_plan_id}/ticket_state_flows`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `state_plan_id` | String | 是 | 工单状态方案的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `from_state_id` | String | 是 | 起始工单状态的id。 |
| `to_state_id` | String | 是 | 可更改为的工单状态的id。 |

#### Parameters Examples
**请求示例：**
```json
{
   "from_state_id": "63bb744214bd13c9def24ca5",
   "to_state_id": "63bb744214bd13c9def24ca2"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "63feb3da9cc1ead1d2be93fd",
    "url": "https://rest_api_root/v1/ship/ticket_state_plans/63feb3da9cc1ead1d2be93f4/ticket_state_flows/63feb3da9cc1ead1d2be93fd",
    "state_plan": {
        "id": "63feb3da9cc1ead1d2be93f4",
        "url": "https://rest_api_root/v1/ship/ticket_state_plans/63feb3da9cc1ead1d2be93f4"
    },
    "form_state": {
        "id": "63bb744214bd13c9def24ca5",
        "url": "https://rest_api_root/v1/ship/ticket_states/63bb744214bd13c9def24ca5",
        "name": "已计划",
        "type": "in_progress"
    },
    "to_state": {
        "id": "63bb744214bd13c9def24ca2",
        "url": "https://rest_api_root/v1/ship/ticket_states/63bb744214bd13c9def24ca2",
        "name": "待处理",
        "type": "pending"
    }
}
```

### 在工单属性方案中移除一个工单属性

**接口:** `DELETE https://rest_api_root/v1/ship/ticket_property_plans/{property_plan_id}/ticket_properties/{property_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `property_plan_id` | String | 是 | 工单属性方案的id。 |
| `property_id` | String | 是 | 工单属性的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "solution",
    "url": "https://rest_api_root/v1/ship/ticket_property_plans/5f8a21f18ef715265de90c21/ticket_properties/solution",
    "property_plan": {
        "id": "5f8a21f18ef715265de90c21",
        "url": "https://rest_api_root/v1/ship/ticket_property_plans/5f8a21f18ef715265de90c21"
    },
    "property": {
        "id": "solution",
        "url": "https://rest_api_root/v1/ship/ticket_properties/solution",
        "name": "解决方案",
        "type": "select"
    }
}
```

### 在状态方案中移除一个工单状态

**接口:** `DELETE https://rest_api_root/v1/ship/ticket_state_plans/{state_plan_id}/ticket_states/{state_id}`

移除状态后，每种类型的状态至少存在一种，否则将无法移除。

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `state_plan_id` | String | 是 | 工单状态方案的id。 |
| `state_id` | String | 是 | 工单状态的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "63bb744214bd13c9def24ca2",
    "url": "https://rest_api_root/v1/ship/ticket_state_plans/63feb3da9cc1ead1d2be93f4/ticket_states/63bb744214bd13c9def24ca2",
    "state_plan": {
        "id": "63feb3da9cc1ead1d2be93f4",
        "url": "https://rest_api_root/v1/ship/ticket_state_plans/63feb3da9cc1ead1d2be93f4"
    },
    "state": {
        "id": "63bb744214bd13c9def24ca2",
        "url": "https://rest_api_root/v1/ship/ticket_states/63bb744214bd13c9def24ca2",
        "name": "待处理",
        "type": "pending"
    }
}
```

### 在状态方案中移除一个工单状态流转

**接口:** `DELETE https://rest_api_root/v1/ship/ticket_state_plans/{state_plan_id}/ticket_state_flows/{state_flow_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `state_plan_id` | String | 是 | 工单状态方案的id。 |
| `state_flow_id` | String | 是 | 工单状态流转的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "63feb3da9cc1ead1d2be93fd",
    "url": "https://rest_api_root/v1/ship/ticket_state_plans/63feb3da9cc1ead1d2be93f4/ticket_state_flows/63feb3da9cc1ead1d2be93fd",
    "state_plan": {
        "id": "63feb3da9cc1ead1d2be93f4",
        "url": "https://rest_api_root/v1/ship/ticket_state_plans/63feb3da9cc1ead1d2be93f4"
    },
    "form_state": {
        "id": "63bb744214bd13c9def24ca5",
        "url": "https://rest_api_root/v1/ship/ticket_states/63bb744214bd13c9def24ca5",
        "name": "已计划",
        "type": "in_progress"
    },
    "to_state": {
        "id": "63bb744214bd13c9def24ca2",
        "url": "https://rest_api_root/v1/ship/ticket_states/63bb744214bd13c9def24ca2",
        "name": "待处理",
        "type": "pending"
    }
}
```

### 获取全部工单属性列表

**接口:** `GET https://rest_api_root/v1/ship/ticket_properties`

**权限:** 企业令牌/用户令牌

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 2,
    "values": [
        {
            "id": "solution",
            "url": "https://rest_api_root/v1/ship/ticket_properties/solution",
            "name": "解决方案",
            "type": "select",
            "options": [
                {
                    "_id": "6422711c3f12e6c1e46d40e9",
                    "text": "进入需求池"
                }
            ],
            "is_removable": false,
            "is_name_editable": false,
            "is_options_editable": false
        },
        {
            "id": "identifier",
            "url": "https://rest_api_root/v1/ship/ticket_properties/identifier",
            "name": "编号",
            "type": "text",
            "options": null,
            "is_removable": false,
            "is_name_editable": false,
            "is_options_editable": false
        }
    ]
}
```

### 获取全部工单状态列表

**接口:** `GET https://rest_api_root/v1/ship/ticket_states`

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
            "id": "6422711c3f12e6c1e46d40f2",
            "url": "https://rest_api_root/v1/ship/ticket_states/6422711c3f12e6c1e46d40f2",
            "name": "处理中",
            "type": "pending",
            "color": "#F6C659"
        }
    ]
}
```

### 获取全部工单类型列表

**接口:** `GET https://rest_api_root/v1/ship/ticket_types`

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
            "id": "63bb744214bd13c9def24ca9",
            "url": "https://rest_api_root/v1/ship/ticket_types/63bb744214bd13c9def24ca9",
            "name": "需求",
            "is_system": true
        }
    ]
}
```

### 获取工单属性方案中的工单属性列表

**接口:** `GET https://rest_api_root/v1/ship/ticket_property_plans/{property_plan_id}/ticket_properties`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `property_plan_id` | String | 是 | 工单属性方案的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "solution",
            "url": "https://rest_api_root/v1/ship/ticket_property_plans/5f8a21f18ef715265de90c21/ticket_properties/solution",
            "property_plan": {
                "id": "5f8a21f18ef715265de90c21",
                "url": "https://rest_api_root/v1/ship/ticket_property_plans/5f8a21f18ef715265de90c21"
            },
            "property": {
                "id": "solution",
                "url": "https://rest_api_root/v1/ship/ticket_properties/solution",
                "name": "解决方案",
                "type": "select"
            }
        }
    ]
}
```

### 获取工单属性方案列表

**接口:** `GET https://rest_api_root/v1/ship/ticket_property_plans`

**权限:** 企业令牌/用户令牌

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 2,
    "values": [
        {
            "id": "5f8a21f18ef715265de90c21",
            "url": "https://rest_api_root/v1/ship/ticket_property_plans/5f8a21f18ef715265de90c21",
            "product": null
        },
        {
            "id": "5f8a21f18ef715265de90c22",
            "url": "https://rest_api_root/v1/ship/ticket_property_plans/5f8a21f18ef715265de90c22",
            "product": {
                 "id": "6422711c3f12e6c1e46d40e9",
                 "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9",
                 "identifier": "SLC",
                 "name": "示例产品",
                 "is_archived": 0,
                 "is_deleted": 0
            }
        }
    ]
}
```

### 获取工单状态方案列表

**接口:** `GET https://rest_api_root/v1/ship/ticket_state_plans`

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
            "id": "63feb3da9cc1ead1d2be93f4",
            "url": "https://rest_api_root/v1/ship/ticket_state_plans/63feb3da9cc1ead1d2be93f4",
            "product": null
        },
        {
            "id": "63feb3da9cc1ead1d2be93f5",
            "url": "https://rest_api_root/v1/ship/ticket_state_plans/63feb3da9cc1ead1d2be93f5",
            "product": {
                 "id": "6422711c3f12e6c1e46d40e9",
                 "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9",
                 "identifier": "SLC",
                 "name": "示例产品",
                 "is_archived": 0,
                 "is_deleted": 0
            }
        }
    ]
}
```

### 获取状态方案中的工单状态列表

**接口:** `GET https://rest_api_root/v1/ship/ticket_state_plans/{state_plan_id}/ticket_states`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `state_plan_id` | String | 是 | 工单状态方案的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "63bb744214bd13c9def24ca2",
            "url": "https://rest_api_root/v1/ship/ticket_state_plans/63feb3da9cc1ead1d2be93f4/ticket_states/63bb744214bd13c9def24ca2",
            "state_plan": {
                "id": "63feb3da9cc1ead1d2be93f4",
                "url": "https://rest_api_root/v1/ship/ticket_state_plans/63feb3da9cc1ead1d2be93f4"
            },
            "state": {
                "id": "63bb744214bd13c9def24ca2",
                "url": "https://rest_api_root/v1/ship/ticket_states/63bb744214bd13c9def24ca2",
                "name": "待处理",
                "type": "pending"
            }
        }
    ]
}
```

### 获取状态方案中的工单状态流转列表

**接口:** `GET https://rest_api_root/v1/ship/ticket_state_plans/{state_plan_id}/ticket_state_flows`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `state_plan_id` | String | 是 | 工单状态方案的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "63feb3da9cc1ead1d2be93f5",
            "url": "https://rest_api_root/v1/ship/ticket_state_plans/63feb3da9cc1ead1d2be93f4/ticket_states/63feb3da9cc1ead1d2be93f5",
            "state_plan": {
                "id": "63feb3da9cc1ead1d2be93f4",
                "url": "https://rest_api_root/v1/ship/ticket_state_plans/63feb3da9cc1ead1d2be93f4"
            },
            "form_state": {
                "id": "63bb744214bd13c9def24ca2",
                "url": "https://rest_api_root/v1/ship/ticket_states/63bb744214bd13c9def24ca2",
                "name": "待处理",
                "type": "pending"
            },
            "to_state": {
                "id": "63bb744214bd13c9def24ca4",
                "url": "https://rest_api_root/v1/ship/ticket_states/63bb744214bd13c9def24ca4",
                "name": "处理中",
                "type": "in_progress"
            }
        }
    ]
}
```

### 部分更新一个工单属性

**接口:** `PATCH https://rest_api_root/v1/ship/ticket_properties/{property_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `property_id` | String | 是 | 工单属性的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 工单属性的名称。在一个企业中这个名称是唯一的。 |
| `options` | Object[] | 否 | 选择项列表。options是整体更新的。 |
| `options._id` | String | 否 | 选择项id。该值在选择项中是唯一的。 |
| `options.text` | String | 是 | 选择项内容。该值在选择项中是唯一的。 |
| `options.parent_id` | String | 否 | 选择项父级id。当属性类型为cascade_select,cascade_multi_select时，parent_id参数有效，用于构建级联类型选择项之间的父子关系，最多存在4级。 |

#### Parameters Examples
**请求示例（select）：**
```json
{
    "name": "严重程度-update",
    "options": [
        {
            "id": "5efb1859110533727a82c603",
            "text": "严重-update"
        },
        {
            "text": "一般"
        }
    ]
}
```

**请求示例（cascade_select）：**
```json
{
    "name": "级联单选-update",
    "options": [
        {
            "_id": "64b9f741eec7fd94e63b411e",
            "text": "父-update"
        },
        {
            "_id": "64b9f741eec7fd94e63b411f",
            "text": "子",
            "parent_id": "64b9f741eec7fd94e63b411e"
        }
    ]
}
```

#### Success Examples
**响应示例（select）：**
```json
{
    "id": "severity-update",
    "url": "https://rest_api_root/v1/ship/ticket_properties/severity",
    "name": "严重程度-update",
    "type": "select",
    "options": [
        {
            "_id": "5efb1859110533727a82c603",
            "text": "严重-update"
        },
        {
            "_id": "5efb1859110533727a82c624",
            "text": "一般"
        }
    ],
    "is_removable": true,
    "is_name_editable": true,
    "is_options_editable": true,
    "select_all_level": false,
    "display_all_level": false,
    "display_separator": null
}
```

**响应示例（cascade_select）：**
```json
{
    "id": "jiliandanxuan",
    "url": "https://rest_api_root/v1/ship/ticket_properties/jiliandanxuan",
    "name": "级联单选-update",
    "type": "cascade_select",
    "options": [
        {
            "_id": "64b9f741eec7fd94e63b411e",
            "text": "父-update"
        },
        {
            "_id": "64b9f741eec7fd94e63b411f",
            "text": "子",
            "parent_id": "64b9f741eec7fd94e63b411e"
        }
    ],
    "is_removable": true,
    "is_name_editable": true,
    "is_options_editable": true,
    "select_all_level": false,
    "display_all_level": false,
    "display_separator": "/"
}
```

### 部分更新一个工单状态

**接口:** `Patch https://rest_api_root/v1/ship/ticket_states/{ticket_state_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `ticket_state_id` | String | 是 | 工单状态id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 工单状态的名称，在一个企业中这个名称是唯一的。 |
| `type` | String | 否 | 工单状态的类型。<br>可选值: `pending`, `in_progress`, `completed`, `closed` |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "已完成",
    "type": "completed"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "6422711c3f12e6c1e46d40f2",
    "url": "https://rest_api_root/v1/ship/ticket_states/6422711c3f12e6c1e46d40f2",
    "name": "已完成",
    "type": "completed",
    "color": "#56AB25"
}
```

## 需求配置

### 创建一个需求属性

**接口:** `POST https://rest_api_root/v1/ship/idea_properties`

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 需求属性的名称。在一个企业中这个名称是唯一的。 |
| `type` | String | 是 | 需求属性的类型。<br>可选值: `text`, `textarea`, `select`, `multi_select`, `cascade_select`, `cascade_multi_select`, `member`, `members`, `date`, `number`, `progress`, `rate`, `link` |
| `options` | Object[] | 否 | 选择项列表。当需求属性类型为select,multi_select,cascade_select,cascade_multi_select时可选填此项。 |
| `options._id` | String | 否 | 选择项id。该值在选择项中是唯一的。 |
| `options.text` | String | 是 | 选择项内容。该值在选择项中是唯一的。 |
| `options.parent_id` | String | 否 | 选择项父级id。当属性类型为cascade_select,cascade_multi_select时，parent_id参数有效，用于构建级联类型选择项之间的父子关系，最多存在4级。 |

#### Parameters Examples
**请求示例（select）：**
```json
{
    "name": "严重程度",
    "type": "select",
    "options": [
        {
           "_id": "5efb1859110533727a82c603",
            "text": "严重"
        },
        {
            "text": "一般"
        }
    ]
}
```

**请求示例（cascade_select）：**
```json
{
    "name": "级联单选",
    "type": "cascade_select",
    "options": [
        {
            "_id": "64b9f741eec7fd94e63b411e",
            "text": "父"
        },
        {
            "_id": "64b9f741eec7fd94e63b411f",
            "text": "子",
            "parent_id": "64b9f741eec7fd94e63b411e"
        }
    ]
}
```

#### Success Examples
**响应示例（select）：**
```json
{
    "id": "severity",
    "url": "https://rest_api_root/v1/ship/idea_properties/severity",
    "name": "严重程度",
    "type": "select",
    "options": [
        {
            "_id": "5efb1859110533727a82c603",
            "text": "严重"
        },
        {
            "_id": "5efb1859110533727a82c604",
            "text": "一般"
        }
    ],
    "is_removable": true,
    "is_name_editable": true,
    "is_options_editable": true,
    "select_all_level": false,
    "display_all_level": false,
    "display_separator": null
}
```

**响应示例（cascade_select）：**
```json
{
    "id": "jiliandanxuan",
    "url": "https://rest_api_root/v1/ship/idea_properties/jiliandanxuan",
    "name": "级联单选",
    "type": "cascade_select",
    "options": [
        {
            "_id": "64b9f741eec7fd94e63b411e",
            "text": "父"
        },
        {
            "_id": "64b9f741eec7fd94e63b411f",
            "text": "子",
            "parent_id": "64b9f741eec7fd94e63b411e"
        }
    ],
    "is_removable": true,
    "is_name_editable": true,
    "is_options_editable": true,
    "select_all_level": false,
    "display_all_level": false,
    "display_separator": "/"
}
```

### 向需求属性方案中添加一个需求属性

**接口:** `POST https://rest_api_root/v1/ship/idea_property_plans/{property_plan_id}/idea_properties`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `property_plan_id` | String | 是 | 需求属性方案的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `property_id` | String | 是 | 需求属性的id。 |

#### Parameters Examples
**请求示例：**
```json
{
    "property_id": "solution"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "solution",
    "url": "https://rest_api_root/v1/ship/idea_property_plans/5d7a21f19ef715269ae90c50/idea_properties/solution",
    "property_plan": {
        "id": "5d7a21f19ef715269ae90c50",
        "url": "https://rest_api_root/v1/ship/idea_property_plans/5d7a21f19ef715269ae90c50"
    },
    "property": {
        "id": "solution",
        "url": "https://rest_api_root/v1/ship/idea_properties/solution",
        "name": "解决方案",
        "type": "select"
    }
}
```

### 在需求属性方案中移除一个需求属性

**接口:** `DELETE https://rest_api_root/v1/ship/idea_property_plans/{property_plan_id}/idea_properties/{property_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `property_plan_id` | String | 是 | 需求属性方案的id。 |
| `property_id` | String | 是 | 需求属性的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "solution",
    "url": "https://rest_api_root/v1/ship/idea_property_plans/5d7a21f19ef715269ae90c50/idea_properties/solution",
    "property_plan": {
        "id": "5d7a21f19ef715269ae90c50",
        "url": "https://rest_api_root/v1/ship/idea_property_plans/5d7a21f19ef715269ae90c50"
    },
    "property": {
        "id": "solution",
        "url": "https://rest_api_root/v1/ship/idea_properties/solution",
        "name": "解决方案",
        "type": "select"
    }
}
```

### 获取全部需求属性列表

**接口:** `GET https://rest_api_root/v1/ship/idea_properties`

**权限:** 企业令牌/用户令牌

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 2,
    "values": [
        {
            "id": "backlog_type",
            "url": "https://rest_api_root/v1/ship/idea_properties/backlog_type",
            "name": "需求类型",
            "type": "select",
            "options": [
                {
                    "_id": "5cb7e763fda1ce4ca0010002",
                    "text": "功能需求"
                },
                {
                    "_id": "5cb7e763fda1ce4ca0010004",
                    "text": "体验优化"
                }
            ],
            "is_removable": false,
            "is_name_editable": false,
            "is_options_editable": false
        },
        {
            "id": "identifier",
            "url": "https://rest_api_root/v1/ship/idea_properties/identifier",
            "name": "编号",
            "type": "text",
            "options": null,
            "is_removable": false,
            "is_name_editable": false,
            "is_options_editable": false
        }
    ]
}
```

### 获取全部需求状态列表

**接口:** `GET https://rest_api_root/v1/ship/idea_states`

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
            "id": "63e1bf51898a0be5a2d21b2a",
            "url": "https://rest_api_root/v1/ship/idea_states/63e1bf51898a0be5a2d21b2a",
            "name": "待评审",
            "type": "pending",
            "color": "#56ABFB"
        }
    ]
}
```

### 获取需求属性方案中的需求属性列表

**接口:** `GET https://rest_api_root/v1/ship/idea_property_plans/{property_plan_id}/idea_properties`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `property_plan_id` | String | 是 | 需求属性方案的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "solution",
            "url": "https://rest_api_root/v1/ship/idea_property_plans/5d7a21f19ef715269ae90c50/idea_properties/solution",
            "property_plan": {
                "id": "5d7a21f19ef715269ae90c50",
                "url": "https://rest_api_root/v1/ship/idea_property_plans/5d7a21f19ef715269ae90c50"
            },
            "property": {
                "id": "solution",
                "url": "https://rest_api_root/v1/ship/idea_properties/solution",
                "name": "解决方案",
                "type": "select"
            }
        }
    ]
}
```

### 获取需求属性方案列表

**接口:** `GET https://rest_api_root/v1/ship/idea_property_plans`

**权限:** 企业令牌/用户令牌

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 2,
    "values": [
        {
            "id": "5d7a21f19ef715269ae90c50",
            "url": "https://rest_api_root/v1/ship/idea_property_plans/5d7a21f19ef715269ae90c50",
            "product": null
        },
        {
            "id": "5f8a21f18ef715265de90c22",
            "url": "https://rest_api_root/v1/ship/idea_property_plans/5f8a21f18ef715265de90c22",
            "product": {
                 "id": "6422711c3f12e6c1e46d40e9",
                 "url": "https://rest_api_root/v1/ship/products/6422711c3f12e6c1e46d40e9",
                 "identifier": "SLC",
                 "name": "示例产品",
                 "is_archived": 0,
                 "is_deleted": 0
            }
        }
    ]
}
```

### 部分更新一个需求属性

**接口:** `PATCH https://rest_api_root/v1/ship/idea_properties/{property_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `property_id` | String | 是 | 需求属性的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 需求属性的名称。在一个企业中这个名称是唯一的。 |
| `options` | Object[] | 否 | 选择项列表。options是整体更新的。 |
| `options._id` | String | 否 | 选择项id。该值在选择项中是唯一的。 |
| `options.text` | String | 是 | 选择项内容。该值在选择项中是唯一的。 |
| `options.parent_id` | String | 否 | 选择项父级id。当属性类型为cascade_select,cascade_multi_select时，parent_id参数有效，用于构建级联类型选择项之间的父子关系，最多存在4级。 |

#### Parameters Examples
**请求示例（select）：**
```json
{
    "name": "严重程度-update",
    "options": [
        {
            "id": "5efb1859110533727a82c603",
            "text": "严重-update"
        },
        {
            "text": "一般"
        }
    ]
}
```

**请求示例（cascade_select）：**
```json
{
    "name": "级联单选-update",
    "options": [
        {
            "_id": "64b9f741eec7fd94e63b411e",
            "text": "父-update"
        },
        {
            "_id": "64b9f741eec7fd94e63b411f",
            "text": "子-update",
            "parent_id": "64b9f741eec7fd94e63b411e"
        }
    ]
}
```

#### Success Examples
**响应示例（select）：**
```json
{
    "id": "severity-update",
    "url": "https://rest_api_root/v1/ship/idea_properties/severity",
    "name": "严重程度-update",
    "type": "select",
    "options": [
        {
            "_id": "64b9f741eec7fd94e63b411e",
            "text": "父"
        },
        {
            "_id": "64b9f741eec7fd94e63b411f",
            "text": "子"
        }
    ],
    "is_removable": true,
    "is_name_editable": true,
    "is_options_editable": true,
    "select_all_level": false,
    "display_all_level": false,
    "display_separator": null
}
```

**响应示例（cascade_select）：**
```json
{
    "id": "jiliandanxuan",
    "url": "https://rest_api_root/v1/ship/idea_properties/jiliandanxuan",
    "name": "级联单选-update",
    "type": "cascade_select",
    "options": [
        {
            "_id": "64b9f741eec7fd94e63b411e",
            "text": "父-update"
        },
        {
            "_id": "64b9f741eec7fd94e63b411f",
            "text": "子-update",
            "parent_id": "64b9f741eec7fd94e63b411e"
        }
    ],
    "is_removable": true,
    "is_name_editable": true,
    "is_options_editable": true,
    "select_all_level": false,
    "display_all_level": false,
    "display_separator": "/"
}
```

## 项目管理

### Kanban

**接口:** ` Kanban`

用于查看和管理看板相关信息。

### Scrum

**接口:** ` Scrum`

用于查看和管理迭代相关信息。

### 发布

**接口:** ` 发布`

用于查看和管理发布相关信息。
 资源地址：{GET} https://rest_api_root/v1/project/projects/{project_id}/versions/{version_id}

#### Success
**资源属性**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 发布的id。 |
| `url` | String | 是 | 发布的url。 |
| `project` | Object | 是 | 发布所属的项目。 |
| `name` | String | 是 | 发布的名称。 |
| `start_at` | Number | 是 | 发布的开始时间。 |
| `end_at` | Number | 是 | 发布的结束时间。 |
| `stage` | Object | 是 | 发布的当前阶段。 |
| `assignee` | Object | 是 | 发布的负责人。 |
| `stages` | Object[] | 是 | 发布的阶段列表。 |
| `progress` | Number | 是 | 发布的进度。 |
| `changelog` | String | 是 | 发布的发布日志。 |
| `operate_at` | Number | 是 | 发布的最后操作时间。 |
| `categories` | Object[] | 是 | 发布的类别列表。 |
| `created_at` | Number | 是 | 发布的创建时间。 |
| `created_by` | Object | 是 | 发布的创建人。 |
| `updated_at` | Number | 是 | 发布的更新时间。 |
| `updated_by` | Object | 是 | 发布的更新人。 |

#### Success Examples
**全量数据示例：**
```json
{
    "id": "5eb623f6a70571487ea47001",
    "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/versions/5eb623f6a70571487ea47001",
    "project": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
        "identifier": "SCR",
        "type": "scrum",
        "name": "Scrum项目",
        "is_archived": 0,
        "is_deleted": 0
    },
    "name": "1.0.0",
    "start_at": 1565193600,
    "end_at": 1566403200,
    "stage": {
        "id": "5f44a8f8bb347b14b49624a1",
        "url": "https://rest_api_root/v1/project/stages/5f44a8f8bb347b14b49624a1",
        "name": "未开始",
        "type": "pending",
        "color": "#FA8888"
    },
    "assignee": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "stages": [
        {
            "id": "5f44a8f8bb347b14b49624a1",
            "url": "https://rest_api_root/v1/project/stages/5f44a8f8bb347b14b49624a1",
            "name": "未开始",
            "operate_at": 1565366400
        },
        {
            "id": "5f44a8f8bb347b14b49624a2",
            "url": "https://rest_api_root/v1/project/stages/5f44a8f8bb347b14b49624a2",
            "name": "进行中",
            "operate_at": null
        },
        {
            "id": "5f44a8f8bb347b14b49624a3",
            "url": "https://rest_api_root/v1/project/stages/5f44a8f8bb347b14b49624a3",
            "name": "已发布",
            "operate_at": null
        }
    ],
    "progress": 0,
    "changelog": "发布日志",
    "operate_at": 1565366400,
    "categories": [
        {
            "id": "676a460a0fd987b7ea320889",
            "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/version_categories/676a460a0fd987b7ea320889",
            "name": "私有部署发布"
        }
    ],
    "created_at": 1565366200,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1565366200,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    }
}
```

**引用数据示例：**
```json
{
    "id": "5eb623f6a70571487ea47001",
    "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/versions/5eb623f6a70571487ea47001",
    "name": "1.0.0",
    "start_at": 1565193600,
    "end_at": 1566403200,
    "stage": {
        "id": "5f44a8f8bb347b14b49624a1",
        "url": "https://rest_api_root/v1/project/stages/5f44a8f8bb347b14b49624a1",
        "name": "未开始",
        "type": "pending",
        "color": "#FA8888"
    }
}
```

### 工作项

**接口:** ` 工作项`

用于查看和管理工作项相关信息。
 资源地址：{GET} https://rest_api_root/v1/project/work_items/{work_item_id}

#### Success
**资源属性**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 工作项的id。 |
| `url` | String | 是 | 工作项的地址。 |
| `project` | Object | 是 | 工作项所属的项目。 |
| `identifier` | String | 是 | 工作项的标识。 |
| `title` | String | 是 | 工作项的标题。 |
| `type` | String | 是 | 工作项的类型。工作项类型分为9种系统类型和一些自定义类型。系统类型包括：史诗、特性、用户故事、阶段、里程碑、需求、任务、缺陷和事务。 |
| `start_at` | Number | 是 | 工作项的开始时间。 |
| `end_at` | Number | 是 | 工作项的结束时间。 |
| `parent_id` | String | 是 | 工作项的父工作项id。 |
| `short_id` | String | 是 | 工作项的短id。 |
| `html_url` | String | 是 | 工作项的html地址。 |
| `parent` | Object | 是 | 工作项的父工作项。 |
| `assignee` | Object | 是 | 工作项的负责人。 |
| `state` | Object | 是 | 工作项的状态。 |
| `priority` | Object | 是 | 工作项的优先级。 |
| `version` | Object | 是 | 工作项属的发布。 |
| `sprint` | Object | 是 | 工作项所属的迭代。 |
| `board` | Object | 是 | 工作项所属的看板。 |
| `entry` | Object | 是 | 工作项所属的看板栏。 |
| `swimlane` | Object | 是 | 工作项的所属的泳道。 |
| `phase` | Object | 是 | 工作项的所属计划。 |
| `description` | String | 是 | 工作项的描述。 |
| `completed_at` | Number | 是 | 工作项的完成时间。 |
| `story_points` | Number | 是 | 工作项的故事点。 |
| `estimated_workload` | Number | 是 | 工作项的预估工时。 |
| `remaining_workload` | Number | 是 | 工作项的剩余工时。 |
| `properties` | Object | 是 | 工作项的自定义属性。自定义属性包括用户自定义的属性和一些系统内置的属性。用户自定义的属性例如prop_a和prop_b。系统内置的属性例如bug_type、solution和risk等。 |
| `tags` | Object[] | 是 | 工作项的标签列表。 |
| `participants` | Object[] | 是 | 工作项的关注人列表。 |
| `public_image_token` | String | 是 | 工作项描述和自定义多行文本类型属性里获取图片资源token。获取一个工作项和获取工作项列表参数include_public_image_token值有效时返回。 |
| `created_at` | Number | 是 | 工作项的创建时间。 |
| `created_by` | Object | 是 | 工作项的创建人。 |
| `updated_at` | Number | 是 | 工作项的更新时间。 |
| `updated_by` | Object | 是 | 工作项的更新人。 |
| `is_archived` | Number | 是 | 是否已归档。<br>可选值: `0`, `1` |
| `is_deleted` | Number | 是 | 是否已删除。<br>可选值: `0`, `1` |

#### Success Examples
**全量数据示例：**
```json
{
     "id": "6efca131b06329c524cdd2fb",
     "url": "https://rest_api_root/v1/project/work_items/6efca131b06329c524cdd2fb",
     "project": {
         "id": "5eb623f6a70571487ea47004",
         "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47004",
         "identifier": "HBR",
         "name": "Hybrid项目",
         "type": "hybrid",
         "is_archived": 0,
         "is_deleted": 0
     },
     "identifier": "HBR-1",
     "title": "这是一个用户故事",
     "type": "story",
     "start_at": 1583290309,
     "end_at": 1583290347,
     "parent_id": "5edfa3b67463c1ee626c0980",
     "short_id": "eqWqLmTO",
     "html_url": "https://yctech.pingcode.com/pjm/workitems/eqWqLmTO",
     "parent": {
         "id": "5edfa3b67463c1ee626c0980",
         "url": "https://rest_api_root/v1/project/work_items/5edfa3b67463c1ee626c0980",
         "identifier": "HBR-2",
         "title": "这是一个特性",
         "type": "feature",
         "start_at": 1583290309,
         "end_at": 1583290347,
         "parent_id": null,
         "properties": {
             "prop_a": "prop_a_value",
             "prop_b": "prop_b_value",
             "risk": null,
             "business_value": null,
             "effort": null,
             "backlog_type": null,
             "backlog_from": null
         }
      },
      "assignee": {
          "id": "a0417f68e846aae315c85d24643678a9",
          "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
          "name": "john",
          "display_name": "John",
          "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
      },
      "version": {
          "id": "5eb623487ea47001f6a70571",
          "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47004/versions/5eb623487ea47001f6a70582",
          "name": "1.0.1",
          "start_at": 1565255712,
          "end_at": 1565255879,
          "stage": {
              "id": "5f44a8f8bb347b14b49624a1",
              "url": "https://rest_api_root/v1/project/stages/5f44a8f8bb347b14b49624a1",
              "name": "未开始",
              "type": "pending",
              "color": "#FA8888"
          }
      },
      "sprint": {
          "id": "5ecf7b74eaab845a2aa53139",
          "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47004/sprints/5ecf7b74eaab845a2aa53139",
          "name": "Sprint 1",
          "start_at": 1589791860,
          "end_at": 1589791860,
          "status": "completed"
      },
      "state": {
          "id": "5c9b35de90ad7153c2062f18",
          "url": "https://rest_api_root/v1/project/work_item_states/5c9b35de90ad7153c2062f18",
          "name": "新建",
          "type": "pending",
          "color": "#ff7575"
      },
      "priority": {
          "id": "5eb623f6a70571487ea47111",
          "url": "https://rest_api_root/v1/project/work_item_priorities/5eb623f6a70571487ea47111",
          "name": "最高"
      },
      "board": {
          "id": "5eb623f6a70571487ea47333",
          "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47004/boards/5eb623f6a70571487ea47333",
          "name": "kanban",
          "work_item_types": [
             "epic",
             "feature",
             "issue",
             "story"
          ]
      },
      "entry": {
          "id": "5ee1c4fac5b3c51206f0a862",
          "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47004/boards/5eb623f6a70571487ea47333/entries/5ee1c4fac5b3c51206f0a862",
          "name": "需求池"
      },
      "swimlane": {
          "id": "5ee1c4fac5b3c51206f0a867",
          "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47004/boards/5eb623f6a70571487ea47333/swimlanes/5ee1c4fac5b3c51206f0a867",
          "name": "默认泳道"
      },
      "phase": {
          "id": "63761fee31caaf77189816b5",
          "url": "http://rest_api_root/v1/project/projects/5eb623f6a70571487ea47004/phases/63761fee31caaf77189816b5",
          "title": "这是一个阶段",
          "identifier": "WTF-1"
      },
      "description": "<p>这是一个用户故事的描述<p><img src=\"https://atlas.pingcode.com/files/public/689a9d124df436ef91923a3a\" originUrl=\"https://atlas.pingcode.com/files/public/689a9d124df436ef91923a3a\" alt=\"图片.png\" size=\"35460\" style=\"text-align: center;\" />",
      "completed_at": 1583290347,
      "story_points": 1,
      "estimated_workload": 1,
      "remaining_workload": 1,
      "properties": {
          "prop_a": "prop_a_value",
          "prop_b": "prop_b_value",
          "risk": null,
          "backlog_type": null,
          "backlog_from": null
      },
      "tags": [
          {
              "id": "5e6b35de50ef8153c2062f70",
              "url": "https://rest_api_root/v1/project/tags/5e6b35de50ef8153c2062f70",
              "name": "标签-1"
          }
      ],
      "participants": [
          {
              "id": "a0417f68e846aae315c85d24643678a9",
              "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=work_item&principal_id=5edca112b06305c524cad2fa",
              "type": "user",
              "user": {
                  "id": "a0417f68e846aae315c85d24643678a9",
                  "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                  "name": "john",
                  "display_name": "John",
                  "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
              }
          }
      ],
      "public_image_token": "-fkvANQ2dcVECK6Xg45L3kG8VCbOTK8NrNckGkxljRY",
      "created_at": 1583290300,
      "created_by": {
          "id": "a0417f68e846aae315c85d24643678a9",
          "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
          "name": "john",
          "display_name": "John",
          "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
      },
      "updated_at": 1583290300,
      "updated_by": {
          "id": "a0417f68e846aae315c85d24643678a9",
          "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
          "name": "john",
          "display_name": "John",
          "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
      },
      "is_archived": 0,
      "is_deleted": 0
}
```

**引用数据示例：**
```json
{
    "id": "5edca5d2fa112b06305c24ca",
    "url": "https://rest_api_root/v1/project/work_items/5edca5d2fa112b06305c24ca",
    "identifier": "KB-1",
    "title": "这是一个事务",
    "type": "issue",
    "start_at": 1583290309,
    "end_at": 1583290347,
    "parent_id": null,
    "short_id": "c9WqLmTO",
    "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
    "properties": {
        "prop_a": "prop_a_value",
        "prop_b": "prop_b_value",
        "entry_status": null,
        "entry_position": null,
        "operation_time": 1691571221
    }
}
```

### 项目

**接口:** ` 项目`

用于查看和管理项目相关信息。
 资源地址：{GET} https://rest_api_root/v1/project/projects/{project_id}

#### Success
**资源属性**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 项目的id。 |
| `url` | String | 是 | 项目的地址。 |
| `type` | String | 是 | 项目的类型。<br>可选值: `kanban`, `scrum`, `waterfall`, `hybrid` |
| `process_id` | String | 是 | 项目流程的id。 |
| `scope_id` | String | 是 | 项目的所属id。 |
| `scope_type` | String | 是 | 项目的所属类型。<br>可选值: `organization`, `user_group` |
| `name` | String | 是 | 项目的名称。 |
| `color` | String | 是 | 项目的主题色。 |
| `identifier` | String | 是 | 项目的标识。 |
| `visibility` | String | 是 | 项目的可见性。<br>可选值: `private`, `public` |
| `description` | String | 是 | 项目的描述。 |
| `state` | Object | 是 | 项目的状态。 |
| `assignee` | Object | 是 | 项目的负责人。 |
| `start_at` | Number | 是 | 项目的开始时间。 |
| `end_at` | Number | 是 | 项目的结束时间。 |
| `properties` | Object | 是 | 项目的自定义属性。 |
| `properties.prop_a` | Object | 是 | 项目的自定义属性prop_a。 |
| `properties.prop_b` | Object | 是 | 项目的自定义属性prop_b。 |
| `members` | Object[] | 是 | 项目的成员列表。 |
| `created_at` | Number | 是 | 项目的创建时间。 |
| `created_by` | Object | 是 | 项目的创建人。 |
| `updated_at` | Number | 是 | 项目的更新时间。 |
| `updated_by` | Object | 是 | 项目的更新人。 |
| `is_archived` | Number | 是 | 是否已归档。<br>可选值: `0`, `1` |
| `is_deleted` | Number | 是 | 是否已删除。<br>可选值: `0`, `1` |

#### Success Examples
**全量数据示例：**
```json
{
    "id": "5eb623f6a70571487ea47000",
    "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
    "type": "scrum",
    "process_id": "5fa690f1ae0571487ea49030",
    "scope_type": "user_group",
    "scope_id": "63c8fb32729dee3334d96af7",
    "name": "Scrum项目",
    "color": "#F693E7",
    "identifier": "SCR",
    "visibility": "private",
    "description": "这是一个scrum类型的项目",
    "state": {
        "id": "66cbf3b4b78a55fcd1a76296",
        "url": "http://rest_api_root/v1/project/project_states/66cbf3b4b78a55fcd1a76296",
        "name": "正常",
        "type": "in_progress"
    },
    "assignee": {
        "id": "8168dd057b104c81bceb2e48bdf283d0",
        "url": "http://rest_api_root/v1/directory/users/8168dd057b104c81bceb2e48bdf283d0",
        "name": "john",
        "display_name": "john",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "start_at": 1680278400,
    "end_at": 1682870399,
    "properties": {
        "prop_a": "prop_a_value",
        "prop_b": "prop_b_value"
    },
    "members": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/members/a0417f68e846aae315c85d24643678a9",
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        },
        {
            "id": "63c8fb32729dee3334d96af7",
            "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/members/63c8fb32729dee3334d96af7",
            "type": "user_group",
            "user_group": {
                "id": "63c8fb32729dee3334d96af7",
                "url": "https://rest_api_root/v1/directory/groups/63c8fb32729dee3334d96af7",
                "name": "Open Team"
            }
        }
    ],
    "created_at": 1583290300,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1583290300,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_archived": 0,
    "is_deleted": 0
}
```

**引用数据示例：**
```json
{
    "id": "5eb623f6a70571487ea47000",
    "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
    "identifier": "SCR",
    "name": "Scrum项目",
    "type": "scrum",
    "is_archived": 0,
    "is_deleted": 0
}
```

### 项目配置中心

### 项目配置中心

## 项目

### 创建一个项目

**接口:** `POST https://rest_api_root/v1/project/projects`

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `scope_type` | String | 否 | 项目的所属类型。默认值organization。允许值分别表示企业可见和团队可见。<br>默认值: `organization`<br>可选值: `organization`, `user_group` |
| `scope_id` | String | 否 | 项目的所属id。当scope_type为user_group时，该字段必填，且表示团队id；当scope_type为其他值时，该字段无效。 |
| `name` | String | 是 | 项目的名称。最大长度为255。 |
| `visibility` | String | 否 | 项目的可见范围。允许值分别表示组织全部成员可见和仅项目成员可见。<br>默认值: `private`<br>可选值: `public`, `private` |
| `type` | String | 是 | 项目的类型。<br>可选值: `kanban`, `scrum`, `waterfall`, `hybrid` |
| `identifier` | String | 是 | 项目的标识。在一个企业中这个标识是唯一的。项目的标识由大写英文字母/数字/下划线/连接线组成（不超过15个字符）。 |
| `description` | String | 否 | 项目的描述。 |
| `members` | Object[] | 否 | 项目成员的列表。当项目的scope_type变为user_group时，项目成员必须是scope_id指定的团队内的成员；当scope_type为其他值时，项目成员可以是任意成员或团队。 |
| `members.id` | String | 是 | 企业成员或团队的id。 |
| `members.type` | String | 是 | 项目成员的类型。<br>可选值: `user`, `user_group` |
| `start_at` | Number | 否 | 项目开始的时间。 |
| `end_at` | Number | 否 | 项目结束的时间。 |
| `assignee_id` | String | 否 | 项目负责人的id。 |

#### Parameters Examples
**请求示例：**
```json
{
    "scope_type": "user_group",
    "scope_id": "63c8fb32729dee3334d96af7",
    "name": "Scrum项目",
    "visibility": "private",
    "type": "scrum",
    "identifier": "SCR",
    "description": "这是一个scrum类型的项目",
    "members": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "type": "user"
        }
    ],
    "start_at": 1680278400,
    "end_at": 1682870399,
    "assignee_id": "8168dd057b104c81bceb2e48bdf283d0"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "5eb623f6a70571487ea47000",
    "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
    "type": "scrum",
    "process_id": "5fa690f1ae0571487ea49030",
    "scope_type": "user_group",
    "scope_id": "63c8fb32729dee3334d96af7",
    "name": "Scrum项目",
    "color": "#F693E7",
    "identifier": "SCR",
    "visibility": "private",
    "description": "这是一个scrum类型的项目",
    "state": {
        "id": "66cbf3b4b78a55fcd1a76296",
        "url": "http://rest_api_root/v1/project/project_states/66cbf3b4b78a55fcd1a76296",
        "name": "正常",
        "type": "in_progress"
    },
    "assignee": {
        "id": "8168dd057b104c81bceb2e48bdf283d0",
        "url": "http://rest_api_root/v1/directory/users/8168dd057b104c81bceb2e48bdf283d0",
        "name": "john",
        "display_name": "john",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "start_at": 1680278400,
    "end_at": 1682870399,
    "properties": {},
    "members": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/members/a0417f68e846aae315c85d24643678a9",
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        }
    ],
    "created_at": 1583290300,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1583290300,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_archived": 0,
    "is_deleted": 0
}
```

### 向项目中添加一个成员

**接口:** `POST https://rest_api_root/v1/project/projects/{project_id}/members`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `member` | Object | 是 | 项目的成员。 |
| `member.id` | String | 是 | 企业成员或团队的id。 |
| `member.type` | String | 是 | 项目成员的类型。<br>可选值: `user`, `user_group` |
| `role_id` | String | 否 | 角色的id。 |

#### Parameters Examples
**请求示例：**
```json
{
    "member": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "type": "user"
    },
    "role_id": "6422711c3f12e6c1e46d40e6"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "a0417f68e846aae315c85d24643678a9",
    "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/members/a0417f68e846aae315c85d24643678a9",
    "project": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
        "identifier": "SCR",
        "name": "Scrum项目",
        "type": "scrum",
        "is_archived": 0,
        "is_deleted": 0
    },
    "type": "user",
    "user": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "role": {
        "id": "6422711c3f12e6c1e46d40e6",
        "url": "https://rest_api_root/v1/directory/roles/6422711c3f12e6c1e46d40e6",
        "name": "管理员"
    }
}
```

### 向项目中添加一个项目属性

**接口:** `POST https://rest_api_root/v1/project/projects/{project_id}/project_properties`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `property_id` | String | 是 | 项目属性的id。 |

#### Parameters Examples
**请求示例：**
```json
{
    "property_id": "risk"
}
```

#### Success Examples
**响应示例：**
```json
{
  "id": "risk",
  "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/project_properties/risk",
  "project": {
    "id": "5eb623f6a70571487ea47000",
    "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
    "identifier": "SCR",
    "name": "Scrum项目",
    "type": "scrum",
    "is_archived": 0,
    "is_deleted": 0
  },
  "property": {
    "id": "risk",
    "url": "http://rest_api_root/v1/project/project_properties/risk",
    "name": "项目风险",
    "type": "select",
    "options": [
      {
        "_id": "5efb1859110533727a82c603",
        "text": "高"
      },
      {
        "_id": "5efb1859110533727a82c604",
        "text": "中"
      },
      {
        "_id": "5efb1859110533727a82c605",
        "text": "低"
      }
    ]
  }
}
```

### 在项目中移除一个成员

**接口:** `DELETE https://rest_api_root/v1/project/projects/{project_id}/members/{member_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |
| `member_id` | String | 是 | 企业成员或团队的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "a0417f68e846aae315c85d24643678a9",
    "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/members/a0417f68e846aae315c85d24643678a9",
    "project": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
        "identifier": "SCR",
        "name": "Scrum项目",
        "type": "scrum",
        "is_archived": 0,
        "is_deleted": 0
    },
    "type": "user",
    "user": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "role": {
        "id": "6422711c3f12e6c1e46d40e6",
        "url": "https://rest_api_root/v1/directory/roles/6422711c3f12e6c1e46d40e6",
        "name": "管理员"
    }
}
```

### 在项目中移除一个项目属性

**接口:** `DELETE https://rest_api_root/v1/project/projects/{project_id}/project_properties/{property_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |
| `property_id` | String | 是 | 项目属性的id。 |

#### Success Examples
**响应示例：**
```json
{
  "id": "risk",
  "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/project_properties/risk",
  "project": {
    "id": "5eb623f6a70571487ea47000",
    "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
    "identifier": "SCR",
    "name": "Scrum项目",
    "type": "scrum",
    "is_archived": 0,
    "is_deleted": 0
  },
  "property": {
    "id": "risk",
    "url": "http://rest_api_root/v1/project/project_properties/risk",
    "name": "项目风险",
    "type": "select",
    "options": [
      {
        "_id": "5efb1859110533727a82c603",
        "text": "高"
      },
      {
        "_id": "5efb1859110533727a82c604",
        "text": "中"
      },
      {
        "_id": "5efb1859110533727a82c605",
        "text": "低"
      }
    ]
  }
}
```

### 复制一个项目

**接口:** `POST https://rest_api_root/v1/project/projects/{project_id}/clone`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `scope_type` | String | 否 | 项目的所属类型。默认使用原项目的所属。允许值分别表示企业可见和团队可见。<br>可选值: `organization`, `user_group` |
| `scope_id` | String | 否 | 项目的所属id。当scope_type为user_group时，该字段必填，且表示团队id；当scope_type为其他值时，该字段无效。 |
| `name` | String | 否 | 项目的名称。最大长度为255。默认使用原项目的名称。 |
| `visibility` | String | 否 | 项目的可见范围。默认使用原项目的可见范围。允许值分别表示组织全部成员可见和仅项目成员可见。<br>可选值: `public`, `private` |
| `identifier` | String | 是 | 项目的标识。在一个企业中这个标识是唯一的。项目的标识由大写英文字母/数字/下划线/连接线组成（不超过15个字符）。 |
| `description` | String | 否 | 项目的描述。默认使用原项目的描述。 |
| `members` | Object[] | 否 | 项目成员的列表。当项目的scope_type变为user_group时，项目成员必须是scope_id指定的团队内的成员；当scope_type为其他值时，项目成员可以是任意成员或团队，默认使用原项目的成员列表。 |
| `members.id` | String | 是 | 企业成员或团队的id。 |
| `members.type` | String | 是 | 项目成员的类型。<br>可选值: `user`, `user_group` |

#### Parameters Examples
**请求示例：**
```json
{
   "scope_type": "user_group",
   "scope_id": "63c8fb32729dee3334d96af7",
   "name": "复制的Scrum项目",
   "visibility": "public",
   "identifier": "SCRC",
   "description": "这是一个复制的Scrum类型的项目",
   "members": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "type": "user"
        }
    ]
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "5ab623f6a70571487ea47001",
    "url": "https://rest_api_root/v1/project/projects/5ab623f6a70571487ea47001",
    "type": "scrum",
    "process_id": "5fa690f1ae0571487ea49030",
    "scope_type": "user_group",
    "scope_id": "63c8fb32729dee3334d96af7",
    "name": "复制的Scrum项目",
    "color": "#F693E7",
    "identifier": "SCRC",
    "visibility": "public",
    "description": "这是一个复制的Scrum类型的项目",
    "state": {
        "id": "66cbf3b4b78a55fcd1a76296",
        "url": "http://rest_api_root/v1/project/project_states/66cbf3b4b78a55fcd1a76296",
        "name": "正常",
        "type": "in_progress"
    },
    "assignee": {
        "id": "8168dd057b104c81bceb2e48bdf283d0",
        "url": "http://rest_api_root/v1/directory/users/8168dd057b104c81bceb2e48bdf283d0",
        "name": "john",
        "display_name": "john",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "start_at": 1680278400,
    "end_at": 1682870399,
    "properties": {},
    "members": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/members/a0417f68e846aae315c85d24643678a9",
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        }
    ],
    "created_at": 1583290300,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1583290300,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_archived": 0,
    "is_deleted": 0
}
```

### 获取一个项目进度

**接口:** `GET https://rest_api_root/v1/project/projects/{project_id}/progress`

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
    "work_item": {
        "total": 4,
        "pending_count": 1,
        "in_progress_count": 2,
        "completed_count": 1
    }
}
```

### 获取项目中的成员列表

**接口:** `GET https://rest_api_root/v1/project/projects/{project_id}/members`

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
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/members/a0417f68e846aae315c85d24643678a9",
            "project": {
                "id": "5eb623f6a70571487ea47000",
                "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
                "identifier": "SCR",
                "name": "Scrum项目",
                "type": "scrum",
                "is_archived": 0,
                "is_deleted": 0
            },
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "role": {
                "id": "6422711c3f12e6c1e46d40e6",
                "url": "https://rest_api_root/v1/directory/roles/6422711c3f12e6c1e46d40e6",
                "name": "管理员"
            }
        },
        {
            "id": "63c8fb32729dee3334d96af7",
            "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/members/63c8fb32729dee3334d96af7",
            "project": {
                "id": "5eb623f6a70571487ea47000",
                "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
                "identifier": "SCR",
                "name": "Scrum项目",
                "type": "scrum",
                "is_archived": 0,
                "is_deleted": 0
            },
            "type": "user_group",
            "user_group": {
                "id": "63c8fb32729dee3334d96af7",
                "url": "https://rest_api_root/v1/directory/groups/63c8fb32729dee3334d96af7",
                "name": "Open Team"
            },
            "role": {
                "id": "6422711c3f12e6c1e46d40e6",
                "url": "https://rest_api_root/v1/directory/roles/6422711c3f12e6c1e46d40e6",
                "name": "管理员"
            }
        }
    ]
}
```

### 获取项目中的项目属性列表

**接口:** `GET https://rest_api_root/v1/project/projects/{project_id}/project_properties`

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
      "id": "risk",
      "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/project_properties/risk",
      "project": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
        "identifier": "SCR",
        "name": "Scrum项目",
        "type": "scrum",
        "is_archived": 0,
        "is_deleted": 0
      },
      "property": {
        "id": "risk",
        "url": "http://rest_api_root/v1/project/project_properties/risk",
        "name": "项目风险",
        "type": "select",
        "options": [
          {
            "_id": "5efb1859110533727a82c603",
            "text": "高"
          },
          {
            "_id": "5efb1859110533727a82c604",
            "text": "中"
          },
          {
            "_id": "5efb1859110533727a82c605",
            "text": "低"
          }
        ]
      }
    },
    {
      "id": "name",
      "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/project_properties/name",
      "project": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
        "identifier": "SCR",
        "name": "Scrum项目",
        "type": "scrum",
        "is_archived": 0,
        "is_deleted": 0
      },
      "property": {
        "id": "name",
        "url": "https://rest_api_root/v1/project/project_properties/name",
        "name": "名称",
        "type": "text",
        "options": null,
        "is_removable": false,
        "is_name_editable": false,
        "is_options_editable": false
      }
    }
  ]
}
```

### 获取项目列表

**接口:** `GET https://rest_api_root/v1/project/projects`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `identifier` | String | 否 | 项目的标识。 |
| `type` | String | 否 | 项目的类型。<br>可选值: `scrum`, `kanban`, `waterfall`, `hybrid` |
| `include_deleted` | Boolean | 否 | 是否查询已删除的项目。该值默认为false。 |
| `include_archived` | Boolean | 否 | 是否查询已归档的项目。该值默认为false。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "5eb623f6a70571487ea47000",
            "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
            "type": "scrum",
            "process_id": "5fa690f1ae0571487ea49030",
            "scope_type": "user_group",
            "scope_id": "63c8fb32729dee3334d96af7",
            "name": "Scrum项目",
            "color": "#F693E7",
            "identifier": "SCR",
            "visibility": "private",
            "description": "这是一个scrum类型的项目",
            "state": {
                "id": "66cbf3b4b78a55fcd1a76296",
                "url": "http://rest_api_root/v1/project/project_states/66cbf3b4b78a55fcd1a76296",
                "name": "正常",
                "type": "in_progress"
            },
            "assignee": {
                "id": "8168dd057b104c81bceb2e48bdf283d0",
                "url": "http://rest_api_root/v1/directory/users/8168dd057b104c81bceb2e48bdf283d0",
                "name": "john",
                "display_name": "john",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "start_at": 1680278400,
            "end_at": 1682870399,
            "properties": {
                "prop_a": "prop_a_value",
                "prop_b": "prop_b_value"
            },
            "members": [
                {
                    "id": "a0417f68e846aae315c85d24643678a9",
                    "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/members/a0417f68e846aae315c85d24643678a9",
                    "type": "user",
                    "user": {
                        "id": "a0417f68e846aae315c85d24643678a9",
                        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                        "name": "john",
                        "display_name": "John",
                        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
                    }
                }
            ],
            "created_at": 1583290300,
            "created_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "updated_at": 1583290300,
            "updated_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "is_archived": 0,
            "is_deleted": 0
        }
    ]
}
```

### 获取项目状态列表

**接口:** `GET https://rest_api_root/v1/project/project/states?project_id={project_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_index": 0,
    "page_size": 30,
    "total": 5,
    "values": [
        {
            "id": "66cbf5401e7cc374c85acb1b",
            "url": "https://rest_api_root/v1/project/project_states/66cbf5401e7cc374c85acb1b",
            "name": "未开始",
            "type": "pending"
        },
        {
            "id": "66cbf5401e7cc374c85acb1c",
            "url": "https://rest_api_root/v1/project/project_states/66cbf5401e7cc374c85acb1c",
            "name": "正常",
            "type": "in_progress"
        },
        {
            "id": "66cbf5401e7cc374c85acb1d",
            "url": "https://rest_api_root/v1/project/project_states/66cbf5401e7cc374c85acb1d",
            "name": "预警",
            "type": "in_progress"
        },
        {
            "id": "66cbf5401e7cc374c85acb1e",
            "url": "https://rest_api_root/v1/project/project_states/66cbf5401e7cc374c85acb1e",
            "name": "延期",
            "type": "in_progress"
        },
        {
            "id": "66cbf5401e7cc374c85acb1f",
            "url": "https://rest_api_root/v1/project/project_states/66cbf5401e7cc374c85acb1f",
            "name": "结束",
            "type": "completed"
        }
    ]
}
```

### 部分更新一个项目

**接口:** `PATCH https://rest_api_root/v1/project/projects/{project_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 项目的名称。最大长度为255。 |
| `identifier` | String | 否 | 项目的标识。在一个企业中这个标识是唯一的。项目的标识由大写英文字母/数字/下划线/连接线组成（不超过15个字符）。 |
| `description` | String | 否 | 项目的描述。 |
| `start_at` | Number | 否 | 项目开始的时间。 |
| `end_at` | Number | 否 | 项目结束的时间。 |
| `assignee_id` | String | 否 | 项目负责人的id。 |
| `state_id` | String | 否 | 项目状态的id。项目状态可以通过获取项目状态列表获取。 |
| `properties` | Object | 否 | 项目自定义属性的键值对集合。需要注意自定义属性需要包含在项目属性方案中。例如属性方案中包含prop_a和prop_b。 |
| `properties.prop_a` | Object | 否 | 项目自定义属性prop_a。 |
| `properties.prop_b` | Object | 否 | 项目自定义属性prop_b。 |

#### Parameters Examples
**请求示例：**
```json
{
   "name": "Scrum项目",
   "identifier": "SCR",
   "description": "这是一个scrum类型的项目",
   "start_at": 1680278400,
   "end_at": 1682870399,
   "assignee_id": "a0417f68e846aae315c85d24643678a9",
   "state_id": "66cbf3b4b78a55fcd1a76296",
   "properties": {
       "prop_a": "prop_a_value",
       "prop_b": "prop_b_value"
   }
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "5eb623f6a70571487ea47000",
    "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
    "type": "scrum",
    "process_id": "5fa690f1ae0571487ea49030",
    "scope_type": "user_group",
    "scope_id": "63c8fb32729dee3334d96af7",
    "name": "Scrum项目",
    "color": "#F693E7",
    "identifier": "SCR",
    "visibility": "private",
    "description": "这是一个scrum类型的项目",
    "state": {
        "id": "66cbf3b4b78a55fcd1a76296",
        "url": "http://rest_api_root/v1/project/project_states/66cbf3b4b78a55fcd1a76296",
        "name": "正常",
        "type": "in_progress"
    },
    "assignee": {
        "id": "8168dd057b104c81bceb2e48bdf283d0",
        "url": "http://rest_api_root/v1/directory/users/8168dd057b104c81bceb2e48bdf283d0",
        "name": "john",
        "display_name": "john",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "start_at": 1680278400,
    "end_at": 1682870399,
    "properties": {
        "prop_a": "prop_a_value",
        "prop_b": "prop_b_value"
    },
    "members": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/members/a0417f68e846aae315c85d24643678a9",
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        }
    ],
    "created_at": 1583290300,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1583293300,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_archived": 0,
    "is_deleted": 0
}
```

### 部分更新一个项目内的成员

**接口:** `PATCH https://rest_api_root/v1/project/projects/{project_id}/members/{member_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |
| `member_id` | String | 是 | 企业成员或团队的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `role_id` | String | 否 | 角色的id。管理员可以更改其他用户的角色，但非管理员用户无权更改其他用户的角色。 |

#### Parameters Examples
**请求示例：**
```json
{
    "role_id": "6422711c3f12e6c1e46d40e6"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "a0417f68e846aae315c85d24643678a9",
    "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/members/a0417f68e846aae315c85d24643678a9",
    "project": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
        "identifier": "SCR",
        "name": "Scrum项目",
        "type": "scrum",
        "is_archived": 0,
        "is_deleted": 0
    },
    "type": "user",
    "user": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "role": {
        "id": "6422711c3f12e6c1e46d40e6",
        "url": "https://rest_api_root/v1/directory/roles/6422711c3f12e6c1e46d40e6",
        "name": "管理员"
    }
}
```

## Scrum

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

## Kanban

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

## 工作项

### 关联一个工作项

**接口:** `POST https://rest_api_root/v1/project/work_items/{work_item_id}/relations`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `work_item_id` | String | 是 | 工作项的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `target_work_item_id` | String | 是 | 目标工作项的id。 |
| `relation_type` | String | 是 | 关联的类型。<br>可选值: `mention`, `clone`, `cloned_by`, `duplicate`, `relate`, `cause`, `caused_by`, `block`, `blocked_by`, `dependency`, `自定义关联类型的id` |

#### Parameters Examples
**请求示例：**
```json
{
   "target_work_item_id": "5f9a65ef20ef8153c1462e64",
   "relation_type": "relate"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "58fb35de50ef8153c2062e36",
    "url": "https://rest_api_root/v1/project/work_items/5edca524cad2b06305cfa112/relations/58fb35de50ef8153c2062e36",
    "relation_type": "relate",
    "origin_work_item": {
        "id": "5edca524cad2b06305cfa112",
        "url": "https://rest_api_root/v1/project/work_items/5edca524cad2b06305cfa112",
        "identifier": "SCR-4",
        "title": "这是一个任务",
        "type": "task",
        "start_at": 1583290309,
        "end_at": 1583290347,
        "parent_id": "5edca524cad2fa1125cb0629",
        "short_id": "c9WqLmTO",
        "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
        "properties": {
            "prop_a": "prop_a_value",
            "prop_b": "prop_b_value"
        }
    },
    "target_work_item": {
        "id": "5f9a65ef20ef8153c1462e64",
        "url": "https://rest_api_root/v1/project/work_items/5f9a65ef20ef8153c1462e64",
        "identifier": "SCR-5",
        "title": "这是一个缺陷",
        "type": "bug",
        "start_at": 1583290309,
        "end_at": 1583290347,
        "parent_id": null,
        "short_id": "a9WqLmTO",
        "html_url": "https://yctech.pingcode.com/pjm/workitems/a9WqLmTO",
        "properties": {
            "prop_a": "prop_a_value",
            "prop_b": "prop_b_value"
        }
    }
}
```

### 创建一个工作项

**接口:** `POST https://rest_api_root/v1/project/work_items`

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |
| `type_id` | String | 是 | 工作项类型的id。工作项类型分为9种系统类型和一些自定义类型。系统类型包括：史诗、特性、用户故事、阶段、里程碑、需求、任务、缺陷和事务。可以通过获取全部工作项类型列表获得。 |
| `title` | String | 是 | 工作项的标题。 |
| `description` | String | 否 | 工作项的描述。 |
| `start_at` | Number | 否 | 工作项的开始时间。当工作项类型为里程碑时，该参数无效。 |
| `end_at` | Number | 否 | 工作项的截止时间。 |
| `priority_id` | String | 否 | 工作项优先级的id。 |
| `state_id` | String | 否 | 工作项状态的id。工作项状态的id在设置时必须同时满足工作项类型的工作项状态方案和工作项状态流转的状态值才能成功完成设置。工作项状态方案可以通过获取工作项状态方案列表获取。工作项状态流转则可以通过获取状态方案中的工作项状态流转列表获取。 |
| `assignee_id` | String | 否 | 工作项负责人的id。 |
| `parent_id` | String | 否 | 工作项的父工作项的id。当前工作项类型支持的父工作类型包含parent_id对应的工作项类型时，该参数有效。具体配置见属性与视图子工作项配置。 |
| `sprint_id` | String | 否 | 所属迭代id。该字段只有项目类型为scrum和hybrid时有效。 |
| `version_ids` | String[] | 否 | 所属发布的id列表。 |
| `board_id` | String | 否 | 看板的id。该字段只有项目类型为kanban和hybrid时有效。 |
| `entry_id` | String | 否 | 看板栏的id。该字段只有项目类型为kanban和hybrid时有效。 |
| `swimlane_id` | String | 否 | 泳道的id。该字段只有项目类型为kanban和hybrid时有效。 |
| `story_points` | Number | 否 | 工作项的故事点。当工作项的属性在视图中配置了故事点属性时，该参数生效。故事点数值必须是大于等于0的整数或最多包含一位小数的正数。 |
| `estimated_workload` | Number | 否 | 工作项的预估工时。 |
| `remaining_workload` | Number | 否 | 工作项的剩余工时。 |
| `properties` | Object | 否 | 工作项属性的键值对集合，需要注意的是，当前工作项类型对应的工作项属性方案需要包含这些工作项属性，例如工作项属性方案中包含prop_a和prop_b。 |
| `properties.prop_a` | Object | 否 | 工作项属性prop_a。 |
| `properties.prop_b` | Object | 否 | 工作项属性prop_b。 |
| `participant_ids` | String[] | 否 | 工作项关注人的id列表。 |

#### Parameters Examples
**请求示例：**
```json
{
    "project_id": "5eb623f6a70571487ea47000",
    "type_id": "bug",
    "title": "这是一个缺陷",
    "description": "这是一个缺陷的描述",
    "start_at": 1583290309,
    "end_at": 1583290347,
    "state_id": "5c9b35de90ad7153c2062f18",
    "parent_id": "5edca112b06305c524cad2fa",
    "sprint_id": "5ecf7b74eaab845a2aa53138",
    "version_ids": [
        "5eb623487ea47001f6a70571"
    ],
    "board_id": "5eb623f6a70571487ea47222",
    "entry_id": "5ee1c4fac5b3c51206f0a861",
    "swimlane_id": "5ee1c4fac5b3c51206f0a866",
    "priority_id": "5eb623f6a70571487ea47111",
    "assignee_id": "a0417f68e846aae315c85d24643678a9",
    "participant_ids": [
        "a0417f68e846aae315c85d24643678a9"
    ],
    "story_points": 1,
    "estimated_workload": 1,
    "remaining_workload": 1,
    "properties": {
        "prop_a": "prop_a_value",
        "prop_b": "prop_b_value"
    }
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "5edca524cad2fa1125cb0630",
    "url": "https://rest_api_root/v1/project/work_items/5edca524cad2fa1125cb0630",
    "project": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
        "identifier": "SCR",
        "name": "Scrum项目",
        "type": "scrum",
        "is_archived": 0,
        "is_deleted": 0
    },
    "identifier": "SCR-5",
    "title": "这是一个缺陷",
    "type": "bug",
    "start_at": 1583290309,
    "end_at": 1583290347,
    "parent_id": "5edca112b06305c524cad2fa",
    "short_id": "1bAqLmTG",
    "html_url": "https://yctech.pingcode.com/pjm/workitems/1bAqLmTG",
    "parent": {
        "id": "5edca112b06305c524cad2fa",
        "url": "https://rest_api_root/v1/project/work_items/5edca112b06305c524cad2fa",
        "identifier": "SCR-3",
        "title": "这是一个用户故事",
        "type": "story",
        "start_at": 1583290309,
        "end_at": 1583290347,
        "parent_id": "5edca524cad2fa112b06309c",
        "properties": {
            "prop_a": "prop_a_value",
            "prop_b": "prop_b_value",
            "risk": null,
            "business_value": null,
            "effort": null,
            "backlog_type": null,
            "backlog_from": null
        }
    },
    "assignee": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "versions": [
       {
          "id": "5eb623487ea47001f6a70571",
          "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/versions/5eb623487ea47001f6a70571",
          "name": "1.0.1",
          "start_at": 1565255712,
          "end_at": 1565255879,
          "stage": {
              "id": "5f44a8f8bb347b14b49624a1",
              "url": "https://rest_api_root/v1/project/stages/5f44a8f8bb347b14b49624a1",
              "name": "未开始",
              "type": "pending",
              "color": "#FA8888"
          }
       }
    ],
    "sprint": {
        "id": "5ecf7b74eaab845a2aa53138",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/sprints/5ecf7b74eaab845a2aa53138",
        "name": "Sprint 1",
        "start_at": 1589791860,
        "end_at": 1589791860,
        "status": "completed"
    },
    "state": {
        "id": "5c9b35de90ad7153c2062f18",
        "url": "https://rest_api_root/v1/project/work_item_states/5c9b35de90ad7153c2062f18",
        "name": "新建",
        "type": "pending",
        "color": "#ff7575"
    },
    "priority": {
        "id": "5eb623f6a70571487ea47111",
        "url": "https://rest_api_root/v1/project/work_item_priorities/5eb623f6a70571487ea47111",
        "name": "最高"
    },
    "board": null,
    "entry": null,
    "swimlane": null,
    "phase": null,
    "description": "这是一个缺陷的描述",
    "completed_at": 1583290347,
    "story_points": 1,
    "estimated_workload": 1,
    "remaining_workload": 1,
    "properties": {
        "prop_a": "prop_a_value",
        "prop_b": "prop_b_value",
        "severity": null,
        "replay_version": null,
        "reappear_probability": null,
        "bug_type": null,
        "reason": null,
        "solution": null,
        "replay_step": null
    },
    "tags": [],
    "participants": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=work_item&principal_id=5edca524cad2fa1125cb0630",
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        }
    ],
    "created_at": 1583290300,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1583290300,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_archived": 0,
    "is_deleted": 0
}
```

### 创建一个工作项交付目标

**接口:** `POST https://rest_api_root/v1/project/deliverables`

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `work_item_id` | String | 是 | 工作项的id。工作项所属项目类型必须为waterfall或hybrid。 |
| `name` | String | 是 | 工作项交付目标的名称。 |
| `content_type` | String | 否 | 工作项交付物的类型。工作项交付物的类型。只支持link。attachment类型的交付物通过向交付目标中上传一个文件接口上传附件。 |
| `content` | String | 否 | 工作项交付物。当工作项交付物的类型是link时，工作项交付物为包含name和href的对象，例如：{ "name": "链接工作项交付目标",  "href": "https://rest_api_root/wiki/spaces/public/pages/6472e6f2f1968d3fdb0aba15" }。当工作项交付物不为空时，参数必须包含交付物类型。 |

#### Parameters Examples
**请求示例：**
```json
{
    "work_item_id": "63761fee31caaf77189816b4",
    "name": "工作项交付目标",
    "content_type": "link",
    "content": {
         "name": "PingCode",
         "href": "https://www.pingcode.com"
     }
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "63761fee31caaf7718981876",
    "url": "https://rest_api_root/v1/project/deliverables/63761fee31caaf7718981876",
    "name": "阶段交付目标",
    "content_type": "link",
    "content": {
        "name": "PingCode",
        "href": "https://www.pingcode.com"
    },
    "project": {
        "id": "6375cc81e3004de4ea14aa52",
        "url": "https://rest_api_root/v1/project/projects/6375cc81e3004de4ea14aa52",
        "identifier": "WTF",
        "name": "瀑布项目",
        "type": "waterfall",
        "is_archived": 0,
        "is_deleted": 0
    },
    "work_item": {
        "id": "63761fee31caaf77189816b4",
        "url": "https://rest_api_root/v1/project/work_items/63761fee31caaf77189816b4",
        "identifier": "WTF-5",
        "title": "这是一个阶段",
        "type": "630da48bc9443b1aa94ce3ee",
        "start_at": 1583290309,
        "end_at": 1583290347,
        "parent_id": "5edca524cad2fa1125cb0629",
        "short_id": "c9WqLmTO",
        "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
        "properties": {
            "prop_a": "prop_a_value",
            "prop_b": "prop_b_value"
        }
    },
    "created_at": 1668685806,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1668685806,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_archived": 0,
    "is_deleted": 0
}
```

### 创建一个工作项工时

**接口:** `POST https://rest_api_root/v1/project/workloads`

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `work_item_id` | String | 是 | 工作项的id。 |
| `workload_type_id` | String | 是 | 工时类型的id。 |
| `duration` | Number | 是 | 时长。时长的单位是小时。数值可以是为0-24之间，最多包含一位小数的正数。 |
| `report_at` | Number | 是 | 登记日期。该值为十位数字组成的时间戳，会被转换为该时间当天的零点零分零秒。 |
| `report_by` | String | 否 | 登记人，企业鉴权时必填。个人鉴权时不需要传递，即使传递了也会被忽略。 |
| `description` | String | 否 | 工时的描述信息。 |

#### Parameters Examples
**请求示例：**
```json
{
    "work_item_id": "5edca524cad2fa1125cb0630",
    "workload_type_id": "5a86eaf6a72585327ea46fge0",
    "duration": 8,
    "report_at": 1593290347,
    "report_by": "a0417f68e846aae315c85d24643678a9",
    "description": "这是一个工时"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "5f168f764eba01a5278b87cd",
    "url": "https://rest_api_root/v1/project/workloads/5f168f764eba01a5278b87cd",
    "project": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
        "identifier": "SCR",
        "name": "Scrum项目",
        "type": "scrum",
        "is_archived": 0,
        "is_deleted": 0
    },
    "work_item": {
        "id": "5edca524cad2fa1125cb0630",
        "url": "https://rest_api_root/v1/project/work_items/5edca524cad2fa1125cb0630",
        "identifier": "SCR-5",
        "title": "这是一个缺陷",
        "type": "bug",
        "start_at": 1583290309,
        "end_at": 1583290347,
        "parent_id": "5edca524cad2fa1125cb0629",
        "short_id": "c9WqLmTO",
        "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
        "properties": {
            "prop_a": "prop_a_value",
            "prop_b": "prop_b_value"
        }
    },
    "type": {
        "id": "5a86eaf6a72585327ea46fge0",
        "url": "https://rest_api_root/v1/project/workload_types/5a86eaf6a72585327ea46fge0",
        "name": "研发",
        "color": "#56ABF"
    },
    "duration": 8,
    "description": "这是一个工时",
    "report_at": 1593290347,
    "report_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "created_at": 1593290347
}
```

### 删除一个工作项

**接口:** `DELETE https://rest_api_root/v1/project/work_items/{work_item_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `work_item_id` | String | 是 | 工作项的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "5edca5d2fa112b06305c24ca",
    "url": "https://rest_api_root/v1/project/work_items/5edca5d2fa112b06305c24ca",
    "project": {
        "id": "5eb623f6a70571487ea41919",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919",
        "identifier": "KB",
        "name": "看板项目",
        "type": "kanban",
        "is_archived": 0,
        "is_deleted": 0
    },
    "identifier": "KB-1",
    "title": "这是一个事务",
    "type": "issue",
    "start_at": 1583290309,
    "end_at": 1583290347,
    "short_id": "c9WqLmTO",
    "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
    "assignee": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "versions": null,
    "sprint": null,
    "state": {
        "id": "5c9b35de90ad7153c2062f18",
        "url": "https://rest_api_root/v1/project/work_item_states/5c9b35de90ad7153c2062f18",
        "name": "新建",
        "type": "pending",
        "color": "#ff7575"
    },
    "priority": {
        "id": "5eb623f6a70571487ea47111",
        "url": "https://rest_api_root/v1/project/work_item_priorities/5eb623f6a70571487ea47111",
        "name": "最高"
    },
    "board": {
        "id": "5eb623f6a70571487ea47222",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919/boards/5eb623f6a70571487ea47222",
        "name": "kanban",
        "work_item_types": [
            "epic",
            "feature",
            "issue",
            "story"
        ]
    },
    "entry": {
        "id": "5ee1c4fac5b3c51206f0a861",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919/boards/5eb623f6a70571487ea47222/entries/5ee1c4fac5b3c51206f0a861",
        "name": "需求池"
    },
    "swimlane": {
        "id": "5ee1c4fac5b3c51206f0a866",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919/boards/5eb623f6a70571487ea47222/swimlanes/5ee1c4fac5b3c51206f0a866",
        "name": "默认泳道"
    },
    "phase": null,
    "description": "这是一个事务的描述",
    "completed_at": 1583290347,
    "story_points": null,
    "estimated_workload": 1,
    "remaining_workload": 1,
    "properties": {
        "prop_a": "prop_a_value",
        "prop_b": "prop_b_value",
        "entry_status": null,
        "entry_position": null,
        "operation_time": 1691571221
    },
    "tags": [
        {
            "id": "5e6b35de50ef8153c2062f70",
            "url": "https://rest_api_root/v1/project/tags/5e6b35de50ef8153c2062f70",
            "name": "标签-1"
        }
    ],
    "participants": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=work_item&principal_id=5edca5d2fa112b06305c24ca",
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        }
    ],
    "created_at": 1583290300,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1583290300,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_archived": 0,
    "is_deleted": 1
}
```

### 删除一个工作项交付目标

**接口:** `DELETE https://rest_api_root/v1/project/deliverables/{deliverable_target_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `deliverable_target_id` | String | 是 | 工作项交付目标的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "63761fee31caaf7718981876",
    "url": "https://rest_api_root/v1/project/deliverables/63761fee31caaf7718981876",
    "name": "阶段交付目标",
    "content_type": "link",
    "content": {
        "name": "PingCode",
        "href": "https://www.pingcode.com"
    },
    "project": {
        "id": "6375cc81e3004de4ea14aa52",
        "url": "https://rest_api_root/v1/project/projects/6375cc81e3004de4ea14aa52",
        "identifier": "WTF",
        "name": "瀑布项目",
        "type": "waterfall",
        "is_archived": 0,
        "is_deleted": 0
    },
    "work_item": {
        "id": "63761fee31caaf77189816b4",
        "url": "https://rest_api_root/v1/project/work_items/63761fee31caaf77189816b4",
        "identifier": "WTF-5",
        "title": "这是一个阶段",
        "type": "630da48bc9443b1aa94ce3ee",
        "start_at": 1583290309,
        "end_at": 1583290347,
        "parent_id": "5edca524cad2fa1125cb0629",
        "short_id": "c9WqLmTO",
        "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
        "properties": {
            "prop_a": "prop_a_value",
            "prop_b": "prop_b_value"
        }
    },
    "created_at": 1668685806,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1668685806,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_archived": 0,
    "is_deleted": 1
}
```

### 删除一个工作项工时

**接口:** `DELETE https://rest_api_root/v1/project/workloads/{workload_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `workload_id` | String | 是 | 工时的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "5f168f764eba01a5278b87cd",
    "url": "https://rest_api_root/v1/project/workloads/5f168f764eba01a5278b87cd",
    "project": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
        "identifier": "SCR",
        "name": "Scrum项目",
        "type": "scrum",
        "is_archived": 0,
        "is_deleted": 0
    },
    "work_item": {
        "id": "5edca524cad2fa1125cb0630",
        "url": "https://rest_api_root/v1/project/work_items/5edca524cad2fa1125cb0630",
        "identifier": "SCR-5",
        "title": "这是一个缺陷",
        "type": "bug",
        "start_at": 1583290309,
        "end_at": 1583290347,
        "parent_id": "5edca524cad2fa1125cb0629",
        "short_id": "c9WqLmTO",
        "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
        "properties": {
            "prop_a": "prop_a_value",
            "prop_b": "prop_b_value"
        }
    },
    "type": {
        "id": "5a86eaf6a72585327ea46fge0",
        "url": "https://rest_api_root/v1/project/workload_types/5a86eaf6a72585327ea46fge0",
        "name": "研发",
        "color": "#56ABF"
    },
    "duration": 8,
    "description": "这是一个工时",
    "report_at": 1593290347,
    "report_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "created_at": 1593290347
}
```

### 取消关联一个工作项

**接口:** `DELETE https://rest_api_root/v1/project/work_items/{work_item_id}/relations/{relation_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `work_item_id` | String | 是 | 工作项的id。 |
| `relation_id` | String | 是 | 工作项关联的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "58fb35de50ef8153c2062e36",
    "url": "https://rest_api_root/v1/project/work_items/5edca524cad2b06305cfa112/relations/58fb35de50ef8153c2062e36",
    "relation_type": "relate",
    "origin_work_item": {
        "id": "5edca524cad2b06305cfa112",
        "url": "https://rest_api_root/v1/project/work_items/5edca524cad2b06305cfa112",
        "identifier": "SCR-4",
        "title": "这是一个任务",
        "type": "task",
        "start_at": 1583290309,
        "end_at": 1583290347,
        "parent_id": "5edca524cad2fa1125cb0629",
        "short_id": "c9WqLmTO",
        "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
        "properties": {
            "prop_a": "prop_a_value",
            "prop_b": "prop_b_value"
        }
    },
    "target_work_item": {
        "id": "5f9a65ef20ef8153c1462e64",
        "url": "https://rest_api_root/v1/project/work_items/5f9a65ef20ef8153c1462e64",
        "identifier": "SCR-5",
        "title": "这是一个缺陷",
        "type": "bug",
        "start_at": 1583290309,
        "end_at": 1583290347,
        "parent_id": null,
        "short_id": "a9WqLmTO",
        "html_url": "https://yctech.pingcode.com/pjm/workitems/a9WqLmTO",
        "properties": {
            "prop_a": "prop_a_value",
            "prop_b": "prop_b_value"
        }
    }
}
```

### 向工作项中添加一个标签

**接口:** `POST https://rest_api_root/v1/project/work_items/{work_item_id}/tags`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `work_item_id` | String | 是 | 工作项的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `tag_id` | String | 是 | 标签的id。 |

#### Parameters Examples
**请求示例：**
```json
{
    "tag_id": "5e6b35de50ef8153c2062f70"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "5e6b35de50ef8153c2062f70",
    "url": "https://rest_api_root/v1/project/work_items/5edca524cad2fa1125cb0630/tags/5e6b35de50ef8153c2062f70",
    "work_item": {
        "id": "5edca524cad2fa1125cb0630",
        "url": "https://rest_api_root/v1/project/work_items/5edca524cad2fa1125cb0630",
        "identifier": "SCR-5",
        "title": "这是一个缺陷",
        "type": "bug",
        "start_at": 1583290309,
        "end_at":1583290347,
        "parent_id": "5edca524cad2fa112b05105c",
        "short_id": "c9WqLmTO",
        "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
        "properties": {
            "prop_a": "prop_a_value",
            "prop_b": "prop_b_value"
        }
    },
    "tag": {
        "id": "5e6b35de50ef8153c2062f70",
        "url": "https://rest_api_root/v1/project/tags/5e6b35de50ef8153c2062f70",
        "name": "标签-1"
    }
}
```

### 在工作项中移除一个标签

**接口:** `DELETE https://rest_api_root/v1/project/work_items/{work_item_id}/tags/{tag_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `work_item_id` | String | 是 | 工作项的id。 |
| `tag_id` | String | 是 | 标签的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "5e6b35de50ef8153c2062f70",
    "url": "https://rest_api_root/v1/project/work_items/5edca524cad2fa1125cb0630/tags/5e6b35de50ef8153c2062f70",
    "work_item": {
        "id": "5edca524cad2fa1125cb0630",
        "url": "https://rest_api_root/v1/project/work_items/5edca524cad2fa1125cb0630",
        "identifier": "SCR-5",
        "title": "这是一个缺陷",
        "type": "bug",
        "start_at": 1583290309,
        "end_at":1583290347,
        "parent_id": "5edca524cad2fa112b05105c",
        "short_id": "c9WqLmTO",
        "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
        "properties": {
            "prop_a": "prop_a_value",
            "prop_b": "prop_b_value"
        }
    },
    "tag": {
        "id": "5e6b35de50ef8153c2062f70",
        "url": "https://rest_api_root/v1/project/tags/5e6b35de50ef8153c2062f70",
        "name": "标签-1"
    }
}
```

### 批量部分更新工作项属性

**接口:** `PATCH https://rest_api_root/v1/project/work_items`

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `ids` | String[] | 是 | 需要更新的工作项的id列表。最多可以批量更新100个工作项。 |
| `property_name` | String | 是 | 需要更新的工作项属性名。<br>可选值: `title`, `start_at`, `end_at`, `description`, `priority_id`, `assignee_id`, `state_id`, `story_points`, `estimated_workload`, `remaining_workload`, `自定义属性` |
| `property_value` | String | 否 | 需要更新的工作项属性值。 |

#### Parameters Examples
**请求示例：**
```json
{
    "ids": [
        "547000eb6a70571487623fea"
    ],
    "property_name": "title",
    "property_value": "这是一个工作项"
}
```

#### Success Examples
**响应示例：**
```json
{
    "inserts": 0,
    "updates": 1,
    "deletes": 0
}
```

### 获取关联的工作项列表

**接口:** `GET https://rest_api_root/v1/project/work_items/{work_item_id}/relations`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `work_item_id` | String | 是 | 工作项的id。 |

**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `relation_type` | String | 否 | 关联的类型。<br>可选值: `mention`, `clone`, `cloned_by`, `duplicate`, `relate`, `cause`, `caused_by`, `block`, `blocked_by`, `dependency`, `自定义关联类型的id` |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "58fb35de50ef8153c2062e36",
            "url": "https://rest_api_root/v1/project/work_items/5edca524cad2b06305cfa112/relations/58fb35de50ef8153c2062e36",
            "relation_type": "relate",
            "origin_work_item": {
                "id": "5edca524cad2b06305cfa112",
                "url": "https://rest_api_root/v1/project/work_items/5edca524cad2b06305cfa112",
                "identifier": "SCR-4",
                "title": "这是一个任务",
                "type": "task",
                "start_at": 1583290309,
                "end_at": 1583290347,
                "parent_id": "5edca524cad2fa1125cb0629",
                "short_id": "c9WqLmTO",
                "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
                "properties": {
                    "prop_a": "prop_a_value",
                    "prop_b": "prop_b_value"
                }
            },
            "target_work_item": {
                "id": "5f9a65ef20ef8153c1462e64",
                "url": "https://rest_api_root/v1/project/work_items/5f9a65ef20ef8153c1462e64",
                "identifier": "SCR-5",
                "title": "这是一个缺陷",
                "type": "bug",
                "start_at": 1583290309,
                "end_at": 1583290347,
                "parent_id": null,
                "short_id": "a9WqLmTO",
                "html_url": "https://yctech.pingcode.com/pjm/workitems/a9WqLmTO",
                "properties": {
                    "prop_a": "prop_a_value",
                    "prop_b": "prop_b_value"
                }
            }
        }
    ]
}
```

### 获取工作项交付目标列表

**接口:** `GET https://rest_api_root/v1/project/deliverables`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 否 | 项目的id。项目类型必须为waterfall或hybrid。 |
| `work_item_id` | String | 否 | 工作项的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 2,
    "values": [
        {
            "id": "63761fee31caaf7718981876",
            "url": "https://rest_api_root/v1/project/deliverables/63761fee31caaf7718981876",
            "name": "阶段交付目标",
            "content_type": "link",
            "content": {
                "name": "PingCode",
                "href": "https://www.pingcode.com"
            },
            "project": {
                "id": "6375cc81e3004de4ea14aa52",
                "url": "https://rest_api_root/v1/project/projects/6375cc81e3004de4ea14aa52",
                "identifier": "WTF",
                "name": "瀑布项目",
                "type": "waterfall",
                "is_archived": 0,
                "is_deleted": 0
            },
            "work_item": {
                "id": "63761fee31caaf77189816b4",
                "url": "https://rest_api_root/v1/project/work_items/63761fee31caaf77189816b4",
                "identifier": "WTF-5",
                "title": "这是一个阶段",
                "type": "630da48bc9443b1aa94ce3ee",
                "start_at": 1583290309,
                "end_at": 1583290347,
                "parent_id": "5edca524cad2fa1125cb0629",
                "short_id": "c9WqLmTO",
                "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
                "properties": {
                   "prop_a": "prop_a_value",
                   "prop_b": "prop_b_value"
                }
            },
            "created_at": 1668685806,
            "created_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "updated_at": 1668685806,
            "updated_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "is_archived": 0,
            "is_deleted": 0
        },
        {
            "id": "63761fee31caaf7718981877",
            "url": "https://rest_api_root/v1/project/deliverables/63761fee31caaf7718981877",
            "name": "缺陷交付目标",
            "content_type": "attachment",
            "content": {
                "id": "64abd9050461799795b6ea3e",
                "url": "https://rest_api_root/v1/attachments/64abd9050461799795b6ea3e?deliverable_target_id=63761fee31caaf7718981877",
                "title": "fixed.png",
                "size": 11396,
                "type": "file"
            },
            "project": {
                "id": "6375cc81e3004de4ea14aa52",
                "url": "https://rest_api_root/v1/project/projects/6375cc81e3004de4ea14aa52",
                "identifier": "WTF",
                "name": "瀑布项目",
                "type": "waterfall",
                "is_archived": 0,
                "is_deleted": 0
            },
            "work_item": {
                "id": "63761fee31caaf77189816b5",
                "url": "https://rest_api_root/v1/project/work_items/63761fee31caaf77189816b5",
                "identifier": "WTF-6",
                "title": "这是一个缺陷",
                "type": "bug",
                "start_at": 1583290319,
                "end_at": 1583290357,
                "parent_id": "5edca524cad2fa1125cb0623",
                "short_id": "c9WqLmTO",
                "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
                "properties": {
                    "prop_a": "prop_a_value",
                    "prop_b": "prop_b_value"
                }
            },
            "created_at": 1668685816,
            "created_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "updated_at": 1668685816,
            "updated_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "is_archived": 0,
            "is_deleted": 0
        }
    ]
}
```

### 获取工作项优先级列表

**接口:** `GET https://rest_api_root/v1/project/work_item/priorities?project_id={project_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

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
            "id": "5eb623f6a70571487ea47111",
            "url": "https://rest_api_root/v1/project/work_item_priorities/5eb623f6a70571487ea47111",
            "name": "最高"
        }
    ]
}
```

### 获取工作项关联类型列表

**接口:** `GET https://rest_api_root/v1/project/work_item/relation_types`

**权限:** 企业令牌/用户令牌

#### Success Examples
**响应示例：**
```json
{
    "page_index": 0,
    "page_size": 30,
    "total": 1,
    "values": [
        {
            "id": "676510af06fd48a4a4e12616",
            "url": "https://rest_api_root/v1/project/work_item/relation_types/676510af06fd48a4a4e12616",
            "name": "重复",
            "category": "duplicate",
            "is_system": 1
        }
    ]
}
```

### 获取工作项列表

**接口:** `GET https://rest_api_root/v1/project/work_items`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `identifier` | String | 否 | 工作项编号。 |
| `project_ids` | String | 否 | 项目的id，使用','分割，最多只能20个。 |
| `type_ids` | String | 否 | 工作项类型的id。工作项类型分为9种系统类型和一些自定义类型。系统类型包括：史诗、特性、用户故事、阶段、里程碑、需求、任务、缺陷和事务。可以通过获取全部工作项类型列表获得。最多只能20个。 |
| `parent_ids` | String | 否 | 父工作项的id，使用','分割，最多只能20个。 |
| `assignee_ids` | String | 否 | 工作项负责人的id，使用','分割，最多只能20个。 |
| `state_ids` | String | 否 | 工作项状态的id，使用','分割，最多只能20个。 |
| `start_between` | String | 否 | 开始时间介于的时间范围，通过','分割起始时间。比如1580000000,1590000000表示开始时间介于两个时间之间；,1590000000表示开始时间小于该时间；1580000000表示开始时间大于该时间。 |
| `end_between` | String | 否 | 结束时间介于的时间范围，通过','分割起始时间。使用方式参考开始时间。 |
| `priority_ids` | String | 否 | 工作项优先级的id，使用','分割，最多只能20个。 |
| `bug_type_ids` | String | 否 | 缺陷类别的id，使用','分割，最多只能20个。 |
| `tag_ids` | String | 否 | 工作项标签的id，使用','分割，最多只能20个。 |
| `sprint_ids` | String | 否 | 迭代的id，使用','分割，最多只能20个。 |
| `board_ids` | String | 否 | 看板的id，使用','分割，最多只能20个。 |
| `entry_ids` | String | 否 | 看板栏的id，使用','分割，最多只能20个。 |
| `swimlane_ids` | String | 否 | 泳道的id，使用','分割，最多只能20个。 |
| `phase_ids` | String | 否 | 所属计划的id，使用','分割，最多只能20个。 |
| `version_ids` | String | 否 | 发布的id，使用','分割，最多只能20个。 |
| `created_by_ids` | String | 否 | 创建人的id，使用','分割，最多只能20个。 |
| `created_between` | String | 否 | 创建时间介于的时间范围，通过','分割起始时间。使用方式参考开始时间。 |
| `updated_between` | String | 否 | 更新时间介于的时间范围，通过','分割起始时间。使用方式参考开始时间。 |
| `participant_id` | String | 否 | 工作项关注人的id。 |
| `keywords` | String | 否 | 关键字。支持工作项编号和工作项标题。 |
| `include_public_image_token` | String | 否 | 包含获取图片资源token的属性。使用','分割，最多只能20个，支持description和自定义多行文本类型的属性。参数示例description,properties.prop_b。 |
| `include_deleted` | Boolean | 否 | 是否查询已删除的工作项。该值默认为false。 |
| `include_archived` | Boolean | 否 | 是否查询已归档的工作项。该值默认为false。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 4,
    "values": [
        {
            "id": "5edca524cad2fa112b06305c",
            "url": "https://rest_api_root/v1/project/work_items/5edca524cad2fa112b06305c",
            "project": {
                "id": "5eb623f6a70571487ea47000",
                "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
                "identifier": "SCR",
                "name": "Scrum项目",
                "type": "scrum",
                "is_archived": 0,
                "is_deleted": 0
            },
            "identifier": "SCR-1",
            "title": "这是一个史诗",
            "type": "epic",
            "start_at": 1583290309,
            "end_at": 1583290347,
            "parent_id": null,
            "short_id": "d9WqLmTO",
            "html_url": "https://yctech.pingcode.com/pjm/workitems/d9WqLmTO",
            "parent": null,
            "assignee": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "versions": null,
            "sprint": null,
            "state": {
                "id": "5c9b35de90ad7153c2062f18",
                "url": "https://rest_api_root/v1/project/work_item_states/5c9b35de90ad7153c2062f18",
                "name": "新建",
                "type": "pending",
                "color": "#ff7575"
            },
            "priority": {
                "id": "5eb623f6a70571487ea47111",
                "url": "https://rest_api_root/v1/project/work_item_priorities/5eb623f6a70571487ea47111",
                "name": "最高"
            },
            "board": null,
            "entry": null,
            "swimlane": null,
            "phase": null,
            "description": "这是一个史诗的描述",
            "completed_at": 1583290347,
            "story_points": null,
            "estimated_workload": 1,
            "remaining_workload": 1,
            "properties": {
                "prop_a": "prop_a_value",
                "prop_b": "prop_b_value",
                "risk": null,
                "business_value": null,
                "effort": 123,
                "backlog_from": null
            },
            "tags": [
                {
                    "id": "5e6b35de50ef8153c2062f70",
                    "url": "https://rest_api_root/v1/project/tags/5e6b35de50ef8153c2062f70",
                    "name": "标签-1"
                }
            ],
            "participants": [
                {
                    "id": "a0417f68e846aae315c85d24643678a9",
                    "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=work_item&principal_id=5edca524cad2fa112b06305c",
                    "type": "user",
                    "user": {
                        "id": "a0417f68e846aae315c85d24643678a9",
                        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                        "name": "john",
                        "display_name": "John",
                        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
                    }
                }
            ],
            "public_image_token": "73UNZyxnxUVvzKXe6KMs7ZUsEaTx3AGaBP3-Y9GE-Df",
            "created_at": 1583290300,
            "created_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "updated_at": 1583290300,
            "updated_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "is_archived": 0,
            "is_deleted": 0
        },
        {
            "id": "5edfa3b67463c1ee626c0979",
            "url": "https://rest_api_root/v1/project/work_items/5edfa3b67463c1ee626c0979",
            "project": {
                "id": "5eb623f6a70571487ea47000",
                "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
                "identifier": "SCR",
                "name": "Scrum项目",
                "type": "scrum",
                "is_archived": 0,
                "is_deleted": 0
            },
            "identifier": "SCR-2",
            "title": "这是一个特性",
            "type": "feature",
            "start_at": 1583290309,
            "end_at": 1583290347,
            "parent_id": "5edca524cad2fa112b06305c",
            "short_id": "a9WqLmTO",
            "html_url": "https://yctech.pingcode.com/pjm/workitems/a9WqLmTO",
            "parent": {
                "id": "5edca524cad2fa112b06305c",
                "url": "https://rest_api_root/v1/project/work_items/5edca524cad2fa112b06305c",
                "identifier": "SCR-1",
                "title": "这是一个史诗",
                "type": "epic",
                "start_at": 1583290309,
                "end_at": 1583290347,
                "parent_id": null,
                "properties": {
                    "prop_a": "prop_a_value",
                    "prop_b": "prop_b_value",
                    "risk": null,
                    "business_value": null,
                    "effort": null,
                    "backlog_type": null,
                    "backlog_from": null
                }
            },
            "assignee": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "versions": [
                {
                   "id": "5eb623487ea47001f6a70571",
                   "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/versions/5eb623487ea47001f6a70571",
                   "name": "1.0.1",
                   "start_at": 1565255712,
                   "end_at": 1565255879,
                   "stage": {
                       "id": "5f44a8f8bb347b14b49624a1",
                       "url": "https://rest_api_root/v1/project/stages/5f44a8f8bb347b14b49624a1",
                       "name": "未开始",
                       "type": "pending",
                       "color": "#FA8888"
                   }
                }
            ],
            "sprint": null,
            "state": {
                "id": "5c9b35de90ad7153c2062f18",
                "url": "https://rest_api_root/v1/project/work_item_states/5c9b35de90ad7153c2062f18",
                "name": "新建",
                "type": "pending",
                "color": "#ff7575"
            },
            "priority": {
                "id": "5eb623f6a70571487ea47111",
                "url": "https://rest_api_root/v1/project/work_item_priorities/5eb623f6a70571487ea47111",
                "name": "最高"
            },
            "board": null,
            "entry": null,
            "swimlane": null,
            "phase": null,
            "description": "这是一个特性的描述",
            "completed_at": 1583290347,
            "story_points": null,
            "estimated_workload": 1,
            "remaining_workload": 1,
            "properties": {
                "prop_a": "prop_a_value",
                "prop_b": "prop_b_value",
                "risk": null,
                "business_value": null,
                "effort": null,
                "backlog_type": null,
                "backlog_from": null
            },
            "tags": [
                {
                    "id": "5e6b35de50ef8153c2062f70",
                    "url": "https://rest_api_root/v1/project/tags/5e6b35de50ef8153c2062f70",
                    "name": "标签-1"
                }
            ],
            "participants": [
                {
                    "id": "a0417f68e846aae315c85d24643678a9",
                    "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=work_item&principal_id=5edfa3b67463c1ee626c0979",
                    "type": "user",
                    "user": {
                        "id": "a0417f68e846aae315c85d24643678a9",
                        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                        "name": "john",
                        "display_name": "John",
                        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
                    }
                }
            ],
            "public_image_token": "73UNZyxnxUVvzKXe6KMs7ZUsEaTx3AGaBP3-Y9GE-fC",
            "created_at": 1583290300,
            "created_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "updated_at": 1583290300,
            "updated_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "is_archived": 1,
            "is_deleted": 1
        },
        {
            "id": "5edca112b06305c524cad2fa",
            "url": "https://rest_api_root/v1/project/work_items/5edca112b06305c524cad2fa",
            "project": {
                "id": "5eb623f6a70571487ea47000",
                "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
                "identifier": "SCR",
                "name": "Scrum项目",
                "type": "scrum",
                "is_archived": 0,
                "is_deleted": 0
            },
            "identifier": "SCR-3",
            "title": "这是一个用户故事",
            "type": "story",
            "start_at": 1583290309,
            "end_at": 1583290347,
            "parent_id": "5edfa3b67463c1ee626c0979",
            "short_id": "b9WqLmTO",
            "html_url": "https://yctech.pingcode.com/pjm/workitems/b9WqLmTO",
            "parent": {
                "id": "5edfa3b67463c1ee626c0979",
                "url": "https://rest_api_root/v1/project/work_items/5edfa3b67463c1ee626c0979",
                "identifier": "SCR-2",
                "title": "这是一个特性",
                "type": "feature",
                "start_at": 1583290309,
                "end_at": 1583290347,
                "parent_id": "5edca524cad2fa112b06305g",
                "properties": {
                    "prop_a": "prop_a_value",
                    "prop_b": "prop_b_value",
                    "risk": null,
                    "business_value": null,
                    "effort": null,
                    "backlog_type": null,
                    "backlog_from": null
                }
            },
            "assignee": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "versions": [
                {
                   "id": "5eb623487ea47001f6a70571",
                   "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/versions/5eb623487ea47001f6a70571",
                   "name": "1.0.1",
                   "start_at": 1565255712,
                   "end_at": 1565255879,
                   "stage": {
                       "id": "5f44a8f8bb347b14b49624a1",
                       "url": "https://rest_api_root/v1/project/stages/5f44a8f8bb347b14b49624a1",
                       "name": "未开始",
                       "type": "pending",
                       "color": "#FA8888"
                   }
                }
            ],
            "sprint": {
                "id": "5ecf7b74eaab845a2aa53138",
                "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/sprints/5ecf7b74eaab845a2aa53138",
                "name": "Sprint 1",
                "start_at": 1589791860,
                "end_at": 1589791860,
                "status": "completed"
            },
            "state": {
                "id": "5c9b35de90ad7153c2062f18",
                "url": "https://rest_api_root/v1/project/work_item_states/5c9b35de90ad7153c2062f18",
                "name": "新建",
                "type": "pending",
                "color": "#ff7575"
            },
            "priority": {
                "id": "5eb623f6a70571487ea47111",
                "url": "https://rest_api_root/v1/project/work_item_priorities/5eb623f6a70571487ea47111",
                "name": "最高"
            },
            "board": null,
            "entry": null,
            "swimlane": null,
            "phase": null,
            "description": "这是一个用户故事的描述",
            "completed_at": 1583290347,
            "story_points": 1,
            "estimated_workload": 1,
            "remaining_workload": 1,
            "properties": {
                "prop_a": "prop_a_value",
                "prop_b": "prop_b_value",
                "risk": null,
                "backlog_type": null,
                "backlog_from": null
            },
            "tags": [
                {
                    "id": "5e6b35de50ef8153c2062f70",
                    "url": "https://rest_api_root/v1/project/tags/5e6b35de50ef8153c2062f70",
                    "name": "标签-1"
                }
            ],
            "participants": [
                {
                    "id": "a0417f68e846aae315c85d24643678a9",
                    "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=work_item&principal_id=5edca112b06305c524cad2fa",
                    "type": "user",
                    "user": {
                        "id": "a0417f68e846aae315c85d24643678a9",
                        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                        "name": "john",
                        "display_name": "John",
                        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
                    }
                }
            ],
            "public_image_token": "73UNZyxnxUVvzKXe6KMs7ZUsEaTx3AGaBP3-Y9GE-Hm",
            "created_at": 1583290300,
            "created_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "updated_at": 1583290300,
            "updated_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "is_archived": 0,
            "is_deleted": 0
        },
        {
            "id": "5edca5d2fa112b06305c24ca",
            "url": "https://rest_api_root/v1/project/work_items/5edca5d2fa112b06305c24ca",
            "project": {
                "id": "6375cc81e3004de4ea14aa52",
                "url": "http://rest_api_root/v1/project/projects/6375cc81e3004de4ea14aa52",
                "identifier": "WTF",
                "name": "瀑布项目",
                "type": "waterfall",
                "is_archived": 0,
                "is_deleted": 0
            },
            "identifier": "WTF-2",
            "title": "这是一个瀑布项目下需求类型的工作项",
            "type": "630da48bc9443b1aa94ce3ea",
            "start_at": 1583290309,
            "end_at": 1583290347,
            "short_id": "c9WqLmTO",
            "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
            "assignee": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "versions": null,
            "sprint": null,
            "state": {
                "id": "5c9b35de90ad7153c2062f18",
                "url": "https://rest_api_root/v1/project/work_item_states/5c9b35de90ad7153c2062f18",
                "name": "新建",
                "type": "pending",
                "color": "#ff7575"
            },
            "priority": {
                "id": "5eb623f6a70571487ea47111",
                "url": "https://rest_api_root/v1/project/work_item_priorities/5eb623f6a70571487ea47111",
                "name": "最高"
            },
            "board": null,
            "entry": null,
            "swimlane": null,
            "phase": {
                "id": "63761fee31caaf77189816b4",
                "url": "http://rest_api_root/v1/project/projects/63761fee31caaf7718981698/phases/63761fee31caaf77189816b4",
                "title": "这是一个阶段",
                "identifier": "WTF-1"
            },
            "description": "这是一个瀑布项目下需求类型的工作项描述",
            "completed_at": 1583290347,
            "story_points": null,
            "estimated_workload": 1,
            "remaining_workload": 1,
            "properties": {
                "prop_a": "prop_a_value",
                "prop_b": "prop_b_value",
                "backlog_type": null,
                "backlog_from": null
            },
            "tags": [
                {
                    "id": "5e6b35de50ef8153c2062f70",
                    "url": "https://rest_api_root/v1/project/tags/5e6b35de50ef8153c2062f70",
                    "name": "标签-1"
                }
            ],
            "participants": [
                {
                    "id": "a0417f68e846aae315c85d24643678a9",
                    "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=work_item&principal_id=5edca112b06305c524cad2fa",
                    "type": "user",
                    "user": {
                        "id": "a0417f68e846aae315c85d24643678a9",
                        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                        "name": "john",
                        "display_name": "John",
                        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
                    }
                }
            ],
            "public_image_token": "73UNZyxnxUVvzKXe6KMs7ZUsEaTx3AGaBP3-Y9GE-Ki",
            "created_at": 1583290300,
            "created_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "updated_at": 1583290300,
            "updated_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "is_archived": 0,
            "is_deleted": 0
        },
        {
            "id": "6efca131b06329c524cdd2fb",
            "url": "https://rest_api_root/v1/project/work_items/6efca131b06329c524cdd2fb",
            "project": {
                "id": "5eb623f6a70571487ea47004",
                "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47004",
                "identifier": "HBR",
                "name": "Hybrid项目",
                "type": "hybrid",
                "is_archived": 0,
                "is_deleted": 0
            },
            "identifier": "HBR-1",
            "title": "这是一个用户故事",
            "type": "story",
            "start_at": 1583290309,
            "end_at": 1583290347,
            "parent_id": "5edfa3b67463c1ee626c0980",
            "short_id": "e9WqLmTO",
            "html_url": "https://yctech.pingcode.com/pjm/workitems/e9WqLmTO",
            "parent": {
                "id": "5edfa3b67463c1ee626c0980",
                "url": "https://rest_api_root/v1/project/work_items/5edfa3b67463c1ee626c0980",
                "identifier": "HBR-2",
                "title": "这是一个特性",
                "type": "feature",
                "start_at": 1583290309,
                "end_at": 1583290347,
                "parent_id": null,
                "properties": {
                   "prop_a": "prop_a_value",
                   "prop_b": "prop_b_value",
                   "risk": null,
                   "business_value": null,
                   "effort": null,
                   "backlog_type": null,
                   "backlog_from": null
                }
            },
            "assignee": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "versions": [
                {
                   "id": "5eb623487ea47001f6a70571",
                   "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/versions/5eb623487ea47001f6a70571",
                   "name": "1.0.1",
                   "start_at": 1565255712,
                   "end_at": 1565255879,
                   "stage": {
                       "id": "5f44a8f8bb347b14b49624a1",
                       "url": "https://rest_api_root/v1/project/stages/5f44a8f8bb347b14b49624a1",
                       "name": "未开始",
                       "type": "pending",
                       "color": "#FA8888"
                   }
                }
            ],
            "sprint": {
                "id": "5ecf7b74eaab845a2aa53139",
                "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47004/sprints/5ecf7b74eaab845a2aa53139",
                "name": "Sprint 1",
                "start_at": 1589791860,
                "end_at": 1589791860,
                "status": "completed"
            },
            "state": {
                "id": "5c9b35de90ad7153c2062f18",
                "url": "https://rest_api_root/v1/project/work_item_states/5c9b35de90ad7153c2062f18",
                "name": "新建",
                "type": "pending",
                "color": "#ff7575"
            },
            "priority": {
                "id": "5eb623f6a70571487ea47111",
                "url": "https://rest_api_root/v1/project/work_item_priorities/5eb623f6a70571487ea47111",
                "name": "最高"
            },
            "board": {
                "id": "5eb623f6a70571487ea47333",
                "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47004/boards/5eb623f6a70571487ea47333",
                "name": "kanban",
                "work_item_types": [
                   "epic",
                   "feature",
                   "issue",
                   "story"
                ]
            },
            "entry": {
                "id": "5ee1c4fac5b3c51206f0a862",
                "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47004/boards/5eb623f6a70571487ea47333/entries/5ee1c4fac5b3c51206f0a862",
                "name": "需求池"
            },
            "swimlane": {
                "id": "5ee1c4fac5b3c51206f0a867",
                "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47004/boards/5eb623f6a70571487ea47333/swimlanes/5ee1c4fac5b3c51206f0a867",
                "name": "默认泳道"
            },
            "phase": {
                "id": "63761fee31caaf77189816b5",
                "url": "http://rest_api_root/v1/project/projects/5eb623f6a70571487ea47004/phases/63761fee31caaf77189816b5",
                "title": "这是一个阶段",
                "identifier": "WTF-1"
            },
            "description": "<p>这是一个用户故事的描述<p><img src=\"https://atlas.pingcode.com/files/public/689a9d124df436ef91923a3a\" originUrl=\"https://atlas.pingcode.com/files/public/689a9d124df436ef91923a3a\" alt=\"图片.png\" size=\"35460\" style=\"text-align: center;\" />",
            "completed_at": 1583290347,
            "story_points": 1,
            "estimated_workload": 1,
            "remaining_workload": 1,
            "properties": {
                "prop_a": "prop_a_value",
                "prop_b": "prop_b_value",
                "risk": null,
                "backlog_type": null,
                "backlog_from": null
            },
            "tags": [
                {
                    "id": "5e6b35de50ef8153c2062f70",
                    "url": "https://rest_api_root/v1/project/tags/5e6b35de50ef8153c2062f70",
                    "name": "标签-1"
                }
            ],
            "participants": [
                {
                    "id": "a0417f68e846aae315c85d24643678a9",
                    "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=work_item&principal_id=5edca112b06305c524cad2fa",
                    "type": "user",
                    "user": {
                        "id": "a0417f68e846aae315c85d24643678a9",
                        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                        "name": "john",
                        "display_name": "John",
                        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
                    }
                }
            ],
            "public_image_token": "73UNZyxnxUVvzKXe6KMs7ZUsEaTx3AGaBP3-Y9GE-Ac",
            "created_at": 1583290300,
            "created_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "updated_at": 1583290300,
            "updated_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "is_archived": 0,
            "is_deleted": 0
        }
    ]
}
```

### 获取工作项属性列表

**接口:** `GET https://rest_api_root/v1/project/work_item/properties?project_id={project_id}&work_item_type_id={work_item_type_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |
| `work_item_type_id` | String | 是 | 工作项类型的id。工作项类型分为9种系统类型和一些自定义类型。系统类型包括：史诗、特性、用户故事、阶段、里程碑、需求、任务、缺陷和事务。可以通过获取全部工作项类型列表获得。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "severity",
            "url": "https://rest_api_root/v1/project/work_item/work_item_properties/severity",
            "name": "严重程度",
            "type": "select",
            "options": [
                {
                    "_id": "5efb1859110533727a82c603",
                    "text": "严重"
                },
                {
                    "_id": "5efb1859110533727a82c604",
                    "text": "一般"
                }
            ]
        },
        {
            "id": "identifier",
            "url": "https://rest_api_root/v1/project/work_item_properties/identifier",
            "name": "编号",
            "type": "text",
            "options": null
        }
    ]
}
```

### 获取工作项工时列表

**接口:** `GET https://rest_api_root/v1/project/workloads`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 否 | 项目的id。使用该参数过滤数据时，登记日期查询的起始时间和登记日期查询的结束时间的跨度最大为3个月。 |
| `work_item_id` | String | 否 | 工作项的id。 |
| `start_at` | String | 否 | 登记日期查询的起始时间。 |
| `end_at` | String | 否 | 登记日期查询的结束时间。 |
| `user_id` | String | 否 | 登记人的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "5f168f764eba01a5278b87cd",
            "url": "https://rest_api_root/v1/project/workloads/5f168f764eba01a5278b87cd",
            "project": {
                "id": "5eb623f6a70571487ea47000",
                "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
                "identifier": "SCR",
                "name": "Scrum项目",
                "type": "scrum",
                "is_archived": 0,
                "is_deleted": 0
            },
            "work_item": {
                "id": "5edca524cad2fa1125cb0630",
                "url": "https://rest_api_root/v1/project/work_items/5edca524cad2fa1125cb0630",
                "identifier": "SCR-5",
                "title": "这是一个缺陷",
                "type": "bug",
                "start_at": 1583290309,
                "end_at": 1583290347,
                "parent_id": "5edca524cad2fa1125cb0629",
                "short_id": "c9WqLmTO",
                "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
                "properties": {
                    "prop_a": "prop_a_value",
                    "prop_b": "prop_b_value"
                }
            },
            "type": {
                "id": "5a86eaf6a72585327ea46fge0",
                "url": "https://rest_api_root/v1/project/workload_types/5a86eaf6a72585327ea46fge0",
                "name": "研发",
                "color": "#56ABF"
            },
            "duration": 8,
            "description": "这是一个工时",
            "report_at": 1593290347,
            "report_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "created_at": 1593290347
        }
    ]
}
```

### 获取工作项工时类型列表

**接口:** `GET https://rest_api_root/v1/project/workload_types`

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
            "id": "5a86eaf6a72585327ea46fge0",
            "url": "https://rest_api_root/v1/project/workload_types/5a86eaf6a72585327ea46fge0",
            "name": "研发",
            "color": "#56ABFB"
        }
    ]
}
```

### 获取工作项标签列表

**接口:** `GET https://rest_api_root/v1/project/work_item/tags`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |
| `name` | String | 否 | 标签的名称。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "5e6b35de50ef8153c2062f70",
            "url": "https://rest_api_root/v1/project/work_item_tags/5e6b35de50ef8153c2062f70",
            "name": "标签-1"
        }
    ]
}
```

### 获取工作项流转记录列表

**接口:** `GET https://rest_api_root/v1/project/work_items/{work_item_id}/transition_histories`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `work_item_id` | String | 是 | 工作项的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "5e6b35de50ef8153c2062f70",
            "url": "https://rest_api_root/v1/project/work_items/5edca524cad2fa1125cb0630/transition_histories/5e6b35de50ef8153c2062f70",
            "work_item": {
                "id": "5edca524cad2fa1125cb0630",
                "url": "https://rest_api_root/v1/project/work_items/5edca524cad2fa1125cb0630",
                "identifier": "SCR-5",
                "title": "这是一个缺陷",
                "type": "bug",
                "start_at": 1674493200,
                "end_at": 1674493200,
                "parent_id": "5edca524cad2fa112b05105c",
                "short_id": "c9WqLmTO",
                "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
                "properties": {
                   "prop_a": "prop_a_value",
                   "prop_b": "prop_b_value"
                }
            },
            "from_state": {
                "id": "5c9b35de90ad7153c2062f18",
                "url": "https://rest_api_root/v1/project/work_item_states/5c9b35de90ad7153c2062f18",
                "name": "新建",
                "type": "pending",
                "color": "#56ABFB"
            },
            "to_state": {
                "id": "5ef85b1e9481936604da7f4c",
                "url": "https://rest_api_root/v1/project/work_item_states/5ef85b1e9481936604da7f4c",
                "name": "进行中",
                "type": "in_progress",
                "color": "#F6C659"
            },
            "created_at": 1674528614,
            "created_by": {
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

### 获取工作项状态列表

**接口:** `GET https://rest_api_root/v1/project/work_item/states?project_id={project_id}&work_item_type_id={work_item_type_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |
| `work_item_type_id` | String | 是 | 工作项类型的id。工作项类型分为9种系统类型和一些自定义类型。系统类型包括：史诗、特性、用户故事、阶段、里程碑、需求、任务、缺陷和事务。可以通过获取全部工作项类型列表获得。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "5c9b35de90ad7153c2062f18",
            "url": "https://rest_api_root/v1/project/work_item_states/5c9b35de90ad7153c2062f18",
            "name": "新建",
            "type": "pending",
            "color": "#ff7575"
        }
    ]
}
```

### 获取工作项类型列表

**接口:** `GET https://rest_api_root/v1/project/work_item/types?project_id={project_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |

#### Success Examples
**响应示例（scrum项目）：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 6,
    "values": [
        {
            "id": "epic",
            "url": "http://rest_api_root/v1/project/work_item_types/epic",
            "name": "史诗",
            "group": "requirement"
        },
        {
            "id": "feature",
            "url": "http://rest_api_root/v1/project/work_item_types/feature",
            "name": "特性",
            "group": "requirement"
        },
        {
            "id": "story",
            "url": "http://rest_api_root/v1/project/work_item_types/story",
            "name": "用户故事",
            "group": "requirement"
        },
        {
            "id": "task",
            "url": "http://rest_api_root/v1/project/work_item_types/task",
            "name": "任务",
            "group": "task"
        },
        {
            "id": "bug",
            "url": "http://rest_api_root/v1/project/work_item_types/bug",
            "name": "缺陷",
            "group": "bug"
        }
    ]
}
```

**响应示例（kanban项目）：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 6,
    "values": [
        {
            "id": "epic",
            "url": "http://rest_api_root/v1/project/work_item_types/epic",
            "name": "史诗",
            "group": "requirement"
        },
        {
            "id": "feature",
            "url": "http://rest_api_root/v1/project/work_item_types/feature",
            "name": "特性",
            "group": "requirement"
        },
        {
            "id": "story",
            "url": "http://rest_api_root/v1/project/work_item_types/story",
            "name": "用户故事",
            "group": "requirement"
        },
        {
            "id": "task",
            "url": "http://rest_api_root/v1/project/work_item_types/task",
            "name": "任务",
            "group": "task"
        },
        {
            "id": "bug",
            "url": "http://rest_api_root/v1/project/work_item_types/bug",
            "name": "缺陷",
            "group": "bug"
        },
        {
            "id": "issue",
            "url": "http://rest_api_root/v1/project/work_item_types/issue",
            "name": "事务",
            "group": "issue"
        }
    ]
}
```

**响应示例（waterfall项目）：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 6,
    "values": [
        {
            "id": "630da48bc9443b1aa94ce3ea",
            "url": "https://rest_api_root/v1/project/work_item_types/630da48bc9443b1aa94ce3ea",
            "name": "需求",
            "group": "requirement"
        },
        {
            "id": "task",
            "url": "https://rest_api_root/v1/project/work_item_types/task",
            "name": "任务",
            "group": "task"
        },
        {
            "id": "bug",
            "url": "https://rest_api_root/v1/project/work_item_types/bug",
            "name": "缺陷",
            "group": "bug"
        },
        {
            "id": "6385c650fef18f2d7222d15d",
            "url": "https://rest_api_root/v1/project/work_item_types/6385c650fef18f2d7222d15d",
            "name": "自定义",
            "group": "issue"
        },
        {
            "id": "630da48bc9443b1aa94ce3ee",
            "url": "https://rest_api_root/v1/project/work_item_types/630da48bc9443b1aa94ce3ee",
            "name": "阶段",
            "group": "plan"
        },
        {
            "id": "630da48bc9443b1aa94ce3ef",
            "url": "https://rest_api_root/v1/project/work_item_types/630da48bc9443b1aa94ce3ef",
            "name": "里程碑",
            "group": "plan"
        }
    ]
}
```

**响应示例（hybrid项目）：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total":9,
    "values": [
        {
            "id": "epic",
            "url": "http://rest_api_root/v1/project/work_item_types/epic",
            "name": "史诗",
            "group": "requirement"
        },
        {
            "id": "feature",
            "url": "http://rest_api_root/v1/project/work_item_types/feature",
            "name": "特性",
            "group": "requirement"
        },
        {
            "id": "story",
            "url": "http://rest_api_root/v1/project/work_item_types/story",
            "name": "用户故事",
            "group": "requirement"
        },
        {
            "id": "task",
            "url": "http://rest_api_root/v1/project/work_item_types/task",
            "name": "任务",
            "group": "task"
        },
        {
            "id": "bug",
            "url": "http://rest_api_root/v1/project/work_item_types/bug",
            "name": "缺陷",
            "group": "bug"
        },
        {
            "id": "issue",
            "url": "http://rest_api_root/v1/project/work_item_types/issue",
            "name": "事务",
            "group": "issue"
        },
        {
            "id": "630da48bc9443b1aa94ce3ea",
            "url": "https://rest_api_root/v1/project/work_item_types/630da48bc9443b1aa94ce3ea",
            "name": "需求",
            "group": "requirement"
        },
        {
            "id": "630da48bc9443b1aa94ce3ee",
            "url": "https://rest_api_root/v1/project/work_item_types/630da48bc9443b1aa94ce3ee",
            "name": "阶段",
            "group": "plan"
        },
        {
            "id": "630da48bc9443b1aa94ce3ef",
            "url": "https://rest_api_root/v1/project/work_item_types/630da48bc9443b1aa94ce3ef",
            "name": "里程碑",
            "group": "plan"
        },
        {
            "id": "6385c650fef18f2d7222d15d",
            "url": "https://rest_api_root/v1/project/work_item_types/6385c650fef18f2d7222d15d",
            "name": "自定义",
            "group": "issue"
        }
    ]
}
```

### 部分更新一个工作项

**接口:** `PATCH https://rest_api_root/v1/project/work_items/{work_item_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `work_item_id` | String | 是 | 工作项的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `title` | String | 否 | 工作项的标题。 |
| `description` | String | 否 | 工作项的描述。 |
| `start_at` | Number | 否 | 工作项的开始时间。当工作项类型为里程碑时，该参数无效。 |
| `end_at` | Number | 否 | 工作项的截止时间。 |
| `priority_id` | String | 否 | 工作项优先级的id。 |
| `state_id` | String | 否 | 工作项状态的id。工作项状态的id在设置时必须同时满足工作项类型的工作项状态方案和工作项状态流转的状态值才能成功完成设置。工作项状态方案可以通过获取工作项状态方案列表获取。工作项状态流转则可以通过获取状态方案中的工作项状态流转列表获取。 |
| `assignee_id` | String | 否 | 工作项负责人的id。 |
| `parent_id` | String | 否 | 工作项的父工作项的id。当前工作项类型支持的父工作类型包含parent_id对应的工作项类型时，该参数有效。具体配置见属性与视图子工作项配置。 |
| `version_ids` | String[] | 否 | 所属发布的id列表。 |
| `board_id` | String | 否 | 看板的id。该字段只有项目类型为kanban和hybrid时有效。 |
| `entry_id` | String | 否 | 看板栏的id。该字段只有项目类型为kanban和hybrid时有效。 |
| `swimlane_id` | String | 否 | 泳道的id。该字段只有项目类型为kanban和hybrid时有效。 |
| `phase_id` | String | 否 | 所属计划的id。该字段只有项目类型为waterfall和hybrid时有效。 |
| `story_points` | Number | 否 | 工作项的故事点。当工作项的属性在视图中配置了故事点属性时，该参数生效。故事点数值必须是大于等于0的整数或最多包含一位小数的正数。 |
| `estimated_workload` | Number | 否 | 工作项的预估工时。 |
| `remaining_workload` | Number | 否 | 工作项的剩余工时。 |
| `properties` | Object | 否 | 工作项属性的键值对集合，需要注意的是，当前工作项类型对应的工作项属性方案需要包含这些工作项属性，例如工作项属性方案中包含prop_a和prop_b。 |
| `properties.prop_a` | Object | 否 | 工作项属性prop_a。 |
| `properties.prop_b` | Object | 否 | 工作项属性prop_b。 |

#### Parameters Examples
**请求示例：**
```json
{
    "title": "这是一个用户故事",
    "description": "这是一个用户故事的描述",
    "start_at": 1583290309,
    "end_at": 1583290347,
    "sprint_id": "5ecf7b74eaab845a2aa53138",
    "version_ids": [
       "5eb623487ea47001f6a70571"
    ],
    "priority_id": "5eb623f6a70571487ea47111",
    "assignee_id": "a0417f68e846aae315c85d24643678a9",
    "story_points": 1,
    "state_id": "5c9b35de90ad7153c2062f18",
    "parent_id": "5edfa3b67463c1ee626c0979",
    "properties": {
        "prop_a": "prop_a_value",
        "prop_b": "prop_b_value"
    }
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "5edca112b06305c524cad2fa",
    "url": "https://rest_api_root/v1/project/work_items/5edca112b06305c524cad2fa",
    "project": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
        "identifier": "SCR",
        "name": "Scrum项目",
        "type": "scrum",
        "is_archived": 0,
        "is_deleted": 0
    },
    "identifier": "SCR-3",
    "title": "这是一个用户故事",
    "type": "story",
    "start_at": 1583290309,
    "end_at": 1583290347,
    "parent_id": "5edfa3b67463c1ee626c0979",
    "short_id": "b9WqLmTO",
    "html_url": "https://yctech.pingcode.com/pjm/workitems/b9WqLmTO",
    "parent": {
        "id": "5edfa3b67463c1ee626c0979",
        "url": "https://rest_api_root/v1/project/work_items/5edfa3b67463c1ee626c0979",
        "identifier": "SCR-2",
        "title": "这是一个特性",
        "type": "feature",
        "start_at": 1583290309,
        "end_at": 1583290347,
        "parent_id": "5edca524cad2fa112b06306c",
        "properties": {
            "prop_a": "prop_a_value",
            "prop_b": "prop_b_value",
            "risk": null,
            "business_value": null,
            "effort": null,
            "backlog_type": null,
            "backlog_from": null
        }
    },
    "assignee": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "versions": [
       {
          "id": "5eb623487ea47001f6a70571",
          "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/versions/5eb623487ea47001f6a70571",
          "name": "1.0.1",
          "start_at": 1565255712,
          "end_at": 1565255879,
          "stage": {
              "id": "5f44a8f8bb347b14b49624a1",
              "url": "https://rest_api_root/v1/project/stages/5f44a8f8bb347b14b49624a1",
              "name": "未开始",
              "type": "pending",
              "color": "#FA8888"
          }
       }
    ],
    "sprint": {
        "id": "5ecf7b74eaab845a2aa53138",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/sprints/5ecf7b74eaab845a2aa53138",
        "name": "Sprint 1",
        "start_at": 1589791860,
        "end_at": 1589791860,
        "status": "completed"
    },
    "state": {
        "id": "5c9b35de90ad7153c2062f18",
        "url": "https://rest_api_root/v1/project/work_item_states/5c9b35de90ad7153c2062f18",
        "name": "新建",
        "type": "pending",
        "color": "#ff7575"
    },
    "priority": {
        "id": "5eb623f6a70571487ea47111",
        "url": "https://rest_api_root/v1/project/work_item_priorities/5eb623f6a70571487ea47111",
        "name": "最高"
    },
    "board":null,
    "entry": null,
    "swimlane": null,
    "phase": null,
    "story_points": 1,
    "estimated_workload": 1,
    "remaining_workload": 1,
    "description": "这是一个用户故事的描述",
    "completed_at": 1583290347,
    "properties": {
        "prop_a": "prop_a_value",
        "prop_b": "prop_b_value",
        "risk": null,
        "backlog_type": null,
        "backlog_from": null
    },
    "tags": [],
    "participants": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=work_item&principal_id=5edca112b06305c524cad2fa",
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        }
    ],
    "created_at": 1583290300,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1583293300,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_archived": 0,
    "is_deleted": 0
}
```

### 部分更新一个工作项交付目标

**接口:** `PATCH https://rest_api_root/v1/project/deliverables/{deliverable_target_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `deliverable_target_id` | String | 是 | 工作项交付目标id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `work_item_id` | String | 否 | 工作项的id。 |
| `name` | String | 否 | 工作项交付目标的名称。 |
| `content_type` | String | 否 | 工作项交付物的类型。只支持link。attachment类型的交付物通过向交付目标中上传一个文件接口上传附件。 |
| `content` | String | 否 | 工作项交付物。当工作项交付物的类型是link时，工作项交付物为包含name和href的对象，例如：{ "name": "链接工作项交付目标",  "href": "https://rest_api_root/wiki/spaces/public/pages/6472e6f2f1968d3fdb0aba15" }。当工作项交付物不为空时，参数必须包含交付物类型。 |

#### Parameters Examples
**请求示例：**
```json
{
    "work_item_id": "63761fee31caaf77189816b4",
    "name": "工作项交付目标",
    "content_type": "link",
    "content": {
         "name": "PingCode",
         "href": "https://www.pingcode.com"
     }
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "63761fee31caaf7718981876",
    "url": "https://rest_api_root/v1/project/deliverables/63761fee31caaf7718981876",
    "name": "阶段交付目标",
    "content_type": "link",
    "content": {
        "name": "PingCode",
        "href": "https://www.pingcode.com"
    },
    "project": {
        "id": "6375cc81e3004de4ea14aa52",
        "url": "https://rest_api_root/v1/project/projects/6375cc81e3004de4ea14aa52",
        "identifier": "WTF",
        "name": "瀑布项目",
        "type": "waterfall",
        "is_archived": 0,
        "is_deleted": 0
    },
    "work_item": {
        "id": "63761fee31caaf77189816b4",
        "url": "https://rest_api_root/v1/project/work_items/63761fee31caaf77189816b4",
        "identifier": "WTF-5",
        "title": "这是一个阶段",
        "type": "630da48bc9443b1aa94ce3ee",
        "start_at": 1583290309,
        "end_at": 1583290347,
        "parent_id": "5edca524cad2fa1125cb0629",
        "short_id": "c9WqLmTO",
        "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
        "properties": {
            "prop_a": "prop_a_value",
            "prop_b": "prop_b_value"
        }
    },
    "created_at": 1668685806,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1668687806,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_archived": 0,
    "is_deleted": 0
}
```

### 部分更新一个工作项工时

**接口:** `PATCH https://rest_api_root/v1/project/workloads/{workload_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `workload_type_id` | String | 否 | 工时类型的id。 |
| `duration` | Number | 否 | 时长。时长的单位是小时。数值可以是为0-24之间，最多包含一位小数的正数。 |
| `report_at` | Number | 否 | 登记日期。该值为十位数字组成的时间戳，会被转换为该时间当天的零点零分零秒。 |
| `report_by` | String | 否 | 登记人，企业鉴权时必填。个人鉴权时不需要传递，即使传递了也会被忽略。 |
| `description` | String | 否 | 工时的描述信息。 |

#### Parameters Examples
**请求示例：**
```json
{
    "workload_type_id": "5a86eaf6a72585327ea46fge0",
    "duration": 8,
    "report_at": 1593290347,
    "report_by": "a0417f68e846aae315c85d24643678a9",
    "description": "这是一个工时"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "5f168f764eba01a5278b87cd",
    "url": "https://rest_api_root/v1/project/workloads/5f168f764eba01a5278b87cd",
    "project": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
        "identifier": "SCR",
        "name": "Scrum项目",
        "type": "scrum",
        "is_archived": 0,
        "is_deleted": 0
    },
    "work_item": {
        "id": "5edca524cad2fa1125cb0630",
        "url": "https://rest_api_root/v1/project/work_items/5edca524cad2fa1125cb0630",
        "identifier": "SCR-5",
        "title": "这是一个缺陷",
        "type": "bug",
        "start_at": 1583290309,
        "end_at": 1583290347,
        "parent_id": "5edca524cad2fa1125cb0629",
        "short_id": "c9WqLmTO",
        "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
        "properties": {
            "prop_a": "prop_a_value",
            "prop_b": "prop_b_value"
        }
    },
    "type": {
        "id": "5a86eaf6a72585327ea46fge0",
        "url": "https://rest_api_root/v1/project/workload_types/5a86eaf6a72585327ea46fge0",
        "name": "研发",
        "color": "#56ABF"
    },
    "duration": 8,
    "description": "这是一个工时",
    "report_at": 1593290347,
    "report_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "created_at": 1593290347
}
```

## 发布

### 创建一个发布

**接口:** `POST https://rest_api_root/v1/project/projects/{project_id}/versions`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 发布的名称。同一项目下该名称是唯一的。 |
| `start_at` | Number | 是 | 开始的时间。 |
| `end_at` | Number | 是 | 发布的时间。 |
| `assignee_id` | String | 是 | 负责人的id。 |
| `stage_id` | String | 否 | 发布阶段的id。 |
| `category_ids` | String[] | 否 | 发布类别id数组。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "1.0.0",
    "start_at": 1565193600,
    "end_at": 1566403200,
    "assignee_id": "a0417f68e846aae315c85d24643678a9",
    "stage_id": "5f44a8f8bb347b14b49624a1",
    "category_ids": ["676a460a0fd987b7ea320889"]
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "5eb623f6a70571487ea47001",
    "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/versions/5eb623f6a70571487ea47001",
    "project": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
        "identifier": "SCR",
        "type": "scrum",
        "name": "Scrum项目",
        "is_archived": 0,
        "is_deleted": 0
    },
    "name": "1.0.0",
    "start_at": 1565193600,
    "end_at": 1566403200,
    "stage": {
        "id": "5f44a8f8bb347b14b49624a1",
        "url": "https://rest_api_root/v1/project/stages/5f44a8f8bb347b14b49624a1",
        "name": "未开始",
        "type": "pending",
        "color": "#FA8888"
    },
    "assignee": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "stages": [
        {
            "id": "5f44a8f8bb347b14b49624a1",
            "url": "https://rest_api_root/v1/project/stages/5f44a8f8bb347b14b49624a1",
            "name": "未开始",
            "operate_at": null
        },
        {
            "id": "5f44a8f8bb347b14b49624a2",
            "url": "https://rest_api_root/v1/project/stages/5f44a8f8bb347b14b49624a2",
            "name": "进行中",
            "operate_at": null
        },
        {
            "id": "5f44a8f8bb347b14b49624a3",
            "url": "https://rest_api_root/v1/project/stages/5f44a8f8bb347b14b49624a3",
            "name": "已发布",
            "operate_at": null
        }
    ],
    "progress": 0,
    "changelog": null,
    "operate_at": 1565255712,
    "categories": [
        {
            "id": "676a460a0fd987b7ea320889",
            "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/version_categories/676a460a0fd987b7ea320889",
            "name": "私有部署发布"
        }
    ],
    "created_at": 1565366200,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1565366200,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    }
}
```

### 创建一个发布分组

**接口:** `POST https://rest_api_root/v1/project/projects/{project_id}/version_sections`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 发布分组的名称。 |
| `description` | String | 否 | 发布分组的描述。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "私有部署",
    "description": "私有部署发布分组"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "63560f3ad02cbc4f9df91251",
    "url": "http://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/version_sections/63560f3ad02cbc4f9df91251",
    "project": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
        "identifier": "SCR",
        "name": "Scrum项目",
        "type": "scrum",
        "is_archived": 0,
        "is_deleted": 0
    },
    "name": "私有部署",
    "description": "私有部署发布分组"
}
```

### 创建一个发布类别

**接口:** `POST https://rest_api_root/v1/project/projects/{project_id}/version_categories`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 发布类别的名称。 |
| `section_id` | String | 否 | 发布类别所属发布分组。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "私有部署发布",
    "section_id": "63560f3ad02cbc4f9df91251"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "676a460a0fd987b7ea320889",
    "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/version_categories/676a460a0fd987b7ea320889",
    "project": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
        "identifier": "SCR",
        "name": "Scrum项目",
        "type": "scrum",
        "is_archived": 0,
        "is_deleted": 0
    },
    "name": "私有部署发布",
    "section": {
        "id": "63560f3ad02cbc4f9df91251",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/version_sections/63560f3ad02cbc4f9df91251",
        "name": "私有部署发布分组"
    }
}
```

### 创建一个发布阶段

**接口:** `POST https://rest_api_root/v1/project/stages`

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 发布阶段的名称。在一个企业中这个名称是唯一的。 |
| `type` | String | 是 | 发布阶段的类型。<br>可选值: `pending`, `in_progress`, `published` |

#### Parameters Examples
**请求示例：**
```json
{
   "name": "新建",
   "type": "pending"
}
```

#### Success Examples
**响应示例：**
```json
{
   "id": "5c9b35de90ad7153c2062f18",
   "url": "https://rest_api_root/v1/project/stages/5c9b35de90ad7153c2062f18",
   "name": "新建",
   "type": "pending",
   "color": "#ff7575"
}
```

### 删除一个发布

**接口:** `DELETE https://rest_api_root/v1/project/projects/{project_id}/versions/{version_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |
| `version_id` | String | 是 | 发布的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "5eb623f6a70571487ea47001",
    "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/versions/5eb623f6a70571487ea47001",
    "project": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
        "identifier": "SCR",
        "type": "scrum",
        "name": "Scrum项目",
        "is_archived": 0,
        "is_deleted": 0
    },
    "name": "1.0.0",
    "start_at": 1565193600,
    "end_at": 1566403200,
    "stage": {
        "id": "5f44a8f8bb347b14b49624a1",
        "url": "https://rest_api_root/v1/project/stages/5f44a8f8bb347b14b49624a1",
        "name": "未开始",
        "type": "pending",
        "color": "#FA8888"
    },
    "assignee": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "stages": [
        {
            "id": "5f44a8f8bb347b14b49624a1",
            "url": "https://rest_api_root/v1/project/stages/5f44a8f8bb347b14b49624a1",
            "name": "未开始",
            "operate_at": null
        },
        {
            "id": "5f44a8f8bb347b14b49624a2",
            "url": "https://rest_api_root/v1/project/stages/5f44a8f8bb347b14b49624a2",
            "name": "进行中",
            "operate_at": null
        },
        {
            "id": "5f44a8f8bb347b14b49624a3",
            "url": "https://rest_api_root/v1/project/stages/5f44a8f8bb347b14b49624a3",
            "name": "已发布",
            "operate_at": null
        }
    ],
    "progress": 0,
    "changelog": null,
    "operate_at": 1565255712,
    "categories": [
        {
            "id": "676a460a0fd987b7ea320889",
            "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/version_categories/676a460a0fd987b7ea320889",
            "name": "私有部署发布"
        }
    ],
    "created_at": 1565366200,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1565366200,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    }
}
```

### 删除一个发布分组

**接口:** `DELETE https://rest_api_root/v1/project/projects/{project_id}/version_sections/{section_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |
| `section_id` | String | 是 | 发布分组的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "63560f3ad02cbc4f9df91252",
    "url": "http://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/version_sections/63560f3ad02cbc4f9df91252",
    "project": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
        "identifier": "SCR",
        "name": "Scrum项目",
        "type": "scrum",
        "is_archived": 0,
        "is_deleted": 0
    },
    "name": "临时部署",
    "description": "临时发布分组"
}
```

### 删除一个发布类别

**接口:** `DELETE https://rest_api_root/v1/project/projects/{project_id}/version_categories/{version_category_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |
| `version_category_id` | String | 是 | 发布类别的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "676a460a0fd987b7ea320890",
    "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/version_categories/676a460a0fd987b7ea320890",
    "project": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
        "identifier": "SCR",
        "name": "Scrum项目",
        "type": "scrum",
        "is_archived": 0,
        "is_deleted": 0
    },
    "name": "这是一个发布类别",
    "section": {
        "id": "63560f3ad02cbc4f9df91251",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/version_sections/63560f3ad02cbc4f9df91251",
        "name": "私有部署发布分组"
    }
}
```

### 删除一个发布阶段

**接口:** `DELETE https://rest_api_root/v1/project/stages/{stage_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `stage_id` | String | 是 | 发布阶段的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `replace_id` | String | 否 | 替换的发布阶段id，如果一个发布阶段已经被发布使用，删除该发布阶段时需要提供一个替换的发布阶段。 |

#### Parameters Examples
**请求示例：**
```json
{
   "replace_id": "5c9b35de90ad7153c2062f19"
}
```

#### Success Examples
**响应示例：**
```json
{
   "id": "5c9b35de90ad7153c2062f18",
   "url": "https://rest_api_root/v1/project/stages/5c9b35de90ad7153c2062f18",
   "name": "新建",
   "type": "in_progress",
   "color": "#ff7575"
}
```

### 批量创建发布

**接口:** `POST https://rest_api_root/v1/project/versions/bulk`

**权限:** 企业令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `versions` | Object[] | 是 | 需要批量创建的发布。该参数是一个对象数组（数组内对象不得超过100个）。 |
| `versions.project_id` | String | 是 | 发布所属项目的id。 |
| `versions.name` | String | 是 | 发布的名称。 |
| `versions.start_at` | Number | 是 | 发布的开始时间。 |
| `versions.end_at` | Number | 是 | 发布的时间。 |
| `versions.assignee_id` | String | 是 | 发布负责人的id。 |
| `versions.stage_id` | String | 是 | 发布的阶段id。 |
| `versions.category_ids` | String[] | 否 | 发布类别的id列表。 |

#### Parameters Examples
**请求示例：**
```json
{
    "versions": [
        {
            "project_id": "5eb623f6a70571487ea47000",
            "name": "1.0.0",
            "start_at": 1565193600,
            "end_at": 1566403200,
            "assignee_id": "a0417f68e846aae315c85d24643678a9",
            "stage_id": "5f44a8f8bb347b14b49624a1",
            "category_ids": ["676a460a0fd987b7ea320889"]
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
        "version": {
            "id": "5eb623f6a70571487ea47001",
            "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/versions/5eb623f6a70571487ea47001",
            "project": {
                "id": "5eb623f6a70571487ea47000",
                "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
                "identifier": "SCR",
                "type": "scrum",
                "name": "Scrum项目",
                "is_archived": 0,
                "is_deleted": 0
            },
            "name": "1.0.0",
            "start_at": 1565193600,
            "end_at": 1566403200,
            "stage": {
                "id": "5f44a8f8bb347b14b49624a1",
                "url": "https://rest_api_root/v1/project/stages/5f44a8f8bb347b14b49624a1",
                "name": "未开始",
                "type": "pending",
                "color": "#FA8888"
            },
            "assignee": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "stages": [
                {
                    "id": "5f44a8f8bb347b14b49624a1",
                    "url": "https://rest_api_root/v1/project/stages/5f44a8f8bb347b14b49624a1",
                    "name": "未开始",
                    "operate_at": 1565366400
                },
                {
                    "id": "5f44a8f8bb347b14b49624a2",
                    "url": "https://rest_api_root/v1/project/stages/5f44a8f8bb347b14b49624a2",
                    "name": "进行中",
                    "operate_at": null
                },
                {
                    "id": "5f44a8f8bb347b14b49624a3",
                    "url": "https://rest_api_root/v1/project/stages/5f44a8f8bb347b14b49624a3",
                    "name": "已发布",
                    "operate_at": null
                }
            ],
            "progress": 0,
            "changelog": null,
            "operate_at": 1565366400,
            "categories": [
                {
                    "id": "676a460a0fd987b7ea320889",
                    "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/version_categories/676a460a0fd987b7ea320889",
                    "name": "私有部署发布"
                }
            ],
            "created_at": 1565366200,
            "created_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "updated_at": 1565366200,
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

### 获取发布分组列表

**接口:** `GET https://rest_api_root/v1/project/projects/{project_id}/version_sections`

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
            "id": "63560f3ad02cbc4f9df91251",
            "url": "http://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/version_sections/63560f3ad02cbc4f9df91251",
            "project": {
                "id": "5eb623f6a70571487ea47000",
                "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
                "identifier": "SCR",
                "name": "Scrum项目",
                "type": "scrum",
                "is_archived": 0,
                "is_deleted": 0
            },
            "name": "这是一个发布分组",
            "description": "这是一个发布分组的描述"
        }
    ]
}
```

### 获取发布列表

**接口:** `GET https://rest_api_root/v1/project/projects/{project_id}/versions`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |

**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 发布的名字。 |
| `status` | String | 否 | 发布的状态。<br>可选值: `pending`, `in_progress`, `published` |
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
            "id": "5eb623f6a70571487ea47001",
            "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/versions/5eb623f6a70571487ea47001",
            "project": {
                "id": "5eb623f6a70571487ea47000",
                "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
                "identifier": "SCR",
                "type": "scrum",
                "name": "Scrum项目",
                "is_archived": 0,
                "is_deleted": 0
            },
            "name": "1.0.0",
            "start_at": 1565193600,
            "end_at": 1566403200,
            "stage": {
                "id": "5f44a8f8bb347b14b49624a1",
                "url": "https://rest_api_root/v1/project/stages/5f44a8f8bb347b14b49624a1",
                "name": "未开始",
                "type": "pending",
                "color": "#FA8888"
            },
            "assignee": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "stages": [
                {
                    "id": "5f44a8f8bb347b14b49624a1",
                    "url": "https://rest_api_root/v1/project/stages/5f44a8f8bb347b14b49624a1",
                    "name": "未开始",
                    "operate_at": 1565366400
                },
                {
                    "id": "5f44a8f8bb347b14b49624a2",
                    "url": "https://rest_api_root/v1/project/stages/5f44a8f8bb347b14b49624a2",
                    "name": "进行中",
                    "operate_at": null
                },
                {
                    "id": "5f44a8f8bb347b14b49624a3",
                    "url": "https://rest_api_root/v1/project/stages/5f44a8f8bb347b14b49624a3",
                    "name": "已发布",
                    "operate_at": null
                }
            ],
            "progress": 0,
            "changelog": "发布日志",
            "operate_at": 1565366400,
            "categories": [
                {
                    "id": "676a460a0fd987b7ea320889",
                    "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/version_categories/676a460a0fd987b7ea320889",
                    "name": "私有部署发布"
                }
            ],
            "created_at": 1565366200,
            "created_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "updated_at": 1565366200,
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

### 获取发布类别列表

**接口:** `GET https://rest_api_root/v1/project/projects/{project_id}/version_categories`

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
            "id": "676a460a0fd987b7ea320889",
            "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/version_categories/676a460a0fd987b7ea320889",
            "project": {
                "id": "5eb623f6a70571487ea47000",
                "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
                "identifier": "SCR",
                "name": "Scrum项目",
                "type": "scrum",
                "is_archived": 0,
                "is_deleted": 0
            },
            "name": "私有部署发布",
            "section": {
                "id": "63560f3ad02cbc4f9df91251",
                "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/version_sections/63560f3ad02cbc4f9df91251",
                "name": "私有部署发布分组"
            }
        }
    ]
}
```

### 获取发布阶段列表

**接口:** `GET https://rest_api_root/v1/project/stages`

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
             "id": "5c9b35de90ad7153c2062f18",
             "url": "https://rest_api_root/v1/project/stages/5c9b35de90ad7153c2062f18",
             "name": "新建",
             "type": "in_progress",
             "color": "#ff7575"
         }
     ]
}
```

### 部分更新一个发布

**接口:** `PATCH https://rest_api_root/v1/project/projects/{project_id}/versions/{version_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |
| `version_id` | String | 是 | 发布的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 发布的名称。同一项目下该名称是唯一的。 |
| `start_at` | Number | 否 | 开始的时间。 |
| `end_at` | Number | 否 | 发布的时间。 |
| `assignee_id` | String | 否 | 负责人的id。 |
| `stage_id` | String | 否 | 发布阶段的id。 |
| `operate_at` | Number | 否 | 发布阶段的日期。需要和stage_id一起传递。 |
| `category_ids` | String[] | 否 | 发布类别id数组。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "1.0.0",
    "start_at": 1565193600,
    "end_at": 1566403200,
    "assignee_id": "a0417f68e846aae315c85d24643678a9",
    "stage_id": "5f44a8f8bb347b14b49624a1",
    "operate_at": 1565366400,
    "category_ids": ["676a460a0fd987b7ea320889"]
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "5eb623f6a70571487ea47001",
    "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/versions/5eb623f6a70571487ea47001",
    "project": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
        "identifier": "SCR",
        "type": "scrum",
        "name": "Scrum项目",
        "is_archived": 0,
        "is_deleted": 0
    },
    "name": "1.0.0",
    "start_at": 1565193600,
    "end_at": 1566403200,
    "stage": {
        "id": "5f44a8f8bb347b14b49624a1",
        "url": "https://rest_api_root/v1/project/stages/5f44a8f8bb347b14b49624a1",
        "name": "未开始",
        "type": "pending",
        "color": "#FA8888"
    },
    "assignee": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "stages": [
        {
            "id": "5f44a8f8bb347b14b49624a1",
            "url": "https://rest_api_root/v1/project/stages/5f44a8f8bb347b14b49624a1",
            "name": "未开始",
            "operate_at": 1565366400
        },
        {
            "id": "5f44a8f8bb347b14b49624a2",
            "url": "https://rest_api_root/v1/project/stages/5f44a8f8bb347b14b49624a2",
            "name": "进行中",
            "operate_at": null
        },
        {
            "id": "5f44a8f8bb347b14b49624a3",
            "url": "https://rest_api_root/v1/project/stages/5f44a8f8bb347b14b49624a3",
            "name": "已发布",
            "operate_at": null
        }
    ],
    "progress": 0,
    "changelog": "发布日志",
    "operate_at": 1565366400,
    "categories": [
        {
            "id": "676a460a0fd987b7ea320889",
            "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/version_categories/676a460a0fd987b7ea320889",
            "name": "私有部署发布"
        }
    ],
    "created_at": 1565366200,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1565366200,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    }
}
```

### 部分更新一个发布分组

**接口:** `PATCH https://rest_api_root/v1/project/projects/{project_id}/version_sections/{section_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |
| `section_id` | String | 是 | 发布分组的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 发布分组的名称。 |
| `description` | String | 否 | 发布分组的描述。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "私有部署",
    "description": "私有部署发布分组"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "63560f3ad02cbc4f9df91251",
    "url": "http://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/version_sections/63560f3ad02cbc4f9df91251",
    "project": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
        "identifier": "SCR",
        "name": "Scrum项目",
        "type": "scrum",
        "is_archived": 0,
        "is_deleted": 0
    },
    "name": "私有部署",
    "description": "私有部署发布分组"
}
```

### 部分更新一个发布类别

**接口:** `PATCH https://rest_api_root/v1/project/projects/{project_id}/version_categories/{version_category_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |
| `version_category_id` | String | 是 | 发布类别的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 发布类别的名称。 |
| `section_id` | String | 否 | 发布类别所属发布分组。 |

#### Parameters Examples
**请求示例：**
```json
{
   "name": "私有部署发布",
   "section_id": "63560f3ad02cbc4f9df91251"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "676a460a0fd987b7ea320889",
    "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/version_categories/676a460a0fd987b7ea320889",
    "project": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
        "identifier": "SCR",
        "name": "Scrum项目",
        "type": "scrum",
        "is_archived": 0,
        "is_deleted": 0
    },
    "name": "私有部署发布",
    "section": {
        "id": "63560f3ad02cbc4f9df91251",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000/version_sections/63560f3ad02cbc4f9df91251",
        "name": "私有部署发布分组"
    }
}
```

### 部分更新一个发布阶段

**接口:** `PATCH https://rest_api_root/v1/project/stages/{stage_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `stage_id` | String | 是 | 发布阶段的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 发布阶段的名称。在一个企业中这个名称是唯一的。 |
| `type` | String | 否 | 发布阶段的类型。<br>可选值: `pending`, `in_progress`, `published` |

#### Parameters Examples
**请求示例：**
```json
{
   "name": "新建",
   "type": "in_progress"
}
```

#### Success Examples
**响应示例：**
```json
{
   "id": "5c9b35de90ad7153c2062f18",
   "url": "https://rest_api_root/v1/project/stages/5c9b35de90ad7153c2062f18",
   "name": "新建",
   "type": "in_progress",
   "color": "#ff7575"
}
```

## 项目配置中心

### 工作项配置

**接口:** ` 工作项配置`

用于查看和管理工作项相关配置。

### 项目配置

**接口:** ` 项目配置`

用于查看和管理项目相关配置。

### 项目配置

**接口:** ` 项目配置`

用于查看和管理项目相关配置。

## 项目配置

### PatchV1ProjectProject_propertiesProperty_id

**接口:** `PATCH https://rest_api_root/v1/project/project_properties/{property_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `property_id` | String | 是 | 项目属性的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 项目属性的名称。在一个企业中这个名称是唯一的。 |
| `options` | Object[] | 否 | 选择项列表。options是整体更新的。 |
| `options._id` | Sting | 否 | 选择项的_id。如果option中不包含用于确定唯一性的_id，那么这个option将被视为新建，并为之创建新的_id。 |
| `options.text` | String | 是 | 选择项内容。 |
| `options.parent_id` | String | 否 | 选择项父级id。当属性类型为cascade_select,cascade_multi_select时，parent_id参数有效，用于构建级联类型选择项之间的父子关系，最多存在4级。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "项目规模",
    "options": [
        {
            "_id": "5efb1859110533727a82c605",
            "text": "大"
        },
        {
            "text": "小"
        }
    ]
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "xiangmuguimo",
    "url": "https://rest_api_root/v1/project/project_properties/xiangmuguimo",
    "name": "项目规模",
    "type": "select",
    "options": [
        {
            "_id": "5efb1859110533727a82c605",
            "text": "大"
        },
        {
            "_id": "5efb1859110533727a82c606",
            "text": "小"
        }
    ],
    "is_removable": true,
    "is_name_editable": true,
    "is_options_editable": true
}
```

### 创建一个项目属性

**接口:** `POST https://rest_api_root/v1/project/project_properties`

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 项目属性的名称。在一个企业中这个名称是唯一的。 |
| `type` | String | 是 | 项目属性的类型。<br>可选值: `text`, `textarea`, `select`, `multi_select`, `cascade_select`, `cascade_multi_select`, `member`, `members`, `date`, `number`, `progress`, `rate`, `link` |
| `options` | Object[] | 否 | 选择项列表。当属性类型为select,multi_select,cascade_select,cascade_multi_select时可选填此项。 |
| `options._id` | String | 否 | 选择项id。该值在选择项中是唯一的。 |
| `options.text` | String | 是 | 选择项内容。该值在选择项中是唯一的。 |
| `options.parent_id` | String | 否 | 选择项父级id。当属性类型为cascade_select,cascade_multi_select时，parent_id参数有效，用于构建级联类型选择项之间的父子关系，最多存在4级。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "项目风险",
    "type": "select",
    "options": [
        {
            "text": "高"
        },
        {
            "_id": "5efb1859110533727a82c604",
            "text": "中"
        },
        {
            "_id": "5efb1859110533727a82c605",
            "text": "低"
        }
    ]
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "risk",
    "url": "https://rest_api_root/v1/project/project_properties/risk",
    "name": "项目风险",
    "type": "select",
    "options": [
        {
            "_id": "5efb1859110533727a82c603",
            "text": "高"
        },
        {
            "_id": "5efb1859110533727a82c604",
            "text": "中"
        },
        {
            "_id": "5efb1859110533727a82c605",
            "text": "低"
        }
    ],
    "is_removable": false,
    "is_name_editable": false,
    "is_options_editable": false
}
```

### 获取项目属性列表

**接口:** `GET https://rest_api_root/v1/project/project_properties`

**权限:** 企业令牌/用户令牌

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 2,
    "values": [
        {
            "id": "risk",
            "url": "https://rest_api_root/v1/project/project_properties/risk",
            "name": "项目风险",
            "type": "select",
            "options": [
                {
                    "_id": "5efb1859110533727a82c603",
                    "text": "高"
                },
                {
                    "_id": "5efb1859110533727a82c604",
                    "text": "中"
                },
                {
                    "_id": "5efb1859110533727a82c605",
                    "text": "低"
                }
            ],
            "is_removable": false,
            "is_name_editable": false,
            "is_options_editable": false
        },
        {
            "id": "name",
            "url": "https://rest_api_root/v1/project/project_properties/name",
            "name": "名称",
            "type": "text",
            "options": null,
            "is_removable": false,
            "is_name_editable": false,
            "is_options_editable": false
        }
    ]
}
```

## 工作项配置

### 创建一个工作项属性

**接口:** `POST https://rest_api_root/v1/project/work_item_properties`

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 工作项属性的名称。在一个企业中这个名称是唯一的。 |
| `type` | String | 是 | 工作项属性的类型。<br>可选值: `text`, `textarea`, `select`, `multi_select`, `cascade_select`, `cascade_multi_select`, `member`, `members`, `date`, `number`, `progress`, `rate`, `link` |
| `options` | Object[] | 否 | 选择项列表。当工作项属性类型为select,multi_select,cascade_select,cascade_multi_select时可选填此项。 |
| `options._id` | String | 否 | 选择项id。该值在选择项中是唯一的。 |
| `options.text` | String | 是 | 选择项内容。该值在选择项中是唯一的。 |
| `options.parent_id` | String | 否 | 选择项父级id。当属性类型为cascade_select,cascade_multi_select时，parent_id参数有效，用于构建级联类型选择项之间的父子关系，最多存在4级。 |

#### Parameters Examples
**请求示例（select）：**
```json
{
    "name": "严重程度",
    "type": "select",
    "options": [
        {
            "text": "严重"
        },
        {
            "_id": "5efb1859110533727a82c604",
            "text": "一般"
        }
    ]
}
```

**请求示例（cascade_select）：**
```json
{
    "name": "级联单选",
    "type": "cascade_select",
    "options": [
        {
            "_id": "64b9f741eec7fd94e63b411e",
            "text": "父"
        },
        {
            "_id": "64b9f741eec7fd94e63b411f",
            "text": "子",
            "parent_id": "64b9f741eec7fd94e63b411e"
        }
    ]
}
```

#### Success Examples
**响应示例（select）：**
```json
{
    "id": "severity",
    "url": "https://rest_api_root/v1/project/work_item_properties/severity",
    "name": "严重程度",
    "type": "select",
    "options": [
        {
            "_id": "5efb1859110533727a82c603",
            "text": "严重"
        },
        {
            "_id": "5efb1859110533727a82c604",
            "text": "一般"
        }
    ],
    "is_removable": true,
    "is_name_editable": true,
    "is_options_editable": true,
    "select_all_level": false,
    "display_all_level": false,
    "display_separator": null
}
```

**响应示例（cascade_select）：**
```json
{
    "id": "jiliandanxuan",
    "url": "https://rest_api_root/v1/project/work_item_properties/jiliandanxuan",
    "name": "级联单选",
    "type": "cascade_select",
    "options": [
        {
            "_id": "64b9f741eec7fd94e63b411e",
            "text": "父"
        },
        {
            "_id": "64b9f741eec7fd94e63b411f",
            "text": "子",
            "parent_id": "64b9f741eec7fd94e63b411e"
        }
    ],
    "is_removable": true,
    "is_name_editable": true,
    "is_options_editable": true,
    "select_all_level": false,
    "display_all_level": false,
    "display_separator": "/"
}
```

### 创建一个工作项标签

**接口:** `POST https://rest_api_root/v1/project/work_item_tags`

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 标签的名称。在一个企业中这个名称是唯一的。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "标签-1"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "5e6b35de50ef8153c2062f70",
    "url": "https://rest_api_root/v1/project/work_item_tags/5e6b35de50ef8153c2062f70",
    "name": "标签-1",
    "color": "#56ABFB"
}
```

### 创建一个工作项状态

**接口:** `POST https://rest_api_root/v1/project/work_item_states`

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 工作项状态的名称。在一个企业中这个名称是唯一的。 |
| `type` | String | 是 | 工作项状态的类型。<br>可选值: `pending`, `in_progress`, `completed`, `closed` |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "新建",
    "type": "pending"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "5c9b35de90ad7153c2062f18",
    "url": "https://rest_api_root/v1/project/work_item_states/5c9b35de90ad7153c2062f18",
    "name": "新建",
    "type": "pending",
    "color": "#ff7575",
    "is_system": false
}
```

### 创建一个工作项类型

**接口:** `POST https://rest_api_root/v1/project/work_item_types`

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 工作项类型的名称。在一个企业中这个名称是唯一的。 |
| `group` | String | 是 | 工作项类型的分组。<br>可选值: `requirement`, `task`, `bug`, `issue`, `plan` |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "功能缺陷",
    "group": "bug"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "630da48bc9443b1aa94ce3fc",
    "url": "https://rest_api_root/v1/project/work_item_types/630da48bc9443b1aa94ce3fc",
    "name": "功能缺陷",
    "group": "bug",
    "is_system": false
}
```

### 删除一个工作项标签

**接口:** `DELETE https://rest_api_root/v1/project/work_item_tags/{tag_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `tag_id` | String | 是 | 标签的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "5e6b35de50ef8153c2062f70",
    "url": "https://rest_api_root/v1/project/work_item_tags/5e6b35de50ef8153c2062f70",
    "name": "标签-2",
    "color": "#56ABFB"
}
```

### 删除一个工作项类型

**接口:** `DELETE https://rest_api_root/v1/project/work_item_types/{work_item_type_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `work_item_type_id` | String | 是 | 工作项类型的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "630da48bc9443b1aa94ce3df",
    "url": "https://rest_api_root/v1/project/work_item_types/630da48bc9443b1aa94ce3df",
    "name": "非功能性需求",
    "group": "requirement",
    "is_system": false
}
```

### 向属性方案中添加一个工作项属性

**接口:** `POST https://rest_api_root/v1/project/work_item_property_plans/{property_plan_id}/work_item_properties`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `property_plan_id` | String | 是 | 工作项属性方案的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `property_id` | String | 是 | 工作项属性的id。 |

#### Parameters Examples
**请求示例：**
```json
{
    "property_id": "severity"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "severity",
    "url": "https://rest_api_root/v1/project/work_item_property_plans/5f8a21f18ef715265de90c21/properties/severity",
    "property_plan": {
        "id": "5f8a21f18ef715265de90c21",
        "url": "https://rest_api_root/v1/project/work_item_property_plans/5f8a21f18ef715265de90c21",
        "project_type": "scrum",
        "work_item_type": "story"
    },
    "property": {
        "id": "severity",
        "url": "https://rest_api_root/v1/project/work_item_properties/severity",
        "name": "严重程度",
        "type": "select"
    }
}
```

### 向工作项类型方案中添加一个工作项类型

**接口:** `POST https://rest_api_root/v1/project/work_item_type_plans/{work_item_type_plan_id}/work_item_types`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `work_item_type_plan_id` | String | 是 | 工作项类型方案的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `work_item_type_id` | String | 是 | 工作项类型的id。 |

#### Parameters Examples
**请求示例：**
```json
{
    "work_item_type_id": "5c9b35de90ad7153c2062f18"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "630da48bc9443b1aa94ce3ea",
    "url": "https://rest_api_root/v1/project/work_item_type_plans/65b0d9fd9ee456e672657e39/work_item_types/630da48bc9443b1aa94ce3ea",
    "type_plan": {
        "id": "6abb92f18ad725395df86c45",
        "url": "https://rest_api_root/v1/project/work_item_type_plans/65b0d9fd9ee456e672657e39",
        "project_type": "waterfall"
    },
    "type": {
        "id": "630da48bc9443b1aa94ce3ea",
        "url": "https://rest_api_root/v1/project/work_item_types/630da48bc9443b1aa94ce3ea",
        "name": "需求",
        "group": "requirement"
    },
    "sub_types": [
        {
           "id": "bug",
           "url": "https://rest_api_root/v1/project/work_item_types/bug",
           "name": "缺陷",
           "group": "bug"
        },
        {
           "id": "6385c650fef18f2d7222d15d",
           "url": "https://rest_api_root/v1/project/work_item_types/6385c650fef18f2d7222d15d",
           "name": "自定义",
           "group": "issue"
        }
    ]
}
```

### 向状态方案中添加一个工作项状态

**接口:** `POST https://rest_api_root/v1/project/work_item_state_plans/{state_plan_id}/work_item_states`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `state_plan_id` | String | 是 | 工作项状态方案的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `state_id` | String | 是 | 工作项状态的id。 |

#### Parameters Examples
**请求示例：**
```json
{
    "state_id": "5c9b35de90ad7153c2062f18"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "5cc2062f189b35de90ad7153",
    "url": "https://rest_api_root/v1/project/work_item_state_plans/5c9b62f18ad715335de90c20/work_item_states/5c9b35de90ad7153c2062f18",
    "state_plan": {
        "id": "5c9b62f18ad715335de90c20",
        "url": "https://rest_api_root/v1/project/work_item_state_plans/5c9b62f18ad715335de90c20",
        "project_type": "scrum",
        "work_item_type": "story"
    },
    "state": {
        "id": "5c9b35de90ad7153c2062f18",
        "url": "https://rest_api_root/v1/project/work_item_states/5c9b35de90ad7153c2062f18",
        "name": "新建",
        "type": "pending",
        "color": "#ff7575"
    }
}
```

### 向状态方案中添加一个工作项状态流转

**接口:** `POST https://rest_api_root/v1/project/work_item_state_plans/{state_plan_id}/work_item_state_flows`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `state_plan_id` | String | 是 | 工作项状态方案的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `from_state_id` | String | 是 | 起始工作项状态的id。 |
| `to_state_id` | String | 是 | 可更改为的工作项状态的id。 |

#### Parameters Examples
**请求示例：**
```json
{
   "from_state_id": "5c9b35de90ad7153c2062f18",
   "to_state_id": "5ef85b1e9481936604da7f4c"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "5ef85b1e9481936604da7fcd",
    "url": "https://rest_api_root/v1/project/work_item_state_plans/5c9b62f18ad715335de90c20/work_item_state_flows/5ef85b1e9481936604da7fcd",
    "state_plan": {
        "id": "5c9b62f18ad715335de90c20",
        "url": "https://rest_api_root/v1/project/work_item_state_plans/5c9b62f18ad715335de90c20",
        "project_type": "scrum",
        "work_item_type": "story"
    },
    "from_state": {
        "id": "5c9b35de90ad7153c2062f18",
        "url": "https://rest_api_root/v1/project/work_item_states/5c9b35de90ad7153c2062f18",
        "name": "新建",
        "type": "pending",
        "color": "#56ABFB"
    },
    "to_state": {
        "id": "5ef85b1e9481936604da7f4c",
        "url": "https://rest_api_root/v1/project/work_item_states/5ef85b1e9481936604da7f4c",
        "name": "进行中",
        "type": "in_progress",
        "color": "#F6C659"
    }
}
```

### 在属性方案中移除一个工作项属性

**接口:** `DELETE https://rest_api_root/v1/project/work_item_property_plans/{property_plan_id}/work_item_properties/{property_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `property_plan_id` | String | 是 | 工作项属性方案的id。 |
| `property_id` | String | 是 | 工作项属性的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "severity",
    "url": "https://rest_api_root/v1/project/work_item_property_plans/5f8a21f18ef715265de90c21/properties/severity",
    "property_plan": {
        "id": "5f8a21f18ef715265de90c21",
        "url": "https://rest_api_root/v1/project/work_item_property_plans/5f8a21f18ef715265de90c21",
        "project_type": "scrum",
        "work_item_type": "story"
    },
    "property": {
        "id": "severity",
        "url": "https://rest_api_root/v1/project/work_item_properties/severity",
        "name": "严重程度",
        "type": "select"
    }
}
```

### 在工作项类型方案中移除一个工作项类型

**接口:** `DELETE https://rest_api_root/v1/project/work_item_type_plans/{work_item_type_plan_id}/work_item_types/{work_item_type_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `work_item_type_plan_id` | String | 是 | 工作项类型方案的id。 |
| `work_item_type_id` | String | 是 | 工作项类型的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "630da48bc9443b1aa94ce3ea",
    "url": "https://rest_api_root/v1/project/work_item_type_plans/65b0d9fd9ee456e672657e39/work_item_types/630da48bc9443b1aa94ce3ea",
    "type_plan": {
        "id": "6abb92f18ad725395df86c45",
        "url": "https://rest_api_root/v1/project/work_item_type_plans/65b0d9fd9ee456e672657e39",
        "project_type": "waterfall"
    },
    "type": {
        "id": "630da48bc9443b1aa94ce3ea",
        "url": "https://rest_api_root/v1/project/work_item_types/630da48bc9443b1aa94ce3ea",
        "name": "需求",
        "group": "requirement"
    },
    "sub_types": [
        {
           "id": "bug",
           "url": "https://rest_api_root/v1/project/work_item_types/bug",
           "name": "缺陷",
           "group": "bug"
        },
        {
           "id": "6385c650fef18f2d7222d15d",
           "url": "https://rest_api_root/v1/project/work_item_types/6385c650fef18f2d7222d15d",
           "name": "自定义",
           "group": "issue"
        }
    ]
}
```

### 在状态方案中移除一个工作项状态

**接口:** `DELETE https://rest_api_root/v1/project/work_item_state_plans/{state_plan_id}/work_item_states/{state_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `state_plan_id` | String | 是 | 工作项状态方案的id。 |
| `state_id` | String | 是 | 工作项状态的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "5cc2062f189b35de90ad7153",
    "url": "https://rest_api_root/v1/project/work_item_state_plans/5c9b62f18ad715335de90c20/work_item_states/5c9b35de90ad7153c2062f18",
    "state_plan": {
        "id": "5c9b62f18ad715335de90c20",
        "url": "https://rest_api_root/v1/project/work_item_state_plans/5c9b62f18ad715335de90c20",
        "project_type": "scrum",
        "work_item_type": "story"
    },
    "state": {
        "id": "5c9b35de90ad7153c2062f18",
        "url": "https://rest_api_root/v1/project/work_item_states/5c9b35de90ad7153c2062f18",
        "name": "新建",
        "type": "pending",
        "color": "#ff7575"
    }
}
```

### 在状态方案中移除一个工作项状态流转

**接口:** `DELETE https://rest_api_root/v1/project/work_item_state_plans/{state_plan_id}/work_item_state_flows/{flow_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `state_plan_id` | String | 是 | 工作项状态方案的id。 |
| `flow_id` | String | 是 | 工作项状态流转的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "5ef85b1e9481936604da7fcd",
    "url": "https://rest_api_root/v1/project/work_item_state_plans/5c9b62f18ad715335de90c20/work_item_state_flows/5ef85b1e9481936604da7fcd",
    "state_plan": {
        "id": "5c9b62f18ad715335de90c20",
        "url": "https://rest_api_root/v1/project/work_item_state_plans/5c9b62f18ad715335de90c20",
        "project_type": "scrum",
        "work_item_type": "story"
    },
    "from_state": {
        "id": "5c9b35de90ad7153c2062f18",
        "url": "https://rest_api_root/v1/project/work_item_states/5c9b35de90ad7153c2062f18",
        "name": "新建",
        "type": "pending",
        "color": "#56ABFB"
    },
    "to_state": {
        "id": "5ef85b1e9481936604da7f4c",
        "url": "https://rest_api_root/v1/project/work_item_states/5ef85b1e9481936604da7f4c",
        "name": "进行中",
        "type": "in_progress",
        "color": "#F6C659"
    }
}
```

### 开启工作项本地配置

**接口:** `POST https://rest_api_root/v1/project/work_item_plans`

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。 |

#### Parameters Examples
**请求示例：**
```json
{
    "project_id": "5eb623f6a70571487ea47000"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "5eb623f6a70571487ea47000",
    "url": "https://rest_api_root/v1/project/work_item_plans/5eb623f6a70571487ea47000",
    "project": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
        "identifier": "SCR",
        "name": "Scrum项目",
        "type": "scrum",
        "is_archived": 0,
        "is_deleted": 0
    }
}
```

### 获取全部工作项属性列表

**接口:** `GET https://rest_api_root/v1/project/work_item_properties`

**权限:** 企业令牌/用户令牌

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 2,
    "values": [
        {
            "id": "severity",
            "url": "https://rest_api_root/v1/project/work_item_properties/severity",
            "name": "严重程度",
            "type": "select",
            "options": [
                {
                    "_id": "5efb1859110533727a82c603",
                    "text": "严重"
                },
                {
                    "_id": "5efb1859110533727a82c604",
                    "text": "一般"
                }
            ],
            "is_removable": true,
            "is_name_editable": true,
            "is_options_editable": true,
            "select_all_level": false,
            "display_all_level": false,
            "display_separator": null
        },
        {
            "id": "identifier",
            "url": "https://rest_api_root/v1/project/work_item_properties/identifier",
            "name": "编号",
            "type": "text",
            "options": null,
            "is_removable": false,
            "is_name_editable": false,
            "is_options_editable": false,
            "select_all_level": false,
            "display_all_level": false,
            "display_separator": null
        }
    ]
}
```

### 获取全部工作项标签列表

**接口:** `GET https://rest_api_root/v1/project/work_item_tags`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 标签的名称。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "5e6b35de50ef8153c2062f70",
            "url": "https://rest_api_root/v1/project/work_item_tags/5e6b35de50ef8153c2062f70",
            "name": "标签-2",
            "color": "#56ABFB"
        }
    ]
}
```

### 获取全部工作项状态列表

**接口:** `GET https://rest_api_root/v1/project/work_item_states`

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
            "id": "5c9b35de90ad7153c2062f18",
            "url": "https://rest_api_root/v1/project/work_item_states/5c9b35de90ad7153c2062f18",
            "name": "新建",
            "type": "pending",
            "color": "#ff7575",
            "is_system": true
        }
    ]
}
```

### 获取全部工作项类型列表

**接口:** `GET https://rest_api_root/v1/project/work_item_types`

**权限:** 企业令牌/用户令牌

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 10,
    "values": [
        {
            "id": "epic",
            "url": "http://rest_api_root/v1/project/work_item_types/epic",
            "name": "史诗",
            "group": "requirement",
            "is_system": true
        },
        {
            "id": "feature",
            "url": "http://rest_api_root/v1/project/work_item_types/feature",
            "name": "特性",
            "group": "requirement",
            "is_system": true
        },
        {
            "id": "story",
            "url": "http://rest_api_root/v1/project/work_item_types/story",
            "name": "用户故事",
            "group": "requirement",
            "is_system": true
        },
        {
            "id": "task",
            "url": "http://rest_api_root/v1/project/work_item_types/task",
            "name": "任务",
            "group": "task",
            "is_system": true
        },
        {
            "id": "bug",
            "url": "http://rest_api_root/v1/project/work_item_types/bug",
            "name": "缺陷",
            "group": "bug",
            "is_system": true
        },
        {
            "id": "issue",
            "url": "http://rest_api_root/v1/project/work_item_types/issue",
            "name": "事务",
            "group": "issue",
            "is_system": true
        },
        {
            "id": "630da48bc9443b1aa94ce3ea",
            "url": "https://rest_api_root/v1/project/work_item_types/630da48bc9443b1aa94ce3ea",
            "name": "需求",
            "group": "requirement",
            "is_system": true
        },
        {
            "id": "6385c650fef18f2d7222d15d",
            "url": "https://rest_api_root/v1/project/work_item_types/6385c650fef18f2d7222d15d",
            "name": "自定义",
            "group": "issue",
            "is_system": false
        },
        {
            "id": "630da48bc9443b1aa94ce3ee",
            "url": "https://rest_api_root/v1/project/work_item_types/630da48bc9443b1aa94ce3ee",
            "name": "阶段",
            "group": "plan",
            "is_system": true
        },
        {
            "id": "630da48bc9443b1aa94ce3ef",
            "url": "https://rest_api_root/v1/project/work_item_types/630da48bc9443b1aa94ce3ef",
            "name": "里程碑",
            "group": "plan",
            "is_system": true
        }
    ]
}
```

### 获取属性方案中的工作项属性列表

**接口:** `GET https://rest_api_root/v1/project/work_item_property_plans/{property_plan_id}/work_item_properties`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `property_plan_id` | String | 是 | 工作项属性方案的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 2,
    "values": [
        {
            "id": "severity",
            "url": "https://rest_api_root/v1/project/work_item_property_plans/5f8a21f18ef715265de90c21/properties/severity",
            "property_plan": {
                "id": "5f8a21f18ef715265de90c21",
                "url": "https://rest_api_root/v1/project/work_item_property_plans/5f8a21f18ef715265de90c21",
                "project_type": "scrum",
                "work_item_type": "story"
            },
            "property": {
                "id": "severity",
                "url": "https://rest_api_root/v1/project/work_item_properties/severity",
                "name": "严重程度",
                "type": "select"
            }
        },
        {
            "id": "identifier",
            "url": "https://rest_api_root/v1/project/work_item_property_plans/5f8a21f18ef715265de90c21/properties/identifier",
            "property_plan": {
                "id": "5f8a21f18ef715265de90c21",
                "url": "https://rest_api_root/v1/project/work_item_property_plans/5f8a21f18ef715265de90c21",
                "project_type": "scrum",
                "work_item_type": "story"
            },
            "property": {
                "id": "identifier",
                "url": "https://rest_api_root/v1/project/work_item_properties/identifier",
                "name": "编号",
                "type": "text"
            }
        }
    ]
}
```

### 获取工作项属性方案列表

**接口:** `GET https://rest_api_root/v1/project/work_item_property_plans`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 否 | 项目的id。查询开启本地配置的工作项属性方案时传入。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "5f8a21f18ef715265de90c21",
            "url": "https://rest_api_root/v1/project/work_item_property_plans/5f8a21f18ef715265de90c21",
            "project_type": "scrum",
            "process_id": "5fa690f1ae0571487ea49030",
            "work_item_type": "story",
            "project": {
                "id": "5eb623f6a70571487ea47000",
                "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
                "identifier": "SCR",
                "name": "Scrum项目",
                "type": "scrum",
                "is_archived": 0,
                "is_deleted": 0
            }
        }
    ]
}
```

### 获取工作项状态方案列表

**接口:** `GET https://rest_api_root/v1/project/work_item_state_plans`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 否 | 项目的id。查询开启本地配置的工作项状态方案时传入。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "5c9b62f18ad715335de90c20",
            "url": "https://rest_api_root/v1/project/work_item_state_plans/5c9b62f18ad715335de90c20",
            "project_type": "scrum",
            "process_id": "5fa690f1ae0571487ea49030",
            "work_item_type": "story",
            "project": {
                "id": "5eb623f6a70571487ea47000",
                "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
                "identifier": "SCR",
                "name": "Scrum项目",
                "type": "scrum",
                "is_archived": 0,
                "is_deleted": 0
            }
        }
    ]
}
```

### 获取工作项类型方案中的工作项类型列表

**接口:** `GET https://rest_api_root/v1/project/work_item_type_plans/{work_item_type_plan_id}/work_item_types`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `work_item_type_plan_id` | String | 是 | 工作项类型方案的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "630da48bc9443b1aa94ce3ea",
            "url": "https://rest_api_root/v1/project/work_item_type_plans/65b0d9fd9ee456e672657e39/work_item_types/630da48bc9443b1aa94ce3ea",
            "type_plan": {
                "id": "6abb92f18ad725395df86c45",
                "url": "https://rest_api_root/v1/project/work_item_type_plans/65b0d9fd9ee456e672657e39",
                "project_type": "waterfall"
            },
            "type": {
                "id": "630da48bc9443b1aa94ce3ea",
                "url": "https://rest_api_root/v1/project/work_item_types/630da48bc9443b1aa94ce3ea",
                "name": "需求",
                "group": "requirement"
            },
            "sub_types": [
                {
                   "id": "bug",
                   "url": "https://rest_api_root/v1/project/work_item_types/bug",
                   "name": "缺陷",
                   "group": "bug"
                },
                {
                   "id": "6385c650fef18f2d7222d15d",
                   "url": "https://rest_api_root/v1/project/work_item_types/6385c650fef18f2d7222d15d",
                   "name": "自定义",
                   "group": "issue"
                }
            ]
        }
    ]
}
```

### 获取工作项类型方案列表

**接口:** `GET https://rest_api_root/v1/project/work_item_type_plans`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 否 | 项目的id。查询开启本地配置的工作项类型方案时传入。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "5eb623f6a70571487ea47000",
            "url": "https://rest_api_root/v1/project/work_item_type_plans/5eb623f6a70571487ea47000",
            "project_type": "scrum",
            "process_id": "5fa690f1ae0571487ea49030",
            "project": {
                "id": "5eb623f6a70571487ea47000",
                "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea47000",
                "identifier": "SCR",
                "name": "Scrum项目",
                "type": "scrum",
                "is_archived": 0,
                "is_deleted": 0
            }
        }
    ]
}
```

### 获取状态方案中的工作项状态列表

**接口:** `GET https://rest_api_root/v1/project/work_item_state_plans/{state_plan_id}/work_item_states`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `state_plan_id` | String | 是 | 工作项状态方案的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "5cc2062f189b35de90ad7153",
            "url": "https://rest_api_root/v1/project/work_item_state_plans/5c9b62f18ad715335de90c20/work_item_states/5c9b35de90ad7153c2062f18",
            "state_plan": {
                "id": "5c9b62f18ad715335de90c20",
                "url": "https://rest_api_root/v1/project/work_item_state_plans/5c9b62f18ad715335de90c20",
                "project_type": "scrum",
                "work_item_type": "story"
            },
            "state": {
                "id": "5c9b35de90ad7153c2062f18",
                "url": "https://rest_api_root/v1/project/work_item_states/5c9b35de90ad7153c2062f18",
                "name": "新建",
                "type": "pending",
                "color": "#ff7575"
            }
        }
    ]
}
```

### 获取状态方案中的工作项状态流转列表

**接口:** `GET https://rest_api_root/v1/project/work_item_state_plans/{state_plan_id}/work_item_state_flows`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `state_plan_id` | String | 是 | 工作项状态方案的id。 |

**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `from_state_id` | String | 否 | 上一个工作项状态的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "5ef85b1e9481936604da7fcd",
            "url": "https://rest_api_root/v1/project/work_item_state_plans/5c9b62f18ad715335de90c20/work_item_state_flows/5ef85b1e9481936604da7fcd",
            "state_plan": {
                "id": "5c9b62f18ad715335de90c20",
                "url": "https://rest_api_root/v1/project/work_item_state_plans/5c9b62f18ad715335de90c20",
                "project_type": "scrum",
                "work_item_type": "story"
            },
            "from_state": {
                "id": "5c9b35de90ad7153c2062f18",
                "url": "https://rest_api_root/v1/project/work_item_states/5c9b35de90ad7153c2062f18",
                "name": "新建",
                "type": "pending",
                "color": "#56ABFB"
            },
            "to_state": {
                "id": "5ef85b1e9481936604da7f4c",
                "url": "https://rest_api_root/v1/project/work_item_states/5ef85b1e9481936604da7f4c",
                "name": "进行中",
                "type": "in_progress",
                "color": "#F6C659"
            }
        }
    ]
}
```

### 部分更新一个工作项属性

**接口:** `PATCH https://rest_api_root/v1/project/work_item_properties/{property_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `property_id` | String | 是 | 工作项属性的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 工作项属性的名称。在一个企业中这个名称是唯一的。 |
| `options` | Object[] | 否 | 选择项列表。options是整体更新的。 |
| `options._id` | String | 否 | 选择项id。该值在选择项中是唯一的。 |
| `options.text` | String | 是 | 选择项内容。该值在选择项中是唯一的。 |
| `options.parent_id` | String | 否 | 选择项父级id。当属性类型为cascade_select,cascade_multi_select时，parent_id参数有效，用于构建级联类型选择项之间的父子关系，最多存在4级。 |

#### Parameters Examples
**请求示例（select）：**
```json
{
    "name": "严重程度-update",
    "options": [
        {
            "id": "5efb1859110533727a82c603",
            "text": "严重-update"
        },
        {
            "text": "一般"
        }
    ]
}
```

**请求示例（cascade_select）：**
```json
{
    "name": "级联单选-update",
    "options": [
        {
            "_id": "64b9f741eec7fd94e63b411e",
            "text": "父-update"
        },
        {
            "_id": "64b9f741eec7fd94e63b411f",
            "text": "子-update",
            "parent_id": "64b9f741eec7fd94e63b411e"
        },
        {
            "text": "子-create",
            "parent_id": "64b9f741eec7fd94e63b411f"
        }
    ]
}
```

#### Success Examples
**响应示例（select）：**
```json
{
    "id": "severity-update",
    "url": "https://rest_api_root/v1/project/work_item_properties/severity",
    "name": "严重程度-update",
    "type": "select",
    "options": [
        {
            "_id": "5efb1859110533727a82c603",
            "text": "严重-update"
        },
        {
            "_id": "5efb1859110533727a82c624",
            "text": "一般"
        }
    ],
    "is_removable": true,
    "is_name_editable": true,
    "is_options_editable": true,
    "select_all_level": false,
    "display_all_level": false,
    "display_separator": null
}
```

**响应示例（cascade_select）：**
```json
{
    "id": "jiliandanxuan",
    "url": "https://rest_api_root/v1/project/work_item_properties/jiliandanxuan",
    "name": "级联单选-update",
    "type": "cascade_select",
    "options": [
        {
            "_id": "64b9f741eec7fd94e63b411e",
            "text": "父-update"
        },
        {
            "_id": "64b9f741eec7fd94e63b411f",
            "text": "子-update",
            "parent_id": "64b9f741eec7fd94e63b411e"
        },
        {
            "_id": "64b9f741eec7fd94e63b411g",
            "text": "子-create",
            "parent_id": "64b9f741eec7fd94e63b411f"
        }
    ],
    "is_removable": true,
    "is_name_editable": true,
    "is_options_editable": true,
    "select_all_level": false,
    "display_all_level": false,
    "display_separator": "/"
}
```

### 部分更新一个工作项标签

**接口:** `PATCH https://rest_api_root/v1/project/work_item_tags/{tag_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `tag_id` | String | 是 | 标签的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 标签的名称。在一个企业中这个名称是唯一的。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "标签-2"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "5e6b35de50ef8153c2062f70",
    "url": "https://rest_api_root/v1/project/work_item_tags/5e6b35de50ef8153c2062f70",
    "name": "标签-2",
    "color": "#56ABFB"
}
```

### 部分更新一个工作项状态

**接口:** `PATCH https://rest_api_root/v1/project/work_item_states/{state_id}`

只有非系统类型的工作项状态才能更新。

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 工作项状态的名称。在一个企业中这个名称是唯一的。 |
| `type` | String | 否 | 工作项状态的类型。<br>可选值: `pending`, `in_progress`, `completed`, `closed` |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "新建",
    "type": "pending"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "5c9b35de90ad7153c2062f18",
    "url": "https://rest_api_root/v1/project/work_item_states/5c9b35de90ad7153c2062f18",
    "name": "新建",
    "type": "pending",
    "color": "#ff7575",
    "is_system": false
}
```

### 部分更新一个工作项类型

**接口:** `PATCH https://rest_api_root/v1/project/work_item_types/{work_item_type_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `work_item_type_id` | String | 是 | 工作项类型的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 工作项类型的名称。在一个企业中这个名称是唯一的。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "非功能性需求"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "630da48bc9443b1aa94ce3df",
    "url": "https://rest_api_root/v1/project/work_item_types/630da48bc9443b1aa94ce3df",
    "name": "非功能性需求",
    "group": "requirement",
    "is_system": false
}
```

### 部分更新工作项类型方案中的工作项类型

**接口:** `PATCH https://rest_api_root/v1/project/work_item_type_plans/{work_item_type_plan_id}/work_item_types/{work_item_type_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `work_item_type_plan_id` | String | 是 | 工作项类型方案的id。 |
| `work_item_type_id` | String | 是 | 工作项类型的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `sub_type_ids` | String[] | 是 | 子工作项类型id的列表，使用','分割，最多只能20个。 |

#### Parameters Examples
**请求示例：**
```json
{
    "sub_type_ids": [
        "bug",
        "6385c650fef18f2d7222d15d"
    ]
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "630da48bc9443b1aa94ce3ea",
    "url": "https://rest_api_root/v1/project/work_item_type_plans/65b0d9fd9ee456e672657e39/work_item_types/630da48bc9443b1aa94ce3ea",
    "type_plan": {
        "id": "6abb92f18ad725395df86c45",
        "url": "https://rest_api_root/v1/project/work_item_type_plans/65b0d9fd9ee456e672657e39",
        "project_type": "waterfall"
    },
    "type": {
        "id": "630da48bc9443b1aa94ce3ea",
        "url": "https://rest_api_root/v1/project/work_item_types/630da48bc9443b1aa94ce3ea",
        "name": "需求",
        "group": "requirement"
    },
    "sub_types": [
        {
           "id": "bug",
           "url": "https://rest_api_root/v1/project/work_item_types/bug",
           "name": "缺陷",
           "group": "bug"
        },
        {
           "id": "6385c650fef18f2d7222d15d",
           "url": "https://rest_api_root/v1/project/work_item_types/6385c650fef18f2d7222d15d",
           "name": "自定义",
           "group": "issue"
        }
    ]
}
```

## 测试管理

### 测试库

**接口:** ` 测试库`

用于查看和管理测试库的基本信息。
 资源地址：{GET} https://rest_api_root/v1/testhub/libraries/{library_id}

#### Success
**资源属性**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 测试库的id。 |
| `url` | String | 是 | 测试库的资源地址。 |
| `identifier` | String | 是 | 测试库的标识。 |
| `name` | String | 是 | 测试库的名称。 |
| `scope_type` | String | 是 | 测试库的所属类型。<br>可选值: `organization`, `user_group` |
| `scope_id` | String | 是 | 测试库的所属id。 |
| `visibility` | String | 是 | 测试库的可见性。<br>可选值: `private`, `public` |
| `color` | String | 是 | 测试库的主题色。 |
| `description` | String | 是 | 测试库的描述。 |
| `members` | Object[] | 是 | 测试库的成员列表。 |
| `created_at` | Number | 是 | 测试库的创建时间。 |
| `created_by` | Object | 是 | 测试库的创建人。 |
| `updated_at` | Number | 是 | 测试库的更新时间。 |
| `updated_by` | Object | 是 | 测试库的更新人。 |
| `is_archived` | Number | 是 | 是否已归档。<br>可选值: `0`, `1` |
| `is_deleted` | Number | 是 | 是否已删除。<br>可选值: `0`, `1` |

#### Success Examples
**全量数据示例：**
```json
{
    "id": "5eb623f6a70571487ea47000",
    "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000",
    "identifier": "CSK",
    "name": "测试库",
    "scope_type": "user_group",
    "scope_id": "63c8fb32729dee3334d96af7",
    "visibility": "private",
    "color": "#F693E7",
    "description": "这是一个测试库",
    "members": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/members/a0417f68e846aae315c85d24643678a9",
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        }
    ],
    "created_at": 1583290300,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1583290300,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_archived": 0,
    "is_deleted": 0
}
```

**引用数据示例：**
```json
{
    "id": "5eb623f6a70571487ea47000",
    "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000",
    "identifier": "CSK",
    "name": "测试库",
    "is_archived": 0,
    "is_deleted": 0
}
```

### 测试配置中心

**接口:** ` 测试配置中心`

用于查看和管理测试用例属性。

### 用例

**接口:** ` 用例`

用于查看和管理测试用例的基本信息。
 资源地址：{GET} https://rest_api_root/v1/testhub/cases/{case_id}

#### Success
**资源属性**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 用例的id。 |
| `url` | String | 是 | 用例的资源地址。 |
| `library` | Object | 是 | 用例所属的测试库。 |
| `identifier` | String | 是 | 用例的标识。 |
| `title` | String | 是 | 用例的标题。 |
| `level` | String | 是 | 用例重要程度的名字。 |
| `short_id` | String | 是 | 用例的短id。 |
| `html_url` | String | 是 | 用例的html地址。 |
| `important_level` | Object | 是 | 用例的重要程度。 |
| `suite` | Object | 是 | 用例所属的测试模块。 |
| `state` | Object | 是 | 用例的状态。 |
| `type` | Object | 是 | 用例的类型。 |
| `maintenance` | Object | 是 | 用例的维护人。 |
| `test_type` | String | 是 | 用例的测试类型。允许值分别表示自动测试和手动测试。<br>可选值: `automation`, `manual` |
| `description` | String | 是 | 用例的描述。 |
| `precondition` | String | 是 | 用例的前置条件。 |
| `properties` | Object | 是 | 用例的自定义属性。 |
| `estimated_workload` | Number | 是 | 用例的预估工时。 |
| `remaining_workload` | Number | 是 | 用例的剩余工时。 |
| `steps` | Object[] | 是 | 用例的步骤列表。 |
| `participants` | Object[] | 是 | 用例的关注人列表。 |
| `public_image_token` | String | 是 | 用例描述和自定义多行文本类型属性里获取图片资源token。获取一个用例和获取用例列表参数include_public_image_token值有效时返回。 |
| `created_at` | Number | 是 | 用例的创建时间。 |
| `created_by` | Object | 是 | 用例的创建人。 |
| `updated_at` | Number | 是 | 用例的更新时间。 |
| `updated_by` | Object | 是 | 用例的更新人。 |
| `is_archived` | Number | 是 | 是否已归档。<br>可选值: `0`, `1` |
| `is_deleted` | Number | 是 | 是否已删除。<br>可选值: `0`, `1` |

#### Success Examples
**全量数据示例：**
```json
{
    "id": "5edca524cad2fa112b06305c",
    "url": "https://rest_api_root/v1/testhub/cases/5edca524cad2fa112b06305c",
    "library": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000",
        "identifier": "CSK",
        "name": "测试库",
        "is_archived": 0,
        "is_deleted": 0
    },
    "identifier": "CSK-10",
    "title": "这是一个测试用例",
    "level": "P1",
    "short_id": "fdUw3C",
    "html_url": "https://yctech.pingcode.com/testhub/cases/fdUw3C",
    "important_level": {
        "id": "57a109b35ae8c20630fd7256",
        "url": "https://rest_api_root/v1/testhub/case_important_levels/57a109b35ae8c20630fd7256",
        "name": "P1"
    },
    "suite": {
        "id": "55714870a70ea4eb623f6700",
        "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/suites/55714870a70ea4eb623f6700",
        "name": "登录",
        "paths": "首页/账户"
    },
    "state": {
        "id": "686f62038668bbae4f4dd0c1",
        "url": "https://rest_api_root/v1/testhub/case_states/686f62038668bbae4f4dd0c1",
        "name": "设计",
        "type": "pending"
    },
    "type": {
        "id": "5cf189b35de9c20620ad7153",
        "url": "https://rest_api_root/v1/testhub/case_types/5cf189b35de9c20620ad7153",
        "name": "功能测试"
    },
    "maintenance": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "test_type": "automation",
    "description": "测试用例的备注",
    "precondition": "前置条件的描述信息",
    "properties": {
        "prop_a": "prop_a_value",
        "prop_b": "prop_b_value"
    },
    "estimated_workload": 8,
    "remaining_workload": 5,
    "steps": [
        {
             "step_id": "524cad5edb06305cca2fa111",
             "description": "网页访问",
             "expected_value": null,
             "is_group": 1,
             "group_id": null
        },
        {
             "step_id": "524cad5edb06305cca2fa112",
             "description": "在浏览器地址栏中输入https://pingcode.com",
             "expected_value": "成功访问PingCode官网",
             "is_group": 0,
             "group_id": "524cad5edb06305cca2fa111"
        }
    ],
    "participants": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=test_case&principal_id=5edca524cad2fa112b06305c",
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        }
    ],
    "public_image_token": "IcF1VmJFF-UIi9lMU18m1NFFAruWXYx0ZAm90pJ2LGk",
    "created_at": 1583290300,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1583290300,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_archived": 0,
    "is_deleted": 0
}
```

**引用数据示例：**
```json
{
    "id": "5edca524cad2fa112b06305c",
    "url": "https://rest_api_root/v1/testhub/cases/5edca524cad2fa112b06305c",
    "identifier": "CSK-10",
    "title": "这是一个测试用例",
    "level": "P1",
    "short_id": "fdUw3C",
    "html_url": "https://yctech.pingcode.com/testhub/cases/fdUw3C",
    "properties": {
        "prop_a": "prop_a_value",
        "prop_b": "prop_b_value"
    }
}
```

### 计划

**接口:** ` 计划`

用于查看和管理测试计划的基本信息。
 资源地址：{GET} https://rest_api_root/v1/testhub/libraries/{library_id}/plans/{plan_id}

#### Success
**资源属性**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 计划的id。 |
| `url` | String | 是 | 计划的资源地址。 |
| `library` | Object | 是 | 计划所属的测试库。 |
| `name` | String | 是 | 计划的名称。 |
| `state` | Object | 是 | 计划的状态。 |
| `start_at` | Number | 是 | 计划的开始时间。 |
| `end_at` | Number | 是 | 计划的结束时间。 |
| `short_id` | String | 是 | 计划的短id。 |
| `html_url` | String | 是 | 计划的html地址。 |
| `type` | Object | 是 | 计划关联的类型。包括项目、发布和迭代。 |
| `project` | Object | 是 | 计划关联的项目。 |
| `sprint` | Object | 是 | 计划关联的迭代。 |
| `version` | Object | 是 | 计划关联的发布。 |
| `assignee` | Object | 是 | 计划的负责人。 |
| `summary` | String | 是 | 计划测试报告的概要。 |
| `created_at` | Number | 是 | 计划的创建时间。 |
| `created_by` | Object | 是 | 计划的创建人。 |
| `updated_at` | Number | 是 | 计划的更新时间。 |
| `updated_by` | Object | 是 | 计划的更新人。 |

#### Success Examples
**全量数据示例：**
```json
{
    "id": "5eb6a70571487623fea47000",
    "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/plans/5eb6a70571487623fea47000",
    "library": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000",
        "identifier": "CSK",
        "name": "测试库",
        "is_archived": 0,
        "is_deleted": 0
    },
    "name": "测试计划",
    "state": {
        "id": "652d0cb2b798f983d9c67c2b",
        "url": "http://rest_api_root/v1/testhub/plan_states/652d0cb2b798f983d9c67c2b",
        "name": "进行中",
        "type": "in_progress"
    },
    "start_at": 1589791860,
    "end_at": 1589791870,
    "short_id": "7nNkViOD",
    "html_url": "https://yctech.pingcode.com/testhub/libraries/CSK/plans/7nNkViOD/runs",
    "type": {
        "id": "641d0ab2b998f883f9c67b2c",
        "url": "http://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/plan_types/641d0ab2b998f883f9c67b2c",
        "name": "发布测试"
    },
    "project": {
        "id": "5eb623f6a70571487ea41919",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919",
        "identifier": "SCR",
        "name": "Scrum项目",
        "type": "scrum",
        "is_archived": 0,
        "is_deleted": 0
    },
    "sprint": null,
    "version": {
        "id": "5eb623487ea47001f6a70571",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919/versions/5eb623487ea47001f6a70571",
        "name": "1.0.0",
        "start_at": 1565255712,
        "end_at": 1565255879,
        "stage": {
            "id": "5f44a8f8bb347b14b49624a1",
            "url": "https://rest_api_root/v1/project/stages/5f44a8f8bb347b14b49624a1",
            "name": "未开始",
            "type": "pending",
            "color": "#FA8888"
        }
    },
    "assignee": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "summary": "测试报告的概要",
    "created_at": 1565366200,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1565366200,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    }

}
```

**引用数据示例：**
```json
{
    "id": "5eb6a70571487623fea47000",
    "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/plans/5eb6a70571487623fea47000",
    "name": "测试计划",
    "status": "in_progress",
    "start_at": 1589791860,
    "end_at": 1589791870,
    "short_id": "7nNkViOD",
    "html_url": "https://yctech.pingcode.com/testhub/libraries/CSK/plans/7nNkViOD/runs"
}
```

## 测试库

### 创建一个测试库

**接口:** `POST https://rest_api_root/v1/testhub/libraries`

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `scope_type` | String | 否 | 测试库的所属类型。默认值organization。允许值分别表示企业可见和团队可见。<br>默认值: `organization`<br>可选值: `organization`, `user_group` |
| `scope_id` | String | 否 | 测试库的所属id。当scope_type为user_group时，该字段必填，且表示团队id；当scope_type为其他值时，该字段无效。 |
| `name` | String | 是 | 测试库的名称。 |
| `visibility` | String | 否 | 测试库的可见范围。允许值分别表示组织全部成员可见和仅项目成员可见。<br>默认值: `private`<br>可选值: `public`, `private` |
| `identifier` | String | 是 | 测试库的标识。在一个企业中这个标识是唯一的。项目的标识由大写英文字母/数字/下划线/连接线组成（不超过15个字符）。 |
| `description` | String | 否 | 测试库的描述。 |
| `members` | Object[] | 否 | 测试库成员的列表。当测试库的scope_type变为user_group时，测试库成员必须是scope_id指定的团队内的成员；当scope_type为其他值时，测试库成员可以是任意成员或团队。 |
| `members.id` | String | 是 | 企业成员或团队的id。 |
| `members.type` | String | 是 | 测试库成员的类型。<br>可选值: `user`, `user_group` |

#### Parameters Examples
**请求示例：**
```json
{
    "scope_type": "user_group",
    "scope_id": "63c8fb32729dee3334d96af7",
    "name": "测试库",
    "visibility": "private",
    "identifier": "CSK",
    "description": "这是一个测试库",
    "members": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "type": "user"
        }
    ]
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "5eb623f6a70571487ea47000",
    "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000",
    "identifier": "CSK",
    "name": "测试库",
    "scope_type": "user_group",
    "scope_id": "63c8fb32729dee3334d96af7",
    "visibility": "private",
    "color": "#F693E7",
    "description": "这是一个测试库",
    "members": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/members/a0417f68e846aae315c85d24643678a9",
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        }
    ],
    "created_at": 1583290300,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1583290300,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_archived": 0,
    "is_deleted": 0
}
```

### 向测试库中添加一个成员

**接口:** `POST https://rest_api_root/v1/testhub/libraries/{library_id}/members`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `library_id` | String | 是 | 测试库的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `member` | Object | 否 | 测试库的成员。 |
| `member.id` | String | 是 | 企业成员或团队的id。 |
| `member.type` | String | 是 | 成员的类型。<br>可选值: `user`, `user_group` |
| `role_id` | String | 否 | 角色的id。 |

#### Parameters Examples
**请求示例：**
```json
{
    "member": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "type": "user"
    }
    "role_id": "6422711c3f12e6c1e46d40e6"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "a0417f68e846aae315c85d24643678a9",
    "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/members/a0417f68e846aae315c85d24643678a9",
    "library": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000",
        "identifier": "CSK",
        "name": "测试库",
        "is_archived": 0,
        "is_deleted": 0
    },
    "type": "user",
    "user": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "role": {
        "id": "6422711c3f12e6c1e46d40e6",
        "url": "https://rest_api_root/v1/directory/roles/6422711c3f12e6c1e46d40e6",
        "name": "管理员"
    }
}
```

### 向测试库中添加一个用例模块

**接口:** `POST https://rest_api_root/v1/testhub/libraries/{library_id}/suites`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `library_id` | String | 是 | 测试库的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 测试模块名称。测试模块为树形结构，同一层次下的名称不能重复。 |
| `parent_id` | String | 否 | 父测试模块的id。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "登录",
    "parent_id": "5eb623f6a70571487ea46999"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "55714870a70ea4eb623f6700",
    "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/suites/55714870a70ea4eb623f6700",
    "library": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000",
        "identifier": "CSK",
        "name": "测试库",
        "is_archived": 0,
        "is_deleted": 0
    },
    "name": "登录",
    "parent": {
        "id": "5eb623f6a70571487ea46999",
        "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/suites/5eb623f6a70571487ea46999",
        "name": "用户"
    },
    "paths": "首页/用户"
}
```

### 在测试库中移除一个成员

**接口:** `DELETE https://rest_api_root/v1/testhub/libraries/{library_id}/members/{member_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `library_id` | String | 是 | 测试库的id。 |
| `member_id` | String | 是 | 企业成员或团队的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "a0417f68e846aae315c85d24643678a9",
    "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/members/a0417f68e846aae315c85d24643678a9",
    "library": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000",
        "identifier": "CSK",
        "name": "测试库",
        "is_archived": 0,
        "is_deleted": 0
    },
    "type": "user",
    "user": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "role": {
        "id": "6422711c3f12e6c1e46d40e6",
        "url": "https://rest_api_root/v1/directory/roles/6422711c3f12e6c1e46d40e6",
        "name": "管理员"
    }
}
```

### 在测试库中移除一个用例模块

**接口:** `DELETE https://rest_api_root/v1/testhub/libraries/{library_id}/suites/{suite_id}`

请注意，删除一个模块会自动删除其所有的子模块。

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `library_id` | String | 是 | 测试库的id。 |
| `suite_id` | String | 是 | 测试模块的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "55714870a70ea4eb623f6701",
    "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/suites/55714870a70ea4eb623f6701",
    "library": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000",
        "identifier": "CSK",
        "name": "测试库",
        "is_archived": 0,
        "is_deleted": 0
    },
    "name": "注册",
    "parent": {
        "id": "5eb623f6a70571487ea46999",
        "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/suites/5eb623f6a70571487ea46999",
        "name": "用户"
    },
    "paths": "首页/用户"
}
```

### 获取测试库中的成员列表

**接口:** `GET https://rest_api_root/v1/testhub/libraries/{library_id}/members`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `library_id` | String | 是 | 测试库的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 2,
    "values": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/members/a0417f68e846aae315c85d24643678a9",
            "library": {
                "id": "5eb623f6a70571487ea47000",
                "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000",
                "identifier": "CSK",
                "name": "测试库",
                "is_archived": 0,
                "is_deleted": 0
            },
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "role": {
                "id": "6422711c3f12e6c1e46d40e6",
                "url": "https://rest_api_root/v1/directory/roles/6422711c3f12e6c1e46d40e6",
                "name": "管理员"
            }
        },
        {
            "id": "63c8fb32729dee3334d96af7",
            "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/members/63c8fb32729dee3334d96af7",
            "library": {
                "id": "5eb623f6a70571487ea47000",
                "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000",
                "identifier": "CSK",
                "name": "测试库",
                "is_archived": 0,
                "is_deleted": 0
            },
            "type": "user_group",
            "user_group": {
                "id": "63c8fb32729dee3334d96af7",
                "url": "https://rest_api_root/v1/directory/groups/63c8fb32729dee3334d96af7",
                "name": "Open Team"
            },
            "role": {
                "id": "6422711c3f12e6c1e46d40e6",
                "url": "https://rest_api_root/v1/directory/roles/6422711c3f12e6c1e46d40e6",
                "name": "管理员"
            }
        }
    ]
}
```

### 获取测试库中的用例模块列表

**接口:** `GET https://rest_api_root/v1/testhub/libraries/{library_id}/suites`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `library_id` | String | 是 | 测试库的id。 |

**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `parent_id` | String | 否 | 父测试模块的id。值可以是root或者某个模块id，当为空时，获取到所有的模块，当为root时，获取到所有的一级模块，当为某个模块id时，获取到该模块的直属子模块。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "55714870a70ea4eb623f6700",
            "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/suites/55714870a70ea4eb623f6700",
            "library": {
                "id": "5eb623f6a70571487ea47000",
                "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000",
                "identifier": "CSK",
                "name": "测试库",
                "is_archived": 0,
                "is_deleted": 0
            },
            "name": "登录",
            "parent": {
                "id": "5eb623f6a70571487ea46999",
                "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/suites/5eb623f6a70571487ea46999",
                "name": "用户"
            },
            "paths": "首页/用户"
        }
    ]
}
```

### 获取测试库列表

**接口:** `GET https://rest_api_root/v1/testhub/libraries`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 测试库的名称。 |
| `scope_type` | String | 否 | 测试库的所属类型。<br>可选值: `organization`, `user_group` |
| `scope_id` | String | 否 | 测试库的所属id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "5eb623f6a70571487ea47000",
            "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000",
            "identifier": "CSK",
            "name": "测试库",
            "scope_type": "user_group",
            "scope_id": "63c8fb32729dee3334d96af7",
            "visibility": "private",
            "color": "#F693E7",
            "description": "这是一个测试库",
            "members": [
                {
                    "id": "a0417f68e846aae315c85d24643678a9",
                    "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/members/a0417f68e846aae315c85d24643678a9",
                    "type": "user",
                    "user": {
                        "id": "a0417f68e846aae315c85d24643678a9",
                        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                        "name": "john",
                        "display_name": "John",
                        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
                    }
                }
            ],
            "created_at": 1583290300,
            "created_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "updated_at": 1583290300,
            "updated_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "is_archived": 0,
            "is_deleted": 0
        }
    ]
}
```

### 部分更新一个测试库

**接口:** `PATCH https://rest_api_root/v1/testhub/libraries/{library_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `library_id` | String | 是 | 测试库的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 测试库的名称。 |
| `identifier` | String | 否 | 测试库的标识。在一个企业中这个标识是唯一的。项目的标识由大写英文字母/数字/下划线/连接线组成（不超过15个字符）。 |
| `description` | String | 否 | 测试库的描述。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "测试库",
    "identifier": "CSK",
    "description": "这是一个测试库"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "5eb623f6a70571487ea47000",
    "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000",
    "identifier": "CSK",
    "name": "测试库",
    "scope_type": "user_group",
    "scope_id": "63c8fb32729dee3334d96af7",
    "visibility": "private",
    "color": "#F693E7",
    "description": "这是一个测试库",
    "members": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/members/a0417f68e846aae315c85d24643678a9",
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        }
    ],
    "created_at": 1583290300,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1583290300,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_archived": 0,
    "is_deleted": 0
}
```

### 部分更新一个测试库中用例模块

**接口:** `PATCH https://rest_api_root/v1/testhub/libraries/{library_id}/suites/{suite_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `library_id` | String | 是 | 测试库的id。 |
| `suite_id` | String | 是 | 测试模块的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 测试模块名称。测试模块为树形结构，同一层次下的名称不能重复。 |
| `parent_id` | String | 否 | 父测试模块的id。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "登录",
    "parent_id": "5eb623f6a70571487ea46999"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "55714870a70ea4eb623f6700",
    "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/suites/55714870a70ea4eb623f6700",
    "library": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000",
        "identifier": "CSK",
        "name": "测试库",
        "is_archived": 0,
        "is_deleted": 0
    },
    "name": "登录",
    "parent": {
        "id": "5eb623f6a70571487ea46999",
        "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/suites/5eb623f6a70571487ea46999",
        "name": "用户"
    },
    "paths": "首页/用户"
}
```

### 部分更新一个测试库内的成员

**接口:** `PATCH https://rest_api_root/v1/testhub/libraries/{library_id}/members/{member_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `library_id` | String | 是 | 测试库的id。 |
| `member_id` | String | 是 | 企业成员或团队的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `role_id` | String | 否 | 角色的id。管理员可以更改其他用户的角色，但非管理员用户无权更改其他用户的角色。 |

#### Parameters Examples
**请求示例：**
```json
{
    "role_id": "6422711c3f12e6c1e46d40e6"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "a0417f68e846aae315c85d24643678a9",
    "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/members/a0417f68e846aae315c85d24643678a9",
    "library": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000",
        "identifier": "CSK",
        "name": "测试库",
        "is_archived": 0,
        "is_deleted": 0
    },
    "type": "user",
    "user": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "role": {
        "id": "6422711c3f12e6c1e46d40e6",
        "url": "https://rest_api_root/v1/directory/roles/6422711c3f12e6c1e46d40e6",
        "name": "管理员"
    }
}
```

## 用例

### 创建一个用例

**接口:** `POST https://rest_api_root/v1/testhub/cases`

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `test_library_id` | String | 是 | 测试库的id。 |
| `title` | String | 是 | 测试用例的标题。 |
| `suite_id` | String | 否 | 测试用例所属模块的id。 |
| `type_id` | String | 否 | 测试用例类型的id。 |
| `important_level_id` | String | 否 | 测试用例重要程度的id。 |
| `maintenance_id` | String | 否 | 测试用例维护人的id。 |
| `participant_ids` | String[] | 否 | 测试用例关注人的id列表。 |
| `properties` | Object | 否 | 测试用例属性的键值对集合，需要注意的是，当前测试用例对应的属性方案需要包含这些测试用例属性，例如属性方案中包含prop_a和prop_b。 |
| `properties.prop_a` | Object | 否 | 测试用例属性prop_a。 |
| `properties.prop_b` | Object | 否 | 测试用例属性prop_b。 |
| `description` | String | 否 | 测试用例的描述。 |
| `precondition` | String | 否 | 测试用例的前置条件。 |
| `steps` | Object[] | 否 | 测试用例的步骤列表。steps是整体更新的。 |
| `steps.step_id` | String | 否 | 测试用例步骤的id。 |
| `steps.description` | String | 否 | 测试用例步骤的描述。 |
| `steps.expected_value` | String | 否 | 测试用例步骤的期望值。 |
| `steps.is_group` | Number | 否 | 测试用例步骤类型是否为分组。<br>可选值: `0`, `1` |
| `steps.group_id` | String | 否 | 测试用例步骤所属分组的id。group_id是分组类型步骤的step_id，分组类型的步骤不需要该参数。 |

#### Parameters Examples
**请求示例：**
```json
{
    "test_library_id": "5eb623f6a70571487ea47000",
    "title": "这是一个测试用例",
    "suite_id": "55714870a70ea4eb623f6700",
    "type_id": "5cf189b35de9c20620ad7153",
    "important_level_id": "57a109b35ae8c20630fd7256",
    "maintenance_id": "a0417f68e846aae315c85d24643678a9",
    "participant_ids": [
        "a0417f68e846aae315c85d24643678a9"
    ],
    "properties": {
        "prop_a": "prop_a_value",
        "prop_b": "prop_b_value"
    },
    "description": "测试用例的备注",
    "precondition": "前置条件的描述信息",
    "steps": [
        {
            "step_id": "5cdca524cade3a112b063071",
            "description": "UI测试",
            "is_group": 1
        },
        {
            "step_id": "5cdca524cade3a112b063072",
            "description": "在浏览器地址栏中输入https://pingcode.com",
            "expected_value": "成功访问PingCode官网",
            "is_group": 0,
            "group_id": "5cdca524cade3a112b063071"
        }
    ]
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "5edca524cad2fa112b06305c",
    "url": "https://rest_api_root/v1/testhub/cases/5edca524cad2fa112b06305c",
    "library": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000",
        "identifier": "CSK",
        "name": "测试库",
        "is_archived": 0,
        "is_deleted": 0
    },
    "identifier": "CSK-10",
    "title": "这是一个测试用例",
    "level": "P1",
    "short_id": "fdUw3C",
    "html_url": "https://yctech.pingcode.com/testhub/cases/fdUw3C",
    "important_level": {
        "id": "57a109b35ae8c20630fd7256",
        "url": "https://rest_api_root/v1/testhub/case_important_levels/57a109b35ae8c20630fd7256",
        "name": "P1"
    },
    "suite": {
        "id": "55714870a70ea4eb623f6700",
        "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/suites/55714870a70ea4eb623f6700",
        "name": "登录",
        "paths": "首页/账户"
    },
   "state": {
        "id": "686f62038668bbae4f4dd0c1",
        "url": "https://rest_api_root/v1/testhub/case_states/686f62038668bbae4f4dd0c1",
        "name": "设计",
        "type": "pending"
    },
    "type": {
        "id": "5cf189b35de9c20620ad7153",
        "url": "https://rest_api_root/v1/testhub/case_types/5cf189b35de9c20620ad7153",
        "name": "功能测试"
    },
    "maintenance": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "test_type": "automation",
    "description": "测试用例的备注",
    "precondition": "前置条件的描述信息",
    "properties": {
        "prop_a": "prop_a_value",
        "prop_b": "prop_b_value"
    },
    "estimated_workload": null,
    "remaining_workload": null,
    "steps": [
        {
            "step_id": "524cad5edb06305cca2fa112",
            "description": "UI测试",
            "expected_value": null,
            "is_group": 1,
            "group_id": null
        },
        {
            "step_id": "524cad5edb06305cca2fa113",
            "description": "在浏览器地址栏中输入https://pingcode.com",
            "expected_value": "成功访问PingCode官网",
            "is_group": 0,
            "group_id": "524cad5edb06305cca2fa112"
        }
    ],
    "participants": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=test_case&principal_id=5edca524cad2fa112b06305c",
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        }
    ],
    "created_at": 1583290300,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1583290300,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_archived": 0,
    "is_deleted": 0
}
```

### 删除一个用例

**接口:** `DELETE https://rest_api_root/v1/testhub/cases/{case_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `case_id` | String | 是 | 测试用例的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "5edca524cad2fa112b06305d",
    "url": "https://rest_api_root/v1/testhub/cases/5edca524cad2fa112b06305d",
    "library": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000",
        "identifier": "CSK",
        "name": "测试库",
        "is_archived": 0,
        "is_deleted": 0
    },
    "identifier": "CSK-1",
    "title": "这是一个测试用例",
    "level": "P1",
    "short_id": "fdUw3C",
    "html_url": "https://yctech.pingcode.com/testhub/cases/fdUw3C",
    "important_level": {
        "id": "57a109b35ae8c20630fd7256",
        "url": "https://rest_api_root/v1/testhub/case_important_levels/57a109b35ae8c20630fd7256",
        "name": "P1"
    },
    "suite": {
        "id": "55714870a70ea4eb623f6700",
        "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/suites/55714870a70ea4eb623f6700",
        "name": "登录",
        "paths": "首页/账户"
    },
    "state": {
        "id": "686f62038668bbae4f4dd0c1",
        "url": "https://rest_api_root/v1/testhub/case_states/686f62038668bbae4f4dd0c1",
        "name": "设计",
        "type": "pending"
    },
    "type": {
        "id": "5cf189b35de9c20620ad7153",
        "url": "https://rest_api_root/v1/testhub/case_types/5cf189b35de9c20620ad7153",
        "name": "功能测试"
    },
    "maintenance": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "test_type": "automation",
    "description": "测试用例的备注",
    "precondition": "前置条件的描述信息",
    "properties": {
        "prop_a": "prop_a_value",
        "prop_b": "prop_b_value"
    },
    "estimated_workload": 8,
    "remaining_workload": 5,
    "steps": [
        {
            "step_id": "524cad5edb06305cca2fa112",
            "description": "在浏览器地址栏中输入https://pingcode.com",
            "expected_value": "成功访问PingCode官网",
            "is_group": 0,
            "group_id": null
        }
    ],
    "participants": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=test_case&principal_id=5edca524cad2fa112b06305d",
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        }
    ],
    "created_at": 1583290300,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1583293300,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_archived": 0,
    "is_deleted": 1
}
```

### 批量创建测试用例关联工作项

**接口:** `POST https://rest_api_root/v1/testhub/cases/{case_id}/work_item_relations/bulk`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `case_id` | String | 是 | 测试用例id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `work_item_ids` | String[] | 是 | 关联的工作项id数组。支持的工作项类型包括bug和story。 |

#### Parameters Examples
**请求示例：**
```json
{
    "work_item_ids": ["5edca524cad2fa1125cb0630"]
}
```

#### Success Examples
**响应示例：**
```json
[
    {
        "state": "success",
        "relation": {
            "id": "fa1125cb06305edca524cad2",
            "url": "https://rest_api_root/v1/relations/fa1125cb06305edca524cad2",
            "principal_type": "test_case",
            "principal": {
                "id": "5edca524cad2fa112b06305c",
                "url": "https://rest_api_root/v1/testhub/cases/5edca524cad2fa112b06305c",
                "identifier": "CSK-10",
                "title": "这是一个测试用例",
                "level": "P1",
                "short_id": "fdUw3C",
                "html_url": "https://yctech.pingcode.com/testhub/cases/fdUw3C"
            },
            "target_type": "work_item",
            "target": {
                "id": "5edca524cad2fa1125cb0630",
                "url": "https://rest_api_root/v1/project/work_items/5edca524cad2fa1125cb0630",
                "identifier": "SCR-5",
                "title": "这是一个缺陷",
                "type": "bug",
                "start_at": 1583290309,
                "end_at": 1583290347,
                "parent_id": "5edca524cad2fa112b06105c",
                "short_id": "c9WqLmTO",
                "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO"
            }
        }
    }
]
```

### 批量创建用例

**接口:** `POST https://rest_api_root/v1/testhub/cases/bulk`

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `cases` | Object[] | 是 | 创建单个测试用例必要参数的数组，数组内对象不能超过100个。 |
| `cases.test_library_id` | String | 是 | 测试用例所属测试库id。 |
| `cases.title` | String | 是 | 测试用例的标题，长度1～200有效字符。 |
| `cases.important_level_id` | String | 否 | 测试用例重要程度的id。 |
| `cases.maintenance_id` | String | 否 | 测试用例维护人的id。 |
| `cases.participant_ids` | String[] | 否 | 测试用例关注人的id列表。 |
| `cases.properties` | String | 否 | 测试用例属性的键值对集合。 |
| `cases.description` | String | 否 | 测试用例的描述。 |
| `cases.precondition` | String | 否 | 测试用例的前置条件。 |
| `cases.steps` | Object[] | 否 | 测试用例的步骤列表。 |
| `cases.steps.step_id` | String | 否 | 测试用例步骤的id。 |
| `cases.steps.description` | String | 否 | 测试用例步骤的描述。 |
| `cases.steps.expected_value` | String | 否 | 测试用例步骤的期望值。 |
| `cases.steps.is_group` | Number | 否 | 测试用例步骤类型是否为分组。<br>可选值: `0`, `1` |
| `cases.steps.group_id` | String | 否 | 测试用例步骤所属分组的id。group_id是分组类型步骤的step_id，分组类型的步骤不需要该参数。 |

#### Parameters Examples
**请求示例：**
```json
{
    "cases": [
        {
            "test_library_id": "5eb623f6a70571487ea47000",
            "title": "这是一个测试用例",
            "important_level_id": "57a109b35ae8c20630fd7256",
            "maintenance_id": "a0417f68e846aae315c85d24643678a9",
            "participant_ids": [
                "a0417f68e846aae315c85d24643678a9"
            ],
            "properties": {
                "prop_a": "prop_a_value",
                "prop_b": "prop_b_value"
            },
            "description": "测试用例的描述",
            "precondition": "前置条件的描述信息",
            "steps": [
                {
                    "step_id": "524cad5edb06305cca2fa112",
                    "description": "UI测试",
                    "is_group": 1
                },
                {
                    "step_id": "524cad5edb06305cca2fa113",
                    "description": "在浏览器地址栏中输入https://pingcode.com",
                    "expected_value": "成功访问PingCode官网",
                    "is_group": 0,
                    "group_id": "524cad5edb06305cca2fa112"
                }
            ]
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
        "case": {
            "id": "5edca524cad2fa112b06305d",
            "url": "https://rest_api_root/v1/testhub/cases/5edca524cad2fa112b06305d",
            "library": {
                "id": "5eb623f6a70571487ea47000",
                "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000",
                "identifier": "CSK",
                "name": "测试库",
                "is_archived": 0,
                "is_deleted": 0
            },
            "identifier": "CSK-1",
            "title": "这是一个测试用例",
            "level": "P1",
            "short_id": "fdUw3C",
            "html_url": "https://yctech.pingcode.com/testhub/cases/fdUw3C",
            "important_level": {
                "id": "57a109b35ae8c20630fd7256",
                "url": "https://rest_api_root/v1/testhub/case_important_levels/57a109b35ae8c20630fd7256",
                "name": "P1"
            },
            "suite": {
                "id": "55714870a70ea4eb623f6700",
                "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/suites/55714870a70ea4eb623f6700",
                "name": "登录",
                "paths": "首页/账户"
            },
            "state": {
                "id": "686f62038668bbae4f4dd0c1",
                "url": "https://rest_api_root/v1/testhub/case_states/686f62038668bbae4f4dd0c1",
                "name": "设计",
                "type": "pending"
            },
            "type": {
                "id": "5cf189b35de9c20620ad7153",
                "url": "https://rest_api_root/v1/testhub/case_types/5cf189b35de9c20620ad7153",
                "name": "功能测试"
            },
            "maintenance": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "test_type": "automation",
            "description": "测试用例的备注",
            "precondition": "前置条件的描述信息",
            "properties": {
                "prop_a": "prop_a_value",
                "prop_b": "prop_b_value"
            },
            "estimated_workload": null,
            "remaining_workload": null,
            "steps": [
                {
                    "step_id": "524cad5edb06305cca2fa112",
                    "description": "UI测试",
                    "expected_value": null,
                    "is_group": 1,
                    "group_id": null
                },
                {
                    "step_id": "524cad5edb06305cca2fa113",
                    "description": "在浏览器地址栏中输入https://pingcode.com",
                    "expected_value": "成功访问PingCode官网",
                    "is_group": 0,
                    "group_id": "524cad5edb06305cca2fa112"
                }
            ],
            "participants": [
                {
                    "id": "a0417f68e846aae315c85d24643678a9",
                    "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=test_case&principal_id=5edca524cad2fa112b06305d",
                    "type": "user",
                    "user": {
                        "id": "a0417f68e846aae315c85d24643678a9",
                        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                        "name": "john",
                        "display_name": "John",
                        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
                    }
                }
            ],
            "created_at": 1583290300,
            "created_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "updated_at": 1583293300,
            "updated_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "is_archived": 0,
            "is_deleted": 0
        }
    }
]
```

### 批量删除测试用例关联工作项

**接口:** `DELETE https://rest_api_root/v1/testhub/cases/{case_id}/work_item_relations/bulk`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `case_id` | String | 是 | 测试用例id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `work_item_ids` | String[] | 是 | 关联的工作项id数组。支持的工作项类型包括bug和story。 |

#### Parameters Examples
**请求示例：**
```json
{
    "work_item_ids": ["5edca524cad2fa1125cb0630"]
}
```

#### Success Examples
**响应示例：**
```json
[
    {
        "state": "success",
        "relation": {
            "id": "fa1125cb06305edca524cad2",
            "url": "https://rest_api_root/v1/relations/fa1125cb06305edca524cad2",
            "principal_type": "test_case",
            "principal": {
                "id": "5edca524cad2fa112b06305c",
                "url": "https://rest_api_root/v1/testhub/cases/5edca524cad2fa112b06305c",
                "identifier": "CSK-10",
                "title": "这是一个测试用例",
                "level": "P1",
                "short_id": "fdUw3C",
                "html_url": "https://yctech.pingcode.com/testhub/cases/fdUw3C"
            },
            "target_type": "work_item",
            "target": {
                "id": "5edca524cad2fa1125cb0630",
                "url": "https://rest_api_root/v1/project/work_items/5edca524cad2fa1125cb0630",
                "identifier": "SCR-5",
                "title": "这是一个缺陷",
                "type": "bug",
                "start_at": 1583290309,
                "end_at": 1583290347,
                "parent_id": "5edca524cad2fa112b06105c",
                "short_id": "c9WqLmTO",
                "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
                "properties": {
                   "prop_a": "prop_a_value",
                   "prop_b": "prop_b_value"
                }
            }
        }
    }
]
```

### 批量部分更新用例

**接口:** `PATCH https://rest_api_root/v1/testhub/cases/bulk`

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `cases` | Object[] | 是 | 部分更新测试用例的数组。 |
| `cases.case_id` | String | 是 | 测试用例的id。 |
| `cases.state_id` | String | 否 | 测试用例状态的id。 |
| `cases.type_id` | String | 否 | 测试用例类型的id。 |
| `cases.title` | String | 否 | 测试用例的标题。 |
| `cases.important_level_id` | String | 否 | 测试用例重要程度的id。 |
| `cases.maintenance_id` | String | 否 | 测试用例维护人的id。 |
| `cases.properties` | Object[] | 否 | 测试用例属性的键值对集合，property中包含propertyKey、propertyValue和propertyType三个字段。需要注意的是，当前测试用例对应的属性方案需要包含这些测试用例属性。 |
| `cases.properties.prop_a` | Object | 否 | 测试用例属性的自定义属性prop_a。 |
| `cases.properties.prop_b` | Object | 否 | 测试用例属性的自定义属性prop_b。 |
| `cases.description` | String | 否 | 测试用例的备注。 |
| `cases.precondition` | String | 否 | 测试用例的前置条件。 |
| `cases.steps` | Object[] | 否 | 测试用例的步骤列表。steps是整体更新的。 |
| `cases.steps.step_id` | String | 否 | 测试用例的步骤的id。如果step中不包含用于确定唯一性的step_id，那么这个step将被视为新建，并为之创建新的step_id。 |
| `cases.steps.description` | String | 否 | 测试用例的步骤的描述。 |
| `cases.steps.expected_value` | String | 否 | 测试用例的步骤的期望值。 |
| `cases.steps.is_group` | Number | 否 | 测试用例步骤类型是否为分组。<br>可选值: `0`, `1` |
| `cases.steps.group_id` | String | 否 | 测试用例步骤所属分组的id。group_id是分组类型步骤的step_id，分组类型的步骤不需要该参数。 |

#### Parameters Examples
**请求示例：**
```json
{
    "cases": [
        {
            "case_id": "5edca524cad2fa112b06305c",
            "state_id": "686f62038668bbae4f4dd0c1",
            "type_id": "5cf189b35de9c20620ad7153",
            "title": "这是一个测试用例",
            "important_level_id": "57a109b35ae8c20630fd7256",
            "maintenance_id": "a0417f68e846aae315c85d24643678a9",
            "properties": {
                "prop_a": "prop_a_value",
                "prop_b": "prop_b_value"
            },
            "description": "测试用例的描述",
            "precondition": "前置条件的描述信息",
            "steps": [
                {
                    "step_id": "524cad5edb06305cca2fa112",
                    "description": "UI测试",
                    "is_group": 1
                },
                {
                    "step_id": "524cad5edb06305cca2fa113",
                    "description": "点击下一页按钮",
                    "expected_value": "成功跳转至下一页",
                    "is_group": 0,
                    "group_id": "524cad5edb06305cca2fa112"
                },
                {
                    "description": "点击最后一页按钮",
                    "expected_value": "成功跳转至最后一页",
                    "is_group": 0,
                    "group_id": "524cad5edb06305cca2fa112"
                }
            ]
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
        "case": {
            "id": "5edca524cad2fa112b06305c",
            "url": "https://rest_api_root/v1/testhub/cases/5edca524cad2fa112b06305c",
            "library": {
                "id": "5eb623f6a70571487ea47000",
                "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000",
                "identifier": "CSK",
                "name": "测试库",
                "is_archived": 0,
                "is_deleted": 0
            },
            "identifier": "CSK-10",
            "title": "这是一个测试用例",
            "level": "P1",
            "short_id": "fdUw3C",
            "html_url": "https://yctech.pingcode.com/testhub/cases/fdUw3C",
            "important_level": {
                "id": "57a109b35ae8c20630fd7256",
                "url": "https://rest_api_root/v1/testhub/case_important_levels/57a109b35ae8c20630fd7256",
                "name": "P1"
            },
            "suite": {
                "id": "55714870a70ea4eb623f6700",
                "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/suites/55714870a70ea4eb623f6700",
                "name": "登录",
                "paths": "首页/账户"
            },
            "state": {
                 "id": "686f62038668bbae4f4dd0c1",
                 "url": "https://rest_api_root/v1/testhub/case_states/686f62038668bbae4f4dd0c1",
                 "name": "设计",
                 "type": "pending"
            },
            "type": {
                "id": "5cf189b35de9c20620ad7153",
                "url": "https://rest_api_root/v1/testhub/case_types/5cf189b35de9c20620ad7153",
                "name": "功能测试"
            },
            "maintenance": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "test_type": "automation",
            "description": "测试用例的备注",
            "precondition": "前置条件的描述信息",
            "properties": {
                "prop_a": "prop_a_value",
                "prop_b": "prop_b_value"
            },
            "estimated_workload": 8,
            "remaining_workload": 5,
            "steps": [
                {
                    "step_id": "524cad5edb06305cca2fa112",
                    "description": "UI测试",
                    "expected_value": null,
                    "is_group": 1,
                    "group_id": null
                },
                {
                    "step_id": "524cad5edb06305cca2fa113",
                    "description": "点击下一页按钮",
                    "expected_value": "成功跳转至下一页",
                    "is_group": 0,
                    "group_id": "524cad5edb06305cca2fa112"
                },
                {
                    "step_id": "524cad5edb06305cca2fa114",
                    "description": "点击最后一页按钮",
                    "expected_value": "成功跳转至最后一页",
                    "is_group": 0,
                    "group_id": "524cad5edb06305cca2fa112"
                }
            ],
            "participants": [
                {
                    "id": "a0417f68e846aae315c85d24643678a9",
                    "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=test_case&principal_id=5edca524cad2fa112b06305c",
                    "type": "user",
                    "user": {
                        "id": "a0417f68e846aae315c85d24643678a9",
                        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                        "name": "john",
                        "display_name": "John",
                        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
                    }
                }
            ],
            "created_at": 1583290300,
            "created_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "updated_at": 15832903300,
            "updated_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "is_archived": 0,
            "is_deleted": 0
        }
    }
]
```

### 获取用例列表

**接口:** `GET https://rest_api_root/v1/testhub/cases`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `library_id` | String | 否 | 测试库的id。 |
| `maintenance_id` | String | 否 | 维护人的id。 |
| `state_ids` | String | 否 | 状态的id，使用','分割，最多只能20个。 |
| `important_level_ids` | String | 否 | 重要程度的id，使用','分割，最多只能20个。 |
| `tag_ids` | String | 否 | 标签的id，使用','分割，最多只能20个。 |
| `created_between` | String | 否 | 创建时间介于的时间范围，通过','分割起始时间。 |
| `updated_between` | String | 否 | 更新时间介于的时间范围，通过','分割起始时间。 |
| `include_public_image_token` | String | 否 | 包含获取图片资源token的属性。使用','分割，最多只能20个，支持description和自定义多行文本类型的属性。参数示例description,properties.prop_b。 |
| `include_deleted` | Boolean | 否 | 是否查询已删除的用例。该值默认为false。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "5edca524cad2fa112b06305c",
            "url": "https://rest_api_root/v1/testhub/cases/5edca524cad2fa112b06305c",
            "library": {
                "id": "5eb623f6a70571487ea47000",
                "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000",
                "identifier": "CSK",
                "name": "测试库",
                "is_archived": 0,
                "is_deleted": 0
            },
            "identifier": "CSK-10",
            "title": "这是一个测试用例",
            "level": "P1",
            "short_id": "fdUw3C",
            "html_url": "https://yctech.pingcode.com/testhub/cases/fdUw3C",
            "important_level": {
                "id": "57a109b35ae8c20630fd7256",
                "url": "https://rest_api_root/v1/testhub/case_important_levels/57a109b35ae8c20630fd7256",
                "name": "P1"
            },
            "suite": {
                "id": "55714870a70ea4eb623f6700",
                "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/suites/55714870a70ea4eb623f6700",
                "name": "登录",
                "paths": "首页/账户"
            },
            "state": {
                "id": "686f62038668bbae4f4dd0c1",
                "url": "https://rest_api_root/v1/testhub/case_states/686f62038668bbae4f4dd0c1",
                "name": "设计",
                "type": "pending"
             },
            "type": {
                "id": "5cf189b35de9c20620ad7153",
                "url": "https://rest_api_root/v1/testhub/case_types/5cf189b35de9c20620ad7153",
                "name": "功能测试"
            },
            "maintenance": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "test_type": "automation",
            "description": "测试用例的备注",
            "precondition": "前置条件的描述信息",
            "properties": {
                "prop_a": "prop_a_value",
                "prop_b": "prop_b_value"
            },
            "estimated_workload": 8,
            "remaining_workload": 5,
            "steps": [
                {
                    "step_id": "524cad5edb06305cca2fa100",
                    "description": "UI测试",
                    "expected_value": null,
                    "is_group": 1,
                    "group_id": null
                },
                {
                    "step_id": "524cad5edb06305cca2fa112",
                    "description": "在浏览器地址栏中输入https://pingcode.com",
                    "expected_value": "成功访问PingCode官网",
                    "is_group": 0,
                    "group_id": "524cad5edb06305cca2fa100"
                },
                {
                    "step_id": "524cad5edb06305cca2fa113",
                    "description": "点击下一页按钮",
                    "expected_value": "成功跳转至下一页",
                    "is_group": 0,
                    "group_id": "524cad5edb06305cca2fa100"
                }
            ],
            "participants": [
                {
                    "id": "a0417f68e846aae315c85d24643678a9",
                    "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=test_case&principal_id=5edca524cad2fa112b06305c",
                    "type": "user",
                    "user": {
                        "id": "a0417f68e846aae315c85d24643678a9",
                        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                        "name": "john",
                        "display_name": "John",
                        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
                    }
                }
            ],
            "public_image_token": "IcF1VmJFF-UIi9lMU18m1NFFAruWXYx0ZAm90pJ2LGk",
            "created_at": 1583290300,
            "created_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "updated_at": 1583293300,
            "updated_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "is_archived": 0,
            "is_deleted": 0
        }
    ]
}
```

### 获取用例属性列表

**接口:** `GET https://rest_api_root/v1/testhub/case/properties?library_id={library_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `library_id` | String | 是 | 测试库的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 2,
    "values": [
        {
            "id": "environment",
            "url": "https://rest_api_root/v1/testhub/case_properties/environment",
            "name": "重现环境",
            "type": "select",
            "options": [
                {
                    "_id": "5efb1859110533727a82c603",
                    "text": "测试"
                },
                {
                    "_id": "5efb1859110533727a82c604",
                    "text": "生产"
                }
            ]
        },
        {
            "id": "estimated_workload",
            "url": "https://rest_api_root/v1/testhub/case_properties/estimated_workload",
            "name": "预估工时",
            "type": "number",
            "options": null
        }
    ]
}
```

### 获取用例模块列表

**接口:** `GET https://rest_api_root/v1/testhub/case/suites?library_id={library_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `library_id` | String | 是 | 测试库的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "55714870a70ea4eb623f6700",
            "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/suites/55714870a70ea4eb623f6700",
            "name": "登录",
            "paths": "首页/用户"
        }
    ]
}
```

### 获取用例状态列表

**接口:** `GET https://rest_api_root/v1/testhub/case/states?library_id={library_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `library_id` | String | 是 | 测试库的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_index": 0,
    "page_size": 30,
    "total": 3,
    "values": [
        {
            "id": "686f62038668bbae4f4dd0c1",
            "url": "http://rest_api_root/v1/testhub/case_states/686f62038668bbae4f4dd0c1",
            "name": "设计",
            "type": "pending"
        },
        {
            "id": "686f62038668bbae4f4dd0c2",
            "url": "http://rest_api_root/v1/testhub/case_states/686f62038668bbae4f4dd0c2",
            "name": "就绪",
            "type": "completed"
        },
        {
            "id": "686f62038668bbae4f4dd0c3",
            "url": "http://rest_api_root/v1/testhub/case_states/686f62038668bbae4f4dd0c3",
            "name": "废弃",
            "type": "closed"
        }
    ]
}
```

### 获取用例的执行历史列表

**接口:** `GET https://rest_api_root/v1/testhub/cases/{case_id}/histories`

获取测试用例所有执行用例的最后一次执行结果。

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `case_id` | String | 是 | 测试用例的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "65115f0939286e26e05a66db",
            "url": "https://rest_api_root/v1/testhub/runs/547000eb6a70571487623fea/histories/65115f0939286e26e05a66db",
            "run": {
                "id": "547000eb6a70571487623fea",
                "url": "https://rest_api_root/v1/testhub/runs/547000eb6a70571487623fea",
                "status": "pass",
                "short_id": "Aq1u38yX",
                "html_url": "https://yctech.pingcode.com/testhub/runs/Aq1u38yX"
            },
            "library": {
                "id": "5eb623f6a70571487ea47000",
                "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000",
                "identifier": "CSK",
                "name": "测试库",
                "is_archived": 0,
                "is_deleted": 0
            },
            "plan": {
                "id": "5eb6a70571487623fea47000",
                "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/plans/5eb6a70571487623fea47000",
                "name": "测试计划",
                "status": "in_progress",
                "start_at": 1589791860,
                "end_at": 1589791870,
                "short_id": "7nNkViOD",
                "html_url": "https://yctech.pingcode.com/testhub/libraries/CSK/plans/7nNkViOD/runs"
            },
            "case": {
                "id": "5edca524cad2fa112b06305c",
                "url": "https://rest_api_root/v1/testhub/cases/5edca524cad2fa112b06305c",
                "identifier": "CSK-10",
                "title": "这是一个测试用例",
                "level": "P1",
                "short_id": "fdUw3C",
                "html_url": "https://yctech.pingcode.com/testhub/cases/fdUw3C",
                "test_type": "automation",
                "properties": {
                    "prop_a": "prop_a_value",
                    "prop_b": "prop_b_value"
                }
            },
            "status": "pass",
            "executed_at": 1583290300,
            "executed_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "steps": [
                {
                    "step_id": "524cad5edb06305cca2fa112",
                    "status": "pass",
                    "actual_value": null
                }
            ]
        }
    ]
}
```

### 获取用例类型列表

**接口:** `GET https://rest_api_root/v1/testhub/case/types?library_id={library_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `library_id` | String | 是 | 测试库的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "5cf189b35de9c20620ad7153",
            "url": "https://rest_api_root/v1/testhub/case_types/5cf189b35de9c20620ad7153",
            "name": "功能测试"
        }
    ]
}
```

### 部分更新一个用例

**接口:** `PATCH https://rest_api_root/v1/testhub/cases/{case_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `case_id` | String | 是 | 测试用例的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `suite_id` | String | 否 | 测试用例所属模块的id。 |
| `state_id` | String | 否 | 测试用例状态的id。 |
| `type_id` | String | 否 | 测试用例类型的id。 |
| `title` | String | 否 | 测试用例的标题。 |
| `important_level_id` | String | 否 | 测试用例重要程度的id。 |
| `maintenance_id` | String | 否 | 测试用例维护人的id。 |
| `properties` | Object | 否 | 测试用例属性的键值对集合。需要注意的是，当前测试用例对应的属性方案需要包含这些测试用例属性。 |
| `properties.prop_a` | Object | 否 | 测试用例属性prop_a。 |
| `properties.prop_b` | Object | 否 | 测试用例属性prop_b。 |
| `description` | String | 否 | 测试用例的备注。 |
| `precondition` | String | 否 | 测试用例的前置条件。 |
| `steps` | Object[] | 否 | 测试用例的步骤列表。steps是整体更新的。 |
| `steps.step_id` | String | 否 | 测试用例的步骤的id。如果step中不包含用于确定唯一性的step_id，那么这个step将被视为新建，并为之创建新的step_id。 |
| `steps.description` | String | 否 | 测试用例的步骤的描述。 |
| `steps.expected_value` | String | 否 | 测试用例的步骤的期望值。 |
| `steps.is_group` | Number | 否 | 测试用例步骤类型是否为分组。<br>可选值: `0`, `1` |
| `steps.group_id` | String | 否 | 测试用例步骤所属分组的id。group_id是分组类型步骤的step_id，分组类型的步骤不需要该参数。 |

#### Parameters Examples
**请求示例：**
```json
{
    "suite_id": "55714870a70ea4eb623f6700",
    "state_id": "686f62038668bbae4f4dd0c1",
    "type_id": "5cf189b35de9c20620ad7153",
    "title": "这是一个测试用例",
    "important_level_id": "57a109b35ae8c20630fd7256",
    "maintenance_id": "a0417f68e846aae315c85d24643678a9",
    "properties": {
        "prop_a": "prop_a_value",
        "prop_b": "prop_b_value"
    },
    "description": "测试用例的备注",
    "precondition": "前置条件的描述信息",
    "steps": [
        {
            "step_id": "524cad5edb06305cca2fa112",
            "description": "UI测试",
            "is_group": 1
        },
        {
            "step_id": "524cad5edb06305cca2fa113",
            "description": "点击下一页按钮",
            "expected_value": "成功跳转至下一页",
            "is_group": 0,
            "group_id": "524cad5edb06305cca2fa112"
        },
        {
            "description": "点击最后一页按钮",
            "expected_value": "成功跳转至最后一页",
            "is_group": 0,
            "group_id": "524cad5edb06305cca2fa112"
        }
    ]
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "5edca524cad2fa112b06305c",
    "url": "https://rest_api_root/v1/testhub/cases/5edca524cad2fa112b06305c",
    "library": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000",
        "identifier": "CSK",
        "name": "测试库",
        "is_archived": 0,
        "is_deleted": 0
    },
    "identifier": "CSK-10",
    "title": "这是一个测试用例",
    "level": "P1",
    "short_id": "fdUw3C",
    "html_url": "https://yctech.pingcode.com/testhub/cases/fdUw3C",
    "important_level": {
        "id": "57a109b35ae8c20630fd7256",
        "url": "https://rest_api_root/v1/testhub/case_important_levels/57a109b35ae8c20630fd7256",
        "name": "P1"
    },
    "suite": {
        "id": "55714870a70ea4eb623f6700",
        "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/suites/55714870a70ea4eb623f6700",
        "name": "登录",
        "paths": "首页/账户"
    },
   "state": {
        "id": "686f62038668bbae4f4dd0c1",
        "url": "https://rest_api_root/v1/testhub/case_states/686f62038668bbae4f4dd0c1",
        "name": "设计",
        "type": "pending"
     },
    "type": {
        "id": "5cf189b35de9c20620ad7153",
        "url": "https://rest_api_root/v1/testhub/case_types/5cf189b35de9c20620ad7153",
        "name": "功能测试"
    },
    "maintenance": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "test_type": "automation",
    "description": "测试用例的备注",
    "precondition": "前置条件的描述信息",
    "properties": {
        "prop_a": "prop_a_value",
        "prop_b": "prop_b_value"
    },
    "estimated_workload": 8,
    "remaining_workload": 5,
    "steps": [
        {
            "step_id": "524cad5edb06305cca2fa112",
            "description": "UI测试",
            "expected_value": null,
            "is_group": 1,
            "group_id": null
        },
        {
            "step_id": "524cad5edb06305cca2fa113",
            "description": "点击下一页按钮",
            "expected_value": "成功跳转至下一页",
            "is_group": 0,
            "group_id": "524cad5edb06305cca2fa112"
        },
        {
            "step_id": "524cad5edb06305cca2fa114",
            "description": "点击最后一页按钮",
            "expected_value": "成功跳转至最后一页",
            "is_group": 0,
            "group_id": "524cad5edb06305cca2fa112"
        }
    ],
    "participants": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=test_case&principal_id=5edca524cad2fa112b06305c",
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        }
    ],
    "created_at": 1583290300,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1583293300,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_archived": 0,
    "is_deleted": 0
}
```

## 计划

### 全量更新一个执行用例

**接口:** `PUT https://rest_api_root/v1/testhub/runs/{run_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `run_id` | String | 是 | 执行用例的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `status_id` | String | 是 | 执行用例执行结果的id。 |
| `remark` | String | 否 | 执行用例执行结果的备注。 |
| `steps` | Object[] | 是 | 执行用例步骤的列表。 |
| `steps.step_id` | String | 是 | 执行用例步骤的id。 |
| `steps.status_id` | String | 是 | 执行用例步骤执行结果的id。 |
| `steps.actual_value` | String | 否 | 执行用例步骤的实际值。 |
| `executor_id` | String | 否 | 执行人的id。不传默认执行人为空。 |

#### Parameters Examples
**请求示例：**
```json
{
    "status_id": "68d117800d5dd2484a198261",
    "remark": "执行用例执行结果的备注",
    "steps": [
        {
            "step_id": "524cad5edb06305cca2fa112",
            "status_id": "68d117800d5dd2484a198261",
            "actual_value": "正常访问PingCode官网"
        }
    ],
    "executor_id": "a0417f68e846aae315c85d24643678a9"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "547000eb6a70571487623fea",
    "url": "https://rest_api_root/v1/testhub/runs/547000eb6a70571487623fea",
    "status": "pass",
    "short_id": "Aq1u38yX",
    "html_url": "https://yctech.pingcode.com/testhub/runs/Aq1u38yX",
    "library": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000",
        "identifier": "CSK",
        "name": "测试库",
        "is_archived": 0,
        "is_deleted": 0
    },
    "plan": {
        "id": "5eb6a70571487623fea47000",
        "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/plans/5eb6a70571487623fea47000",
        "name": "测试计划",
        "status": "in_progress",
        "start_at": 1589791860,
        "end_at": 1589791870,
        "short_id": "7nNkViOD",
        "html_url": "https://yctech.pingcode.com/testhub/libraries/CSK/plans/7nNkViOD/runs"
    },
    "case": {
        "id": "5edca524cad2fa112b06305c",
        "url": "https://rest_api_root/v1/testhub/cases/5edca524cad2fa112b06305c",
        "identifier": "CSK-10",
        "title": "这是一个测试用例",
        "level": "P1",
        "short_id": "fdUw3C",
        "html_url": "https://yctech.pingcode.com/testhub/cases/fdUw3C",
        "test_type": "automation",
        "properties": {
            "prop_a": "prop_a_value",
            "prop_b": "prop_b_value"
        }
    },
    "latest_executed_status": {
        "id": "68d117800d5dd2484a198261",
        "url": "http://rest_api_root/v1/testhub/run_statuses/68d117800d5dd2484a198261",
        "name": "通过"
    },
    "suite": {
        "id": "55714870a70ea4eb623f6700",
        "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/suites/55714870a70ea4eb623f6700",
        "name": "登录",
        "paths": "首页/账户"
    },
    "remark": "执行用例执行结果的备注",
    "executor": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "steps": [
        {
            "step_id": "524cad5edb06305cca2fa112",
            "status": "pass",
            "actual_value": null
        }
    ],
    "created_at": 1583290300,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1583293300,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_archived": 0,
    "is_deleted": 0
}
```

### 创建一个执行用例

**接口:** `POST https://rest_api_root/v1/testhub/runs`

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `library_id` | String | 是 | 测试库的id。 |
| `plan_id` | String | 是 | 测试计划的id。 |
| `case_id` | String | 是 | 测试用例的id。 |
| `executor_id` | String | 否 | 执行人的id。 |

#### Parameters Examples
**请求示例：**
```json
{
    "library_id": "5eb623f6a70571487ea47000",
    "plan_id": "5eb6a70571487623fea47000",
    "case_id": "5edca524cad2fa112b06305c",
    "executor_id": "a0417f68e846aae315c85d24643678a9"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "547000eb6a70571487623fea",
    "url": "https://rest_api_root/v1/testhub/runs/547000eb6a70571487623fea",
    "status": "not_start",
    "short_id": "Aq1u38yX",
    "html_url": "https://yctech.pingcode.com/testhub/runs/Aq1u38yX",
    "library": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000",
        "identifier": "CSK",
        "name": "测试库",
        "is_archived": 0,
        "is_deleted": 0
    },
    "plan": {
        "id": "5eb6a70571487623fea47000",
        "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/plans/5eb6a70571487623fea47000",
        "name": "测试计划",
        "status": "in_progress",
        "start_at": 1589791860,
        "end_at": 1589791870,
        "short_id": "7nNkViOD",
        "html_url": "https://yctech.pingcode.com/testhub/libraries/CSK/plans/7nNkViOD/runs"
    },
    "case": {
        "id": "5edca524cad2fa112b06305c",
        "url": "https://rest_api_root/v1/testhub/cases/5edca524cad2fa112b06305c",
        "identifier": "CSK-10",
        "title": "这是一个测试用例",
        "level": "P1",
        "short_id": "fdUw3C",
        "html_url": "https://yctech.pingcode.com/testhub/cases/fdUw3C",
        "test_type": "automation",
        "properties": {
            "prop_a": "prop_a_value",
            "prop_b": "prop_b_value"
        }
    },
    "latest_executed_status": {
        "id": "68d117800d5dd2484a198265",
        "url": "http://rest_api_root/v1/testhub/run_statuses/68d117800d5dd2484a198265",
        "name": "未测"
    },
    "suite": {
        "id": "55714870a70ea4eb623f6700",
        "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/suites/55714870a70ea4eb623f6700",
        "name": "登录",
        "paths": "首页/账户"
    },
    "remark": null,
    "executor": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "steps": [
        {
            "step_id": "524cad5edb06305cca2fa112",
            "status": "not_start",
            "actual_value": null
        }
    ],
    "created_at": 1583290300,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1583290300,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_archived": 0,
    "is_deleted": 0
}
```

### 创建一个计划

**接口:** `POST https://rest_api_root/v1/testhub/libraries/{library_id}/plans`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `library_id` | String | 是 | 测试库的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 测试计划的名称。名称在一个测试库里唯一。 |
| `type_id` | String | 是 | 测试计划类型的id。 |
| `start_at` | Number | 是 | 测试计划的开始时间。 |
| `end_at` | Number | 是 | 测试计划的结束时间。 |
| `assignee_id` | String | 是 | 测试计划负责人的id。 |
| `project_id` | String | 否 | 项目的id。该字段在 sprint_id 或 version_id 有值时必填。 |
| `sprint_id` | String | 否 | 迭代的id。该字段仅在 type_id 代表迭代测试时有效。 |
| `version_id` | String | 否 | 发布的id。该字段仅在 type_id 代表发布测试时有效。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "测试计划",
    "type_id": "641d0ab2b998f883f9c67b2f",
    "project_id": "5eb623f6a70571487ea41919",
    "version_id": "641d0ab2b998f883f9c67b2c",
    "start_at": 1589791860,
    "end_at": 1589791870,
    "assignee_id": "a0417f68e846aae315c85d24643678a9"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "5eb6a70571487623fea47000",
    "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/plans/5eb6a70571487623fea47000",
    "library": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000",
        "identifier": "CSK",
        "name": "测试库",
        "is_archived": 0,
        "is_deleted": 0
    },
    "name": "测试计划",
    "state": {
        "id": "652d0cb2b798f983d9c67c2b",
        "url": "http://rest_api_root/v1/testhub/plan_states/652d0cb2b798f983d9c67c2c",
        "name": "进行中",
        "type": "in_progress"
    },
    "start_at": 1589791860,
    "end_at": 1589791870,
    "short_id": "7nNkViOD",
    "html_url": "https://yctech.pingcode.com/testhub/libraries/CSK/plans/7nNkViOD/runs",
    "type": {
        "id": "641d0ab2b998f883f9c67b2c",
        "url": "http://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/plan_types/641d0ab2b998f883f9c67b2c",
        "name": "发布测试"
    },
    "project": {
        "id": "5eb623f6a70571487ea41919",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919",
        "identifier": "SCR",
        "name": "Scrum项目",
        "type": "scrum",
        "is_archived": 0,
        "is_deleted": 0
    },
    "sprint": null,
    "version": {
        "id": "5eb623f6a70571487ea47001",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919/versions/5eb623f6a70571487ea47001",
        "name": "1.0.0",
        "start_at": 1565255712,
        "end_at": 1565255879,
        "stage": {
            "id": "5f44a8f8bb347b14b49624a1",
            "url": "https://rest_api_root/v1/project/stages/5f44a8f8bb347b14b49624a1",
            "name": "未开始",
            "type": "pending",
            "color": "#FA8888"
        }
    },
    "assignee": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "summary": "",
    "created_at": 1565366200,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1565366200,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    }
}
```

### 批量创建执行用例

**接口:** `POST https://rest_api_root/v1/testhub/runs/bulk`

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `runs` | Object[] | 是 | 创建单个执行用例必要参数的数组。数组长度不超过100。 |
| `runs.library_id` | String | 是 | 执行用例所属测试库的id。 |
| `runs.plan_id` | String | 是 | 执行用例所属测试计划的id。 |
| `runs.case_id` | String | 是 | 测试用例的id。 |
| `runs.executor_id` | String | 否 | 执行人的id。 |

#### Parameters Examples
**请求示例：**
```json
{
    "runs": [
        {
            "library_id": "5edca524cad2fa112b06305a",
            "plan_id": "5edca524cad2fa112b06305b",
            "case_id": "5edca524cad2fa112b06305c",
            "executor_id": "a0417f68e846aae315c85d24643678a9"
        },
        {
            "library_id": "5edca524cad2fa112b06306a",
            "plan_id": "5edca524cad2fa112b06306b",
            "case_id": "5edca524cad2fa112b06306c",
            "executor_id": "a0417f68e846aae315c85d24643678b9"
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
        "run": {
            "id": "547000eb6a70571487623fea",
            "url": "https://rest_api_root/v1/testhub/runs/547000eb6a70571487623fea",
            "status": "not_start",
            "short_id": "Aq1u38yX",
            "html_url": "https://yctech.pingcode.com/testhub/runs/Aq1u38yX",
            "library": {
                "id": "5eb623f6a70571487ea47000",
                "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000",
                "identifier": "CSK",
                "name": "测试库",
                "is_archived": 0,
                "is_deleted": 0
            },
            "plan": {
                "id": "5eb6a70571487623fea47000",
                "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/plans/5eb6a70571487623fea47000",
                "name": "测试计划",
                "status": "in_progress",
                "start_at": 1589791860,
                "end_at": 1589791870
            },
            "case": {
                "id": "5edca524cad2fa112b06305c",
                "url": "https://rest_api_root/v1/testhub/cases/5edca524cad2fa112b06305c",
                "identifier": "CSK-10",
                "title": "这是一个测试用例",
                "level": "P1",
                "short_id": "fdUw3C",
                "html_url": "https://yctech.pingcode.com/testhub/cases/fdUw3C",
                "test_type": "automation",
                "properties": {
                    "prop_a": "prop_a_value",
                    "prop_b": "prop_b_value"
                }
            },
            "latest_executed_status": {
                "id": "68d117800d5dd2484a198265",
                "url": "http://rest_api_root/v1/testhub/run_statuses/68d117800d5dd2484a198265",
                "name": "未测"
            },
            "suite": {
                "id": "55714870a70ea4eb623f6700",
                "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/suites/55714870a70ea4eb623f6700",
                "name": "登录",
                "paths": "首页/账户"
            },
            "executor": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "remark": "执行用例执行结果的备注",
            "steps": [
                {
                    "step_id": "524cad5edb06305cca2fa112",
                    "status": "not_start",
                    "actual_value": null
                }
            ],
            "created_at": 1583290300,
            "created_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "updated_at": 1583290300,
            "updated_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "is_archived": 0,
            "is_deleted": 0
        }
    },
    {
        "state": "failure",
        "run": {
            "library_id": "5edca524cad2fa112b06305a",
            "plan_id": "5edca524cad2fa112b06305b",
            "case_id": "5edca524cad2fa112b06305d",
            "executor_id": "a0417f68e846aae315c85d24643678a9"
        },
        "message": "创建失败或已创建"
    }
]
```

### 批量操作执行用例

**接口:** `POST https://rest_api_root/v1/testhub/libraries/{library_id}/plans/{plan_id}/runs/bulk`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `library_id` | String | 是 | 测试库的id。 |
| `plan_id` | String | 是 | 测试计划的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `inserts` | Object[] | 否 | 需要批量创建的执行用例。该参数是一个对象数组（数组内对象不得超过50个）。 |
| `inserts.case_id` | String | 是 | 测试用例id。 |
| `inserts.executor_id` | String | 否 | 执行人id。 |
| `updates` | Object[] | 否 | 需要批量更新的执行用例。该参数是一个对象数组（数组内对象不得超过50个）。 |
| `updates.run_id` | String | 是 | 执行用例的id。 |
| `updates.status_id` | String | 是 | 执行用例执行结果的id。 |
| `updates.steps` | Object[] | 否 | 执行用例步骤的数组。 |
| `updates.steps.step_id` | String | 是 | 执行用例步骤的id。 |
| `updates.steps.status_id` | String | 是 | 执行用例步骤执行结果的id。 |
| `updates.steps.actual_value` | String | 否 | 执行用例步骤的实际值。 |
| `updates.executor_id` | String | 否 | 执行人的id。 |
| `deletes` | String[] | 否 | 需要批量删除的执行用例。该参数是一个执行用例id的数组（数组内id不得超过50个）。 |

#### Parameters Examples
**请求示例：**
```json
{
    "inserts": [
        {
            "case_id": "5edca524cad2fa112b06305c",
            "executor_id": "a0417f68e846aae315c85d24643678a9"
        }
    ],
    "updates": [
        {
            "run_id": "547000eb6a70571487623fea",
            "status_id": "68d117800d5dd2484a198265",
            "steps": [
                {
                    "step_id": "524cad5edb06305cca2fa112",
                    "status_id": "68d117800d5dd2484a198265",
                    "actual_value": "正常访问PingCode官网"
                }
            ],
            "executor_id": "a0417f68e846aae315c85d24643678a9"
        }
    ],
    "deletes": [
        "547000eb6a70571487623fea"
    ]
}
```

#### Success Examples
**响应示例：**
```json
{
    "inserts": 1,
    "updates": 1,
    "deletes": 1
}
```

### 批量部分更新执行用例

**接口:** `PATCH https://rest_api_root/v1/testhub/runs/bulk`

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `runs` | Object[] | 是 | 部分更新单个执行用例必要参数的数组。 |
| `runs.run_id` | String | 是 | 执行用例的id。 |
| `runs.status_id` | String | 是 | 执行用例执行结果的id。 |
| `runs.remark` | String | 否 | 执行用例执行结果的备注。 |
| `runs.steps` | Object[] | 否 | 执行用例的步骤列表。 |
| `runs.steps.step_id` | String | 是 | 执行用例步骤的id。 |
| `runs.steps.status_id` | String | 是 | 执行用例步骤执行结果的id。 |
| `runs.steps.actual_value` | String | 否 | 执行用例步骤的实际值。 |
| `runs.executor_id` | String | 否 | 执行人的id。 |

#### Parameters Examples
**请求示例：**
```json
{
    "runs": [
        {
            "run_id": "5edca524cad2fa112b06305c",
            "status_id": "68d117800d5dd2484a198265",
            "remark": "执行用例执行结果的备注",
            "steps": [
                {
                    "step_id": "524cad5edb06305cca2fa112",
                    "status_id": "68d117800d5dd2484a198265",
                    "actual_value": "正常访问PingCode官网"
                },
                {
                    "step_id": "524cad5edb06305cca2fa113",
                    "status_id": "68d117800d5dd2484a198265",
                    "actual_value": "不正常访问PingCode官网"
                }
            ],
            "executor_id": "a0417f68e846aae315c85d24643678a9"
        },
        {
            "run_id": "5edca524cad2fa112b06305d",
            "status_id": "68d117800d5dd2484a198265",
            "remark": "执行用例执行结果的备注",
            "steps": [
                {
                    "step_id": "524cad5edb06305cca2fa114",
                    "status_id": "68d117800d5dd2484a198265",
                    "actual_value": "正常访问PingCode官网"
                },
                {
                    "step_id": "524cad5edb06305cca2fa114",
                    "status_id": "68d117800d5dd2484a198265",
                    "actual_value": "不正常访问PingCode官网"
                }
            ],
            "executor_id": "a0417f68e846aae315c85d24643678a8"
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
        "run": {
            "id": "5edca524cad2fa112b06305c",
            "url": "https://rest_api_root/v1/testhub/runs/547000eb6a70571487623fea",
            "status": "not_start",
            "short_id": "Aq1u38yX",
            "html_url": "https://yctech.pingcode.com/testhub/runs/Aq1u38yX",
            "library": {
                "id": "5eb623f6a70571487ea47000",
                "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000",
                "identifier": "CSK",
                "name": "测试库",
                "is_archived": 0,
                "is_deleted": 0
            },
            "plan": {
                "id": "5eb6a70571487623fea47000",
                "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/plans/5eb6a70571487623fea47000",
                "name": "测试计划",
                "status": "in_progress",
                "start_at": 1589791860,
                "end_at": 1589791870
            },
            "case": {
                "id": "5edca524cad2fa112b06305c",
                "url": "https://rest_api_root/v1/testhub/cases/5edca524cad2fa112b06305c",
                "identifier": "CSK-10",
                "title": "这是一个测试用例",
                "level": "P1",
                "short_id": "fdUw3C",
                "html_url": "https://yctech.pingcode.com/testhub/cases/fdUw3C",
                "test_type": "automation",
                "properties": {
                    "prop_a": "prop_a_value",
                    "prop_b": "prop_b_value"
                }
            },
            "latest_executed_status": {
                "id": "68d117800d5dd2484a198265",
                "url": "http://rest_api_root/v1/testhub/run_statuses/68d117800d5dd2484a198265",
                "name": "未测"
            },
            "suite": {
                "id": "55714870a70ea4eb623f6700",
                "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/suites/55714870a70ea4eb623f6700",
                "name": "登录",
                "paths": "首页/账户"
            },
            "executor": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "remark": null,
            "steps": [
                {
                    "step_id": "524cad5edb06305cca2fa112",
                    "status": "not_start",
                    "actual_value": "正常访问PingCode官网"
                }
            ],
            "created_at": 1583290300,
            "created_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "updated_at": 1583299300,
            "updated_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "is_archived": 0,
            "is_deleted": 0
        }
    },
    {
        "state": "success",
        "run": {
            "id": "5edca524cad2fa112b06305d",
            "url": "https://rest_api_root/v1/testhub/runs/547000eb6a70571487623fea",
            "status": "not_start",
            "short_id": "Aq1u38yX",
            "html_url": "https://yctech.pingcode.com/testhub/runs/Aq1u38yX",
            "library": {
                "id": "5eb623f6a70571487ea47000",
                "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000",
                "identifier": "CSK",
                "name": "测试库",
                "is_archived": 0,
                "is_deleted": 0
            },
            "plan": {
                "id": "5eb6a70571487623fea47000",
                "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/plans/5eb6a70571487623fea47000",
                "name": "测试计划",
                "status": "in_progress",
                "start_at": 1589791860,
                "end_at": 1589791870
            },
            "case": {
                "id": "5edca524cad2fa112b06305c",
                "url": "https://rest_api_root/v1/testhub/cases/5edca524cad2fa112b06305c",
                "identifier": "CSK-10",
                "title": "这是一个测试用例",
                "level": "P1",
                "short_id": "fdUw3C",
                "html_url": "https://yctech.pingcode.com/testhub/cases/fdUw3C",
                "test_type": "automation",
                "properties": {
                    "prop_a": "prop_a_value",
                    "prop_b": "prop_b_value"
                }
            },
            "latest_executed_status": {
                "id": "68d117800d5dd2484a198265",
                "url": "http://rest_api_root/v1/testhub/run_statuses/68d117800d5dd2484a198265",
                "name": "未测"
            },
            "suite": {
                "id": "55714870a70ea4eb623f6700",
                "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/suites/55714870a70ea4eb623f6700",
                "name": "登录",
                "paths": "首页/账户"
            },
            "executor": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "remark": "执行用例执行结果的备注",
            "steps": [
                {
                    "step_id": "524cad5edb06305cca2fa112",
                    "status": "not_start",
                    "actual_value": "正常访问PingCode官网"
                }
            ],
            "created_at": 1583290300,
            "created_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "updated_at": 1583299300,
            "updated_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "is_archived": 0,
            "is_deleted": 0
        }
    }
]
```

### 获取执行用例列表

**接口:** `GET https://rest_api_root/v1/testhub/runs`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `plan_id` | String | 否 | 测试计划的id。 |
| `case_id` | String | 否 | 测试用例的id。 |
| `suite_id` | String | 否 | 测试模块的id。 |
| `status_id` | String | 否 | 执行用例执行结果的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "547000eb6a70571487623fea",
            "url": "https://rest_api_root/v1/testhub/runs/547000eb6a70571487623fea",
            "status": "not_start",
            "short_id": "Aq1u38yX",
            "html_url": "https://yctech.pingcode.com/testhub/runs/Aq1u38yX",
            "library": {
                "id": "5eb623f6a70571487ea47000",
                "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000",
                "identifier": "CSK",
                "name": "测试库",
                "is_archived": 0,
                "is_deleted": 0
            },
            "plan": {
                "id": "5eb6a70571487623fea47000",
                "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/plans/5eb6a70571487623fea47000",
                "name": "测试计划",
                "status": "in_progress",
                "start_at": 1589791860,
                "end_at": 1589791870,
                "short_id": "7nNkViOD",
                "html_url": "https://yctech.pingcode.com/testhub/libraries/CSK/plans/7nNkViOD/runs"
            },
            "case": {
                "id": "5edca524cad2fa112b06305c",
                "url": "https://rest_api_root/v1/testhub/cases/5edca524cad2fa112b06305c",
                "identifier": "CSK-10",
                "title": "这是一个测试用例",
                "level": "P1",
                "html_url": "https://yctech.pingcode.com/testhub/cases/fdUw3C",
                "test_type": "automation",
                "properties": {
                    "prop_a": "prop_a_value",
                    "prop_b": "prop_b_value"
                }
            },
            "latest_executed_status": {
                "id": "68d117800d5dd2484a198265",
                "url": "http://rest_api_root/v1/testhub/run_statuses/68d117800d5dd2484a198265",
                "name": "未测"
            },
            "suite": {
                "id": "55714870a70ea4eb623f6700",
                "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/suites/55714870a70ea4eb623f6700",
                "name": "登录",
                "paths": "首页/账户"
            },
            "remark": "执行用例执行结果的备注",
            "executor": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "steps": [
                {
                    "step_id": "524cad5edb06305cca2fa112",
                    "status": "not_start",
                    "actual_value": null
                }
            ],
            "created_at": 1583290300,
            "created_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "updated_at": 1583290300,
            "updated_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "is_archived": 0,
            "is_deleted": 0
        }
    ]
}
```

### 获取执行用例执行结果列表

**接口:** `GET https://rest_api_root/v1/testhub/run/statuses?library_id={library_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `library_id` | String | 是 | 测试库的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_index": 0,
    "page_size": 30,
    "total": 5,
    "values": [
        {
            "id": "68d117800d5dd2484a198261",
            "url": "https://rest_api_root/v1/testhub/run_statuses/68d117800d5dd2484a198261",
            "name": "通过"
        },
        {
            "id": "68d117800d5dd2484a198262",
            "url": "https://rest_api_root/v1/testhub/run_statuses/68d117800d5dd2484a198262",
            "name": "受阻"
        },
        {
            "id": "68d117800d5dd2484a198263",
            "url": "https://rest_api_root/v1/testhub/run_statuses/68d117800d5dd2484a198263",
            "name": "失败"
        },
        {
            "id": "68d117800d5dd2484a198264",
            "url": "https://rest_api_root/v1/testhub/run_statuses/68d117800d5dd2484a198264",
            "name": "跳过"
        },
        {
            "id": "68d117800d5dd2484a198265",
            "url": "https://rest_api_root/v1/testhub/run_statuses/68d117800d5dd2484a198265",
            "name": "未测"
        }
    ]
}
```

### 获取执行用例的结果记录

**接口:** `GET https://rest_api_root/v1/testhub/runs/{run_id}/histories`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `run_id` | String | 是 | 执行用例的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "65115f0939286e26e05a66db",
            "url": "https://rest_api_root/v1/testhub/runs/547000eb6a70571487623fea/histories/65115f0939286e26e05a66db",
            "run": {
                "id": "547000eb6a70571487623fea",
                "url": "https://rest_api_root/v1/testhub/runs/547000eb6a70571487623fea",
                "status": "pass",
                "short_id": "Aq1u38yX",
                "html_url": "https://yctech.pingcode.com/testhub/runs/Aq1u38yX"
            },
            "library": {
                "id": "5eb623f6a70571487ea47000",
                "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000",
                "identifier": "CSK",
                "name": "测试库",
                "is_archived": 0,
                "is_deleted": 0
            },
            "plan": {
                "id": "5eb6a70571487623fea47000",
                "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/plans/5eb6a70571487623fea47000",
                "name": "测试计划",
                "status": "in_progress",
                "start_at": 1589791860,
                "end_at": 1589791870,
                "short_id": "7nNkViOD",
                "html_url": "https://yctech.pingcode.com/testhub/libraries/CSK/plans/7nNkViOD/runs"
            },
            "case": {
                "id": "5edca524cad2fa112b06305c",
                "url": "https://rest_api_root/v1/testhub/cases/5edca524cad2fa112b06305c",
                "identifier": "CSK-10",
                "title": "这是一个测试用例",
                "level": "P1",
                "short_id": "fdUw3C",
                "html_url": "https://yctech.pingcode.com/testhub/cases/fdUw3C",
                "test_type": "automation",
                "properties": {
                    "prop_a": "prop_a_value",
                    "prop_b": "prop_b_value"
                }
            },
            "executed_status": {
                "id": "68d117800d5dd2484a198261",
                "url": "http://rest_api_root/v1/testhub/run_statuses/68d117800d5dd2484a198261",
                "name": "通过"
            },
            "remark": "执行用例执行结果的备注",
            "executed_at": 1583290300,
            "executed_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "steps": [
                {
                    "step_id": "524cad5edb06305cca2fa112",
                    "status": "pass",
                    "actual_value": null
                }
            ]
        }
    ]
}
```

### 获取计划列表

**接口:** `GET https://rest_api_root/v1/testhub/libraries/{library_id}/plans`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `library_id` | String | 是 | 测试库的id。 |

**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 测试计划名称。 |
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
            "id": "5eb6a70571487623fea47000",
            "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/plans/5eb6a70571487623fea47000",
            "library": {
                "id": "5eb623f6a70571487ea47000",
                "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000",
                "identifier": "CSK",
                "name": "测试库",
                "is_archived": 0,
                "is_deleted": 0
            },
            "name": "测试计划",
            "state": {
                "id": "652d0cb2b798f983d9c67c2b",
                "url": "http://rest_api_root/v1/testhub/plan_states/652d0cb2b798f983d9c67c2b",
                "name": "进行中",
                "type": "in_progress"
            },
            "start_at": 1589791860,
            "end_at": 1589791870,
            "short_id": "7nNkViOD",
            "html_url": "https://yctech.pingcode.com/testhub/libraries/CSK/plans/7nNkViOD/runs",
            "type": {
                "id": "641d0ab2b998f883f9c67b2c",
                "url": "http://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/plan_types/641d0ab2b998f883f9c67b2c",
                "name": "发布测试"
            },
            "project": {
                "id": "5eb623f6a70571487ea41919",
                "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919",
                "identifier": "SCR",
                "name": "Scrum项目",
                "type": "scrum",
                "is_archived": 0,
                "is_deleted": 0
            },
            "sprint": null,
            "version": {
                "id": "5eb623487ea47001f6a70571",
                "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919/versions/5eb623487ea47001f6a70571",
                "name": "1.0.0",
                "start_at": 1565255712,
                "end_at": 1565255879,
                "stage": {
                    "id": "5f44a8f8bb347b14b49624a1",
                    "url": "https://rest_api_root/v1/project/stages/5f44a8f8bb347b14b49624a1",
                    "name": "未开始",
                    "type": "pending",
                    "color": "#FA8888"
                }
            },
            "assignee": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "summary": "测试报告的概要",
            "created_at": 1565366200,
            "created_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "updated_at": 1565366200,
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

### 获取计划类型列表

**接口:** `GET https://rest_api_root/v1/testhub/libraries/{library_id}/plan_types`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `library_id` | String | 是 | 测试库的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "642f765b6950bc66cfa82f05",
            "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/plan_types/642f765b6950bc66cfa82f05",
            "library": {
                "id": "5eb623f6a70571487ea47000",
                "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000",
                "identifier": "CSK",
                "name": "测试库",
                "is_archived": 0,
                "is_deleted": 0
            },
            "name": "普通测试"
        }
    ]
}
```

### 部分更新一个执行用例

**接口:** `PATCH https://rest_api_root/v1/testhub/runs/{run_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `run_id` | String | 是 | 执行用例的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `status_id` | String | 是 | 执行用例执行结果的id。 |
| `remark` | String | 否 | 执行用例执行结果的备注。 |
| `steps` | Object[] | 否 | 执行用例步骤的列表。steps是整体更新的。 |
| `steps.step_id` | String | 是 | 执行用例步骤的id。 |
| `steps.status_id` | String | 是 | 执行用例步骤执行结果的id。 |
| `steps.actual_value` | String | 否 | 执行用例步骤的实际值。 |
| `executor_id` | String | 否 | 执行人的id。不传默认执行人为执行用例的创建人。 |

#### Parameters Examples
**请求示例：**
```json
{
    "status_id": "68d117800d5dd2484a198265",
    "remark": "执行用例执行结果的备注",
    "steps": [
        {
            "step_id": "524cad5edb06305cca2fa112",
            "status_id": "68d117800d5dd2484a198265",
            "actual_value": "正常访问PingCode官网"
        }
    ],
    "executor_id": "a0417f68e846aae315c85d24643678a9"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "547000eb6a70571487623fea",
    "url": "https://rest_api_root/v1/testhub/runs/547000eb6a70571487623fea",
    "status": "not_start",
    "short_id": "Aq1u38yX",
    "html_url": "https://yctech.pingcode.com/testhub/runs/Aq1u38yX",
    "library": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000",
        "identifier": "CSK",
        "name": "测试库",
        "is_archived": 0,
        "is_deleted": 0
    },
    "plan": {
        "id": "5eb6a70571487623fea47000",
        "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/plans/5eb6a70571487623fea47000",
        "name": "测试计划",
        "status": "in_progress",
        "start_at": 1589791860,
        "end_at": 1589791870,
        "short_id": "7nNkViOD",
        "html_url": "https://yctech.pingcode.com/testhub/libraries/CSK/plans/7nNkViOD/runs"
    },
    "case": {
        "id": "5edca524cad2fa112b06305c",
        "url": "https://rest_api_root/v1/testhub/cases/5edca524cad2fa112b06305c",
        "identifier": "CSK-10",
        "title": "这是一个测试用例",
        "level": "P1",
        "html_url": "https://yctech.pingcode.com/testhub/cases/fdUw3C",
        "test_type": "automation",
        "properties": {
            "prop_a": "prop_a_value",
            "prop_b": "prop_b_value"
        }
    },
    "latest_executed_status": {
        "id": "68d117800d5dd2484a198265",
        "url": "http://rest_api_root/v1/testhub/run_statuses/68d117800d5dd2484a198265",
        "name": "未测"
    },
    "suite": {
        "id": "55714870a70ea4eb623f6700",
        "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/suites/55714870a70ea4eb623f6700",
        "name": "登录",
        "paths": "首页/账户"
    },
    "remark": "执行用例执行结果的备注",
    "executor": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "steps": [
        {
            "step_id": "524cad5edb06305cca2fa112",
            "status": "not_start",
            "actual_value": null
        }
    ],
    "created_at": 1583290300,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1583290300,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_archived": 0,
    "is_deleted": 0
}
```

### 部分更新一个计划

**接口:** `PATCH https://rest_api_root/v1/testhub/libraries/{library_id}/plans/{plan_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `library_id` | String | 是 | 测试库的id。 |
| `plan_id` | String | 是 | 测试计划的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 测试计划的名称。名称在一个测试库里唯一。 |
| `type_id` | String | 否 | 测试计划类型的id。指定测试计划类型时，建议同时指定对应的 sprint_id 或 version_id。 |
| `project_id` | String | 否 | 项目的id。 |
| `sprint_id` | String | 否 | 迭代的id。该字段仅在测试计划类型为迭代测试时有效。 |
| `version_id` | String | 否 | 发布的id。该字段仅在测试计划类型为发布测试时有效。 |
| `start_at` | Number | 否 | 测试计划的开始时间。 |
| `end_at` | Number | 否 | 测试计划的结束时间。 |
| `assignee_id` | String | 否 | 测试计划负责人的id。 |
| `state_id` | String | 否 | 测试计划状态的id。 |
| `summary` | String | 否 | 测试报告的概要信息。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "测试计划",
    "type_id": "641d0ab2b998f883f9c67b2c",
    "project_id": "5eb623f6a70571487ea41919",
    "version_id": "5eb623487ea47001f6a70571",
    "start_at": 1589791860,
    "end_at": 1589791870,
    "assignee_id": "a0417f68e846aae315c85d24643678a9",
    "state_id": "652d0cb2b798f983d9c67c2b",
    "summary": "测试报告的概要"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "5eb6a70571487623fea47000",
    "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/plans/5eb6a70571487623fea47000",
    "library": {
        "id": "5eb623f6a70571487ea47000",
        "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000",
        "identifier": "CSK",
        "name": "测试库",
        "is_archived": 0,
        "is_deleted": 0
    },
    "name": "测试计划",
    "state": {
        "id": "652d0cb2b798f983d9c67c2b",
        "url": "http://rest_api_root/v1/testhub/plan_states/652d0cb2b798f983d9c67c2c",
        "name": "进行中",
        "type": "in_progress"
    },
    "start_at": 1589791860,
    "end_at": 1589791870,
    "short_id": "7nNkViOD",
    "html_url": "https://yctech.pingcode.com/testhub/libraries/CSK/plans/7nNkViOD/runs",
    "type": {
        "id": "641d0ab2b998f883f9c67b2c",
        "url": "http://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000/plan_types/641d0ab2b998f883f9c67b2c",
        "name": "发布测试"
    },
    "project": {
        "id": "5eb623f6a70571487ea41919",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919",
        "identifier": "SCR",
        "name": "Scrum项目",
        "type": "scrum",
        "is_archived": 0,
        "is_deleted": 0
    },
    "sprint": null,
    "version": {
        "id": "5eb623487ea47001f6a70571",
        "url": "https://rest_api_root/v1/project/projects/5eb623f6a70571487ea41919/versions/5eb623487ea47001f6a70571",
        "name": "1.0.0",
        "start_at": 1565255712,
        "end_at": 1565255879,
        "stage": {
            "id": "5f44a8f8bb347b14b49624a1",
            "url": "https://rest_api_root/v1/project/stages/5f44a8f8bb347b14b49624a1",
            "name": "未开始",
            "type": "pending",
            "color": "#FA8888"
        }
    },
    "assignee": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "summary": "测试报告的概要",
    "created_at": 1565366200,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1565366200,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    }
}
```

## 测试配置中心

### 执行用例配置

**接口:** ` 执行用例配置`

用于查看和管理执行用例属性。

### 用例配置

**接口:** ` 用例配置`

用于查看和管理测试用例属性。

### 计划配置

**接口:** ` 计划配置`

用于查看和管理计划属性。

## 用例配置

### 创建一个用例属性

**接口:** `POST https://rest_api_root/v1/testhub/case_properties`

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 用例属性的名称。在一个企业中这个名称是唯一的。 |
| `type` | String | 是 | 用例属性的类型。<br>可选值: `text`, `textarea`, `select`, `multi_select`, `cascade_select`, `cascade_multi_select`, `member`, `members`, `date`, `number`, `progress`, `rate`, `link` |
| `options` | Object[] | 否 | 选择项列表。当用例属性类型为select,multi_select,cascade_select,cascade_multi_select时可选填此项。 |
| `options._id` | String | 否 | 选择项id。该值在选择项中是唯一的。 |
| `options.text` | String | 是 | 选择项内容。该值在选择项中是唯一的。 |
| `options.parent_id` | String | 否 | 选择项父级id。当属性类型为cascade_select,cascade_multi_select时，parent_id参数有效，用于构建级联类型选择项之间的父子关系，最多存在4级。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "严重程度",
    "type": "select",
    "options": [
        {
            "text": "严重"
        },
        {
            "text": "一般"
        }
    ]
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "severity",
    "url": "https://rest_api_root/v1/testhub/case_properties/severity",
    "name": "严重程度",
    "type": "select",
    "options": [
        {
            "_id": "5efb1859110533727a82c603",
            "text": "严重"
        },
        {
            "_id": "5efb1859110533727a82c604",
            "text": "一般"
        }
    ],
    "is_removable": true,
    "is_name_editable": true,
    "is_options_editable": true
}
```

### 向属性方案中添加一个用例属性

**接口:** `POST https://rest_api_root/v1/testhub/case_property_plans/{property_plan_id}/case_properties`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `property_plan_id` | String | 是 | 测试用例属性方案的id。 |

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `property_id` | String | 是 | 测试用例属性的id。 |

#### Parameters Examples
**请求示例：**
```json
{
    "property_id": "environment"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "environment",
    "url": "https://rest_api_root/v1/testhub/case_property_plans/5f8a21f18ef715265de90c21/case_properties/environment",
    "property_plan": {
        "id": "5f8a21f18ef715265de90c21",
        "url": "https://rest_api_root/v1/testhub/case_property_plans/5f8a21f18ef715265de90c21",
        "category": "library",
        "host": "case"
    },
    "property": {
        "id": "environment",
        "url": "https://rest_api_root/v1/testhub/case_properties/environment",
        "name": "重现环境",
        "type": "select",
        "options": [
            {
                "_id": "5efb1859110533727a82c603",
                "text": "test"
            },
            {
                "_id": "5efb1859110533727a82c604",
                "text": "beta"
            },
            {
                "_id": "5efb1859110533727a82c605",
                "text": "rc"
            }
        ]
    }
}
```

### 在属性方案中移除一个用例属性

**接口:** `DELETE https://rest_api_root/v1/testhub/case_property_plans/{property_plan_id}/case_properties/{property_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `property_plan_id` | String | 是 | 测试用例属性方案的id。 |
| `property_id` | String | 是 | 测试用例属性的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "environment",
    "url": "https://rest_api_root/v1/testhub/case_property_plans/5f8a21f18ef715265de90c21/case_properties/environment",
    "property_plan": {
        "id": "5f8a21f18ef715265de90c21",
        "url": "https://rest_api_root/v1/testhub/case_property_plans/5f8a21f18ef715265de90c21",
        "category": "library",
        "host": "case"
    },
    "property": {
        "id": "environment",
        "url": "https://rest_api_root/v1/testhub/case_properties/environment",
        "name": "重现环境",
        "type": "select",
        "options": [
            {
                "_id": "5efb1859110533727a82c603",
                "text": "test"
            },
            {
                "_id": "5efb1859110533727a82c604",
                "text": "beta"
            },
            {
                "_id": "5efb1859110533727a82c605",
                "text": "rc"
            }
        ]
    }
}
```

### 获取全部用例属性列表

**接口:** `GET https://rest_api_root/v1/testhub/case_properties`

**权限:** 企业令牌/用户令牌

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 2,
    "values": [
        {
            "id": "environment",
            "url": "https://rest_api_root/v1/testhub/case_properties/environment",
            "name": "重现环境",
            "type": "select",
            "options": [
                {
                    "_id": "5efb1859110533727a82c603",
                    "text": "测试"
                },
                {
                    "_id": "5efb1859110533727a82c604",
                    "text": "生产"
                }
            ],
            "is_removable": false,
            "is_name_editable": false,
            "is_options_editable": false
        },
        {
            "id": "estimated_workload",
            "url": "https://rest_api_root/v1/testhub/case_properties/estimated_workload",
            "name": "预估工时",
            "type": "number",
            "options": null,
            "is_removable": false,
            "is_name_editable": false,
            "is_options_editable": false
        }
    ]
}
```

### 获取全部用例状态列表

**接口:** `GET https://rest_api_root/v1/testhub/case_states`

**权限:** 企业令牌/用户令牌

#### Success Examples
**响应示例：**
```json
{
    "page_index": 0,
    "page_size": 30,
    "total": 3,
    "values": [
        {
            "id": "686f62038668bbae4f4dd0c1",
            "url": "http://rest_api_root/v1/testhub/case_states/686f62038668bbae4f4dd0c1",
            "name": "设计",
            "type": "pending"
        },
        {
            "id": "686f62038668bbae4f4dd0c2",
            "url": "http://rest_api_root/v1/testhub/case_states/686f62038668bbae4f4dd0c2",
            "name": "就绪",
            "type": "completed"
        },
        {
            "id": "686f62038668bbae4f4dd0c3",
            "url": "http://rest_api_root/v1/testhub/case_states/686f62038668bbae4f4dd0c3",
            "name": "废弃",
            "type": "closed"
        }
    ]
}
```

### 获取全部用例类型列表

**接口:** `GET https://rest_api_root/v1/testhub/case_types`

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
            "id": "5cf189b35de9c20620ad7153",
            "url": "https://rest_api_root/v1/testhub/case_types/5cf189b35de9c20620ad7153",
            "name": "功能测试"
        }
    ]
}
```

### 获取全部重要程度列表

**接口:** `GET https://rest_api_root/v1/testhub/case_important_levels`

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
            "id": "57a109b35ae8c20630fd7256",
            "url": "https://rest_api_root/v1/testhub/case_important_levels/57a109b35ae8c20630fd7256",
            "name": "P11",
            "color": "#56ABFB"
        }
    ]
}
```

### 获取属性方案中的用例属性列表

**接口:** `GET https://rest_api_root/v1/testhub/case_property_plans/{property_plan_id}/case_properties`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `property_plan_id` | String | 是 | 测试用例属性方案的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 2,
    "values": [
        {
            "id": "environment",
            "url": "https://rest_api_root/v1/testhub/case_property_plans/5f8a21f18ef715265de90c21/case_properties/environment",
            "property_plan": {
                "id": "5f8a21f18ef715265de90c21",
                "url": "https://rest_api_root/v1/testhub/case_property_plans/5f8a21f18ef715265de90c21",
                "category": "library",
                "host": "case"
            },
            "property": {
                "id": "environment",
                "url": "https://rest_api_root/v1/testhub/case_properties/environment",
                "name": "重现环境",
                "type": "select",
                "options": [
                    {
                        "_id": "5efb1859110533727a82c603",
                        "text": "test"
                    },
                    {
                        "_id": "5efb1859110533727a82c604",
                        "text": "beta"
                    },
                    {
                        "_id": "5efb1859110533727a82c605",
                        "text": "rc"
                    }
                ]
            }
        },
        {
            "id": "estimated_workload",
            "url": "https://rest_api_root/v1/testhub/property_plans/5f8a21f18ef715265de90c21/properties/estimated_workload",
            "property_plan": {
                "id": "5f8a21f18ef715265de90c21",
                "url": "https://rest_api_root/v1/testhub/property_plans/5f8a21f18ef715265de90c21",
                "category": "library",
                "host": "case"
            },
            "property": {
                "id": "estimated_workload",
                "url": "https://rest_api_root/v1/testhub/case_properties/estimated_workload",
                "name": "预估工时",
                "type": "number",
                "options": null
            }
        }
    ]
}
```

### 获取用例属性方案列表

**接口:** `GET https://rest_api_root/v1/testhub/case_property_plans`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `library_id` | String | 否 | 测试库的id。查询开启本地配置的方案时传入。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 2,
    "values": [
        {
            "id": "5f8a21f18ef715265de90c21",
            "url": "https://rest_api_root/v1/testhub/case_property_plans/5f8a21f18ef715265de90c21",
            "category": "library",
            "host": "case",
            "library": null
        },
        {
            "id": "5f8a21f18ef715265de90c22",
            "url": "https://rest_api_root/v1/testhub/case_property_plans/5f8a21f18ef715265de90c22",
            "category": "library",
            "host": "case",
            "library": {
                "id": "5eb623f6a70571487ea47000",
                "url": "https://rest_api_root/v1/testhub/libraries/5eb623f6a70571487ea47000",
                "identifier": "CSK",
                "name": "测试库",
                "is_archived": 0,
                "is_deleted": 0
            }
        }
    ]
}
```

### 部分更新一个用例属性

**接口:** `PATCH https://rest_api_root/v1/testhub/case_properties/{property_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `property_id` | String | 是 | 用例属性的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 用例属性的名称。在一个企业中这个名称是唯一的。 |
| `options` | Object[] | 否 | 选择项列表。options是整体更新的。当用例属性类型为select,multi_select,cascade_select,cascade_multi_select时可选填此项。 |
| `options._id` | String | 否 | 选择项id。该值在选择项中是唯一的。 |
| `options.text` | String | 是 | 选择项内容。该值在选择项中是唯一的。 |
| `options.parent_id` | String | 否 | 选择项父级id。当属性类型为cascade_select,cascade_multi_select时，parent_id参数有效，用于构建级联类型选择项之间的父子关系，最多存在4级。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "严重程度-update",
    "options": [
        {
            "id": "5efb1859110533727a82c603",
            "text": "严重-update"
        },
        {
            "text": "一般"
        }
    ]
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "severity-update",
    "url": "https://rest_api_root/v1/testhub/case_properties/severity",
    "name": "严重程度-update",
    "type": "select",
    "options": [
        {
            "_id": "5efb1859110533727a82c603",
            "text": "严重-update"
        },
        {
            "_id": "5efb1859110533727a82c624",
            "text": "一般"
        }
    ],
    "is_removable": true,
    "is_name_editable": true,
    "is_options_editable": true
}
```

## 执行用例配置

### 获取全部执行用例执行结果列表

**接口:** `GET https://rest_api_root/v1/testhub/run_statuses`

**权限:** 企业令牌/用户令牌

#### Success Examples
**响应示例：**
```json
{
    "page_index": 0,
    "page_size": 30,
    "total": 5,
    "values": [
        {
            "id": "68d117800d5dd2484a198261",
            "url": "https://rest_api_root/v1/testhub/run_statuses/68d117800d5dd2484a198261",
            "name": "通过",
            "is_system": "true"
        },
        {
            "id": "68d117800d5dd2484a198262",
            "url": "https://rest_api_root/v1/testhub/run_statuses/68d117800d5dd2484a198262",
            "name": "受阻",
            "is_system": "true"
        },
        {
            "id": "68d117800d5dd2484a198263",
            "url": "https://rest_api_root/v1/testhub/run_statuses/68d117800d5dd2484a198263",
            "name": "失败",
            "is_system": "true"
        },
        {
            "id": "68d117800d5dd2484a198264",
            "url": "https://rest_api_root/v1/testhub/run_statuses/68d117800d5dd2484a198264",
            "name": "跳过",
            "is_system": "true"
        },
        {
            "id": "68d117800d5dd2484a198265",
            "url": "https://rest_api_root/v1/testhub/run_statuses/68d117800d5dd2484a198265",
            "name": "未测",
            "is_system": "true"
        }
    ]
}
```

## 计划配置

### 获取全部计划状态列表

**接口:** `GET https://rest_api_root/v1/testhub/plan_states`

**权限:** 企业令牌/用户令牌

#### Success Examples
**响应示例：**
```json
{
    "page_index": 0,
    "page_size": 30,
    "total": 4,
    "values": [
        {
            "id": "686f62038668bbae4f4dd0ca",
            "url": "http://rest_api_root/v1/testhub/plan_states/686f62038668bbae4f4dd0ca",
            "name": "未开始",
            "type": "pending",
            "is_system": true
        },
        {
            "id": "652d0cb2b798f983d9c67c2b",
            "url": "http://rest_api_root/v1/testhub/plan_states/652d0cb2b798f983d9c67c2b",
            "name": "进行中",
            "type": "in_progress",
            "is_system": true
        },
        {
            "id": "652d0cb2b798f983d9c67c2d",
            "url": "http://rest_api_root/v1/testhub/plan_states/652d0cb2b798f983d9c67c2d",
            "name": "已完成",
            "type": "completed",
            "is_system": true
        },
        {
            "id": "652d0cb2b798f983d9c67c2e",
            "url": "http://rest_api_root/v1/testhub/plan_states/652d0cb2b798f983d9c67c2e",
            "name": "已终止",
            "type": "completed",
            "is_system": false
        }
    ]
}
```

## 知识管理

### 空间

**接口:** ` 空间`

用于查看和管理空间相关的基本信息。
 资源地址：{GET} https://rest_api_root/v1/wiki/spaces/{space_id}

#### Success
**资源属性**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 空间的id。 |
| `url` | String | 是 | 空间的资源地址。 |
| `identifier` | String | 是 | 空间的标识。 |
| `name` | String | 是 | 空间的名称。 |
| `scope_type` | String | 是 | 空间的所属类型。允许值分别表示企业可见、团队可见和用户可见。<br>可选值: `organization`, `user_group`, `user` |
| `scope_id` | String | 是 | 空间的所属id。 |
| `visibility` | String | 是 | 空间的可见性。<br>可选值: `private`, `public` |
| `color` | String | 是 | 空间的主题色。 |
| `description` | String | 是 | 空间的描述。 |
| `members` | Object[] | 是 | 空间的成员列表。 |
| `created_at` | Number | 是 | 空间的创建时间。 |
| `created_by` | Object | 是 | 空间的创建人。 |
| `updated_at` | Number | 是 | 空间的更新时间。 |
| `updated_by` | Object | 是 | 空间的更新人。 |
| `is_archived` | Number | 是 | 是否已归档。<br>可选值: `0`, `1` |
| `is_deleted` | Number | 是 | 是否已删除。<br>可选值: `0`, `1` |

#### Success Examples
**全量数据示例：**
```json
{
    "id": "642fd641209b56920a6c6e5e",
    "url": "https://rest_api_root/v1/wiki/spaces/642fd641209b56920a6c6e5e",
    "identifier": "DEMO",
    "name": "示例空间",
    "scope_type": "user_group",
    "scope_id": "63c8fb32729dee3334d96af7",
    "visibility": "private",
    "color": "#FB7894",
    "description": "示例空间描述",
    "members": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/wiki/spaces/642fd641209b56920a6c6e5e/members/a0417f68e846aae315c85d24643678a9",
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        },
        {
            "id": "63c8fb32729dee3334d96af7",
            "url": "https://rest_api_root/v1/wiki/spaces/642fd641209b56920a6c6e5e/members/63c8fb32729dee3334d96af7",
            "type": "user_group",
            "user_group": {
                "id": "63c8fb32729dee3334d96af7",
                "url": "https://rest_api_root/v1/directory/groups/63c8fb32729dee3334d96af7",
                "name": "Open Team"
            }
        }
    ],
    "created_at": 1583290300,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1583290400,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_archived": 0,
    "is_deleted": 0
}
```

**引用数据示例：**
```json
{
    "id": "642fd641209b56920a6c6e5e",
    "url": "https://rest_api_root/v1/wiki/spaces/642fd641209b56920a6c6e5e",
    "identifier": "DEMO",
    "name": "示例空间",
    "is_archived": 0,
    "is_deleted": 0
}
```

### 页面

**接口:** ` 页面`

用于查看和管理页面相关的基本信息。企业令牌只能管理非个人空间下的页面。
 资源地址：{GET} https://rest_api_root/v1/wiki/pages/{page_id}

#### Success
**资源属性**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 页面的id。 |
| `url` | String | 是 | 页面的资源地址。 |
| `space` | Object | 是 | 页面所属的空间。 |
| `name` | String | 是 | 页面的名称。 |
| `type` | String | 是 | 页面的类型。<br>可选值: `document`, `group` |
| `short_id` | String | 是 | 页面的短id。 |
| `html_url` | String | 是 | 页面的html地址。 |
| `parent` | Object | 是 | 页面的父页面。 |
| `icon` | String | 是 | 页面的图标。 |
| `readings` | Number | 是 | 页面的阅读量。 |
| `published_at` | Number | 是 | 页面的发布时间。 |
| `published_by` | Object | 是 | 页面的发布人。 |
| `participants` | Object[] | 是 | 页面的关注人列表。 |
| `created_at` | Number | 是 | 页面的创建时间。 |
| `created_by` | Object | 是 | 页面的创建人。 |
| `updated_at` | Number | 是 | 页面的更新时间。 |
| `updated_by` | Object | 是 | 页面的更新人。 |
| `is_locked` | Number | 是 | 是否已锁定。<br>可选值: `0`, `1` |
| `is_archived` | Number | 是 | 是否已归档。<br>可选值: `0`, `1` |
| `is_deleted` | Number | 是 | 是否已删除。<br>可选值: `0`, `1` |

#### Success Examples
**全量数据示例：**
```json
{
    "id": "63e1bf51760505c8795ebccc",
    "url": "https://rest_api_root/v1/wiki/pages/63e1bf51760505c8795ebccc",
    "space": {
        "id": "63e1bf51760505c8795ebcc8",
        "url": "https://rest_api_root/v1/wiki/spaces/63e1bf51760505c8795ebcc8",
        "name": "示例空间",
        "identifier": "DEMO",
        "is_archived": 0,
        "is_deleted": 0
    },
    "name": "示例页面",
    "type": "document",
    "short_id": "5-x6NN",
    "html_url": "https://yctech.pingcode.com/wiki/pages/5-x6NN",
    "parent": {
        "id": "63e1bf51760505c8795ebcce",
        "url": "https://rest_api_root/v1/wiki/pages/63e1bf51760505c8795ebcce",
        "name": "模板",
        "type": "document",
        "short_id": "7nNkViOD",
        "html_url": "https://yctech.pingcode.com/wiki/pages/5-x6NN"
    },
    "icon": "file-fill",
    "readings": 10,
    "published_at": 1694065129,
    "published_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "participants": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=page&principal_id=63e1bf51760505c8795ebccc",
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        }
    ],
    "created_at": 1675738962,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1694065129,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_locked": 0,
    "is_archived": 0,
    "is_deleted": 0
}
```

**引用数据示例：**
```json
{
    "id": "63e1bf51760505c8795ebccc",
    "url": "https://rest_api_root/v1/wiki/pages/63e1bf51760505c8795ebccc",
    "name": "示例页面",
    "type": "document",
    "short_id": "5-x6NN",
    "html_url": "https://yctech.pingcode.com/wiki/pages/5-x6NN"
}
```

## 空间

### 创建一个空间

**接口:** `POST https://rest_api_root/v1/wiki/spaces`

企业令牌不能创建scope_type为user类型的空间。

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 空间的名称（不超过32个字符）。 |
| `identifier` | String | 是 | 空间的标识。在一个企业中这个标识是唯一的。产品的标识由大写英文字母/数字/下划线/连接线组成（不超过15个字符）。 |
| `scope_type` | String | 是 | 空间的所属类型。允许值分别表示企业可见、团队可见和用户可见。<br>可选值: `organization`, `user_group`, `user` |
| `scope_id` | String | 否 | 空间的所属id。当scope_type为user_group时，该字段必填，且表示团队id；当scope_type为其他值时，该字段无效。 |
| `visibility` | String | 否 | 空间可见性。允许值分别表示组织全部成员可见和仅空间成员可见。<br>可选值: `public`, `private` |
| `description` | String | 否 | 空间的描述。 |
| `members` | Object[] | 否 | 空间成员的列表。 |
| `members.id` | String | 是 | 企业成员或团队的id。 |
| `members.type` | String | 是 | 空间成员类型。<br>可选值: `user`, `user_group` |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "团队空间",
    "identifier": "GROUP",
    "scope_type": "user_group",
    "scope_id": "63c8fb32729dee3334d96af7",
    "description": "团队空间所属一个团队，只能添加所属团队内的成员。",
    "members": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "type": "user"
        }
    ],
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "642fd641209b56920a6c6e5f",
    "url": "https://rest_api_root/v1/wiki/spaces/642fd641209b56920a6c6e5f",
    "identifier": "GROUP",
    "name": "团队空间",
    "scope_type": "user_group",
    "scope_id": "63c8fb32729dee3334d96af7",
    "visibility": "private",
    "color": "#FB7894",
    "description": "团队空间所属一个团队，只能添加所属团队内的成员。",
    "members": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/wiki/spaces/642fd641209b56920a6c6e5f/members/a0417f68e846aae315c85d24643678a9",
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        },
        {
            "id": "63c8fb32729dee3334d96af7",
            "url": "https://rest_api_root/v1/wiki/spaces/642fd641209b56920a6c6e5f/members/63c8fb32729dee3334d96af7",
            "type": "user_group",
            "user_group": {
                "id": "63c8fb32729dee3334d96af7",
                "url": "https://rest_api_root/v1/directory/groups/63c8fb32729dee3334d96af7",
                "name": "Open Team"
            }
        }
    ],
    "created_at": 1583290300,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1583290300,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_archived": 0,
    "is_deleted": 0
}
```

### 删除一个空间

**接口:** `DELETE https://rest_api_root/v1/wiki/spaces/{space_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `space_id` | String | 是 | 空间的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "642fd641209b56920a6c6e5e",
    "url": "https://rest_api_root/v1/wiki/spaces/642fd641209b56920a6c6e5e",
    "identifier": "DEMO",
    "name": "示例空间",
    "scope_type": "user_group",
    "scope_id": "63c8fb32729dee3334d96af7",
    "visibility": "private",
    "color": "#FB7894",
    "description": "示例空间描述",
    "members": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/wiki/spaces/642fd641209b56920a6c6e5e/members/a0417f68e846aae315c85d24643678a9",
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        },
        {
            "id": "63c8fb32729dee3334d96af7",
            "url": "https://rest_api_root/v1/wiki/spaces/642fd641209b56920a6c6e5e/members/63c8fb32729dee3334d96af7",
            "type": "user_group",
            "user_group": {
                "id": "63c8fb32729dee3334d96af7",
                "url": "https://rest_api_root/v1/directory/groups/63c8fb32729dee3334d96af7",
                "name": "Open Team"
            }
        }
    ],
    "created_at": 1583290300,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1583290400,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_archived": 0,
    "is_deleted": 0
}
```

### 向空间中添加一个成员

**接口:** `POST https://rest_api_root/v1/wiki/spaces/{space_id}/members`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `space_id` | String | 是 | 空间的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `member` | Object | 是 | 空间的成员。 |
| `member.id` | String | 是 | 企业成员或团队的id。 |
| `member.type` | String | 是 | 空间成员的类型。<br>可选值: `user`, `user_group` |
| `role_id` | String | 否 | 角色的id。 |

#### Parameters Examples
**请求示例：**
```json
{
    "member": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "type": "user"
    },
    "role_id": "6422711c3f12e6c1e46d40e6"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "a0417f68e846aae315c85d24643678a9",
    "url": "https: //rest_api_root/v1/wiki/spaces/642fd641209b56920a6c6e5e/members/a0417f68e846aae315c85d24643678a9",
    "space": {
        "id": "642fd641209b56920a6c6e5e",
        "url": "https://rest_api_root/v1/wiki/spaces/642fd641209b56920a6c6e5e",
        "identifier": "DEMO",
        "name": "示例空间",
        "is_archived": 0,
        "is_deleted": 0
    },
    "type": "user",
    "user": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "role": {
        "id": "6422711c3f12e6c1e46d40e6",
        "url": "https://rest_api_root/v1/directory/roles/6422711c3f12e6c1e46d40e6",
        "name": "管理员"
    }
}
```

### 在空间中移除一个成员

**接口:** `DELETE https://rest_api_root/v1/wiki/spaces/{space_id}/members/{member_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `space_id` | String | 是 | 空间的id。 |
| `member_id` | String | 是 | 企业成员或团队的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "a0417f68e846aae315c85d24643678a9",
    "url": "https: //rest_api_root/v1/wiki/spaces/642fd641209b56920a6c6e5e/members/a0417f68e846aae315c85d24643678a9",
    "space": {
        "id": "642fd641209b56920a6c6e5e",
        "url": "https://rest_api_root/v1/wiki/spaces/642fd641209b56920a6c6e5e",
        "identifier": "DEMO",
        "name": "示例空间",
        "is_archived": 0,
        "is_deleted": 0
    },
    "type": "user",
    "user": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "role": {
        "id": "6422711c3f12e6c1e46d40e6",
        "url": "https://rest_api_root/v1/directory/roles/6422711c3f12e6c1e46d40e6",
        "name": "管理员"
    }
}
```

### 获取空间中的成员列表

**接口:** `GET https://rest_api_root/v1/wiki/spaces/{space_id}/members`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `space_id` | String | 是 | 空间的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 2,
    "values": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https: //rest_api_root/v1/wiki/spaces/642fd641209b56920a6c6e5e/members/a0417f68e846aae315c85d24643678a9",
            "space": {
                "id": "642fd641209b56920a6c6e5e",
                "url": "https://rest_api_root/v1/wiki/spaces/642fd641209b56920a6c6e5e",
                "identifier": "DEMO",
                "name": "示例空间",
                "is_archived": 0,
                "is_deleted": 0
            },
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "role": {
                "id": "6422711c3f12e6c1e46d40e6",
                "url": "https://rest_api_root/v1/directory/roles/6422711c3f12e6c1e46d40e6",
                "name": "管理员"
            }
        },
        {
            "id": "63c8fb32729dee3334d96af7",
            "url": "https: //rest_api_root/v1/wiki/spaces/642fd641209b56920a6c6e5e/members/63c8fb32729dee3334d96af7",
            "space": {
                "id": "642fd641209b56920a6c6e5e",
                "url": "https://rest_api_root/v1/wiki/spaces/642fd641209b56920a6c6e5e",
                "identifier": "DEMO",
                "name": "示例空间",
                "is_archived": 0,
                "is_deleted": 0
            },
            "type": "userGroup",
            "user_group": {
                "id": "63c8fb32729dee3334d96af7",
                "url": "https://rest_api_root/v1/directory/groups/63c8fb32729dee3334d96af7",
                "name": "Open Team"
            },
            "role": {
                "id": "6422711c3f12e6c1e46d40e6",
                "url": "https://rest_api_root/v1/directory/roles/6422711c3f12e6c1e46d40e6",
                "name": "管理员"
            }
       }
    ]
}
```

### 获取空间列表

**接口:** `GET https://rest_api_root/v1/wiki/spaces`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `keywords` | String | 否 | 关键字。只支持name关键字搜索。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "642fd641209b56920a6c6e5e",
            "url": "https://rest_api_root/v1/wiki/spaces/642fd641209b56920a6c6e5e",
            "identifier": "DEMO",
            "name": "示例空间",
            "scope_type": "user_group",
            "scope_id": "63c8fb32729dee3334d96af7",
            "visibility": "private",
            "color": "#FB7894",
            "description": "示例空间描述",
            "members": [
                {
                    "id": "a0417f68e846aae315c85d24643678a9",
                    "url": "https://rest_api_root/v1/wiki/spaces/642fd641209b56920a6c6e5e/members/a0417f68e846aae315c85d24643678a9",
                    "type": "user",
                    "user": {
                        "id": "a0417f68e846aae315c85d24643678a9",
                        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                        "name": "john",
                        "display_name": "John",
                        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
                    }
                },
                {
                    "id": "63c8fb32729dee3334d96af7",
                    "url": "https://rest_api_root/v1/wiki/spaces/642fd641209b56920a6c6e5e/members/63c8fb32729dee3334d96af7",
                    "type": "user_group",
                    "user_group": {
                        "id": "63c8fb32729dee3334d96af7",
                        "url": "https://rest_api_root/v1/directory/groups/63c8fb32729dee3334d96af7",
                        "name": "Open Team"
                    }
                }
            ],
            "created_at": 1583290300,
            "created_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "updated_at": 1583290400,
            "updated_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "is_archived": 0,
            "is_deleted": 0
        }
    ]
}
```

### 部分更新一个空间

**接口:** `PATCH https://rest_api_root/v1/wiki/spaces/{space_id}`

企业令牌不能更新scope_type为user类型的空间。

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `space_id` | String | 是 | 空间的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 空间的名称（不超过32个字符）。 |
| `identifier` | String | 否 | 空间的标识。在一个企业中这个标识是唯一的。产品的标识由大写英文字母/数字/下划线/连接线组成（不超过15个字符）。 |
| `description` | String | 否 | 空间的描述。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "示例空间",
    "identifier": "DEMO",
    "description": "示例空间描述"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "642fd641209b56920a6c6e5e",
    "url": "https://rest_api_root/v1/wiki/spaces/642fd641209b56920a6c6e5e",
    "identifier": "DEMO",
    "name": "示例空间",
    "scope_type": "user_group",
    "scope_id": "63c8fb32729dee3334d96af7",
    "visibility": "private",
    "color": "#FB7894",
    "description": "示例空间描述",
    "members": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/wiki/spaces/642fd641209b56920a6c6e5e/members/a0417f68e846aae315c85d24643678a9",
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        },
        {
            "id": "63c8fb32729dee3334d96af7",
            "url": "https://rest_api_root/v1/wiki/spaces/642fd641209b56920a6c6e5e/members/63c8fb32729dee3334d96af7",
            "type": "user_group",
            "user_group": {
                "id": "63c8fb32729dee3334d96af7",
                "url": "https://rest_api_root/v1/directory/groups/63c8fb32729dee3334d96af7",
                "name": "Open Team"
            }
        }
    ],
    "created_at": 1583290300,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1583290400,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_archived": 0,
    "is_deleted": 0
}
```

## 页面

### 创建一个页面

**接口:** `POST https://rest_api_root/v1/wiki/pages`

**权限:** 企业令牌/用户令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `space_id` | String | 是 | 空间的id。 |
| `name` | String | 是 | 页面的名称。 |
| `parent_id` | String | 否 | 父页面的id。 |
| `content` | String | 否 | 页面的内容。 |
| `format_type` | String | 否 | 页面内容的格式。content和format_type字段必须同时传递。<br>可选值: `text`, `markdown`, `html` |

#### Parameters Examples
**请求示例：**
```json
{
   "space_id": "63e1bf51760505c8795ebcc8",
   "name": "示例页面",
   "parent_id": "63e1bf51760505c8795ebcce",
   "content": "空间是记录信息和知识的页面集合，通过组织页面层级将知识系统化、结构化，便于团队沉淀经验、共享资源，实现知识增值，加快知识流动，在知识管理层面助力企业更快更好的发布产品。 PingCode 空间支持以下特性： 页面支持插入多种元素以及关联页面，满足编写需要 编辑过程自动保存草稿，无需担心内容丢失 提供丰富的模板，使用模板保持页面的一致性，让空间更加规范 使用锁定功能锁定页面最终版本 删除的页面放进回收站，随时恢复 树状页面结构，直接拖动页面编排目录，让知识管理更方便高效 通过设置成员角色来进行权限控制 通过页面评论实现成员沟通交流，形成反馈闭环  【PingCode 空间】当前处于不断迭代过程中，更多功能即将呈现，敬请期待~",
   "format_type": "text"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "63e1bf51760505c8795ebccc",
    "url": "https://rest_api_root/v1/wiki/pages/63e1bf51760505c8795ebccc",
    "space": {
        "id": "63e1bf51760505c8795ebcc8",
        "url": "https://rest_api_root/v1/wiki/spaces/63e1bf51760505c8795ebcc8",
        "name": "示例空间",
        "identifier": "DEMO",
        "is_archived": 0,
        "is_deleted": 0
    },
    "name": "示例页面",
    "type": "document",
    "short_id": "5-x6NN",
    "html_url": "https://yctech.pingcode.com/wiki/pages/5-x6NN",
    "parent": {
        "id": "63e1bf51760505c8795ebcce",
        "url": "https://rest_api_root/v1/wiki/pages/63e1bf51760505c8795ebcce",
        "name": "模板",
        "type": "document",
        "short_id": "c-x6NN",
        "html_url": "https://yctech.pingcode.com/wiki/pages/c-x6NN"
    },
    "type": "document",
    "icon": "file-fill",
    "readings": 0,
    "published_at": 1675738962,
    "published_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "participants": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=page&principal_id=63e1bf51760505c8795ebccc",
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        }
    ],
    "created_at": 1675738962,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1675738962,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_locked": 0,
    "is_archived": 0,
    "is_deleted": 0
}
```

### 删除一个页面

**接口:** `DELETE https://rest_api_root/v1/wiki/pages/{page_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `page_id` | String | 是 | 页面的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "63e1bf51760505c8795ebccc",
    "url": "https://rest_api_root/v1/wiki/pages/63e1bf51760505c8795ebccc",
    "name": "示例页面updated",
    "type": "document",
    "short_id": "5-x6NN",
    "html_url": "https://yctech.pingcode.com/wiki/pages/5-x6NN",
    "space": {
        "id": "63e1bf51760505c8795ebcc8",
        "url": "https://rest_api_root/v1/wiki/spaces/63e1bf51760505c8795ebcc8",
        "name": "示例空间",
        "identifier": "DEMO",
        "is_archived": 0,
        "is_deleted": 0
    },
    "parent": {
        "id": "63e1bf51760505c8795ebcce",
        "url": "https://rest_api_root/v1/wiki/pages/63e1bf51760505c8795ebcce",
        "name": "模板",
        "type": "document",
        "short_id": "c-x6NN",
        "html_url": "https://yctech.pingcode.com/wiki/pages/c-x6NN"
    },
    "icon": "file-fill",
    "readings": 0,
    "published_at": 1675739999,
    "published_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "participants": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=page&principal_id=63e1bf51760505c8795ebccc",
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        }
    ],
    "created_at": 1675738962,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1675739999,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_locked": 0,
    "is_archived": 0,
    "is_deleted": 1
}
```

### 恢复一个页面到指定版本

**接口:** `POST https://rest_api_root/v1/wiki/pages/{page_id}/versions/{version_id}/restore`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `page_id` | String | 是 | 页面的id。 |
| `version_id` | String | 是 | 页面版本的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "65093abf4d4c8ca623da8fff",
    "url": "https://rest_api_root/v1/wiki/pages/65093a8e4d4c8ca623da8fcd/versions/65093abf4d4c8ca623da8fff",
    "page": {
        "id": "65093a8e4d4c8ca623da8fcd",
        "url": "https://rest_api_root/v1/wiki/pages/65093a8e4d4c8ca623da8fcd",
        "name": "主页",
        "type": "document",
        "short_id": "5-x6NN",
        "html_url": "https://yctech.pingcode.com/wiki/pages/5-x6NN"
    },
    "name": "v2恢复自v1",
    "order": 2,
    "status": "published",
    "created_at": 1695103832,
    "created_by": {
         "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    }
}
```

### 更新一个文档正文

**接口:** `PUT https://rest_api_root/v1/wiki/pages/{page_id}/content`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `page_id` | String | 是 | 页面的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `content` | String | 是 | 页面的内容。 |
| `format_type` | String | 是 | 页面内容的格式。<br>可选值: `text`, `markdown`, `html` |

#### Parameters Examples
**请求示例：**
```json
{
   "content": "**空间是记录信息和知识的页面集合，通过组织页面层级将知识系统化、结构化，便于团队沉淀经验、共享资源，实现知识增值，加快知识流动，在知识管理层面助力企业更快更好的发布产品。** *PingCode* 空间支持以下特性： 页面支持插入多种元素以及关联页面，满足编写需要 编辑过程自动保存草稿，无需担心内容丢失 提供丰富的模板，使用模板保持页面的一致性，让空间更加规范 使用锁定功能锁定页面最终版本 删除的页面放进回收站，随时恢复 树状页面结构，直接拖动页面编排目录，让知识管理更方便高效 通过设置成员角色来进行权限控制 通过页面评论实现成员沟通交流，形成反馈闭环 **【PingCode 空间】当前处于不断迭代过程中，更多功能即将呈现，敬请期待~**",
   "format_type": "markdown"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "65093a8e4d4c8ca623da8fcd",
    "url": "https://rest_api_root/v1/wiki/pages/65093a8e4d4c8ca623da8fcd/content",
    "version": {
        "id": "65093abf4d4c8ca623da8ffe",
        "url": "https://rest_api_root/v1/wiki/63e1bf51760505c8795ebccc/versions/65093abf4d4c8ca623da8ffe",
        "name": "v3",
        "order": 3
    },
    "format_type": "markdown",
    "content": "**空间是记录信息和知识的页面集合，通过组织页面层级将知识系统化、结构化，便于团队沉淀经验、共享资源，实现知识增值，加快知识流动，在知识管理层面助力企业更快更好的发布产品。** *PingCode* 空间支持以下特性： 页面支持插入多种元素以及关联页面，满足编写需要 编辑过程自动保存草稿，无需担心内容丢失 提供丰富的模板，使用模板保持页面的一致性，让空间更加规范 使用锁定功能锁定页面最终版本 删除的页面放进回收站，随时恢复 树状页面结构，直接拖动页面编排目录，让知识管理更方便高效 通过设置成员角色来进行权限控制 通过页面评论实现成员沟通交流，形成反馈闭环 **【PingCode 空间】当前处于不断迭代过程中，更多功能即将呈现，敬请期待~**"
}
```

### 获取一个文档正文

**接口:** `GET https://rest_api_root/v1/wiki/pages/{page_id}/content`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `page_id` | String | 是 | 页面的id。 |

**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `format_type` | String | 否 | 正文格式。<br>默认值: `text`<br>可选值: `text`, `markdown`, `html` |
| `version_id` | String | 否 | 页面版本的id。默认值为页面当前版本的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "65093a8e4d4c8ca623da8fcd",
    "url": "https://rest_api_root/v1/wiki/pages/65093a8e4d4c8ca623da8fcd/content",
    "version": {
        "id": "65093abf4d4c8ca623da8ffe",
        "url": "https://rest_api_root/v1/wiki/63e1bf51760505c8795ebccc/versions/65093abf4d4c8ca623da8ffe",
        "name": "v3",
        "order": 3
    },
    "format_type": "text",
    "content": "空间是记录信息和知识的页面集合，通过组织页面层级将知识系统化、结构化，便于团队沉淀经验、共享资源，实现知识增值，加快知识流动，在知识管理层面助力企业更快更好的发布产品。 PingCode 空间支持以下特性： 页面支持插入多种元素以及关联页面，满足编写需要 编辑过程自动保存草稿，无需担心内容丢失 提供丰富的模板，使用模板保持页面的一致性，让空间更加规范 使用锁定功能锁定页面最终版本 删除的页面放进回收站，随时恢复 树状页面结构，直接拖动页面编排目录，让知识管理更方便高效 通过设置成员角色来进行权限控制 通过页面评论实现成员沟通交流，形成反馈闭环  【PingCode 空间】当前处于不断迭代过程中，更多功能即将呈现，敬请期待~"
}
```

### 获取一个页面的版本列表

**接口:** `GET https://rest_api_root/v1/wiki/pages/{page_id}/versions`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `page_id` | String | 是 | 页面的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "65093abf4d4c8ca623da8ffe",
            "url": "https://rest_api_root/v1/wiki/pages/65093a8e4d4c8ca623da8fcd/versions/65093abf4d4c8ca623da8ffe",
            "page": {
                "id": "65093a8e4d4c8ca623da8fcd",
                "url": "https://rest_api_root/v1/wiki/pages/65093a8e4d4c8ca623da8fcd",
                "name": "主页",
                "type": "document",
                "short_id": "AAx6NN",
                "html_url": "https://yctech.pingcode.com/wiki/pages/AAx6NN"
            },
            "name": "v1",
            "order": 1,
            "status": "published",
            "created_at": 1695103679,
            "created_by": {
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

### 获取统计页面

**接口:** `GET https://rest_api_root/v1/dashboard/pages`

**权限:** 用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `category` | String | 是 | 统计页面的类型。<br>可选值: `most_viewed`, `most_commented`, `recently_updated` |
| `count` | String | 否 | 统计页面的数量。<br>默认值: `10` |

#### Success Examples
**响应示例：**
```json
[
    {
       "id": "63e1bf51760505c8795ebccc",
       "url": "https://rest_api_root/v1/wiki/pages/63e1bf51760505c8795ebccc",
       "space": {
           "id": "63e1bf51760505c8795ebcc8",
           "url": "https://rest_api_root/v1/wiki/spaces/63e1bf51760505c8795ebcc8",
           "name": "Demo space",
           "identifier": "DEMO",
           "is_archived": 0,
           "is_deleted": 0
       },
       "name": "Demo page",
       "type": "document",
       "parent": {
           "id": "63e1bf51760505c8795ebcce",
           "url": "https://rest_api_root/v1/wiki/pages/63e1bf51760505c8795ebcce",
           "name": "Demo parent page",
           "type": "document",
           "short_id": "x-x6NN",
           "html_url": "https://yctech.pingcode.com/wiki/pages/x-x6NN"
       },
       "icon": "file-fill",
       "readings": 10,
       "published_at": 1694065129,
       "published_by": {
           "id": "a0417f68e846aae315c85d24643678a9",
           "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
           "name": "john",
           "display_name": "John",
           "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
       },
       "participants": [
           {
               "id": "a0417f68e846aae315c85d24643678a9",
               "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=page&principal_id=63e1bf51760505c8795ebccc",
               "type": "user",
               "user": {
                   "id": "a0417f68e846aae315c85d24643678a9",
                   "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                   "name": "john",
                   "display_name": "John",
                   "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
               }
           }
        ],
        "created_at": 1675738962,
        "created_by": {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
            "name": "john",
            "display_name": "John",
            "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
        },
        "updated_at": 1694065129,
        "updated_by": {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
            "name": "john",
            "display_name": "John",
            "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
         },
         "is_archived": 0,
         "is_deleted": 0
    }
]
```

### 获取页面列表

**接口:** `GET https://rest_api_root/v1/wiki/pages?space_id={space_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `space_id` | String | 是 | 空间的id。 |
| `parent_id` | String | 否 | 父页面的id。 |
| `created_between` | String | 否 | 创建时间介于的时间范围，通过','分割起始时间。 |
| `updated_between` | String | 否 | 更新时间介于的时间范围，通过','分割起始时间。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 2,
    "values": [
        {
            "id": "63e1bf51760505c8795ebccc",
            "url": "https://rest_api_root/v1/wiki/pages/63e1bf51760505c8795ebccc",
            "space": {
                "id": "63e1bf51760505c8795ebcc8",
                "url": "https://rest_api_root/v1/wiki/spaces/63e1bf51760505c8795ebcc8",
                "name": "示例空间",
                "identifier": "DEMO",
                "is_archived": 0,
                "is_deleted": 0
            },
            "name": "示例页面",
            "type": "document",
            "short_id": "5-x6NN",
            "html_url": "https://yctech.pingcode.com/wiki/pages/5-x6NN",
            "parent": {
                "id": "63e1bf51760505c8795ebcce",
                "url": "https://rest_api_root/v1/wiki/pages/63e1bf51760505c8795ebcce",
                "name": "模板",
                "type": "document",
                "short_id": "5-x6NN",
                "html_url": "https://yctech.pingcode.com/wiki/pages/5-x6NN"
            },
            "icon": "file-fill",
            "readings": 10,
            "published_at": 1694065129,
            "published_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "participants": [
                {
                    "id": "a0417f68e846aae315c85d24643678a9",
                    "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=page&principal_id=63e1bf51760505c8795ebccc",
                    "type": "user",
                    "user": {
                        "id": "a0417f68e846aae315c85d24643678a9",
                        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                        "name": "john",
                        "display_name": "John",
                        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
                    }
                }
            ],
            "created_at": 1675738962,
            "created_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "updated_at": 1694065129,
            "updated_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "is_locked": 0,
            "is_archived": 0,
            "is_deleted": 0
        },
        {
            "id": "63e1bf51760505c8795ebcce",
            "url": "https://rest_api_root/v1/wiki/pages/63e1bf51760505c8795ebcce",
            "space": {
                "id": "63e1bf51760505c8795ebcc8",
                "url": "https://rest_api_root/v1/wiki/spaces/63e1bf51760505c8795ebcc8",
                "name": "示例空间",
                "identifier": "DEMO",
                "is_archived": 0,
                "is_deleted": 0
            },
            "name": "模板",
            "type": "document",
            "short_id": "5-x6NN",
            "html_url": "https://yctech.pingcode.com/wiki/pages/5-x6NN",
            "parent": null,
            "icon": "file-fill",
            "readings": 0,
            "published_at": 1694065129,
            "published_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "participants": [
                {
                    "id": "a0417f68e846aae315c85d24643678a9",
                    "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=page&principal_id=63e1bf51760505c8795ebcce",
                    "type": "user",
                    "user": {
                        "id": "a0417f68e846aae315c85d24643678a9",
                        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                        "name": "john",
                        "display_name": "John",
                        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
                    }
                }
            ],
            "created_at": 1675738962,
            "created_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "updated_at": 1694065129,
            "updated_by": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            },
            "is_locked": 0,
            "is_archived": 0,
            "is_deleted": 0
        }
    ]
}
```

### 部分更新一个页面

**接口:** `PATCH https://rest_api_root/v1/wiki/pages/{page_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `page_id` | String | 是 | 页面的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 页面的名称。 |
| `parent_id` | String | 否 | 父页面的id。 |
| `lock` | Number | 否 | 是否锁定页面。<br>可选值: `0`, `1` |

#### Parameters Examples
**请求示例：**
```json
{
   "name": "示例页面updated",
   "parent_id": "63e1bf51760505c8795ebcce",
   "lock": 1
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "63e1bf51760505c8795ebccc",
    "url": "https://rest_api_root/v1/wiki/pages/63e1bf51760505c8795ebccc",
    "space": {
        "id": "63e1bf51760505c8795ebcc8",
        "url": "https://rest_api_root/v1/wiki/spaces/63e1bf51760505c8795ebcc8",
        "name": "示例空间",
        "identifier": "DEMO",
        "is_archived": 0,
        "is_deleted": 0
    },
    "name": "示例页面updated",
    "type": "document",
    "short_id": "5-x6NN",
    "html_url": "https://yctech.pingcode.com/wiki/pages/5-x6NN",
    "parent": {
        "id": "63e1bf51760505c8795ebcce",
        "url": "https://rest_api_root/v1/wiki/pages/63e1bf51760505c8795ebcce",
        "name": "模板",
        "type": "document",
        "short_id": "c-x6NN",
        "html_url": "https://yctech.pingcode.com/wiki/pages/c-x6NN"
    },
    "icon": "file-fill",
    "readings": 0,
    "published_at": 1675739999,
    "published_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "participants": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/participants/a0417f68e846aae315c85d24643678a9?principal_type=page&principal_id=63e1bf51760505c8795ebccc",
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        }
    ],
    "created_at": 1675738962,
    "created_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "updated_at": 1675739999,
    "updated_by": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    },
    "is_locked": 1,
    "is_archived": 0,
    "is_deleted": 0
}
```

## DevOps_数据集成

### 交付

### 代码

### 构建

## 代码

### 代码仓库

**接口:** ` 代码仓库`

代码托管平台内实际的代码仓库，用于在PingCode中显示代码仓库的详细信息。 
资源地址： GET https://rest_api_root/v1/scm/products/{product_id}/repositories/{repository_id}

#### Success
**资源属性**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 代码仓库的id。 |
| `url` | String | 是 | 代码仓库的资源地址。 |
| `product` | Object | 是 | 托管平台。 |
| `name` | String | 是 | 代码仓库的名称。 |
| `full_name` | String | 是 | 代码仓库的全称。 |
| `created_at` | Number | 是 | 代码仓库的创建时间。 |
| `owner` | Object | 是 | 代码仓库的拥有者。 |
| `is_fork` | Boolean | 是 | 代码仓库是否是fork仓库。 |
| `is_private` | Boolean | 是 | 代码仓库是否是私有仓库。 |
| `description` | String | 是 | 代码仓库的描述。 |
| `html_url` | String | 是 | 代码仓库的地址。 |
| `branches_url` | String | 是 | 代码仓库的分支地址模板，链接后面括号里的值会被替换成真实地址。 |
| `commits_url` | String | 是 | 代码仓库的提交地址模板，链接后面括号里的值会被替换成真实地址。 |
| `compare_url` | String | 是 | 代码仓库的分支对比地址模板，链接后面括号里的值会被替换成真实地址。 |
| `pulls_url` | String | 是 | 代码仓库的拉取请求地址模板，链接后面括号里的值会被替换成真实地址。 |

#### Success Examples
**全量数据示例：**
```json
{
    "id": "564587fe700d43b81b080766",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766",
    "product": {
        "id": "564587fe700d43b81b080765",
        "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765",
        "name": "Github",
        "type": "github"
    },
    "name": "ngx-planet",
    "full_name": "worktile/ngx-planet",
    "created_at": 1403018919,
    "owner": {
        "id": "5666aea91f99e33cb7c44964",
        "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/users/5666aea91f99e33cb7c44964",
        "name": "terry"
    },
    "is_fork": false,
    "is_private": false,
    "description": "A powerful, reliable, fully-featured and production ready Micro Frontend library for Angular",
    "html_url": "https://github.com/worktile/ngx-planet",
    "branches_url": "https://github.com/worktile/ngx-planet/tree/{branch}",
    "commits_url": "https://github.com/worktile/ngx-planet/commit/{sha}",
    "compare_url": "https://github.com/worktile/ngx-planet/compare/{base}...{head}",
    "pulls_url": "https://github.com/worktile/ngx-planet/pull/{number}"
}
```

**引用数据示例：**
```json
{
    "id": "564587fe700d43b81b080766",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766",
    "name": "ngx-planet",
    "full_name": "worktile/ngx-planet",
    "created_at": 1403018919
}
```

### 代码分支

**接口:** ` 代码分支`

代码仓库内实际的分支，用于在PingCode中显示分支的详细信息。 
资源地址： GET https://rest_api_root/v1/scm/products/{product_id}/repositories/{repository_id}/branches/{branch_id}

#### Success
**资源属性**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 代码分支的id。 |
| `url` | String | 是 | 代码分支的资源地址。 |
| `product` | Object | 是 | 代码分支的托管平台。 |
| `repository` | Object | 是 | 代码分支的代码仓库。 |
| `name` | String | 是 | 代码分支的名称。 |
| `created_at` | Number | 是 | 代码分支的创建时间。 |
| `sender` | Object | 是 | 代码分支的创建者。 |
| `is_default` | Boolean | 是 | 代码分支是否为默认分支。 |
| `work_items` | Object[] | 是 | 代码分支关联的工作项列表。 |

#### Success Examples
**全量数据示例：**
```json
{
    "id": "564587fe700d43b81b080767",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/branches/564587fe700d43b81b080767",
    "product": {
        "id": "564587fe700d43b81b080765",
        "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765",
        "name": "Github",
        "type": "github"
    },
    "repository": {
        "id": "564587fe700d43b81b080766",
        "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766",
        "name": "ngx-planet",
        "full_name": "worktile/ngx-planet",
        "created_at": 1403018919
    },
    "name": "terry/#PLM-001",
    "created_at": 1403018919,
    "sender": {
        "id": "5666aea91f99e33cb7c44964",
        "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/users/5666aea91f99e33cb7c44964",
        "name": "terry"
    },
    "is_default": false,
    "work_items": [
        {
            "id": "564587fe700d43b81b080ab8",
            "url": "https://rest_api_root/v1/project/work_items/564587fe700d43b81b080ab8",
            "identifier": "PLM-001",
            "title": "这是一个用户故事",
            "type": "story",
            "start_at": 1583290309,
            "end_at": 1583290347,
            "parent_id": "5edca524cad2fa112b06105c",
            "short_id": "c9WqLmTO",
            "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
            "properties": {
                "prop_a": "prop_a_value",
                "prop_b": "prop_b_value"
            }
        }
    ]
}
```

**引用数据示例：**
```json
{
    "id": "564587fe700d43b81b080767",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/branches/564587fe700d43b81b080767",
    "name": "terry/#PLM-001",
    "created_at": 1403018919
}
```

### 代码评审

**接口:** ` 代码评审`

拉取请求实际的代码评审记录，用于在PingCode中显示代码评审的详细信息。 
资源地址： GET https://rest_api_root/v1/scm/products/{product_id}/repositories/{repository_id}/pull_requests/{pull_request_id}/reviews/{review_id}

#### Success
**资源属性**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 代码评审的id。 |
| `url` | String | 是 | 代码评审的资源地址。 |
| `product` | Object | 是 | 代码评审的托管平台。 |
| `repository` | Object | 是 | 代码评审的代码仓库。 |
| `pull_request` | Object | 是 | 代码评审的拉取请求。 |
| `reviewer` | Object | 是 | 代码评审的评审人。 |
| `status` | String | 是 | 代码评审的状态。<br>可选值: `comment`, `approved`, `request_changes` |
| `description` | String | 是 | 代码评审的描述。 |
| `submitted_at` | Number | 是 | 代码评审的提交时间。 |
| `html_url` | String | 是 | 代码评审的地址。 |

#### Success Examples
**全量数据示例：**
```json
{
  "id": "524587fe700d43b81b080988",
  "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/pull_requests/594587fe700d43b81b080789/reviews/524587fe700d43b81b080988",
  "product": {
    "id": "564587fe700d43b81b080765",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765",
    "name": "Github",
    "type": "github"
  },
  "repository": {
    "id": "564587fe700d43b81b080766",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766",
    "name": "ngx-planet",
    "full_name": "worktile/ngx-planet",
    "created_at": 1403018919
  },
  "pull_request": {
    "id": "594587fe700d43b81b080789",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/pull_requests/594587fe700d43b81b080789",
    "number": 1
  },
  "reviewer": {
    "id": "5999aea91f99e33cb7c44964",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/users/5999aea91f99e33cb7c44964",
    "name": "anytao"
  },
  "status": "approved",
  "description": "Review has approved",
  "submitted_at": 1403014111,
  "html_url": "https://github.com/worktile/ngx-planet/pull/127#pullrequestreview-384383294"
}
```

**引用数据示例：**
```json
{
  "id": "524587fe700d43b81b080988",
  "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/pull_requests/594587fe700d43b81b080789/reviews/524587fe700d43b81b080988",
}
```

### 托管平台

**接口:** ` 托管平台`

企业内实际的代码托管平台，例如Github或私有部署的Gitlab。 
资源地址： GET https://rest_api_root/v1/scm/products/{product_id}

#### Success
**资源属性**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 托管平台的id。 |
| `url` | String | 是 | 托管平台的资源地址。 |
| `name` | String | 是 | 托管平台的名称。 |
| `type` | String | 是 | 托管平台的类型。<br>可选值: `github`, `gitlab`, `bitbucket`, `coding.net`, `gogs`, `git`, `svn`, `gerrit`, `other` |
| `description` | String | 是 | 托管平台的描述。 |

#### Success Examples
**全量数据示例：**
```json
{
    "id": "564587fe700d43b81b080765",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765",
    "name": "Github",
    "type": "github",
    "description": "Github公有云"
}
```

**引用数据示例：**
```json
{
    "id": "564587fe700d43b81b080765",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765",
    "name": "Github",
    "type": "github"
}
```

### 托管平台用户

**接口:** ` 托管平台用户`

代码托管平台内实际的用户，用于在PingCode中显示该用户在代码托管平台上的名称、头像以及主页的信息。如果没有手动创建用户，在操作代码仓库、分支、拉取请求时，将自动创建仅包含该用户名的用户。 
资源地址： GET https://rest_api_root/v1/scm/products/{product_id}/users/{user_id}

#### Success
**资源属性**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 托管平台用户的id。 |
| `url` | String | 是 | 托管平台用户的资源地址。 |
| `product` | Object | 是 | 托管平台。 |
| `name` | String | 是 | 托管平台用户的名称。 |
| `display_name` | String | 是 | 托管平台用户的显示名。 |
| `html_url` | String | 是 | 代码托管平台上的用户主页地址。 |
| `avatar_url` | String | 是 | 代码托管平台上的用户头像地址。 |

#### Success Examples
**全量数据示例：**
```json
{
    "id": "5666aea91f99e33cb7c44964",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/users/5666aea91f99e33cb7c44964",
    "product": {
        "id": "564587fe700d43b81b080765",
        "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765",
        "name": "Github",
        "type": "github"
    },
    "name": "terry",
    "display_name": "Terry",
    "html_url": "https://github.com/terrylee",
    "avatar_url": "https://avatars2.githubusercontent.com/u/694592?v=4"
}
```

**引用数据示例：**
```json
{
    "id": "5666aea91f99e33cb7c44964",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/users/5666aea91f99e33cb7c44964",
    "product": {
        "id": "564587fe700d43b81b080765",
        "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765",
        "name": "Github",
        "type": "github"
    },
    "name": "terry"
}
```

### 拉取请求

**接口:** ` 拉取请求`

代码仓库内实际的拉取请求，用于在PingCode中显示拉取请求的详细信息。 
资源地址： GET https://rest_api_root/v1/scm/products/{product_id}/repositories/{repository_id}/pull_requests/{pull_request_id}

#### Success
**资源属性**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 拉取请求的id。 |
| `url` | String | 是 | 拉取请求的资源地址。 |
| `product` | Object | 是 | 拉取请求的托管平台。 |
| `repository` | Object | 是 | 拉取请求的代码仓库。 |
| `title` | String | 是 | 拉取请求的标题。 |
| `number` | Number | 是 | 拉取请求的编号。 |
| `status` | String | 是 | 拉取请求的状态。<br>可选值: `open`, `closed`, `merged`, `abandoned` |
| `description` | String | 是 | 拉取请求的描述。 |
| `author` | Object | 是 | 拉取请求的创建者。 |
| `source_branch` | Object | 是 | 拉取请求的源分支。 |
| `target_branch` | Object | 是 | 拉取请求的目标分支。 |
| `created_at` | Number | 是 | 拉取请求的创建时间。 |
| `merged_at` | Number | 是 | 拉取请求的合并的时间。 |
| `merged_commit_sha` | String | 是 | 拉取请求的源分支最后一次提交的SHA值。 |
| `merged_by` | Object | 是 | 拉取请求的合并者。 |
| `comments_count` | Number | 是 | 拉取请求的评论数量。 |
| `review_comments_count` | Number | 是 | 拉取请求的代码评审评论数量。 |
| `commits_count` | Number | 是 | 拉取请求的提交数量。 |
| `additions_count` | Number | 是 | 拉取请求的新增文件数量。 |
| `deletions_count` | Number | 是 | 拉取请求的删除文件数量。 |
| `changed_files_count` | Number | 是 | 拉取请求的更改文件数量。 |
| `work_items` | Object[] | 是 | 拉取请求关联的PingCode的工作项列表。 |

#### Success Examples
**全量数据示例：**
```json
{
  "id": "594587fe700d43b81b080789",
  "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/pull_requests/594587fe700d43b81b080789",
  "product": {
    "id": "564587fe700d43b81b080765",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765",
    "name": "Github",
    "type": "github"
  },
  "repository": {
    "id": "564587fe700d43b81b080766",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766",
    "name": "ngx-planet",
    "full_name": "worktile/ngx-planet",
    "created_at": 1403018919
  },
  "title": "fix(doc): #PLM-001 fix document title",
  "number": 1,
  "status": "merged",
  "description": "Please give some great suggestions",
  "author": {
    "id": "5666aea91f99e33cb7c44964",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/users/5666aea91f99e33cb7c44964",
    "name": "terry"
  },
  "source_branch": {
    "id": "564587fe700d43b81b080767",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/branches/564587fe700d43b81b080767",
    "name": "terry/#PLM-001",
    "create_at": 1403018919
  },
  "target_branch": {
    "id": "564587fe700d43b81b080776",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/branches/564587fe700d43b81b080776",
    "name": "develop",
    "create_at": 1402018919
  },
  "created_at": 1403014000,
  "merged_at": 1473018919,
  "merged_commit_sha": "96a024347146ebdc5f481f45e6e6871e0c43af5f",
  "merged_by": {
    "id": "5666aea91f99e33cb7c44964",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/users/5666aea91f99e33cb7c44964",
    "name": "terry"
  },
  "comments_count": 2,
  "review_comments_count": 2,
  "commits_count": 2,
  "additions_count": 0,
  "deletions_count": 0,
  "changed_files_count": 3,
  "work_items": [
    {
      "id": "564587fe700d43b81b080ab8",
      "url": "https://rest_api_root/v1/project/work_items/564587fe700d43b81b080ab8",
      "identifier": "PLM-001",
      "title": "这是一个用户故事",
      "type": "story",
      "start_at": 1583290309,
      "end_at": 1583290347,
      "parent_id": "5edca524cad2fa112b06105c",
      "short_id": "c9WqLmTO",
      "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
      "properties": {
        "prop_a": "prop_a_value",
        "prop_b": "prop_b_value"
      }
    }
  ]
}
```

**引用数据示例：**
```json
{
  "id": "594587fe700d43b81b080789",
  "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/pull_requests/594587fe700d43b81b080789",
  "number": 1
}
```

### 提交

**接口:** ` 提交`

实际的代码提交记录，用于在PingCode中显示提交的详细信息。提交并不会自动和代码仓库关联，需要通过提交引用与之关联。 
资源地址： GET https://rest_api_root/v1/scm/commits/{commit_id_or_sha}

#### Success
**资源属性**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 提交的id。 |
| `url` | String | 是 | 提交的资源地址。 |
| `sha` | String | 是 | 提交的SHA值。 |
| `message` | String | 是 | 提交的描述信息。 |
| `committer_name` | String | 是 | 提交者的用户名。 |
| `committed_at` | Number | 是 | 提交的时间。 |
| `tree_id` | String | 是 | 提交树的SHA值。 |
| `files_added` | String[] | 是 | 提交新增文件的文件名列表。 |
| `files_removed` | String[] | 是 | 提交移除文件的文件名列表。 |
| `files_modified` | String[] | 是 | 提交更新文件的文件名列表。 |
| `file_changed_count` | Number | 是 | 提交更新文件数量。 |
| `work_items` | Object[] | 是 | 提交关联的PingCode的工作项列表。 |

#### Success Examples
**全量数据示例：**
```json
{
    "id": "5e3bb2128cfda459bbafa3fb",
    "url": "https://rest_api_root/v1/scm/commits/5e3bb2128cfda459bbafa3fb",
    "sha": "96a024347146ebdc5f481f45e6e6871e0c43af5f",
    "message": "feat(scope): #PLM-001 initialization code structure",
    "committer_name": "terry",
    "committed_at": 1403018919,
    "tree_id": "1bf8989985e70389c07daa5052464a9c6f4896bb",
    "files_added": [
        "index.ts"
    ],
    "files_removed": [
        "utilities.ts"
    ],
    "files_modified": [
        "README.md"
    ],
    "file_changed_count": 3,
    "work_items": [
        {
            "id": "564587fe700d43b81b080ab8",
            "url": "https://rest_api_root/v1/project/work_items/564587fe700d43b81b080ab8",
            "identifier": "PLM-001",
            "title": "这是一个用户故事",
            "type": "story",
            "start_at": 1583290309,
            "end_at": 1583290347,
            "parent_id": "5edca524cad2fa112b06105c",
            "short_id": "c9WqLmTO",
            "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
            "properties": {
                "prop_a": "prop_a_value",
                "prop_b": "prop_b_value"
            }
        }
    ]
}
```

**引用数据示例：**
```json
{
    "id": "5e3bb2128cfda459bbafa3fb",
    "url": "https://rest_api_root/v1/scm/commits/5e3bb2128cfda459bbafa3fb",
    "sha": "96a024347146ebdc5f481f45e6e6871e0c43af5f",
    "message": "feat(scope): #PLM-001 initialization code structure",
    "committer_name": "terry",
    "committed_at": 1403018919
}
```

### 提交引用

**接口:** ` 提交引用`

提交引用是提交与分支的一种关联关系，一个提交可以与多个分支关联，一个分支也可以与多个提交关联。 当提交与分支关联后，提交会自动与由此分支发起的拉取请求关联，当拉取请求合并后，这些关联的提交将自动被标记为“已合并”状态。 
资源地址： GET https://rest_api_root/v1/scm/products/{product_id}/repositories/{repository_id}/refs/{ref_id}

#### Success
**资源属性**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 提交引用的id。 |
| `url` | String | 是 | 提交引用的资源地址。 |
| `product` | Object | 是 | 提交引用的托管平台。 |
| `repository` | Object | 是 | 提交引用的代码仓库。 |
| `commit` | Object | 是 | 提交引用的代码提交。 |
| `meta` | Object | 是 | 提交引用的实体，如分支。 |

#### Success Examples
**全量数据示例：**
```json
{
    "id": "5e451b7dd704c212f7de8b4f",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/refs/5e451b7dd704c212f7de8b4f",
    "product": {
        "id": "564587fe700d43b81b080765",
        "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765",
        "name": "Github",
        "type": "github"
    },
    "repository": {
        "id": "564587fe700d43b81b080766",
        "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766",
        "name": "ngx-planet",
        "full_name": "worktile/ngx-planet",
        "created_at": 1403018919
    },
    "commit": {
        "id": "5e3bb2128cfda459bbafa3fb",
        "url": "https://rest_api_root/v1/scm/commits/5e3bb2128cfda459bbafa3fb",
        "sha": "96a024347146ebdc5f481f45e6e6871e0c43af5f",
        "message": "feat(scope): #PLM-001 initialization code structure",
        "committer_name": "terry",
        "committed_at": 1403018919
    },
    "meta": {
        "id": "564587fe700d43b81b080767",
        "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/branches/564587fe700d43b81b080767",
        "name": "terry/#PLM-001",
        "type": "branch"
    }
}
```

**引用数据示例：**
```json
{
    "id": "5e451b7dd704c212f7de8b4f",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/refs/5e451b7dd704c212f7de8b4f"
}
```

## 托管平台

### 全量更新一个托管平台

**接口:** `PUT https://rest_api_root/v1/scm/products/{product_id}`

**权限:** 企业令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 代码托管平台的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 代码托管平台的名称，在一个企业中这个名称是唯一的。 |
| `type` | String | 是 | 代码托管平台的产品类型，主要用于显示图标。<br>可选值: `github`, `gitlab`, `bitbucket`, `coding.net`, `gogs`, `git`, `svn`, `gerrit`, `other` |
| `description` | String | 否 | 代码托管平台简介。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "Github",
    "type": "github",
    "description": "Github公有云"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "564587fe700d43b81b080765",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765",
    "name": "Github",
    "type": "github",
    "description": "Github公有云"
}
```

### 创建一个托管平台

**接口:** `POST https://rest_api_root/v1/scm/products`

**权限:** 企业令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 代码托管平台的名称，在一个企业中这个名称是唯一的。 |
| `type` | String | 是 | 代码托管平台的产品类型，主要用于显示图标。<br>可选值: `github`, `gitlab`, `bitbucket`, `coding.net`, `gogs`, `git`, `svn`, `gerrit`, `other` |
| `description` | String | 否 | 代码托管平台的简介 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "Github",
    "type": "github",
    "description": "Github公有云"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "564587fe700d43b81b080765",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765",
    "name": "Github",
    "type": "github",
    "description": "Github公有云"
}
```

### 获取托管平台列表

**接口:** `GET https://rest_api_root/v1/scm/products`

**权限:** 企业令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 代码托管平台的名称。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "564587fe700d43b81b080765",
            "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765",
            "name": "Github",
            "type": "github",
            "description": "Github公有云"
        }
    ]
}
```

### 部分更新一个托管平台

**接口:** `PATCH https://rest_api_root/v1/scm/products/{product_id}`

**权限:** 企业令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 代码托管平台的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 代码托管平台的名称，在一个企业中这个名称是唯一的。 |
| `type` | String | 否 | 代码托管平台的产品类型，主要用于显示图标。<br>可选值: `github`, `gitlab`, `bitbucket`, `coding.net`, `gogs`, `git`, `svn`, `gerrit`, `other` |
| `description` | String | 否 | 代码托管平台简介。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "Github",
    "type": "github",
    "description": "Github公有云"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "564587fe700d43b81b080765",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765",
    "name": "Github",
    "type": "github",
    "description": "Github公有云"
}
```

## 托管平台用户

### 全量更新一个托管平台用户

**接口:** `PUT https://rest_api_root/v1/scm/products/{product_id}/users/{user_id}`

**权限:** 企业令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 代码托管平台的id。 |
| `user_id` | String | 是 | 代码托管平台上的用户id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 代码托管平台上的用户名，同一代码托管平台下，该用户名是唯一的。 |
| `display_name` | String | 否 | 用户显示名。 |
| `html_url` | String | 否 | 代码托管平台上的用户主页地址。 |
| `avatar_url` | String | 否 | 代码托管平台上的用户头像地址。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "terry",
    "display_name": "Terry",
    "html_url": "https://github.com/terrylee",
    "avatar_url": "https://avatars2.githubusercontent.com/u/694592?v=4"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "5666aea91f99e33cb7c44964",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/users/5666aea91f99e33cb7c44964",
    "product": {
        "id": "564587fe700d43b81b080765",
        "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765",
        "name": "Github",
        "type": "github"
    },
    "name": "terry",
    "display_name": "Terry",
    "html_url": "https://github.com/terrylee",
    "avatar_url": "https://avatars2.githubusercontent.com/u/694592?v=4"
}
```

### 创建一个托管平台用户

**接口:** `POST https://rest_api_root/v1/scm/products/{product_id}/users`

**权限:** 企业令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 代码托管平台的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 代码托管平台上的用户名，同一代码托管平台下，该用户名是唯一的。 |
| `display_name` | String | 否 | 用户显示名。 |
| `html_url` | String | 否 | 代码托管平台上的用户主页地址。 |
| `avatar_url` | String | 否 | 代码托管平台上的用户头像地址。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "terry",
    "display_name": "Terry",
    "html_url": "https://github.com/terrylee",
    "avatar_url": "https://avatars2.githubusercontent.com/u/694592?v=4"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "5666aea91f99e33cb7c44964",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/users/5666aea91f99e33cb7c44964",
    "product": {
        "id": "564587fe700d43b81b080765",
        "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765",
        "name": "Github",
        "type": "github"
    },
    "name": "terry",
    "display_name": "Terry",
    "html_url": "https://github.com/terrylee",
    "avatar_url": "https://avatars2.githubusercontent.com/u/694592?v=4"
}
```

### 获取托管平台用户列表

**接口:** `GET https://rest_api_root/v1/scm/products/{product_id}/users`

**权限:** 企业令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 代码托管平台的id。 |

**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 代码托管平台上的用户名。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "5666aea91f99e33cb7c44964",
            "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/users/5666aea91f99e33cb7c44964",
            "product": {
                "id": "564587fe700d43b81b080765",
                "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765",
                "name": "Github",
                "type": "github"
            },
            "name": "terry",
            "display_name": "Terry",
            "html_url": "https://github.com/terrylee",
            "avatar_url": "https://avatars2.githubusercontent.com/u/694592?v=4"
        }
    ]
}
```

### 部分更新一个托管平台用户

**接口:** `PATCH https://rest_api_root/v1/scm/products/{product_id}/users/{user_id}`

**权限:** 企业令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 代码托管平台的id。 |
| `user_id` | String | 是 | 代码托管平台上的用户id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 代码托管平台上的用户名，同一代码托管平台下，该用户名是唯一的。 |
| `display_name` | String | 否 | 用户显示名。 |
| `html_url` | String | 否 | 代码托管平台上的用户主页地址。 |
| `avatar_url` | String | 否 | 代码托管平台上的用户头像地址。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "terry",
    "display_name": "Terry",
    "html_url": "https://github.com/terrylee",
    "avatar_url": "https://avatars2.githubusercontent.com/u/694592?v=4"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "5666aea91f99e33cb7c44964",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/users/5666aea91f99e33cb7c44964",
    "product": {
        "id": "564587fe700d43b81b080765",
        "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765",
        "name": "Github",
        "type": "github"
    },
    "name": "terry",
    "display_name": "Terry",
    "html_url": "https://github.com/terrylee",
    "avatar_url": "https://avatars2.githubusercontent.com/u/694592?v=4"
}
```

## 代码仓库

### 全量更新一个代码仓库

**接口:** `PUT https://rest_api_root/v1/scm/products/{product_id}/repositories/{repository_id}`

**权限:** 企业令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 代码托管平台的id。 |
| `repository_id` | String | 是 | 代码仓库的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 代码仓库的名称。 |
| `full_name` | String | 是 | 代码仓库的全称。同一代码托管平台下，代码仓库的全称是唯一的。 |
| `description` | String | 否 | 代码仓库的简介。 |
| `is_fork` | Boolean | 否 | 是否是fork仓库。 |
| `is_private` | Boolean | 否 | 是否是私有仓库。 |
| `owner_name` | String | 否 | 代码仓库拥有者的用户名。 |
| `html_url` | String | 否 | 代码仓库在代码托管平台上的地址。如果为空，在PingCode中不显示相关跳转链接。 |
| `branches_url` | String | 否 | 代码仓库的分支地址，使用{branch}表示分支名。如果为空，在PingCode中不显示相关跳转链接。 |
| `commits_url` | String | 否 | 代码仓库的提交地址，使用{sha}表示提交的SHA值。如果为空，在PingCode中不显示相关跳转链接。 |
| `compare_url` | String | 否 | 代码仓库的分支对比地址，使用{base}和{head}表示基准分支名和需要进行对比的分支名。如果为空，在PingCode中不显示相关跳转链接。 |
| `pulls_url` | String | 否 | 代码仓库的拉取请求地址，使用{number}表示拉取请求的编号。如果为空，在PingCode中不显示相关跳转链接。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "ngx-planet",
    "full_name": "worktile/ngx-planet",
    "description": "A powerful, reliable, fully-featured and production ready Micro Frontend library for Angular",
    "is_fork": false,
    "is_private": false,
    "owner_name": "terry",
    "html_url": "https://github.com/worktile/ngx-planet",
    "branches_url": "https://github.com/worktile/ngx-planet/tree/{branch}",
    "commits_url": "https://github.com/worktile/ngx-planet/commit/{sha}",
    "compare_url": "https://github.com/worktile/ngx-planet/compare/{base}...{head}",
    "pulls_url": "https://github.com/worktile/ngx-planet/pull/{number}"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "564587fe700d43b81b080766",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766",
    "product": {
        "id": "564587fe700d43b81b080765",
        "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765",
        "name": "Github",
        "type": "github"
    },
    "name": "ngx-planet",
    "full_name": "worktile/ngx-planet",
    "created_at": 1403018919,
    "owner": {
        "id": "5666aea91f99e33cb7c44964",
        "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/users/5666aea91f99e33cb7c44964",
        "name": "terry"
    },
    "is_fork": false,
    "is_private": false,
    "description": "A powerful, reliable, fully-featured and production ready Micro Frontend library for Angular",
    "html_url": "https://github.com/worktile/ngx-planet",
    "branches_url": "https://github.com/worktile/ngx-planet/tree/{branch}",
    "commits_url": "https://github.com/worktile/ngx-planet/commit/{sha}",
    "compare_url": "https://github.com/worktile/ngx-planet/compare/{base}...{head}",
    "pulls_url": "https://github.com/worktile/ngx-planet/pull/{number}"
}
```

### 创建一个代码仓库

**接口:** `POST https://rest_api_root/v1/scm/products/{product_id}/repositories`

**权限:** 企业令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 代码托管平台的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 代码仓库的名称。 |
| `full_name` | String | 是 | 代码仓库的全称。同一代码托管平台下，代码仓库的全称是唯一的。 |
| `description` | String | 否 | 代码仓库的简介。 |
| `is_fork` | Boolean | 否 | 是否是fork仓库。 |
| `is_private` | Boolean | 否 | 是否是私有仓库。 |
| `owner_name` | String | 否 | 代码仓库拥有者的用户名。 |
| `html_url` | String | 否 | 代码仓库的地址。如果为空，在PingCode中不显示相关跳转链接。 |
| `branches_url` | String | 否 | 代码仓库的分支地址，使用{branch}表示分支名。如果为空，在PingCode中不显示相关跳转链接。 |
| `commits_url` | String | 否 | 代码仓库的提交地址，使用{sha}表示提交的SHA值。如果为空，在PingCode中不显示相关跳转链接。 |
| `compare_url` | String | 否 | 代码仓库的分支对比地址，使用{base}和{head}表示基准分支名和需要进行对比的分支名。如果为空，在PingCode中不显示相关跳转链接。 |
| `pulls_url` | String | 否 | 代码仓库的拉取请求地址，使用{number}表示拉取请求的编号。如果为空，在PingCode中不显示相关跳转链接。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "ngx-planet",
    "full_name": "worktile/ngx-planet",
    "description": "A powerful, reliable, fully-featured and production ready Micro Frontend library for Angular",
    "is_fork": false,
    "is_private": false,
    "owner_name": "terry",
    "html_url": "https://github.com/worktile/ngx-planet",
    "branches_url": "https://github.com/worktile/ngx-planet/tree/{branch}",
    "commits_url": "https://github.com/worktile/ngx-planet/commit/{sha}",
    "compare_url": "https://github.com/worktile/ngx-planet/compare/{base}...{head}",
    "pulls_url": "https://github.com/worktile/ngx-planet/pull/{number}"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "564587fe700d43b81b080766",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766",
    "product": {
        "id": "564587fe700d43b81b080765",
        "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765",
        "name": "Github",
        "type": "github"
    },
    "name": "ngx-planet",
    "full_name": "worktile/ngx-planet",
    "created_at": 1403018919,
    "owner": {
        "id": "5666aea91f99e33cb7c44964",
        "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/users/5666aea91f99e33cb7c44964",
        "name": "terry"
    },
    "is_fork": false,
    "is_private": false,
    "description": "A powerful, reliable, fully-featured and production ready Micro Frontend library for Angular",
    "html_url": "https://github.com/worktile/ngx-planet",
    "branches_url": "https://github.com/worktile/ngx-planet/tree/{branch}",
    "commits_url": "https://github.com/worktile/ngx-planet/commit/{sha}",
    "compare_url": "https://github.com/worktile/ngx-planet/compare/{base}...{head}",
    "pulls_url": "https://github.com/worktile/ngx-planet/pull/{number}"
}
```

### 获取代码仓库列表

**接口:** `GET https://rest_api_root/v1/scm/products/{product_id}/repositories`

**权限:** 企业令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 代码托管平台的id。 |

**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `full_name` | String | 否 | 代码仓库的全称。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "564587fe700d43b81b080766",
            "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766",
            "product": {
                "id": "564587fe700d43b81b080765",
                "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765",
                "name": "Github",
                "type": "github"
            },
            "name": "ngx-planet",
            "full_name": "worktile/ngx-planet",
            "created_at": 1403018919,
            "owner": {
                "id": "5666aea91f99e33cb7c44964",
                "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/users/5666aea91f99e33cb7c44964",
                "name": "terry"
            },
            "is_fork": false,
            "is_private": false,
            "description": "A powerful, reliable, fully-featured and production ready Micro Frontend library for Angular",
            "html_url": "https://github.com/worktile/ngx-planet",
            "branches_url": "https://github.com/worktile/ngx-planet/tree/{branch}",
            "commits_url": "https://github.com/worktile/ngx-planet/commit/{sha}",
            "compare_url": "https://github.com/worktile/ngx-planet/compare/{base}...{head}",
            "pulls_url": "https://github.com/worktile/ngx-planet/pull/{number}"
        }
    ]
}
```

### 部分更新一个代码仓库

**接口:** `PATCH https://rest_api_root/v1/scm/products/{product_id}/repositories/{repository_id}`

**权限:** 企业令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 代码托管平台的id。 |
| `repository_id` | String | 是 | 代码仓库的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 代码仓库的名称。 |
| `full_name` | String | 否 | 代码仓库的全称。同一代码托管平台下，代码仓库的全称是唯一的。 |
| `description` | String | 否 | 代码仓库的简介。 |
| `is_fork` | Boolean | 否 | 是否是fork仓库。 |
| `is_private` | Boolean | 否 | 是否是私有仓库。 |
| `owner_name` | String | 否 | 代码仓库拥有者的用户名。 |
| `html_url` | String | 否 | 代码仓库在代码托管平台上的地址。如果为空，在PingCode中不显示相关跳转链接。 |
| `branches_url` | String | 否 | 代码仓库的分支地址，使用{branch}表示分支名。如果为空，在PingCode中不显示相关跳转链接。 |
| `commits_url` | String | 否 | 代码仓库的提交地址，使用{sha}表示提交的SHA值。如果为空，在PingCode中不显示相关跳转链接。 |
| `compare_url` | String | 否 | 代码仓库的分支对比地址，使用{base}和{head}表示基准分支名和需要进行对比的分支名。如果为空，在PingCode中不显示相关跳转链接。 |
| `pulls_url` | String | 否 | 代码仓库的拉取请求地址，使用{number}表示拉取请求的编号。如果为空，在PingCode中不显示相关跳转链接。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "ngx-planet",
    "full_name": "worktile/ngx-planet",
    "description": "A powerful, reliable, fully-featured and production ready Micro Frontend library for Angular",
    "is_fork": false,
    "is_private": false,
    "owner_name": "terry",
    "html_url": "https://github.com/worktile/ngx-planet",
    "branches_url": "https://github.com/worktile/ngx-planet/tree/{branch}",
    "commits_url": "https://github.com/worktile/ngx-planet/commit/{sha}",
    "compare_url": "https://github.com/worktile/ngx-planet/compare/{base}...{head}",
    "pulls_url": "https://github.com/worktile/ngx-planet/pull/{number}"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "564587fe700d43b81b080766",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766",
    "product": {
        "id": "564587fe700d43b81b080765",
        "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765",
        "name": "Github",
        "type": "github"
    },
    "name": "ngx-planet",
    "full_name": "worktile/ngx-planet",
    "created_at": 1403018919,
    "owner": {
        "id": "5666aea91f99e33cb7c44964",
        "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/users/5666aea91f99e33cb7c44964",
        "name": "terry"
    },
    "is_fork": false,
    "is_private": false,
    "description": "A powerful, reliable, fully-featured and production ready Micro Frontend library for Angular",
    "html_url": "https://github.com/worktile/ngx-planet",
    "branches_url": "https://github.com/worktile/ngx-planet/tree/{branch}",
    "commits_url": "https://github.com/worktile/ngx-planet/commit/{sha}",
    "compare_url": "https://github.com/worktile/ngx-planet/compare/{base}...{head}",
    "pulls_url": "https://github.com/worktile/ngx-planet/pull/{number}"
}
```

## 代码分支

### 创建一个代码分支

**接口:** `POST https://rest_api_root/v1/scm/products/{product_id}/repositories/{repository_id}/branches`

**权限:** 企业令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 代码托管平台的id。 |
| `repository_id` | String | 是 | 代码仓库的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 分支的名称。同一代码仓库下，分支的名称是唯一的。 |
| `sender_name` | String | 是 | 分支创建者的用户名。 |
| `is_default` | Boolean | 否 | 是否设置为默认分支。当创建分支时，如果当前仓库的分支数为0，则新创建的分支会自动设置为该仓库的默认分支。如果创建分支时设置了该分支为默认分支，并且仓库已经有默认分支存在，那么其他分支将被取消默认属性，而该分支将被设置为新的默认分支。 |
| `work_item_identifiers` | String[] | 否 | PingCode工作项编号的列表。通过该参数将分支与一个或多个工作项关联，分支和工作项关联后，分支下所有的提交都会和该工作项关联。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "terry/#PLM-001",
    "sender_name": "terry",
    "is_default": true,
    "work_item_identifiers": [
        "PLM-001"
    ]
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "564587fe700d43b81b080767",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/branches/564587fe700d43b81b080767",
    "product": {
        "id": "564587fe700d43b81b080765",
        "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765",
        "name": "Github",
        "type": "github"
    },
    "repository": {
        "id": "564587fe700d43b81b080766",
        "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766",
        "name": "ngx-planet",
        "full_name": "worktile/ngx-planet",
        "created_at": 1403018919
    },
    "name": "terry/#PLM-001",
    "created_at": 1403018919,
    "sender": {
        "id": "5666aea91f99e33cb7c44964",
        "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/users/5666aea91f99e33cb7c44964",
        "name": "terry"
    },
    "is_default": true,
    "work_items": [
        {
            "id": "564587fe700d43b81b080ab8",
            "url": "https://rest_api_root/v1/project/work_items/564587fe700d43b81b080ab8",
            "identifier": "PLM-001",
            "title": "这是一个用户故事",
            "type": "story",
            "start_at": 1583290309,
            "end_at": 1583290347,
            "parent_id": "5edca524cad2fa112b06105c",
            "short_id": "c9WqLmTO",
            "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
            "properties": {
                "prop_a": "prop_a_value",
                "prop_b": "prop_b_value"
            }
        }
    ]
}
```

### 删除一个代码分支

**接口:** `DELETE https://rest_api_root/v1/scm/products/{product_id}/repositories/{repository_id}/branches/{branch_id}`

删除分支后，不会移除该分支和工作项的关联历史，在关联历史中，依然可以查询到删除的分支。默认分支不能被删除。

**权限:** 企业令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 代码托管平台的id。 |
| `repository_id` | String | 是 | 代码仓库的id。 |
| `branch_id` | String | 是 | 分支的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "564587fe700d43b81b080768",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/branches/564587fe700d43b81b080768",
    "product": {
        "id": "564587fe700d43b81b080765",
        "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765",
        "name": "Github",
        "type": "github"
    },
    "repository": {
        "id": "564587fe700d43b81b080766",
        "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766",
        "name": "ngx-planet",
        "full_name": "worktile/ngx-planet",
        "created_at": 1403018919
    },
    "name": "terry/#PLM-001",
    "created_at": 1403018919,
    "sender": {
        "id": "5666aea91f99e33cb7c44964",
        "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/users/5666aea91f99e33cb7c44964",
        "name": "terry"
    },
    "is_default": false,
    "work_items": [
        {
            "id": "564587fe700d43b81b080ab8",
            "url": "https://rest_api_root/v1/project/work_items/564587fe700d43b81b080ab8",
            "identifier": "PLM-001",
            "title": "这是一个用户故事",
            "type": "story",
            "start_at": 1583290309,
            "end_at": 1583290347,
            "parent_id": "5edca524cad2fa112b06105c",
            "short_id": "c9WqLmTO",
            "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
            "properties": {
                "prop_a": "prop_a_value",
                "prop_b": "prop_b_value"
            }
        }
    ]
}
```

### 获取代码分支列表

**接口:** `GET https://rest_api_root/v1/scm/products/{product_id}/repositories/{repository_id}/branches`

**权限:** 企业令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 代码托管平台的id。 |
| `repository_id` | String | 是 | 代码仓库的id。 |

**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 分支的名称。 |
| `work_item_id` | String | 否 | 工作项的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "564587fe700d43b81b080767",
            "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/branches/564587fe700d43b81b080767",
            "product": {
                "id": "564587fe700d43b81b080765",
                "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765",
                "name": "Github",
                "type": "github"
            },
            "repository": {
                "id": "564587fe700d43b81b080766",
                "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766",
                "name": "ngx-planet",
                "full_name": "worktile/ngx-planet",
                "created_at": 1403018919
            },
            "name": "terry/#PLM-001",
            "created_at": 1403018919,
            "sender": {
                "id": "5666aea91f99e33cb7c44964",
                "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/users/5666aea91f99e33cb7c44964",
                "name": "terry"
            },
            "is_default": false,
            "work_items": [
                {
                    "id": "564587fe700d43b81b080ab8",
                    "url": "https://rest_api_root/v1/project/work_items/564587fe700d43b81b080ab8",
                    "identifier": "PLM-001",
                    "title": "这是一个用户故事",
                    "type": "story",
                    "start_at": 1583290309,
                    "end_at": 1583290347,
                    "parent_id": "5edca524cad2fa112b06105c",
                    "short_id": "c9WqLmTO",
                    "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
                    "properties": {
                        "prop_a": "prop_a_value",
                        "prop_b": "prop_b_value"
                    }
                }
            ]
        }
    ]
}
```

### 部分更新一个代码分支

**接口:** `PATCH https://rest_api_root/v1/scm/products/{product_id}/repositories/{repository_id}/branches/{branch_id}`

**权限:** 企业令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 代码托管平台的id。 |
| `repository_id` | String | 是 | 代码仓库的id。 |
| `branch_id` | String | 是 | 分支的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `is_default` | Boolean | 否 | 是否设置为默认分支。该值只能是true，设置该分支为默认分支后将取消其他分支的默认属性。 |
| `work_item_identifiers` | String[] | 否 | PingCode工作项编号的列表。通过该参数将分支与一个或多个工作项关联，分支和工作项关联后，分支下所有的提交都会和该工作项关联。 |

#### Parameters Examples
**请求示例：**
```json
{
   "is_default": true,
   "work_item_identifiers": [
      "PLM-001"
   ]
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "564587fe700d43b81b080767",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/branches/564587fe700d43b81b080767",
    "product": {
        "id": "564587fe700d43b81b080765",
        "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765",
        "name": "Github",
        "type": "github"
    },
    "repository": {
        "id": "564587fe700d43b81b080766",
        "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766",
        "name": "ngx-planet",
        "full_name": "worktile/ngx-planet",
        "created_at": 1403018919
    },
    "name": "terry/#PLM-001",
    "created_at": 1403018919,
    "sender": {
        "id": "5666aea91f99e33cb7c44964",
        "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/users/5666aea91f99e33cb7c44964",
        "name": "terry"
    },
    "is_default": true,
    "work_items": [
        {
            "id": "564587fe700d43b81b080ab8",
            "url": "https://rest_api_root/v1/project/work_items/564587fe700d43b81b080ab8",
            "identifier": "PLM-001",
            "title": "这是一个用户故事",
            "type": "story",
            "start_at": 1583290309,
            "end_at": 1583290347,
            "parent_id": "5edca524cad2fa112b06105c",
            "short_id": "c9WqLmTO",
            "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
            "properties": {
                "prop_a": "prop_a_value",
                "prop_b": "prop_b_value"
            }
        }
    ]
}
```

## 提交

### 创建一个提交

**接口:** `post https://rest_api_root/v1/scm/commits`

**权限:** 企业令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `sha` | String | 是 | 提交的SHA值。 |
| `message` | String | 是 | 提交的描述信息。 |
| `committer_name` | String | 是 | 提交者的用户名。 |
| `committed_at` | Number | 是 | 提交的时间。 |
| `tree_id` | String | 否 | 提交树的SHA值。 |
| `files_added` | String[] | 是 | 新增文件的文件名列表。 |
| `files_removed` | String[] | 是 | 移除文件的文件名列表。 |
| `files_modified` | String[] | 是 | 更新文件的文件名列表。 |
| `work_item_identifiers` | String[] | 否 | PingCode工作项编号的列表。通过该参数将提交与一个或多个工作项关联。 |

#### Parameters Examples
**请求示例：**
```json
{
    "sha": "96a024347146ebdc5f481f45e6e6871e0c43af5f",
    "message": "feat(scope): #PLM-001 initialization code structure",
    "committer_name": "terry",
    "committed_at": 1403018919,
    "tree_id": "1bf8989985e70389c07daa5052464a9c6f4896bb",
    "files_added": [
        "index.ts"
    ],
    "files_removed": [
        "utilities.ts"
    ],
    "files_modified": [
        "README.md"
    ],
    "work_item_identifiers": [
        "PLM-001"
    ]
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "5e3bb2128cfda459bbafa3fb",
    "url": "https://rest_api_root/v1/scm/commits/5e3bb2128cfda459bbafa3fb",
    "sha": "96a024347146ebdc5f481f45e6e6871e0c43af5f",
    "message": "feat(scope): #PLM-001 initialization code structure",
    "committer_name": "terry",
    "committed_at": 1403018919,
    "tree_id": "1bf8989985e70389c07daa5052464a9c6f4896bb",
    "files_added": [
        "index.ts"
    ],
    "files_removed": [
        "utilities.ts"
    ],
    "files_modified": [
        "README.md"
    ],
    "file_changed_count": 3,
    "work_items": [
        {
            "id": "564587fe700d43b81b080ab8",
            "url": "https://rest_api_root/v1/project/work_items/564587fe700d43b81b080ab8",
            "identifier": "PLM-001",
            "title": "这是一个用户故事",
            "type": "story",
            "start_at": 1583290309,
            "end_at": 1583290347,
            "parent_id": "5edca524cad2fa112b06105c",
            "short_id": "c9WqLmTO",
            "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
            "properties": {
                "prop_a": "prop_a_value",
                "prop_b": "prop_b_value"
            }
        }
    ]
}
```

### 获取提交列表

**接口:** `get https://rest_api_root/v1/scm/commits`

**权限:** 企业令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `sha` | String | 否 | 提交的SHA值。 |
| `work_item_id` | String | 否 | 工作项的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "5e3bb2128cfda459bbafa3fb",
            "url": "https://rest_api_root/v1/scm/commits/5e3bb2128cfda459bbafa3fb",
            "sha": "96a024347146ebdc5f481f45e6e6871e0c43af5f",
            "message": "feat(scope): #PLM-001 initialization code structure",
            "committer_name": "terry",
            "committed_at": 1403018919,
            "tree_id": "1bf8989985e70389c07daa5052464a9c6f4896bb",
            "files_added": [
                "index.ts"
            ],
            "files_removed": [
                "utilities.ts"
            ],
            "files_modified": [
                "README.md"
            ],
            "file_changed_count": 3,
            "work_items": [
                {
                    "id": "564587fe700d43b81b080ab8",
                    "url": "https://rest_api_root/v1/project/work_items/564587fe700d43b81b080ab8",
                    "identifier": "PLM-001",
                    "title": "这是一个用户故事",
                    "type": "story",
                    "start_at": 1583290309,
                    "end_at": 1583290347,
                    "parent_id": "5edca524cad2fa112b06105c",
                    "short_id": "c9WqLmTO",
                    "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
                    "properties": {
                        "prop_a": "prop_a_value",
                        "prop_b": "prop_b_value"
                    }
                }
            ]
        }
    ]
}
```

## 提交引用

### 创建一个提交引用

**接口:** `POST https://rest_api_root/v1/scm/products/{product_id}/repositories/{repository_id}/refs`

**权限:** 企业令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 代码托管平台的id。 |
| `repository_id` | String | 是 | 代码仓库的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `sha` | String | 是 | 提交的SHA值。 |
| `meta_type` | String | 是 | 引用实体的类型。<br>可选值: `branch` |
| `meta_id` | String | 是 | 引用实体的id，例如：branch_id。 |

#### Parameters Examples
**请求示例：**
```json
{
    "sha": "96a024347146ebdc5f481f45e6e6871e0c43af5f",
    "meta_type": "branch",
    "meta_id": "564587fe700d43b81b080767"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "5e451b7dd704c212f7de8b4f",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/refs/5e451b7dd704c212f7de8b4f",
    "product": {
        "id": "564587fe700d43b81b080765",
        "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765",
        "name": "Github",
        "type": "github"
    },
    "repository": {
        "id": "564587fe700d43b81b080766",
        "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766",
        "name": "ngx-planet",
        "full_name": "worktile/ngx-planet",
        "created_at": 1403018919
    },
    "commit": {
        "id": "5e3bb2128cfda459bbafa3fb",
        "url": "https://rest_api_root/v1/scm/commits/5e3bb2128cfda459bbafa3fb",
        "sha": "96a024347146ebdc5f481f45e6e6871e0c43af5f",
        "message": "feat(scope): #PLM-001 initialization code structure",
        "committer_name": "terry",
        "committed_at": 1403018919
    },
    "meta": {
        "id": "564587fe700d43b81b080767",
        "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/branches/564587fe700d43b81b080767",
        "name": "terry/#PLM-001",
        "type": "branch"
    }
}
```

### 获取提交引用列表

**接口:** `GET https://rest_api_root/v1/scm/products/{product_id}/repositories/{repository_id}/refs`

**权限:** 企业令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 代码托管平台的id。 |
| `repository_id` | String | 是 | 代码仓库的id。 |

**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `meta_type` | String | 是 | 引用实体的类型。<br>可选值: `branch` |
| `meta_id` | String | 是 | 引用实体的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "5e451b7dd704c212f7de8b4f",
            "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/refs/5e451b7dd704c212f7de8b4f",
            "product": {
                "id": "564587fe700d43b81b080765",
                "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765",
                "name": "Github",
                "type": "github"
            },
            "repository": {
                "id": "564587fe700d43b81b080766",
                "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766",
                "name": "ngx-planet",
                "full_name": "worktile/ngx-planet",
                "created_at": 1403018919
            },
            "commit": {
                "id": "5e3bb2128cfda459bbafa3fb",
                "url": "https://rest_api_root/v1/scm/commits/5e3bb2128cfda459bbafa3fb",
                "sha": "96a024347146ebdc5f481f45e6e6871e0c43af5f",
                "message": "feat(scope): #PLM-001 initialization code structure",
                "committer_name": "terry",
                "committed_at": 1403018919
            },
            "meta": {
                "id": "564587fe700d43b81b080767",
                "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/branches/564587fe700d43b81b080767",
                "name": "terry/#PLM-001",
                "type": "branch"
            }
        }
    ]
}
```

## 拉取请求

### 全量更新一个拉取请求

**接口:** `PUT https://rest_api_root/v1/scm/products/{product_id}/repositories/{repository_id}/pull_requests/{pull_request_id}`

**权限:** 企业令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 代码托管平台的id。 |
| `repository_id` | String | 是 | 代码仓库的id。 |
| `pull_request_id` | String | 是 | 拉取请求的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `title` | String | 是 | 拉取请求的标题。 |
| `creator_name` | String | 是 | 拉取请求创建者的用户名。 |
| `source_branch_id` | String | 是 | 源分支的id。 |
| `target_branch_id` | String | 是 | 目标分支的id。 |
| `status` | String | 是 | 拉取请求的状态。<br>可选值: `open`, `closed`, `merged`, `abandoned` |
| `description` | String | 否 | 拉取请求的描述。 |
| `merged_at` | Number | 否 | 拉取请求合并的时间。当拉取请求状态为merged时，该值为必填。 |
| `merged_commit_sha` | String | 否 | 源分支最后一次提交的SHA值。当拉取请求状态为merged时，该值为必填。 |
| `merged_by_name` | String | 否 | 拉取请求合并者的用户名。当拉取请求状态为merged时，该值为必填。 |
| `comments_count` | Number | 否 | 拉取请求的评论数量。 |
| `review_comments_count` | Number | 否 | 代码评审的评论数量。 |
| `commits_count` | Number | 否 | 代码的提交数量。 |
| `additions_count` | Number | 否 | 新增文件的数量。 |
| `deletions_count` | Number | 否 | 删除文件的数量。 |
| `changed_files_count` | Number | 否 | 更改文件的数量。 |
| `work_item_identifiers` | String[] | 否 | PingCode工作项编号的列表。通过该参数将拉取请求与一个或多个工作项关联。 |

#### Parameters Examples
**请求示例：**
```json
{
   "title": "fix(doc): #PLM-001 fix document title",
   "number": 1,
   "creator_name": "terry",
   "description": "Please give some great suggestions",
   "source_branch_id": "564587fe700d43b81b080767",
   "target_branch_id": "564587fe700d43b81b080776",
   "status": "merged",
   "merged_at": 1473018919,
   "merged_commit_sha": "96a024347146ebdc5f481f45e6e6871e0c43af5f",
   "merged_by_name": "terry",
   "comments_count": 2,
   "review_comments_count": 2,
   "commits_count": 2,
   "additions_count": 0,
   "deletions_count": 0,
   "changed_files_count": 3,
   "work_item_identifiers": [
      "PLM-001"
   ]
}
```

#### Success Examples
**响应示例：**
```json
{
   "id": "594587fe700d43b81b080789",
   "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/pull_requests/594587fe700d43b81b080789",
   "product": {
      "id": "564587fe700d43b81b080765",
      "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765",
      "name": "Github",
      "type": "github"
   },
   "repository": {
      "id": "564587fe700d43b81b080766",
      "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766",
      "name": "ngx-planet",
      "full_name": "worktile/ngx-planet",
      "created_at": 1403018919
   },
   "title": "fix(doc): #PLM-001 fix document title",
   "number": 1,
   "status": "merged",
   "description": "Please give some great suggestions",
   "author": {
      "id": "5666aea91f99e33cb7c44964",
      "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/users/5666aea91f99e33cb7c44964",
      "name": "terry"
   },
   "source_branch": {
      "id": "564587fe700d43b81b080767",
      "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/branches/564587fe700d43b81b080767",
      "name": "terry/#PLM-001",
      "create_at": 1403018919
   },
   "target_branch": {
      "id": "564587fe700d43b81b080776",
      "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/branches/564587fe700d43b81b080776",
      "name": "develop",
      "create_at": 1402018919
   },
   "created_at": 1403014000,
   "merged_at": 1473018919,
   "merged_commit_sha": "96a024347146ebdc5f481f45e6e6871e0c43af5f",
   "merged_by": {
      "id": "5666aea91f99e33cb7c44968",
      "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/users/5666aea91f99e33cb7c44964",
      "name": "terry"
   },
   "comments_count": 2,
   "review_comments_count": 2,
   "commits_count": 2,
   "additions_count": 0,
   "deletions_count": 0,
   "changed_files_count": 3,
   "work_items": [
      {
          "id": "564587fe700d43b81b080ab8",
          "url": "https://rest_api_root/v1/project/work_items/564587fe700d43b81b080ab8",
          "identifier": "PLM-001",
          "title": "这是一个用户故事",
          "type": "story",
          "start_at": 1583290309,
          "end_at": 1583290347,
          "parent_id": "5edca524cad2fa112b06105c",
          "short_id": "c9WqLmTO",
          "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
          "properties": {
              "prop_a": "prop_a_value",
              "prop_b": "prop_b_value"
          }
      }
   ]
}
```

### 创建一个拉取请求

**接口:** `POST https://rest_api_root/v1/scm/products/{product_id}/repositories/{repository_id}/pull_requests`

**权限:** 企业令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 代码托管平台的id。 |
| `repository_id` | String | 是 | 代码仓库的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `title` | String | 是 | 拉取请求的标题。 |
| `number` | Number | 是 | 拉取请求的编号。同一代码仓库下，该值是唯一的。 |
| `creator_name` | String | 是 | 拉取请求创建者的用户名。 |
| `source_branch_id` | String | 否 | 源分支的id。 |
| `target_branch_id` | String | 是 | 目标分支的id。 |
| `status` | String | 是 | 拉取请求的状态。<br>可选值: `open`, `closed`, `merged`, `abandoned` |
| `description` | String | 否 | 拉取请求的描述。 |
| `merged_at` | Number | 否 | 拉取请求合并的时间。当拉取请求状态为merged时，该值为必填。 |
| `merged_commit_sha` | String | 否 | 源分支最后一次提交的SHA值。当拉取请求状态为merged时，该值为必填。 |
| `merged_by_name` | String | 否 | 拉取请求合并者的用户名。当拉取请求状态为merged时，该值为必填。 |
| `comments_count` | Number | 否 | 拉取请求的评论数量。 |
| `review_comments_count` | Number | 否 | 代码评审的评论数量。 |
| `commits_count` | Number | 否 | 代码的提交数量。 |
| `additions_count` | Number | 否 | 新增文件的数量。 |
| `deletions_count` | Number | 否 | 删除文件的数量。 |
| `changed_files_count` | Number | 否 | 更改文件的数量。 |
| `work_item_identifiers` | String[] | 否 | PingCode工作项编号的列表。通过该参数将拉取请求与一个或多个工作项关联。 |

#### Parameters Examples
**请求示例：**
```json
{
   "title": "fix(doc): #PLM-001 fix document title",
   "number": 1,
   "creator_name": "terry",
   "description": "Please give some great suggestions",
   "source_branch_id": "564587fe700d43b81b080767",
   "target_branch_id": "564587fe700d43b81b080776",
   "status": "merged",
   "merged_at": 1473018919,
   "merged_commit_sha": "96a024347146ebdc5f481f45e6e6871e0c43af5f",
   "merged_by_name": "terry",
   "comments_count": 2,
   "review_comments_count": 2,
   "commits_count": 2,
   "additions_count": 0,
   "deletions_count": 0,
   "changed_files_count": 3,
   "work_item_identifiers": [
      "PLM-001"
   ]
}
```

#### Success Examples
**响应示例：**
```json
{
  "id": "594587fe700d43b81b080789",
  "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/pull_requests/594587fe700d43b81b080789",
  "product": {
    "id": "564587fe700d43b81b080765",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765",
    "name": "Github",
    "type": "github"
  },
  "repository": {
    "id": "564587fe700d43b81b080766",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766",
    "name": "ngx-planet",
    "full_name": "worktile/ngx-planet",
    "created_at": 1403018919
  },
  "title": "fix(doc): #PLM-001 fix document title",
  "number": 1,
  "status": "merged",
  "description": "Please give some great suggestions",
  "author": {
    "id": "5666aea91f99e33cb7c44964",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/users/5666aea91f99e33cb7c44964",
    "name": "terry"
  },
  "source_branch": {
    "id": "564587fe700d43b81b080767",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/branches/564587fe700d43b81b080767",
    "name": "terry/#PLM-001",
    "create_at": 1403018919
  },
  "target_branch": {
    "id": "564587fe700d43b81b080776",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/branches/564587fe700d43b81b080776",
    "name": "develop",
    "create_at": 1402018919
  },
      "created_at": 1463014000,
  "merged_at": 1473018919,
  "merged_commit_sha": "96a024347146ebdc5f481f45e6e6871e0c43af5f",
  "merged_by": {
    "id": "5666aea91f99e33cb7c44964",
    "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/users/5666aea91f99e33cb7c44964",
    "name": "terry"
  },
  "comments_count": 2,
  "review_comments_count": 2,
  "commits_count": 2,
  "additions_count": 0,
  "deletions_count": 0,
  "changed_files_count": 3,
  "work_items": [
    {
      "id": "564587fe700d43b81b080ab8",
      "url": "https://rest_api_root/v1/project/work_items/564587fe700d43b81b080ab8",
      "identifier": "PLM-001",
      "title": "这是一个用户故事",
      "type": "story",
      "start_at": 1583290309,
      "end_at": 1583290347,
      "parent_id": "5edca524cad2fa112b06105c",
      "short_id": "c9WqLmTO",
      "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
      "properties": {
        "prop_a": "prop_a_value",
        "prop_b": "prop_b_value"
      }
    }
  ]
}
```

### 获取拉取请求列表

**接口:** `GET https://rest_api_root/v1/scm/products/{product_id}/repositories/{repository_id}/pull_requests`

**权限:** 企业令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 代码托管平台的id。 |
| `repository_id` | String | 是 | 代码仓库的id。 |

**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `number` | number | 否 | 拉取请求的编号。 |
| `work_item_id` | String | 否 | 工作项的id。 |

#### Success Examples
**响应示例：**
```json
{
     "page_size": 30,
     "page_index": 0,
     "total": 1,
     "values": [
         {
             "id": "594587fe700d43b81b080789",
             "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/pull_requests/594587fe700d43b81b080789",
             "product": {
                "id": "564587fe700d43b81b080765",
                "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765",
                "name": "Github",
                "type": "github"
             },
             "repository": {
                "id": "564587fe700d43b81b080766",
                "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766",
                "name": "ngx-planet",
                "full_name": "worktile/ngx-planet",
                "created_at": 1403018919
             },
             "title": "fix(doc): #PLM-001 fix document title",
             "number": 1,
             "status": "merged",
             "description": "Please give some great suggestions",
             "author": {
                "id": "5666aea91f99e33cb7c44964",
                "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/users/5666aea91f99e33cb7c44964",
                "name": "terry"
             },
             "source_branch": {
                "id": "564587fe700d43b81b080767",
                "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/branches/564587fe700d43b81b080767",
                "name": "terry/#PLM-001",
                "create_at": 1403018919
             },
             "target_branch": {
                "id": "564587fe700d43b81b080776",
                "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/branches/564587fe700d43b81b080776",
                "name": "develop",
                "create_at": 1402018919
             },
             "created_at": 1403014000,
             "merged_at": 1473018919,
             "merged_commit_sha": "96a024347146ebdc5f481f45e6e6871e0c43af5f",
             "merged_by": {
                "id": "5666aea91f99e33cb7c44964",
                "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/users/5666aea91f99e33cb7c44964",
                "name": "terry"
             },
             "comments_count": 2,
             "review_comments_count": 2,
             "commits_count": 2,
             "additions_count": 0,
             "deletions_count": 0,
             "changed_files_count": 3,
             "work_items": [
                {
                    "id": "564587fe700d43b81b080ab8",
                    "url": "https://rest_api_root/v1/project/work_items/564587fe700d43b81b080ab8",
                    "identifier": "PLM-001",
                    "title": "这是一个用户故事",
                    "type": "story",
                    "start_at": 1583290309,
                    "end_at": 1583290347,
                    "parent_id": "5edca524cad2fa112b06105c",
                    "short_id": "c9WqLmTO",
                    "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
                    "properties": {
                        "prop_a": "prop_a_value",
                        "prop_b": "prop_b_value"
                    }
                }
             ]
         }
     ]
}
```

### 部分更新一个拉取请求

**接口:** `PATCH https://rest_api_root/v1/scm/products/{product_id}/repositories/{repository_id}/pull_requests/{pull_request_id}`

**权限:** 企业令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 代码托管平台的id。 |
| `repository_id` | String | 是 | 代码仓库的id。 |
| `pull_request_id` | String | 是 | 拉取请求的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `status` | String | 是 | 拉取请求的状态。<br>可选值: `open`, `closed`, `merged`, `abandoned` |
| `title` | String | 否 | 拉取请求的标题。 |
| `creator_name` | String | 否 | 拉取请求创建者的用户名。 |
| `description` | String | 否 | 拉取请求的描述。 |
| `target_branch_id` | String | 否 | 目标分支的id。 |
| `source_branch_id` | String | 否 | 源分支的id。 |
| `merged_at` | Number | 否 | 拉取请求合并的时间。当拉取请求状态为merged时，该值为必填。 |
| `merged_commit_sha` | String | 否 | 源分支最后一次提交的SHA值。当拉取请求状态为merged时，该值为必填。 |
| `merged_by_name` | String | 否 | 拉取请求合并者的用户名。当拉取请求状态为merged时，该值为必填。 |
| `comments_count` | Number | 否 | 拉取请求的评论数量。 |
| `review_comments_count` | Number | 否 | 代码评审的评论数量。 |
| `commits_count` | Number | 否 | 代码的提交数量。 |
| `additions_count` | Number | 否 | 新增文件的数量。 |
| `deletions_count` | Number | 否 | 删除文件的数量。 |
| `changed_files_count` | Number | 否 | 更改文件的数量。 |
| `work_item_identifiers` | String[] | 否 | PingCode工作项编号的列表。通过该参数将拉取请求与一个或多个工作项关联。 |

#### Parameters Examples
**请求示例：**
```json
{
   "title": "fix(doc): #PLM-001 fix document title",
   "description": "Please give some great suggestions",
   "status": "merged",
   "target_branch_id": "564587fe700d43b81b080776",
   "source_branch_id": "564587fe700d43b81b080767",
   "merged_at": 1473018919,
   "merged_commit_sha": "96a024347146ebdc5f481f45e6e6871e0c43af5f",
   "merged_by_name": "terry",
   "comments_count": 2,
   "review_comments_count": 2,
   "commits_count": 2,
   "additions_count": 0,
   "deletions_count": 0,
   "changed_files_count": 3,
   "work_item_identifiers": [
      "PLM-001"
   ]
}
```

#### Success Examples
**响应示例：**
```json
{
   "id": "594587fe700d43b81b080789",
   "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/pull_requests/594587fe700d43b81b080789",
   "product": {
      "id": "564587fe700d43b81b080765",
      "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765",
      "name": "Github",
      "type": "github"
   },
   "repository": {
      "id": "564587fe700d43b81b080766",
      "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766",
      "name": "ngx-planet",
      "full_name": "worktile/ngx-planet",
      "created_at": 1403018919
   },
   "title": "fix(doc): #PLM-001 fix document title",
   "number": 1,
   "status": "merged",
   "description": "Please give some great suggestions",
   "author": {
      "id": "5666aea91f99e33cb7c44964",
      "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/users/5666aea91f99e33cb7c44964",
      "name": "terry"
   },
   "source_branch": {
      "id": "564587fe700d43b81b080767",
      "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/branches/564587fe700d43b81b080767",
      "name": "terry/#PLM-001",
      "create_at": 1403018919
   },
   "target_branch": {
      "id": "564587fe700d43b81b080776",
      "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/branches/564587fe700d43b81b080776",
      "name": "develop",
      "create_at": 1402018919
   },
   "created_at": 1403014000,
   "merged_at": 1473018919,
   "merged_commit_sha": "96a024347146ebdc5f481f45e6e6871e0c43af5f",
   "merged_by": {
      "id": "5666aea91f99e33cb7c44964",
      "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/users/5666aea91f99e33cb7c44964",
      "name": "terry"
   },
   "comments_count": 2,
   "review_comments_count": 2,
   "commits_count": 2,
   "additions_count": 0,
   "deletions_count": 0,
   "changed_files_count": 3,
   "work_items": [
      {
          "id": "564587fe700d43b81b080ab8",
          "url": "https://rest_api_root/v1/project/work_items/564587fe700d43b81b080ab8",
          "identifier": "PLM-001",
          "title": "这是一个用户故事",
          "type": "story",
          "start_at": 1583290309,
          "end_at": 1583290347,
          "parent_id": "5edca524cad2fa112b06105c",
          "short_id": "c9WqLmTO",
          "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
          "properties": {
              "prop_a": "prop_a_value",
              "prop_b": "prop_b_value"
          }
      }
   ]
}
```

## 代码评审

### 全量更新一个代码评审

**接口:** `PUT https://rest_api_root/v1/scm/products/{product_id}/repositories/{repository_id}/pull_requests/{pull_request_id}/reviews/{review_id}`

**权限:** 企业令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 代码托管平台的id。 |
| `repository_id` | String | 是 | 代码仓库的id。 |
| `pull_request_id` | String | 是 | 拉取请求的id。 |
| `review_id` | String | 是 | 代码评审的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `reviewer_name` | String | 是 | 评审人的用户名。 |
| `status` | String | 是 | 代码评审的状态。<br>可选值: `comment`, `approved`, `request_changes` |
| `submitted_at` | Number | 是 | 提交的时间。 |
| `description` | String | 否 | 代码评审的描述。 |
| `html_url` | String | 否 | 代码评审的地址。如果为空，在PingCode中不显示相关跳转链接。 |

#### Parameters Examples
**请求示例：**
```json
{
   "reviewer_name": "anytao",
   "status": "approved",
   "description": "Review has approved",
   "submitted_at": 1403014111,
   "html_url": "https://github.com/worktile/ngx-planet/pull/127#pullrequestreview-384383294"
}
```

#### Success Examples
**响应示例：**
```json
{
   "id": "524587fe700d43b81b080988",
   "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/pull_requests/594587fe700d43b81b080789/reviews/524587fe700d43b81b080988",
   "product": {
      "id": "564587fe700d43b81b080765",
      "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765",
      "name": "Github",
      "type": "github"
   },
   "repository": {
      "id": "564587fe700d43b81b080766",
      "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766",
      "name": "ngx-planet",
      "full_name": "worktile/ngx-planet",
      "created_at": 1403018919
   },
   "pull_request": {
      "id": "594587fe700d43b81b080789",
      "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/pull_requests/594587fe700d43b81b080789",
      "number": 1
   },
   "reviewer": {
      "id": "5999aea91f99e33cb7c44964",
      "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/users/5999aea91f99e33cb7c44964",
      "name": "anytao"
   },
   "status": "approved",
   "description": "Review has approved",
   "submitted_at": 1403014111,
   "html_url": "https://github.com/worktile/ngx-planet/pull/127#pullrequestreview-384383294"
}
```

### 创建一个代码评审

**接口:** `POST https://rest_api_root/v1/scm/products/{product_id}/repositories/{repository_id}/pull_requests/{pull_request_id}/reviews`

**权限:** 企业令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 代码托管平台的id。 |
| `repository_id` | String | 是 | 代码仓库的id。 |
| `pull_request_id` | String | 是 | 拉取请求的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `status` | String | 是 | 代码评审的状态。<br>可选值: `comment`, `approved`, `request_changes` |
| `reviewer_name` | String | 是 | 评审人的用户名。 |
| `description` | String | 否 | 代码评审的描述。 |
| `submitted_at` | Number | 是 | 提交的时间。 |
| `html_url` | String | 否 | 代码评审的地址。如果为空，在PingCode中不显示相关跳转链接。 |

#### Parameters Examples
**请求示例：**
```json
{
   "status": "approved",
   "reviewer_name": "anytao",
   "description": "Review has approved",
   "submitted_at": 1403014111,
   "html_url": "https://github.com/worktile/ngx-planet/pull/127#pullrequestreview-384383294"
}
```

#### Success Examples
**响应示例：**
```json
{
   "id": "524587fe700d43b81b080988",
   "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/pull_requests/594587fe700d43b81b080789/reviews/524587fe700d43b81b080988",
   "product": {
      "id": "564587fe700d43b81b080765",
      "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765",
      "name": "Github",
      "type": "github"
   },
   "repository": {
      "id": "564587fe700d43b81b080766",
      "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766",
      "name": "ngx-planet",
      "full_name": "worktile/ngx-planet",
      "created_at": 1403018919
   },
   "pull_request": {
      "id": "594587fe700d43b81b080789",
      "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/pull_requests/594587fe700d43b81b080789",
      "number": 1
   },
   "reviewer": {
      "id": "5999aea91f99e33cb7c44964",
      "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/users/5999aea91f99e33cb7c44964",
      "name": "anytao"
   },
   "status": "approved",
   "description": "Review has approved",
   "submitted_at": 1403014111,
   "html_url": "https://github.com/worktile/ngx-planet/pull/127#pullrequestreview-384383294"
}
```

### 获取代码评审列表

**接口:** `GET https://rest_api_root/v1/scm/products/{product_id}/repositories/{repository_id}/pull_requests/{pull_request_id}/reviews`

**权限:** 企业令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 代码托管平台的id。 |
| `repository_id` | String | 是 | 代码仓库的id。 |
| `pull_request_id` | String | 是 | 拉取请求的id。 |

#### Success Examples
**响应示例：**
```json
{
   "page_size": 30,
   "page_index": 0,
   "total": 1,
   "values": [
      {
         "id": "524587fe700d43b81b080988",
         "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/pull_requests/594587fe700d43b81b080789/reviews/524587fe700d43b81b080988",
         "product": {
            "id": "564587fe700d43b81b080765",
            "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765",
            "name": "Github",
            "type": "github"
         },
         "repository": {
            "id": "564587fe700d43b81b080766",
            "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766",
            "name": "ngx-planet",
            "full_name": "worktile/ngx-planet",
            "created_at": 1403018919
         },
         "pull_request": {
            "id": "594587fe700d43b81b080789",
            "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/pull_requests/594587fe700d43b81b080789",
            "number": 1
         },
         "reviewer": {
            "id": "5999aea91f99e33cb7c44964",
            "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/users/5999aea91f99e33cb7c44964",
            "name": "anytao"
         },
         "status": "approved",
         "description": "Review has approved",
         "submitted_at": 1403014111,
         "html_url": "https://github.com/worktile/ngx-planet/pull/127#pullrequestreview-384383294"
      }
   ]
}
```

### 部分更新一个代码评审

**接口:** `PATCH https://rest_api_root/v1/scm/products/{product_id}/repositories/{repository_id}/pull_requests/{pull_request_id}/reviews/{review_id}`

**权限:** 企业令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `product_id` | String | 是 | 代码托管平台的id。 |
| `repository_id` | String | 是 | 代码仓库的id。 |
| `pull_request_id` | String | 是 | 拉取请求的id。 |
| `review_id` | String | 是 | 代码评审的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `reviewer_name` | String | 否 | 评审人的用户名。 |
| `status` | String | 否 | 代码评审的状态。<br>可选值: `comment`, `approved`, `request_changes` |
| `description` | String | 否 | 代码评审的描述。 |
| `submitted_at` | Number | 否 | 提交的时间。 |
| `html_url` | String | 否 | 代码评审的地址。如果为空，在PingCode中不显示相关跳转链接。 |

#### Parameters Examples
**请求示例：**
```json
{
   "reviewer_name": "anytao",
   "status": "approved",
   "description": "Review has approved",
   "submitted_at": 1403014111,
   "html_url": "https://github.com/worktile/ngx-planet/pull/127#pullrequestreview-384383294"
}
```

#### Success Examples
**响应示例：**
```json
{
   "id": "524587fe700d43b81b080988",
   "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/pull_requests/594587fe700d43b81b080789/reviews/524587fe700d43b81b080988",
   "product": {
      "id": "564587fe700d43b81b080765",
      "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765",
      "name": "Github",
      "type": "github"
   },
   "repository": {
      "id": "564587fe700d43b81b080766",
      "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766",
      "name": "ngx-planet",
      "full_name": "worktile/ngx-planet",
      "created_at": 1403018919
   },
   "pull_request": {
      "id": "594587fe700d43b81b080789",
      "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/repositories/564587fe700d43b81b080766/pull_requests/594587fe700d43b81b080789",
      "number": 1
   },
   "reviewer": {
      "id": "5999aea91f99e33cb7c44964",
      "url": "https://rest_api_root/v1/scm/products/564587fe700d43b81b080765/users/5999aea91f99e33cb7c44964",
      "name": "anytao"
   },
   "status": "approved",
   "description": "Review has approved",
   "submitted_at": 1403014111,
   "html_url": "https://github.com/worktile/ngx-planet/pull/127#pullrequestreview-384383294"
}
```

## 构建

### 构建记录

**接口:** ` 构建记录`

企业内实际的构建记录，用于在PingCode中显示构建的详细信息。 
资源地址： GET https://rest_api_root/v1/build/builds/{build_id}

#### Success
**资源属性**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 构建记录的id。 |
| `url` | String | 是 | 构建记录的资源地址。 |
| `identifier` | String | 是 | 构建记录的编号。 |
| `name` | String | 是 | 构建记录的名称。 |
| `job_url` | String | 是 | 构建任务的地址。 |
| `provider` | String | 是 | 构建工具的名称。<br>可选值: `bamboo`, `bitbucket`, `jenkins`, `other` |
| `result_overview` | String | 是 | 构建结果的概述。 |
| `result_url` | String | 是 | 构建结果的地址。 |
| `start_at` | Number | 是 | 构建开始的时间。 |
| `end_at` | Number | 是 | 构建结束的时间。 |
| `status` | String | 是 | 构建的状态。<br>可选值: `success`, `failure`, `unknown` |
| `duration` | Number | 是 | 构建持续的时间，单位为秒。 |
| `work_items` | Object[] | 是 | 构建关联的PingCode的工作项列表。 |

#### Success Examples
**全量数据示例：**
```json
{
  "id": "564587fe700d43b81b080765",
  "url": "https://rest_api_root/v1/build/builds/564587fe700d43b81b080765",
  "identifier": "131",
  "name": "unit-test",
  "job_url": "https://your-job-url",
  "provider": "jenkins",
  "result_overview": "1000 test cases pass",
  "result_url": "https://your-result-url",
  "start_at": 1583290309,
  "status": "success",
  "end_at": 1583290347,
  "duration": 38,
  "work_items": [
    {
      "id": "564587fe700d43b81b080ab8",
      "url": "https://rest_api_root/v1/project/work_items/564587fe700d43b81b080ab8",
      "identifier": "PLM-001",
      "title": "这是一个用户故事",
      "type": "story",
      "start_at": 1583290309,
      "end_at": 1583290347,
      "parent_id": "5edca524cad2fa112b06105c",
      "short_id": "c9WqLmTO",
      "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
      "properties": {
        "prop_a": "prop_a_value",
        "prop_b": "prop_b_value"
      }
    }
  ]
}
```

**引用数据示例：**
```json
{
  "id": "564587fe700d43b81b080765",
  "url": "https://rest_api_root/v1/build/builds/564587fe700d43b81b080765",
  "identifier": "131",
  "name": "unit-test",
  "job_url": "https://your-job-url",
  "provider": "jenkins",
  "result_overview": "1000 test cases pass",
  "result_url": "https://your-result-url",
  "start_at": 1583290309,
  "status": "success",
  "end_at": 1583290347,
  "duration": 38
}
```

## 构建记录

### 全量更新一条构建记录

**接口:** `PUT https://rest_api_root/v1/build/builds/{build_id}`

**权限:** 企业令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `build_id` | String | 是 | 构建的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 构建的名称。 |
| `identifier` | String | 是 | 构建的编号。 |
| `job_url` | String | 否 | 构建任务的地址。如果为空，在PingCode中不显示相关跳转链接。 |
| `provider` | String | 是 | 构建工具的名称。<br>可选值: `bamboo`, `bitbucket`, `jenkins`, `other` |
| `result_overview` | String | 否 | 构建结果的概述。 |
| `result_url` | String | 否 | 构建结果的地址。如果为空，在PingCode中不显示相关的跳转链接。 |
| `start_at` | Number | 是 | 构建开始的时间。 |
| `end_at` | Number | 是 | 构建结束的时间。 |
| `duration` | Number | 是 | 构建持续的时间。单位为秒。 |
| `status` | String | 是 | 构建的状态。<br>可选值: `success`, `failure` |
| `work_item_identifiers` | String[] | 否 | PingCode工作项编号的列表。通过该参数将构建与一个或多个工作项关联。 |

#### Parameters Examples
**请求示例：**
```json
{
   "name": "unit-test",
   "identifier": "131",
   "job_url": "https://your-job-url",
   "provider": "jenkins",
   "result_overview": "1000 test cases pass",
   "result_url": "https://your-result-url",
   "start_at": 1583290309,
   "end_at": 1583290347,
   "duration": 38,
   "status": "success",
   "work_item_identifiers": [
      "PLM-001"
   ]
}
```

#### Success Examples
**响应示例：**
```json
{
   "id": "564587fe700d43b81b080765",
   "url": "https://rest_api_root/v1/build/builds/564587fe700d43b81b080765",
   "identifier": "131",
   "name": "unit-test",
   "job_url": "https://your-job-url",
   "provider": "jenkins",
   "result_overview": "1000 test cases pass",
   "result_url": "https://your-result-url",
   "start_at": 1583290309,
   "status": "success",
   "end_at": 1583290347,
   "duration": 38,
   "work_items": [
      {
          "id": "564587fe700d43b81b080ab8",
          "url": "https://rest_api_root/v1/project/work_items/564587fe700d43b81b080ab8",
          "identifier": "PLM-001",
          "title": "这是一个用户故事",
          "type": "story",
          "start_at": 1583290309,
          "end_at": 1583290347,
          "parent_id": "5edca524cad2fa112b06105c",
          "short_id": "c9WqLmTO",
          "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
          "properties": {
              "prop_a": "prop_a_value",
              "prop_b": "prop_b_value"
          }
      }
   ]
}
```

### 创建一条构建记录

**接口:** `POST https://rest_api_root/v1/build/builds`

**权限:** 企业令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 构建的名称。 |
| `identifier` | String | 是 | 构建的编号。 |
| `job_url` | String | 否 | 构建任务的地址。如果为空，在PingCode中不显示相关跳转链接。 |
| `provider` | String | 是 | 构建工具的名称。<br>可选值: `bamboo`, `bitbucket`, `jenkins`, `other` |
| `result_overview` | String | 否 | 构建结果的概述。 |
| `result_url` | String | 否 | 构建结果的地址。如果为空，在PingCode中不显示相关的跳转链接。 |
| `start_at` | Number | 是 | 构建开始的时间。 |
| `end_at` | Number | 是 | 构建结束的时间。 |
| `duration` | Number | 是 | 构建持续的时间。单位为秒。 |
| `status` | String | 是 | 构建的状态。<br>可选值: `success`, `failure` |
| `work_item_identifiers` | String[] | 否 | PingCode工作项编号的列表。通过该参数将构建与一个或多个工作项关联。 |

#### Parameters Examples
**请求示例：**
```json
{
   "name": "unit-test",
   "identifier": "131",
   "job_url": "https://your-job-url",
   "provider": "jenkins",
   "result_overview": "1000 test cases pass",
   "result_url": "https://your-result-url",
   "start_at": 1583290309,
   "end_at": 1583290347,
   "duration": 38,
   "status": "success",
   "work_item_identifiers": [
      "PLM-001"
   ]
}
```

#### Success Examples
**响应示例：**
```json
{
   "id": "564587fe700d43b81b080765",
   "url": "https://rest_api_root/v1/build/builds/564587fe700d43b81b080765",
   "name": "unit-test",
   "identifier": "131",
   "job_url": "https://your-job-url",
   "provider": "jenkins",
   "result_overview": "1000 test cases pass",
   "result_url": "https://your-result-url",
   "start_at": 1583290309,
   "status": "success",
   "end_at": 1583290347,
   "duration": 38,
   "work_items": [
      {
          "id": "564587fe700d43b81b080ab8",
          "url": "https://rest_api_root/v1/project/work_items/564587fe700d43b81b080ab8",
          "identifier": "PLM-001",
          "title": "这是一个用户故事",
          "type": "story",
          "start_at": 1583290309,
          "end_at": 1583290347,
          "parent_id": "5edca524cad2fa112b06105c",
          "short_id": "c9WqLmTO",
          "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
          "properties": {
              "prop_a": "prop_a_value",
              "prop_b": "prop_b_value"
          }
      }
   ]
}
```

### 删除一条构建记录

**接口:** `DEL https://rest_api_root/v1/build/builds/{build_id}`

**权限:** 企业令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `build_id` | String | 是 | 构建的id。 |

#### Success Examples
**响应示例：**
```json
{
   "id": "564587fe700d43b81b080765",
   "url": "https://rest_api_root/v1/build/builds/564587fe700d43b81b080765",
   "identifier": "131",
   "name": "unit-test",
   "job_url": "https://your-job-url",
   "provider": "jenkins",
   "result_overview": "1000 test cases pass",
   "result_url": "https://your-result-url",
   "start_at": 1583290309,
   "status": "success",
   "end_at": 1583290347,
   "duration": 38,
   "work_items": [
     {
        "id": "564587fe700d43b81b080ab8",
        "url": "https://rest_api_root/v1/project/work_items/564587fe700d43b81b080ab8",
        "identifier": "PLM-001",
        "title": "这是一个用户故事",
        "type": "story",
        "start_at": 1583290309,
        "end_at": 1583290347,
        "parent_id": "5edca524cad2fa112b06105c",
        "short_id": "c9WqLmTO",
        "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
        "properties": {
            "prop_a": "prop_a_value",
            "prop_b": "prop_b_value"
        }
     }
   ]
}
```

### 获取构建记录列表

**接口:** `GET https://rest_api_root/v1/build/builds`

**权限:** 企业令牌

#### Success Examples
**响应示例：**
```json
{
   "page_size": 30,
   "page_index": 0,
   "total": 1,
   "values": [
       {
            "id": "564587fe700d43b81b080765",
            "url": "https://rest_api_root/v1/build/builds/564587fe700d43b81b080765",
            "identifier": "131",
            "name": "unit-test",
            "job_url": "https://your-job-url",
            "provider": "jenkins",
            "result_overview": "1000 test cases pass",
            "result_url": "https://your-result-url",
            "start_at": 1583290309,
            "status": "success",
            "end_at": 1583290347,
            "duration": 38,
            "work_items": [
                  {
                       "id": "564587fe700d43b81b080ab8",
                       "url": "https://rest_api_root/v1/project/work_items/564587fe700d43b81b080ab8",
                       "identifier": "PLM-001",
                       "title": "这是一个用户故事",
                       "type": "story",
                       "start_at": 1583290309,
                       "end_at": 1583290347,
                       "parent_id": "5edca524cad2fa112b06105c",
                       "short_id": "c9WqLmTO",
                       "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
                       "properties": {
                           "prop_a": "prop_a_value",
                           "prop_b": "prop_b_value"
                       }
                  }
              ]
       }
   ]
}
```

### 部分更新一条构建记录

**接口:** `PATCH https://rest_api_root/v1/build/builds/{build_id}`

**权限:** 企业令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `build_id` | String | 是 | 构建的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 构建的名称。 |
| `identifier` | String | 否 | 构建的编号。 |
| `job_url` | String | 否 | 构建任务的地址。如果为空，在PingCode中不显示相关跳转链接。 |
| `provider` | String | 否 | 构建工具的名称。<br>可选值: `bamboo`, `bitbucket`, `jenkins`, `other` |
| `result_overview` | String | 否 | 构建结果的概述。 |
| `result_url` | String | 否 | 构建结果的地址。如果为空，在PingCode中不显示相关的跳转链接。 |
| `start_at` | Number | 否 | 构建开始的时间。 |
| `end_at` | Number | 否 | 构建结束的时间。 |
| `status` | String | 否 | 构建的状态。<br>可选值: `success`, `failure` |
| `duration` | Number | 否 | 构建持续的时间。单位为秒。 |
| `work_item_identifiers` | String[] | 否 | PingCode工作项编号的列表。通过该参数将构建与一个或多个工作项关联。 |

#### Parameters Examples
**请求示例：**
```json
{
   "name": "unit-test",
   "identifier": "131",
   "job_url": "https://your-job-url",
   "provider": "jenkins",
   "result_overview": "1000 test cases pass",
   "result_url": "https://your-result-url",
   "start_at": 1583290309,
   "end_at": 1583290347,
   "status": "success",
   "duration": 38,
   "work_item_identifiers": [
      "PLM-001"
   ]
}
```

#### Success Examples
**响应示例：**
```json
{
   "id": "564587fe700d43b81b080765",
   "url": "https://rest_api_root/v1/build/builds/564587fe700d43b81b080765",
   "identifier": "131",
   "name": "unit-test",
   "job_url": "https://your-job-url",
   "provider": "jenkins",
   "result_overview": "1000 test cases pass",
   "result_url": "https://your-result-url",
   "start_at": 1583290309,
   "status": "failure",
   "end_at": 1583290347,
   "duration": 38,
   "work_items": [
      {
          "id": "564587fe700d43b81b080ab8",
          "url": "https://rest_api_root/v1/project/work_items/564587fe700d43b81b080ab8",
          "identifier": "PLM-001",
          "title": "这是一个用户故事",
          "type": "story",
          "start_at": 1583290309,
          "end_at": 1583290347,
          "parent_id": "5edca524cad2fa112b06105c",
          "short_id": "c9WqLmTO",
          "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
          "properties": {
              "prop_a": "prop_a_value",
              "prop_b": "prop_b_value"
          }
      }
   ]
}
```

## 交付

### 环境

**接口:** ` 环境`

企业内实际的部署环境，用于在PingCode中显示各个环境的部署信息。 
资源地址： GET https://rest_api_root/v1/release/environments/{env_id}

#### Success
**资源属性**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 环境的id。 |
| `url` | String | 是 | 环境的资源地址。 |
| `name` | String | 是 | 环境的名称。 |
| `html_url` | String | 是 | 环境的真实地址。 |

#### Success Examples
**全量数据示例：**
```json
{
    "id": "564587fe700d43b81b080123",
    "url": "https://rest_api_root/v1/release/environments/564587fe700d43b81b080123",
    "name": "Production",
    "html_url": "https://your-environment-url"
}
```

**引用数据示例：**
```json
{
    "id": "564587fe700d43b81b080123",
    "url": "https://rest_api_root/v1/release/environments/564587fe700d43b81b080123",
    "name": "Production"
}
```

### 部署

**接口:** ` 部署`

企业内实际的部署记录，用于在PingCode中显示部署的详细信息。 
资源地址： GET https://rest_api_root/v1/release/deploys/{deploy_id}

#### Success
**资源属性**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 部署的id。 |
| `url` | String | 是 | 部署的资源地址。 |
| `status` | String | 是 | 部署的状态。<br>可选值: `not_deployed`, `deployed` |
| `release_name` | String | 是 | 发布的名称。 |
| `environment` | Object | 是 | 发布的环境。 |
| `release_url` | String | 是 | 版本发布的地址。 |
| `start_at` | Number | 是 | 部署开始的时间。 |
| `end_at` | Number | 是 | 部署结束的时间。 |
| `duration` | Number | 是 | 部署持续的时间。单位为秒。 |
| `work_items` | Object[] | 是 | 部署关联的PingCode的工作项列表。 |

#### Success Examples
**全量数据示例：**
```json
{
    "id": "564587fe700d43b81b080339",
    "url": "https://rest_api_root/v1/release/deploys/564587fe700d43b81b080339",
    "status": "deployed",
    "release_name": "1.1.0",
    "environment": {
        "id": "564587fe700d43b81b080123",
        "url": "https://rest_api_root/v1/release/environments/564587fe700d43b81b080123",
        "name": "Production"
    },
    "release_url": "https://github.com/worktile/ngx-planet/releases/tag/1.1.0",
    "start_at": 1583143467,
    "end_at": 1583143667,
    "duration": 200,
    "work_items": [
        {
            "id": "564587fe700d43b81b080ab8",
            "url": "https://rest_api_root/v1/project/work_items/564587fe700d43b81b080ab8",
            "identifier": "PLM-001",
            "title": "这是一个用户故事",
            "type": "story",
            "start_at": 1583290309,
            "end_at": 1583290347,
            "parent_id": "5edca524cad2fa112b06105c",
            "short_id": "c9WqLmTO",
            "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
            "properties": {
                "prop_a": "prop_a_value",
                "prop_b": "prop_b_value"
            }
        }
    ]
}
```

**引用数据示例：**
```json
{
    "id": "564587fe700d43b81b080339",
    "url": "https://rest_api_root/v1/release/deploys/564587fe700d43b81b080339",
    "status": "deployed",
    "release_name": "1.1.0"
}
```

## 环境

### 全量更新一个环境

**接口:** `put https://rest_api_root/v1/release/environments/{env_id}`

**权限:** 企业令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `env_id` | String | 是 | 环境的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 环境的名称。同一团队内，环境的名称是唯一的。 |
| `html_url` | String | 否 | 环境的地址。如果为空，在PingCode中不显示相关跳转链接。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "Production",
    "html_url": "https://your-environment-url"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "564587fe700d43b81b080123",
    "url": "https://rest_api_root/v1/release/environments/564587fe700d43b81b080123",
    "name": "Production",
    "html_url": "https://your-environment-url"
}
```

### 创建一个环境

**接口:** `post https://rest_api_root/v1/release/environments`

**权限:** 企业令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 环境的名称。同一团队内，环境的名称是唯一的。 |
| `html_url` | String | 否 | 环境的地址。如果为空，在PingCode中不显示相关跳转链接。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "Production",
    "html_url": "https://your-environment-url"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "564587fe700d43b81b080123",
    "url": "https://rest_api_root/v1/release/environments/564587fe700d43b81b080123",
    "name": "Production",
    "html_url": "https://your-environment-url"
}
```

### 删除一个环境

**接口:** `delete https://rest_api_root/v1/release/environments/{env_id}`

删除环境之前，需要先删除与该环境关联的部署。

**权限:** 企业令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `env_id` | String | 是 | 环境的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "564587fe700d43b81b080123",
    "url": "https://rest_api_root/v1/release/environments/564587fe700d43b81b080123",
    "name": "Production",
    "html_url": "https://your-environment-url"
}
```

### 获取环境列表

**接口:** `get https://rest_api_root/v1/release/environments`

**权限:** 企业令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 是 | 环境的名称。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "564587fe700d43b81b080123",
            "url": "https://rest_api_root/v1/release/environments/564587fe700d43b81b080123",
            "name": "Production",
            "html_url": "https://your-environment-url"
        }
    ]
}
```

### 部分更新一个环境

**接口:** `patch https://rest_api_root/v1/release/environments/{env_id}`

**权限:** 企业令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `env_id` | String | 是 | 环境的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | String | 否 | 环境的名称。同一团队内，环境的名称是唯一的。 |
| `html_url` | String | 否 | 环境的地址。如果为空，在PingCode中不显示相关跳转链接。 |

#### Parameters Examples
**请求示例：**
```json
{
    "name": "Production",
    "html_url": "https://your-environment-url"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "564587fe700d43b81b080123",
    "url": "https://rest_api_root/v1/release/environments/564587fe700d43b81b080123",
    "name": "Production",
    "html_url": "https://your-environment-url"
}
```

## 部署

### 全量更新一个部署

**接口:** `put https://rest_api_root/v1/release/deploys/{deploy_id}`

**权限:** 企业令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `deploy_id` | String | 是 | 部署的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `status` | String | 是 | 部署的状态。<br>可选值: `not_deployed`, `deployed` |
| `env_id` | String | 是 | 环境的id。 |
| `release_name` | String | 是 | 版本发布的名称。 |
| `release_url` | String | 否 | 版本发布的地址。如果为空，在PingCode中不显示相关跳转链接。 |
| `start_at` | Number | 是 | 部署开始的时间。 |
| `end_at` | Number | 是 | 部署结束的时间。 |
| `duration` | Number | 是 | 部署持续的时间。单位为秒。 |
| `work_item_identifiers` | String[] | 否 | PingCode工作项编号的列表。通过该参数将部署与一个或多个工作项关联。 |

#### Parameters Examples
**请求示例：**
```json
{
    "status": "deployed",
    "env_id": "564587fe700d43b81b080123",
    "release_name": "1.1.0",
    "release_url": "https://your-release-host/release",
    "start_at": 1583143467,
    "end_at": 1583143667,
    "duration": 200,
    "work_item_identifiers": [
        "PLM-001"
    ]
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "564587fe700d43b81b080339",
    "url": "https://rest_api_root/v1/release/deploys/564587fe700d43b81b080339",
    "status": "deployed",
    "release_name": "1.1.0",
    "environment": {
        "id": "564587fe700d43b81b080123",
        "url": "https://rest_api_root/v1/release/environments/564587fe700d43b81b080123",
        "name": "Production"
    },
    "release_url": "https://your-release-host/release",
    "start_at": 1583143467,
    "end_at": 1583143667,
    "duration": 200,
    "work_items": [
        {
            "id": "564587fe700d43b81b080ab8",
            "url": "https://rest_api_root/v1/project/work_items/564587fe700d43b81b080ab8",
            "identifier": "PLM-001",
            "title": "这是一个用户故事",
            "type": "story",
            "start_at": 1583290309,
            "end_at": 1583290347,
            "parent_id": "5edca524cad2fa112b06105c",
            "short_id": "c9WqLmTO",
            "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
            "properties": {
                "prop_a": "prop_a_value",
                "prop_b": "prop_b_value"
            }
        }
    ]
}
```

### 创建一个部署

**接口:** `post https://rest_api_root/v1/release/deploys`

**权限:** 企业令牌

#### Parameters
**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `status` | String | 是 | 部署的状态。<br>可选值: `not_deployed`, `deployed` |
| `env_id` | String | 是 | 环境的id。 |
| `release_name` | String | 是 | 发布的名称。 |
| `release_url` | String | 否 | 版本发布的地址。如果为空，在PingCode中不显示相关跳转链接。 |
| `start_at` | Number | 是 | 部署开始的时间。 |
| `end_at` | Number | 是 | 部署结束的时间。 |
| `duration` | Number | 是 | 部署持续的时间。单位为秒。 |
| `work_item_identifiers` | String[] | 否 | PingCode工作项编号的列表。通过该参数将部署与一个或多个工作项关联。 |

#### Parameters Examples
**请求示例：**
```json
{
    "status": "deployed",
    "env_id": "564587fe700d43b81b080123",
    "release_name": "1.1.0",
    "release_url": "https://github.com/worktile/ngx-planet/releases/tag/1.1.0",
    "start_at": 1583143467,
    "end_at": 1583143667,
    "duration": 200,
    "work_item_identifiers": [
        "PLM-001"
    ]
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "564587fe700d43b81b080339",
    "url": "https://rest_api_root/v1/release/deploys/564587fe700d43b81b080339",
    "status": "deployed",
    "release_name": "1.1.0",
    "environment": {
        "id": "564587fe700d43b81b080123",
        "url": "https://rest_api_root/v1/release/environments/564587fe700d43b81b080123",
        "name": "Production"
    },
    "release_url": "https://github.com/worktile/ngx-planet/releases/tag/1.1.0",
    "start_at": 1583143467,
    "end_at": 1583143667,
    "duration": 200,
    "work_items": [
        {
            "id": "564587fe700d43b81b080ab8",
            "url": "https://rest_api_root/v1/project/work_items/564587fe700d43b81b080ab8",
            "identifier": "PLM-001",
            "title": "这是一个用户故事",
            "type": "story",
            "start_at": 1583290309,
            "end_at": 1583290347,
            "parent_id": "5edca524cad2fa112b06105c",
            "short_id": "c9WqLmTO",
            "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
            "properties": {
                "prop_a": "prop_a_value",
                "prop_b": "prop_b_value"
            }
        }
    ]
}
```

### 删除一个部署

**接口:** `delete https://rest_api_root/v1/release/deploys/{deploy_id}`

**权限:** 企业令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `deploy_id` | String | 是 | 部署的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "564587fe700d43b81b080339",
    "url": "https://rest_api_root/v1/release/deploys/564587fe700d43b81b080339",
    "status": "deployed",
    "release_name": "1.1.0",
    "environment": {
        "id": "564587fe700d43b81b080123",
        "url": "https://rest_api_root/v1/release/environments/564587fe700d43b81b080123",
        "name": "Production"
    },
    "release_url": "https://github.com/worktile/ngx-planet/releases/tag/1.1.0",
    "start_at": 1583143467,
    "end_at": 1583143667,
    "duration": 200,
    "work_items": [
        {
            "id": "564587fe700d43b81b080ab8",
            "url": "https://rest_api_root/v1/project/work_items/564587fe700d43b81b080ab8",
            "identifier": "PLM-001",
            "title": "这是一个用户故事",
            "type": "story",
            "start_at": 1583290309,
            "end_at": 1583290347,
            "parent_id": "5edca524cad2fa112b06105c",
            "short_id": "c9WqLmTO",
            "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
            "properties": {
                "prop_a": "prop_a_value",
                "prop_b": "prop_b_value"
            }
        }
    ]
}
```

### 获取部署列表

**接口:** `get https://rest_api_root/v1/release/deploys`

**权限:** 企业令牌

#### Parameters
**查询参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `env_id` | String | 否 | 环境的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "564587fe700d43b81b080339",
            "url": "https://rest_api_root/v1/release/deploys/564587fe700d43b81b080339",
            "status": "deployed",
            "release_name": "1.1.0",
            "environment": {
                "id": "564587fe700d43b81b080123",
                "url": "https://rest_api_root/v1/release/environments/564587fe700d43b81b080123",
                "name": "Production"
            },
            "release_url": "https://github.com/worktile/ngx-planet/releases/tag/1.1.0",
            "start_at": 1583143467,
            "end_at": 1583143667,
            "duration": 200,
            "work_items": [
                {
                    "id": "564587fe700d43b81b080ab8",
                    "url": "https://rest_api_root/v1/project/work_items/564587fe700d43b81b080ab8",
                    "identifier": "PLM-001",
                    "title": "这是一个用户故事",
                    "type": "story",
                    "start_at": 1583290309,
                    "end_at": 1583290347,
                    "parent_id": "5edca524cad2fa112b06105c",
                    "short_id": "c9WqLmTO",
                    "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
                    "properties": {
                        "prop_a": "prop_a_value",
                        "prop_b": "prop_b_value"
                    }
                }
            ]
        }
    ]
}
```

### 部分更新一个部署

**接口:** `patch https://rest_api_root/v1/release/deploys/{deploy_id}`

**权限:** 企业令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `deploy_id` | String | 是 | 部署的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `status` | String | 否 | 部署的状态。<br>可选值: `not_deployed`, `deployed` |
| `env_id` | String | 否 | 环境的id。 |
| `release_name` | String | 否 | 版本发布的名称。 |
| `release_url` | String | 否 | 版本发布的地址。如果为空，在PingCode中不显示相关跳转链接。 |
| `start_at` | Number | 否 | 部署开始的时间。 |
| `end_at` | Number | 否 | 部署结束的时间。 |
| `duration` | Number | 否 | 部署持续的时间。单位为秒。 |
| `work_item_identifiers` | String[] | 否 | PingCode工作项编号的列表。通过该参数将部署与一个或多个工作项关联。 |

#### Parameters Examples
**请求示例：**
```json
{
    "status": "deployed",
    "env_id": "564587fe700d43b81b080123",
    "release_name": "1.1.0",
    "release_url": "https://github.com/worktile/ngx-planet/releases/tag/1.1.0",
    "start_at": 1583143467,
    "end_at": 1583143667,
    "duration": 200,
    "work_item_identifiers": [
        "PLM-001"
    ]
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "564587fe700d43b81b080339",
    "url": "https://rest_api_root/v1/release/deploys/564587fe700d43b81b080339",
    "status": "deployed",
    "release_name": "1.1.0",
    "environment": {
        "id": "564587fe700d43b81b080123",
        "url": "https://rest_api_root/v1/release/environments/564587fe700d43b81b080123",
        "name": "Production"
    },
    "release_url": "https://github.com/worktile/ngx-planet/releases/tag/1.1.0",
    "start_at": 1583143467,
    "end_at": 1583143667,
    "duration": 200,
    "work_items": [
        {
            "id": "564587fe700d43b81b080ab8",
            "url": "https://rest_api_root/v1/project/work_items/564587fe700d43b81b080ab8",
            "identifier": "PLM-001",
            "title": "这是一个用户故事",
            "type": "story",
            "start_at": 1583290309,
            "end_at": 1583290347,
            "parent_id": "5edca524cad2fa112b06105c",
            "short_id": "c9WqLmTO",
            "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
            "properties": {
                "prop_a": "prop_a_value",
                "prop_b": "prop_b_value"
            }
        }
    ]
}
```

## /home/jenkins/agent/workspace/pc-open-Beta-CD-job/src/modules/v1/ship/configuration/idea/priority/facade.ts

### GetV1ShipIdea_priorities

**接口:** `GET https://rest_api_root/v1/ship/idea_priorities`

### GetV1ShipIdea_prioritiesPriority_id

**接口:** `GET https://rest_api_root/v1/ship/idea_priorities/{priority_id}`

## /home/jenkins/agent/workspace/pc-open-Beta-CD-job/src/modules/v1/ship/configuration/product/channel/facade.ts

### GetV1ShipProductsProduct_idChannelsChannel_id

**接口:** `GET https://rest_api_root/v1/ship/products/{product_id}/channels/{channel_id}`

## /home/jenkins/agent/workspace/pc-open-Beta-CD-job/src/modules/v1/ship/configuration/ticket/priority/facade.ts

### GetV1ShipTicket_priorities

**接口:** `GET https://rest_api_root/v1/ship/ticket_priorities`

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 1,
    "values": [
        {
            "id": "5cb9466afda1ce4ca0090005",
            "url": "https://rest_api_root/v1/ship/ticket_priorities/5cb9466afda1ce4ca0090005",
            "name": "P0"
        }
    ]
}
```

## /home/jenkins/agent/workspace/pc-open-Beta-CD-job/src/modules/v1/ship/configuration/ticket/solution/facade.ts

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

## /home/jenkins/agent/workspace/pc-open-Beta-CD-job/src/modules/v1/ship/product/plan/facade.ts

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

## 工作项关注人

### 添加一个工作项关注人

**接口:** `POST https://rest_api_root/v1/project/work_items/{work_item_id}/participants`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `work_item_id` | String | 是 | 工作项的id。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `user_id` | String | 是 | 企业成员的id。 |

#### Parameters Examples
**请求示例：**
```json
{
    "user_id": "a0417f68e846aae315c85d24643678a9"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "a0417f68e846aae315c85d24643678a9",
    "url": "https://rest_api_root/v1/project/work_items/5edca112b06305c524cad2fa/participants/a0417f68e846aae315c85d24643678a9",
    "work_item": {
        "id": "5edca112b06305c524cad2fa",
        "url": "https://rest_api_root/v1/project/work_items/5edca112b06305c524cad2fa",
        "identifier": "SCR-3",
        "title": "这是一个用户故事",
        "type": "story",
        "start_at": 1583290309,
        "end_at": 1583290347,
        "parent_id": "5edca524cad2fa112b06105c",
        "short_id": "c9WqLmTO",
        "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
        "properties": {
            "prop_a": "prop_a_value",
            "prop_b": "prop_b_value"
         }
    },
    "type": "user",
    "user": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    }
}
```

### 移除一个工作项关注人

**接口:** `DELETE https://rest_api_root/v1/project/work_items/{work_item_id}/participants/{participant_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `work_item_id` | String | 是 | 工作项的id。 |
| `participant_id` | String | 是 | 工作项关注人的id。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "a0417f68e846aae315c85d24643678a9",
    "url": "https://rest_api_root/v1/project/work_items/5edca112b06305c524cad2fa/participants/a0417f68e846aae315c85d24643678a9",
    "work_item": {
        "id": "5edca112b06305c524cad2fa",
        "url": "https://rest_api_root/v1/project/work_items/5edca112b06305c524cad2fa",
        "identifier": "SCR-3",
        "title": "这是一个用户故事",
        "type": "story",
        "start_at": 1583290309,
        "end_at": 1583290347,
        "parent_id": "5edca524cad2fa112b06105c",
        "short_id": "c9WqLmTO",
        "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
        "properties": {
            "prop_a": "prop_a_value",
            "prop_b": "prop_b_value"
        }
    },
    "type": "user",
    "user": {
        "id": "a0417f68e846aae315c85d24643678a9",
        "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
        "name": "john",
        "display_name": "John",
        "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
    }
}
```

### 获取一个工作项关注人列表

**接口:** `GET https://rest_api_root/v1/project/work_items/{work_item_id}/participants`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `work_item_id` | String | 是 | 工作项的id。 |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 2,
    "values": [
        {
            "id": "a0417f68e846aae315c85d24643678a9",
            "url": "https://rest_api_root/v1/project/work_items/5edca112b06305c524cad2fa/participants/a0417f68e846aae315c85d24643678a9",
            "work_item": {
                "id": "5edca112b06305c524cad2fa",
                "url": "https://rest_api_root/v1/project/work_items/5edca112b06305c524cad2fa",
                "identifier": "SCR-3",
                "title": "这是一个用户故事",
                "type": "story",
                "start_at": 1583290309,
                "end_at": 1583290347,
                "parent_id": "5edca524cad2fa112b06105c",
                "short_id": "c9WqLmTO",
                "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
                "properties": {
                    "prop_a": "prop_a_value",
                    "prop_b": "prop_b_value"
                }
            },
            "type": "user",
            "user": {
                "id": "a0417f68e846aae315c85d24643678a9",
                "url": "https://rest_api_root/v1/directory/users/a0417f68e846aae315c85d24643678a9",
                "name": "john",
                "display_name": "John",
                "avatar": "https://s3.amazonaws.com/bucket/b46ef40c-e22e-4ecf-a599-cace9fba839a_160x160.png"
            }
        },
        {
            "id": "63c8fb32729dee3334d96af7",
            "url": "https://rest_api_root/v1/project/work_items/5edca112b06305c524cad2fa/participants/63c8fb32729dee3334d96af7",
            "work_item": {
                "id": "5edca112b06305c524cad2fa",
                "url": "https://rest_api_root/v1/project/work_items/5edca112b06305c524cad2fa",
                "identifier": "SCR-3",
                "title": "这是一个用户故事",
                "type": "story",
                "start_at": 1583290309,
                "end_at": 1583290347,
                "parent_id": "5edca524cad2fa112b06105c",
                "short_id": "c9WqLmTO",
                "html_url": "https://yctech.pingcode.com/pjm/workitems/c9WqLmTO",
                "properties": {
                   "prop_a": "prop_a_value",
                   "prop_b": "prop_b_value"
                 }
            },
            "type": "user_group",
            "user_group": {
                "id": "63c8fb32729dee3334d96af7",
                "url": "https://rest_api_root/v1/directory/users/63c8fb32729dee3334d96af7",
                "name": "Open Team"
            }
        }
    ]
 }
```

## 瀑布

### 向瀑布项目中添加一个工作项类型

**接口:** `POST https://rest_api_root/v1/project/projects/{project_id}/work_item_types`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目id。项目类型必须为waterfall，并且项目开启了本地配置。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 工作项类型的id，不支持增加计划类型（里程碑、阶段）。 |

#### Parameters Examples
**请求示例：**
```json
{
     "id": "630da48bc9443b1aa94ce3ea"
}
```

#### Success Examples
**响应示例：**
```json
{
    "id": "630da48bc9443b1aa94ce3ea",
    "url": "https://rest_api_root/v1/project/projects/6375cc81e3004de4ea14aa52/work_item_types/630da48bc9443b1aa94ce3ea",
    "project": {
        "id": "6375cc81e3004de4ea14aa52",
        "url": "http://rest_api_root/v1/project/projects/6375cc81e3004de4ea14aa52",
        "identifier": "WTF",
        "name": "瀑布项目",
        "type": "waterfall",
        "is_archived": 0,
        "is_deleted": 0
    },
    "work_item_type": {
        "id": "630da48bc9443b1aa94ce3ea",
        "url": "https://rest_api_root/v1/project/waterfall/work_item_types/630da48bc9443b1aa94ce3ea",
        "name": "需求",
        "group": "requirement"
    }
}
```

### 在瀑布项目中移除一个工作项类型

**接口:** `DELETE https://rest_api_root/v1/project/projects/{project_id}/work_item_types/{work_item_type_id}`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。项目类型必须为waterfall，并且项目开启了本地配置。 |
| `work_item_type_id` | String | 是 | 工作项类型的id，不支持移除计划类型（里程碑、阶段）。 |

#### Success Examples
**响应示例：**
```json
{
    "id": "630da48bc9443b1aa94ce3ea",
    "url": "https://rest_api_root/v1/project/projects/6375cc81e3004de4ea14aa52/work_item_types/630da48bc9443b1aa94ce3ea",
    "project": {
        "id": "6375cc81e3004de4ea14aa52",
        "url": "http://rest_api_root/v1/project/projects/6375cc81e3004de4ea14aa52",
        "identifier": "WTF",
        "name": "瀑布项目",
        "type": "waterfall",
        "is_archived": 0,
        "is_deleted": 0
    },
    "work_item_type": {
        "id": "630da48bc9443b1aa94ce3ea",
        "url": "https://rest_api_root/v1/project/waterfall/work_item_types/630da48bc9443b1aa94ce3ea",
        "name": "需求",
        "group": "requirement"
    }
}
```

### 获取瀑布项目中的工作项类型列表

**接口:** `GET https://rest_api_root/v1/project/projects/{project_id}/work_item_types`

**权限:** 企业令牌/用户令牌

#### Parameters
**路径参数**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `project_id` | String | 是 | 项目的id。项目类型必须为waterfall，并且项目开启了本地配置。 |

**Parameter**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `group` | String | 是 | 工作项类型的分组。<br>可选值: `requirement`, `task`, `bug`, `issue`, `plan` |

#### Success Examples
**响应示例：**
```json
{
    "page_size": 30,
    "page_index": 0,
    "total": 6,
    "values": [
        {
            "id": "630da48bc9443b1aa94ce3ea",
            "url": "https://rest_api_root/v1/project/projects/6375cc81e3004de4ea14aa52/work_item_types/630da48bc9443b1aa94ce3ea",
            "project": {
                "id": "6375cc81e3004de4ea14aa52",
                "url": "http://rest_api_root/v1/project/projects/6375cc81e3004de4ea14aa52",
                "identifier": "WTF",
                "name": "瀑布项目",
                "type": "waterfall",
                "is_archived": 0,
                "is_deleted": 0
            },
            "work_item_type": {
                "id": "630da48bc9443b1aa94ce3ea",
                "url": "https://rest_api_root/v1/project/projects/6375cc81e3004de4ea14aa52/work_item_types/630da48bc9443b1aa94ce3ea",
                "name": "需求",
                "group": "requirement"
            }
        },
        {
            "id": "630da48bc9443b1aa94ce3eb",
            "url": "https://rest_api_root/v1/project/projects/6375cc81e3004de4ea14aa52/work_item_types/630da48bc9443b1aa94ce3eb",
            "project": {
                "id": "6375cc81e3004de4ea14aa52",
                "url": "http://rest_api_root/v1/project/projects/6375cc81e3004de4ea14aa52",
                "identifier": "WTF",
                "name": "瀑布项目",
                "type": "waterfall",
                "is_archived": 0,
                "is_deleted": 0
            },
            "work_item_type": {
                "id": "630da48bc9443b1aa94ce3eb",
                "url": "https://rest_api_root/v1/project/projects/6375cc81e3004de4ea14aa52/work_item_types/630da48bc9443b1aa94ce3eb",
                "name": "任务",
                "group": "task"
            }
        },
        {
            "id": "630da48bc9443b1aa94ce3ec",
            "url": "https://rest_api_root/v1/project/projects/6375cc81e3004de4ea14aa52/work_item_types/630da48bc9443b1aa94ce3ec",
            "project": {
                "id": "6375cc81e3004de4ea14aa52",
                "url": "http://rest_api_root/v1/project/projects/6375cc81e3004de4ea14aa52",
                "identifier": "WTF",
                "name": "瀑布项目",
                "type": "waterfall",
                "is_archived": 0,
                "is_deleted": 0
            },
            "work_item_type": {
                "id": "630da48bc9443b1aa94ce3ec",
                "url": "https://rest_api_root/v1/project/projects/6375cc81e3004de4ea14aa52/work_item_types/630da48bc9443b1aa94ce3ec",
                "name": "缺陷",
                "group": "bug"
            }
        },
        {
            "id": "630da48bc9443b1aa94ce3ed",
            "url": "https://rest_api_root/v1/project/projects/6375cc81e3004de4ea14aa52/work_item_types/630da48bc9443b1aa94ce3ed",
            "project": {
                "id": "6375cc81e3004de4ea14aa52",
                "url": "http://rest_api_root/v1/project/projects/6375cc81e3004de4ea14aa52",
                "identifier": "WTF",
                "name": "瀑布项目",
                "type": "waterfall",
                "is_archived": 0,
                "is_deleted": 0
            },
            "work_item_type": {
                "id": "630da48bc9443b1aa94ce3ed",
                "url": "https://rest_api_root/v1/project/projects/6375cc81e3004de4ea14aa52/work_item_types/630da48bc9443b1aa94ce3ed",
                "name": "自定义",
                "group": "issue"
            }
        },
        {
            "id": "630da48bc9443b1aa94ce3ee",
            "url": "https://rest_api_root/v1/project/projects/6375cc81e3004de4ea14aa52/work_item_types/630da48bc9443b1aa94ce3ee",
            "project": {
                "id": "6375cc81e3004de4ea14aa52",
                "url": "http://rest_api_root/v1/project/projects/6375cc81e3004de4ea14aa52",
                "identifier": "WTF",
                "name": "瀑布项目",
                "type": "waterfall",
                "is_archived": 0,
                "is_deleted": 0
            },
            "work_item_type": {
                "id": "630da48bc9443b1aa94ce3ee",
                "url": "https://rest_api_root/v1/project/projects/6375cc81e3004de4ea14aa52/work_item_types/630da48bc9443b1aa94ce3ee",
                "name": "阶段",
                "group": "plan"
            }
        },
        {
            "id": "630da48bc9443b1aa94ce3ef",
            "url": "https://rest_api_root/v1/project/projects/6375cc81e3004de4ea14aa52/work_item_types/630da48bc9443b1aa94ce3ef",
            "project": {
                "id": "6375cc81e3004de4ea14aa52",
                "url": "http://rest_api_root/v1/project/projects/6375cc81e3004de4ea14aa52",
                "identifier": "WTF",
                "name": "瀑布项目",
                "type": "waterfall",
                "is_archived": 0,
                "is_deleted": 0
            },
            "work_item_type": {
                "id": "630da48bc9443b1aa94ce3ef",
                "url": "https://rest_api_root/v1/project/projects/6375cc81e3004de4ea14aa52/work_item_types/630da48bc9443b1aa94ce3ef",
                "name": "里程碑",
                "group": "plan"
            }
        }
    ]
}
```
