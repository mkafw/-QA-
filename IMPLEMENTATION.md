# QA-OS 模块实现指南

## 前置知识

在修改代码前，必须阅读：
1. `PRD.md` - 了解整体架构和功能规划
2. `types.ts` - 了解数据结构
3. 本文件 - 了解各模块实现细节

---

## 模块实现 Checklist

### 新增功能流程

```bash
# 1. 定义类型 (如需要)
→ types.ts 添加接口

# 2. 创建 Repository 方法
→ repositories/WorkersRepository.ts

# 3. 创建 Service 业务逻辑 (如需要)
→ services/NewService.ts

# 4. 添加 Hook 控制器
→ hooks/useQASystem.ts 添加方法

# 5. 创建 UI 组件
→ components/NewView.tsx

# 6. 注册到 App.tsx
→ 添加 ViewMode 枚举
→ 添加路由逻辑

# 7. 添加导航项
→ components/Layout.tsx navItems
```

---

## 现有模块详细说明

### GraphView (DNA 可视化)

**文件**: `components/GraphView.tsx`

**职责**:
- 将 Question/Objective 转换为 GraphNode
- 计算双螺旋坐标
- 处理节点交互（悬停、点击、拖拽）

**关键逻辑**:
```typescript
// 1. 数据转换
const steps = questions.map((q, i) => ({
  index: i,
  question: transformToGraphNode(q),
  objective: objectives[i] ? transformToGraphNode(objectives[i]) : null
}))

// 2. 螺旋计算
const { x, y, z } = calculateHelixPoint(index, strand, totalSteps)

// 3. 晶体化逻辑（已完成 OKR 关联的 Question 发光）
const isCrystallized = q.linkedOKRIds.some(id => completedObjectiveIds.has(id))
```

**依赖**:
- `logic/GraphRenderer.ts` - D3 渲染器
- `utils/helixMath.ts` - 螺旋数学公式

---

### QAView (问答管理)

**文件**: `components/QAView.tsx`

**职责**:
- 展示 Question 列表
- 筛选（L0/L1/L2 级别、标签）
- 添加新 Question

**状态**:
- 无本地状态，依赖 props
- 操作通过 onAddQuestion 回调

---

### OKRView (目标管理)

**文件**: `components/OKRView.tsx`

**职责**:
- 展示 Objective 卡片
- 管理 Key Result 状态
- 进度计算

**Key Result 状态**:
```typescript
type KeyResultStatus = 'Pending' | 'In Progress' | 'Completed' | 'Failed'
```

**进度计算**:
```typescript
const progress = (completedKRs / totalKRs) * 100
```

---

### FailureQueue (失败沉积)

**文件**: `components/FailureQueue.tsx`

**职责**:
- 展示失败列表
- 5W2H 分析表单
- 触发沉积流程

**沉积流程**:
```
Failure → 分析 5W2H → 点击"沉淀" 
→ 创建新 Question (分析结果作为内容)
→ 关联原 KR → 更新 Failure 状态
```

---

### WorkersRepository (数据层)

**文件**: `repositories/WorkersRepository.ts`

**API 映射**:

| IRepository 方法 | Workers API 调用 |
|----------------|------------------|
| getQuestions | GET /api/issues → filter type=QUESTION |
| addQuestion | POST /api/issues |
| deleteQuestion | DELETE /api/issues/:id |
| getObjectives | GET /api/issues → filter type=OBJECTIVE |
| addObjective | POST /api/issues |
| updateKeyResult | PATCH /api/issues/:id |
| getFailures | GET /api/issues → filter type=FAILURE |

**注意**: 当前 PATCH/DELETE 按 ID 查询有 bug，需修复

---

## 常见任务示例

### 添加新字段到 Question

```typescript
// 1. types.ts
interface Question extends NodeBase {
  // ... existing
  priority?: 'low' | 'medium' | 'high'  // 新增
}

// 2. WorkersRepository
// GET 时会自动包含新字段
// POST/PATCH 包含新字段即可

// 3. UI 组件
// 显示/编辑新字段
```

### 添加新视图

```typescript
// 1. types.ts 添加 ViewMode
enum ViewMode {
  // ... existing
  DASHBOARD = 'DASHBOARD'
}

// 2. App.tsx
case ViewMode.DASHBOARD:
  return <DashboardView />

// 3. Layout.tsx 添加导航
const navItems = [
  // ... existing
  { id: ViewMode.DASHBOARD, icon: LayoutGrid, label: '仪表盘' }
]
```

---

## 调试技巧

### 查看 API 请求

```typescript
// WorkersRepository.ts 添加日志
async function fetchAPI(method: string, data?: any): Promise<any> {
  console.log(`[API] ${method} ${API_URL}`, data)  // 添加这行
  // ...
}
```

### 本地测试模式

不设置 `VITE_WORKERS_URL` 环境变量时，使用 MemoryRepository：

```bash
# 临时禁用 Workers
rm .env.local
npm run dev
```

---

*本文件应随项目更新，保持与 PRD.md 同步*
