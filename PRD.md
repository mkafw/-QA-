# QA-OS 项目计划文档

## 1. 项目概述

**项目名称**: QA-OS (双核学习系统)  
**核心定位**: 生物启发的个人知识管理系统 - 将知识管理视为"建筑师任务"而非"图书管理员任务"  
**技术栈**: React 19 + D3.js + Vite + Cloudflare Workers + GitHub Issues

---

## 2. 功能模块详细规划

### 2.1 Neural Helix (神经螺旋) - 3D DNA 可视化

| 项目 | 详情 |
|------|------|
| **功能** | 3D 双螺旋结构展示知识和目标 |
| **UI设计** | 双螺旋 strand A/B，节点悬浮显示详情，支持拖拽旋转 |
| **实现逻辑** | D3.js 物理模拟 + 螺旋数学公式 |
| **核心算法** | `helixMath.ts` - 计算螺旋坐标点 |
| **渲染系统** | `GraphRenderer.ts` - 主渲染器，`SceneSystem` 场景层，`NodeSystem` 节点系统，`StructureSystem` 结构系统 |
| **状态** | ✅ 已完成 |

### 2.2 Synapse Canvas (突触画布) - 问答管理

| 项目 | 详情 |
|------|------|
| **功能** | 管理 Question 节点，添加/编辑/删除 |
| **UI设计** | 卡片列表，支持 L0/L1/L2 筛选，标签过滤 |
| **实现逻辑** | 内存/MemoryRepository 存储，本地优先 |
| **核心组件** | `QAView.tsx` - 主视图 |
| **状态** | ✅ 已完成 |

### 2.3 Strategy Core (策略核心) - OKR 目标管理

| 项目 | 详情 |
|------|------|
| **功能** | 管理 Objective 和 Key Result |
| **UI设计** | 目标卡片 + KR 清单 + 进度指示器 |
| **实现逻辑** | KR 状态切换（Pending/In Progress/Completed/Failed） |
| **核心组件** | `OKRView.tsx` |
| **状态** | ✅ 已完成 |

### 2.4 Sedimentation Protocol (沉积协议) - 失败处理

| 项目 | 详情 |
|------|------|
| **功能** | 失败分析 → 转换为 Question |
| **UI设计** | 失败队列 → 5W2H 分析 → 沉淀按钮 |
| **实现逻辑** | Failure → Question 自动转换 |
| **核心组件** | `FailureQueue.tsx` + `SedimentationService.ts` |
| **状态** | ⚠️ 代码问题 - Service 仍引用 MemoryRepository |

### 2.5 Creation Modal (创建模态框)

| 项目 | 详情 |
|------|------|
| **功能** | 统一入口创建 Question/Objective/Failure |
| **UI设计** | 底部滑出面板，Tab 切换类型 |
| **实现逻辑** | 调用对应 repo.add* 方法 |
| **核心组件** | `CreationModal.tsx` |
| **状态** | ✅ 已完成 |

### 2.6 Version Control (版本控制)

| 项目 | 详情 |
|------|------|
| **功能** | Git 提交历史展示 |
| **UI设计** | 提交列表 + 变更统计 |
| **实现逻辑** | 读取 git log |
| **核心组件** | `VersionControl.tsx` |
| **状态** | ⚠️ 仅读取，无写入功能 |

---

## 3. 数据层架构

### 3.1 Repository 模式

```
repositories/
├── IRepository.ts      # 接口定义 (types.ts 中)
├── MemoryRepository.ts # 开发模式本地存储
└── WorkersRepository.ts # 生产模式 → Cloudflare Workers API
```

### 3.2 Workers API 端点

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | /api/issues | 获取所有 QA 项 |
| POST | /api/issues | 创建新项 |
| PATCH | /api/issues/:id | 更新项 |
| DELETE | /api/issues/:id | 删除项 |

### 3.3 加密方案

- 算法: AES-GCM + PBKDF2
- 格式: `salt:iv:ciphertext`
- 密钥: 用户本地管理（不在服务器存储）

---

## 4. UI/UX 设计规范

