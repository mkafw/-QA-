# QA-OS API 文档

## 基础信息

- 基础 URL: `https://your-worker.your-subdomain.workers.dev`
- 所有请求需要 CORS 支持
- 请求/响应格式: `application/json`

## 认证

通过 `GITHUB_TOKEN` 环境变量配置，无需在请求中传递认证信息。

---

## QA 项目接口

### 1. 获取所有 QA 项目

```
GET /api/issues
```

**查询参数:**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | number | 1 | 页码 |
| `per_page` | number | 20 | 每页数量 (最大 100) |

**响应示例:**

```json
{
  "items": [
    {
      "id": "q-001",
      "type": "QUESTION",
      "title": "如何实现语音输入？",
      "content": "我想在 OpenCode 中实现语音输入功能...",
      "level": 1,
      "tags": ["voice", "input"],
      "linkedQuestionIds": [],
      "linkedOKRIds": ["okr-001"],
      "status": "open",
      "createdAt": "2026-02-20T10:00:00.000Z",
      "updatedAt": "2026-02-20T10:00:00.000Z"
    }
  ],
  "total": 50,
  "page": 1,
  "perPage": 20,
  "hasMore": true
}
```

---

### 2. 获取单个 QA 项目

```
GET /api/issues/:id
```

**路径参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | string | QA 项目 ID |

**响应示例:**

```json
{
  "item": {
    "id": "q-001",
    "type": "QUESTION",
    "title": "如何实现语音输入？",
    "content": "我想在 OpenCode 中实现语音输入功能...",
    "level": 1,
    "tags": ["voice", "input"],
    "linkedQuestionIds": [],
    "linkedOKRIds": ["okr-001"],
    "status": "open",
    "createdAt": "2026-02-20T10:00:00.000Z",
    "updatedAt": "2026-02-20T10:00:00.000Z"
  },
  "number": 1
}
```

---

### 3. 创建 QA 项目

```
POST /api/issues
```

**请求体:**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | ✅ | 唯一标识符 |
| `type` | string | ✅ | `QUESTION` 或 `OKR` |
| `title` | string | ✅ | 标题 |
| `content` | string | ❌ | 内容 |
| `level` | number | ❌ | 层级 (0-2) |
| `tags` | string[] | ❌ | 标签 |
| `linkedQuestionIds` | string[] | ❌ | 关联的问题 |
| `linkedOKRIds` | string[] | ❌ | 关联的 OKR |
| `status` | string | ❌ | 状态 |

**请求示例:**

```json
{
  "id": "q-002",
  "type": "QUESTION",
  "title": "如何实现语音输入？",
  "content": "我想在 OpenCode 中实现语音输入功能...",
  "level": 1,
  "tags": ["voice", "input"],
  "linkedQuestionIds": [],
  "linkedOKRIds": [],
  "status": "open"
}
```

---

### 4. 更新 QA 项目

```
PATCH /api/issues/:id
```

**请求体:** 同创建接口

---

### 5. 删除 QA 项目

```
DELETE /api/issues/:id
```

**响应:** `204 No Content`

---

## 会话状态接口

### 1. 心跳上报

```
POST /api/sessions
```

**请求体:**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `sessionId` | string | ✅ | 会话 ID |
| `status` | string | ✅ | 状态: `active`, `idle`, `completed`, `error` |
| `messageCount` | number | ❌ | 消息数量 |
| `agents` | string[] | ❌ | 使用的 Agent 列表 |
| `metadata` | object | ❌ | 额外元数据 |

**请求示例:**

```json
{
  "sessionId": "ses_abc123",
  "status": "active",
  "messageCount": 45,
  "agents": ["Sisyphus", "Planner-Sisyphus"],
  "metadata": {
    "project": "smart-fork"
  }
}
```

---

### 2. 获取所有会话

```
GET /api/sessions
```

**查询参数:**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `includeMetadata` | boolean | false | 是否包含非活跃会话 |

**响应示例:**

```json
[
  {
    "sessionId": "ses_abc123",
    "status": "active",
    "lastHeartbeat": "2026-02-20T10:05:00.000Z",
    "messageCount": 45,
    "agents": ["Sisyphus"],
    "metadata": {}
  }
]
```

---

### 3. 获取单个会话

```
GET /api/sessions/:id
```

---

### 4. 关闭会话

```
DELETE /api/sessions/:id
```

**响应:** `204 No Content`

---

## 错误响应

所有错误响应格式如下：

```json
{
  "error": "错误描述",
  "detail": "详细信息",
  "issueId": "相关 Issue ID (可选)"
}
```

**状态码:**

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 204 | 删除成功 |
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 405 | 方法不允许 |
| 500 | 服务器错误 |

---

## 使用示例

### curl

```bash
# 获取所有 QA 项目
curl https://your-worker.workers.dev/api/issues

# 创建 QA 项目
curl -X POST https://your-worker.workers.dev/api/issues \
  -H "Content-Type: application/json" \
  -d '{"id":"q-001","type":"QUESTION","title":"测试"}'

# 心跳上报
curl -X POST https://your-worker.workers.dev/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"ses_abc","status":"active","messageCount":10,"agents":["Sisyphus"]}'
```

### JavaScript

```javascript
const BASE_URL = 'https://your-worker.workers.dev';

// 获取 QA 列表
async function getQAItems() {
  const res = await fetch(`${BASE_URL}/api/issues?page=1&per_page=20`);
  return res.json();
}

// 心跳上报
async function heartbeat(sessionId, messageCount, agents) {
  const res = await fetch(`${BASE_URL}/api/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      status: 'active',
      messageCount,
      agents,
      lastHeartbeat: new Date().toISOString()
    })
  });
  return res.json();
}
```
