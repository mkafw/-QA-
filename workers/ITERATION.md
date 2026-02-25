# QA-OS 功能迭代规划

> 基于 All-Model-Chat 项目分析的功能迭代路线图

---

## 📋 目录

- [Phase 1: 存储适配器架构](#phase-1---存储适配器架构)
- [Phase 2: 模块化重构](#phase-2---模块化重构)
- [Phase 3: 稳定性与安全](#phase-3---稳定性与安全)
- [Phase 4: 离线与扩展](#phase-4---离线与扩展)
- [参考来源](#参考来源)

---

## Phase 1: 存储适配器架构

### 🎯 目标
实现存储后端的灵活切换，参考 All-Model-Chat 的数据访问模式。

### 📦 实现方案

#### 1. StorageAdapter 接口设计

```typescript
// src/storage/adapter.ts
export interface StorageAdapter {
  // 初始化
  init(): Promise<void>;
  
  // 节点操作
  getNode(id: string): Promise<QAItem | null>;
  listNodes(query?: NodeQuery): Promise<QAItem[]>;
  upsertNode(node: QAItem): Promise<QAItem>;
  deleteNode(id: string): Promise<void>;
  
  // 搜索
  searchNodes(query: string): Promise<QAItem[]>;
  
  // 导入导出
  exportData(): Promise<ExportData>;
  importData(data: ExportData): Promise<void>;
}

export interface NodeQuery {
  type?: 'QUESTION' | 'OKR';
  tags?: string[];
  status?: string;
  page?: number;
  perPage?: number;
}
```

#### 2. GitHubIssuesStorageAdapter 实现

```typescript
// src/storage/github-adapter.ts
export class GitHubIssuesStorageAdapter implements StorageAdapter {
  constructor(
    private octokit: Octokit,
    private owner: string,
    private repo: string,
    private encryptionKey: string
  ) {}
  
  async getNode(id: string): Promise<QAItem | null> {
    // 使用精确 ID 匹配查找 Issue
    // 解密并返回
  }
  
  async listNodes(query?: NodeQuery): Promise<QAItem[]> {
    // 分页获取 + 过滤
  }
  
  async upsertNode(node: QAItem): Promise<QAItem> {
    // 存在则更新，不存在则创建
  }
  
  // ... 其他方法
}
```

#### 3. EdgeKVStorageAdapter 缓存层

```typescript
// src/storage/kv-adapter.ts
export class EdgeKVStorageAdapter implements StorageAdapter {
  constructor(private kv: KVNamespace) {}
  
  // 用作缓存层，减少对 GitHub 的请求
  async getNode(id: string): Promise<QAItem | null> {
    const cached = await this.kv.get(`node:${id}`, 'json');
    if (cached) return cached;
    
    // 缓存未命中，从 GitHub 获取
    const node = await this.githubAdapter.getNode(id);
    await this.kv.put(`node:${id}`, JSON.stringify(node), { expirationTtl: 3600 });
    return node;
  }
}
```

### ✅ 状态

| 功能 | 状态 | 备注 |
|------|------|------|
| StorageAdapter 接口 | ⏳ 待开发 | - |
| GitHubIssuesStorageAdapter | ⏳ 待开发 | 基于现有代码重构 |
| EdgeKVStorageAdapter | ⏳ 待开发 | 缓存层 |

---

## Phase 2: 模块化重构

### 🎯 目标
参考 All-Model-Chat 的 Hooks/Logic/Service 分层架构。

### 📦 实现方案

#### 1. 服务层 (Services)

```
src/services/
├── githubService.ts    # GitHub API 封装
├── encryptionService.ts # 加密/解密
├── cacheService.ts     # 缓存管理
└── logService.ts       # 日志服务
```

#### 2. 逻辑层 (Logic)

```
src/logic/
├── issueLogic.ts       # Issue 业务逻辑
├── sessionLogic.ts     # 会话管理逻辑
└── searchLogic.ts      # 搜索逻辑
```

#### 3. Hooks 层

```typescript
// src/hooks/useIssues.ts
export function useIssues() {
  const [issues, setIssues] = useState<QAItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchIssues = useCallback(async (query?: NodeQuery) => {
    setLoading(true);
    try {
      const items = await storageAdapter.listNodes(query);
      setIssues(items);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { issues, loading, error, fetchIssues };
}
```

### ✅ 状态

| 功能 | 状态 | 备注 |
|------|------|------|
| 服务层重构 | ⏳ 待开发 | - |
| 逻辑层拆分 | ⏳ 待开发 | - |
| Hooks 封装 | ⏳ 待开发 | - |

---

## Phase 3: 稳定性与安全

### 🎯 目标
增强错误处理、日志、监控，参考 All-Model-Chat 的 logService.ts。

### 📦 实现方案

#### 1. 日志服务

```typescript
// src/services/logService.ts
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class LogService {
  constructor(
    private level: LogLevel = LogLevel.INFO,
    private enableRemote: boolean = false
  ) {}
  
  debug(message: string, context?: object): void {
    this.log(LogLevel.DEBUG, message, context);
  }
  
  info(message: string, context?: object): void {
    this.log(LogLevel.INFO, message, context);
  }
  
  error(message: string, error?: Error, context?: object): void {
    this.log(LogLevel.ERROR, message, { ...context, error: error?.message, stack: error?.stack });
  }
  
  private log(level: LogLevel, message: string, context?: object): void {
    if (level < this.level) return;
    
    const entry = {
      timestamp: new Date().toISOString(),
      level: LogLevel[level],
      message,
      context,
    };
    
    console.log(JSON.stringify(entry));
    
    // 可选：发送到远程日志服务
    if (this.enableRemote) {
      this.sendToRemote(entry);
    }
  }
}
```

#### 2. 错误处理与重试

```typescript
// src/utils/retry.ts
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delay?: number;
    backoff?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const { maxAttempts = 3, delay = 1000, backoff = 2, onRetry } = options;
  
  let lastError: Error;
  let currentDelay = delay;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxAttempts) break;
      
      onRetry?.(attempt, lastError);
      await sleep(currentDelay);
      currentDelay *= backoff;
    }
  }
  
  throw lastError!;
}
```

#### 3. GitHub Token 安全管理

- 使用 Cloudflare Secrets 存储 Token
- 不在前端暴露任何认证信息
- 所有 GitHub API 调用通过 Worker 代理

### ✅ 状态

| 功能 | 状态 | 备注 |
|------|------|------|
| LogService | ⏳ 待开发 | 参考 All-Model-Chat |
| 错误重试机制 | ⏳ 待开发 | - |
| Token 安全管理 | ✅ 已实现 | 通过环境变量 |

---

## Phase 4: 离线与扩展

### 🎯 目标
支持离线模式、数据导入导出、多存储后端。

### 📦 实现方案

#### 1. 离线模式

- 使用 Service Worker 缓存 API 响应
- 本地 IndexedDB 存储最近数据
- 网络恢复后自动同步

#### 2. 数据导入导出

```typescript
// src/storage/export.ts
export interface ExportData {
  version: string;
  exportedAt: string;
  items: QAItem[];
  sessions: SessionStatus[];
}

export async function exportToJSON(): Promise<string> {
  const data: ExportData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    items: await storageAdapter.listNodes(),
    sessions: await sessionAdapter.getSessions(),
  };
  return JSON.stringify(data, null, 2);
}

export async function importFromJSON(json: string): Promise<void> {
  const data: ExportData = JSON.parse(json);
  // 验证版本，合并数据
}
```

#### 3. 多存储后端支持

```typescript
// 存储后端选项
export type StorageBackend = 'github-issues' | 'kv-cache' | 'durable-objects';

// 工厂函数
export function createStorageAdapter(backend: StorageBackend, config: StorageConfig): StorageAdapter {
  switch (backend) {
    case 'github-issues':
      return new GitHubIssuesStorageAdapter(config);
    case 'kv-cache':
      return new EdgeKVStorageAdapter(config);
    default:
      throw new Error(`Unknown storage backend: ${backend}`);
  }
}
```

### ✅ 状态

| 功能 | 状态 | 备注 |
|------|------|------|
| 离线模式 | ⏳ 待开发 | 需要 Service Worker |
| 数据导入导出 | ⏳ 待开发 | - |
| 多存储后端 | ⏳ 待开发 | - |

---

## 📊 迭代进度总览

| Phase | 功能 | 状态 |
|-------|------|------|
| Phase 1 | StorageAdapter 接口 | ⏳ |
| Phase 1 | GitHubIssuesStorageAdapter | ⏳ |
| Phase 1 | EdgeKVStorageAdapter | ⏳ |
| Phase 2 | 服务层重构 | ⏳ |
| Phase 2 | 逻辑层拆分 | ⏳ |
| Phase 2 | Hooks 封装 | ⏳ |
| Phase 3 | LogService | ⏳ |
| Phase 3 | 错误重试 | ⏳ |
| Phase 3 | Token 安全 | ✅ |
| Phase 4 | 离线模式 | ⏳ |
| Phase 4 | 导入导出 | ⏳ |
| Phase 4 | 多存储后端 | ⏳ |

---

## 参考来源

- [All-Model-Chat 项目](https://github.com/yeahhe365/All-Model-Chat)
  - 本地优先架构 (IndexedDB)
  - 模块化 Hooks/Logic/Service 分层
  - Network Interceptor 设计
  - 日志服务 (logService.ts)
  - 数据导出/导入 (useDataManagement.ts)

---

## 📝 更新日志

| 日期 | 版本 | 变更 |
|------|------|------|
| 2026-02-25 | 1.0.0 | 初始版本 |

---

## Phase 5: 语音输入功能

### 🎯 目标
实现浏览器端语音输入，结合两种方案：
1. 浏览器原生 SpeechRecognition（实时、低延迟）
2. SiliconFlow STT API（高精度）

### 📦 实现方案

#### 1. 方案架构

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  浏览器录音     │────▶│  opencode-remote │────▶│  SiliconFlow    │
│  MediaRecorder  │     │  Flask Server    │     │  STT API        │
└─────────────────┘     └──────────────────┘     └──────────────────┘
                                │
                                ▼
                         ┌──────────────────┐
                         │  录音文件上传    │
                         │  /transcribe     │
                         └──────────────────┘
```

#### 2. 实现代码

```python
# opencode-remote/app.py

# 方案1: 浏览器原生 SpeechRecognition
const recognition = new SpeechRecognition();
recognition.lang = 'zh-CN';
recognition.onresult = function(event) {
    // 实时转录结果
    const text = event.results[0][0].transcript;
};

# 方案2: SiliconFlow STT
@app.route('/transcribe', methods=['POST'])
def transcribe():
    # 1. 接收录音文件
    file = request.files['file']
    
    # 2. 调用 SiliconFlow API
    response = requests.post(
        'https://api.siliconflow.cn/v1/audio/transcriptions',
        files={'file': file},
        data={'model': 'FunAudioLLM/SenseVoiceSmall'},
        headers={'Authorization': f'Bearer {API_KEY}'}
    )
    
    return jsonify({'text': response.json()['text']})
```

#### 3. 使用方式

| 方案 | 优点 | 缺点 |
|------|------|------|
| 浏览器原生 | 无需网络延迟、免费 | 精度一般、依赖浏览器 |
| SiliconFlow | 精度高、支持多语言 | 需要网络、有配额限制 |

### ✅ 状态

| 功能 | 状态 | 备注 |
|------|------|------|
| 浏览器原生语音识别 | ✅ 已实现 | SpeechRecognition API |
| SiliconFlow 转录 | ✅ 已实现 | SenseVoiceSmall 模型 |
| 录音文件上传 | ✅ 已实现 | /transcribe 接口 |
| 移动端适配 | ✅ 已实现 | opencode-remote |

### 📁 相关文件

- `opencode-remote/app.py` - 语音输入 Flask 服务器

### 参考来源

- [All-Model-Chat useVoiceInput.ts](https://github.com/yeahhe365/All-Model-Chat/blob/main/all-model-chat/hooks/useVoiceInput.ts)
- [siliconflow-stm-mcp](https://github.com/mkafw/siliconflow-stt-mcp)