### 4.1 主题: Cosmic (宇宙风)

| 元素 | 值 |
|------|-----|
| 背景 | 深空黑 #000000 + 渐变 |
| 主色 | 电光蓝 #2E5CFF |
| 辅色 | 星云紫 #7B2EFF |
| 强调 | 事件视界青 #00F0FF |
| 成功 | 星光金 #FFE580 |
| 危险 | 红巨星 #FF2E5B |

### 4.2 字体

- 标题: Cinzel (衬线)
- 正文: Inter (无衬线)
- 代码: JetBrains Mono

### 4.3 组件风格

- Apple Glass 效果 (毛玻璃 + 高光)
- 悬浮阴影 + 边框发光
- 暗色模式优先

---

## 5. 缺失模块 (TODO)

| 模块 | 优先级 | 说明 |
|------|--------|------|
| **Dashboard 全局概览** | 高 | 统计面板：问题数、OKR进度、沉积数 |
| **全局搜索** | 高 | 搜索 Question/Objective/Failure |
| **Settings 设置** | 中 | 主题、加密密钥管理 |
| **WorkersRepository 完善** | 高 | 修复 PATCH/DELETE 按 ID 查询 |
| **SedimentationService 修复** | 高 | 改为动态获取 repo |
| **按需加载** | 低 | React.lazy 代码分割 |

---

## 6. 代码问题修复

### 6.1 紧急

| 问题 | 位置 | 修复方案 |
|------|------|----------|
| SedimentationService 用错 repo | `services/SedimentationService.ts:11` | 传入 repo 参数 |
| PATCH 按 ID 查询不工作 | `workers/src/handlers/issues.ts` | 改用 issue number 查询 |

### 6.2 待优化

| 问题 | 位置 | 建议 |
|------|------|------|
| 无错误边界 | App.tsx | 添加 ErrorBoundary 组件 |
| 无加载状态 | 大部分组件 | 添加 skeleton loading |
| 无离线检测 | 网络层 | 添加 service worker |

---

## 7. 开发流程规范

### 7.1 分支策略

```
main → 开发分支 → 功能分支
```

### 7.2 提交规范

```
feat: 新功能
fix: 修复
refactor: 重构
docs: 文档
chore: 构建/工具
```

### 7.3 代码检查

```bash
npm run build     # 构建
# lint/typecheck  # 待添加
```

---

## 8. 文件结构

```
qa-os/
├── components/           # UI 组件
│   ├── GraphView.tsx    # DNA 可视化
│   ├── QAView.tsx       # 问答列表
│   ├── OKRView.tsx      # 目标管理
│   ├── FailureQueue.tsx # 失败队列
│   ├── CreationModal.tsx
│   ├── VersionControl.tsx
│   └── Layout.tsx       # 主布局
├── hooks/               # 业务逻辑控制器
│   └── useQASystem.ts
├── repositories/         # 数据层
│   ├── MemoryRepository.ts
│   └── WorkersRepository.ts
├── services/            # 领域服务
│   ├── SedimentationService.ts
│   └── DomainRules.ts
├── logic/               # 可视化引擎
│   ├── GraphRenderer.ts
│   └── systems/
│       ├── SceneSystem.ts
│       ├── NodeSystem.ts
│       └── StructureSystem.ts
├── utils/
│   └── helixMath.ts
├── types.ts             # 类型定义
├── workers/             # Cloudflare Workers
│   ├── src/
│   │   ├── index.ts
│   │   ├── crypto.ts
│   │   └── handlers/issues.ts
│   └── wrangler.toml
└── index.html          # 入口 (含 importmap)
```

---

## 9. 下一步行动

1. ✅ Workers API 部署完成
2. ❌ 修复 SedimentationService
3. ❌ 完善 WorkersRepository PATCH/DELETE
4. ⬜ 添加 Dashboard 全局概览
5. ⬜ 添加全局搜索
6. ⬜ 添加 Settings 页面
7. ⬜ 完善错误处理和加载状态

---

*本文档为项目规划核心依据，助手应根据此文档生成代码*
