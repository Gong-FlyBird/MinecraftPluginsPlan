<div align="center">

# 🧱 Minecraft 插件开发计划

**优雅地管理你的 Minecraft 插件开发全流程** · 看板 · 里程碑 · 灵感库 · 时间线

![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-ff69b4?style=flat-square)

</div>

---

## 📋 目录

- [功能一览](#-功能一览)
- [技术栈](#-技术栈)
- [快速开始](#-快速开始)
- [使用指南](#-使用指南)
- [项目结构](#-项目结构)
- [隐私安全](#-隐私安全)
- [常见问题](#-常见问题)
- [同步到 GitHub](#-同步到-github)
- [许可证](#-许可证)

---

## ✨ 功能一览

### 核心功能

| 功能 | 说明 |
|------|------|
| **📋 插件看板** | 三列看板（计划中 / 开发中 / 已发布），支持**拖拽**改变状态 |
| **🏷️ 插件卡片** | 每个卡片包含名称、版本、MC 版本、优先级、标签、描述、更新日志 |
| **🎯 里程碑与任务** | 每个插件可添加多个里程碑，里程碑下可拆解具体任务，自动计算进度 |
| **💡 灵感库** | 快速记录灵感，支持关联插件、参考链接、代码片段 |
| **📅 时间线** | 按时间顺序展示所有插件的创建与更新记录，方便复盘 |
| **📦 数据管理** | JSON 格式导入 / 导出，支持完全迁移与备份 |

### 附加功能

| 功能 | 说明 |
|------|------|
| **📊 统计面板** | 插件数量、完成率、状态 / 优先级分布、热门标签可视化 |
| **🏃 冲刺看板** | GTD 风格的周 / 月冲刺视图，自动归类插件 |
| **🏷️ 标签管理** | 统一管理所有插件标签，支持矩阵视图浏览分布 |
| **🔍 全局搜索** | 快速搜索灵感内容和关联插件 |

---

## 🛠 技术栈

| 技术 | 用途 |
|------|------|
| **React 18** | 函数组件 + Hooks |
| **Vite 6** | 构建工具（HMR） |
| **Tailwind CSS 3** | 样式框架，配合液态玻璃自定义样式 |
| **@dnd-kit** | 看板拖拽排序 |
| **lucide-react** | 图标库 |
| **localStorage** | 数据持久化（纯浏览器存储） |

> 所有数据不经过任何服务器，请放心使用。

---

## 🚀 快速开始

### 前置要求

- Node.js ≥ 18
- npm ≥ 9

### 安装

```bash
git clone https://github.com/你的用户名/你的仓库.git
cd MinecraftPluginsPlan
npm install
```

### 启动开发服务器

```bash
npm run dev
```

浏览器打开 `http://localhost:5173` 即可使用。

### 生产构建

```bash
npm run build     # 输出到 dist/
npm run preview   # 本地预览构建产物
```

---

## 📖 使用指南

### 插件看板

默认进入看板视图，所有插件按状态分布在三列中：

- **计划中** — 还未开始开发的插件
- **开发中** — 正在开发的插件
- **已发布** — 已经完成的插件

**操作方式：**
- 点击卡片展开/折叠详细信息
- 拖拽卡片到其他列以更改状态
- 悬停卡片右上角可编辑或删除

### 里程碑与任务

1. 在侧边栏切换到「里程碑」
2. 左侧选择一个插件
3. 添加里程碑（如「核心功能」「性能优化」）
4. 在每个里程碑下添加具体任务，勾选标记完成
5. 进度条自动计算

### 灵感与参考

在「灵感库」页面可以快速记录开发灵感：
- 支持关联到具体插件
- 可添加参考链接和代码片段
- 支持搜索过滤

### 数据备份

在「数据管理」页面可以：
- **导出** — 将所有数据下载为 JSON 文件
- **导入** — 从之前导出的 JSON 恢复数据
- **清空** — 重置所有数据（建议先导出备份）

---

## 📁 项目结构

```
MinecraftPluginsPlan/
├── index.html                   # 入口 HTML
├── src/
│   ├── main.jsx                 # React 入口
│   ├── App.jsx                  # 主应用（标签页路由）
│   ├── index.css                # Tailwind 指令 + 液态玻璃样式
│   ├── hooks/
│   │   └── useLocalStorage.js   # localStorage 持久化 Hook
│   ├── utils/
│   │   ├── helpers.js           # 工具函数（UID、日期、进度计算、导入导出）
│   │   └── store.js             # 全局数据管理（CRUD）
│   └── components/
│       ├── Sidebar.jsx          # 侧边导航
│       ├── KanbanBoard.jsx      # 插件看板（拖拽）
│       ├── PluginCard.jsx       # 插件卡片（折叠/展开）
│       ├── PluginForm.jsx       # 新建/编辑表单
│       ├── MilestoneTracker.jsx # 里程碑与任务
│       ├── IdeaVault.jsx        # 灵感库
│       ├── TimelineView.jsx     # 时间线
│       ├── DataManager.jsx      # 导入/导出
│       ├── StatsDashboard.jsx   # 统计面板 ✨
│       ├── SprintBoard.jsx      # 冲刺看板 ✨
│       ├── TagManager.jsx       # 标签管理 ✨
│       ├── Modal.jsx            # 模态框
│       ├── GlassPanel.jsx       # 玻璃面板
│       ├── EmptyState.jsx       # 空状态
│       ├── SearchBar.jsx        # 搜索框
│       └── StatusBadge.jsx      # 状态/优先级徽章
├── tailwind.config.js           # Tailwind 配置（Hermès 色板）
├── postcss.config.js
├── vite.config.js
└── package.json
```

---

## 🔒 隐私安全

### 数据流向

```
你的插件计划数据 → 浏览器 localStorage（仅存你本机）
源代码            → GitHub（只有代码，零数据）
```

**所有数据仅存储在浏览器本地，永不离开你的电脑。**

- 不需要注册账号
- 不需要联网（首次加载后）
- 不发送任何数据到服务器
- 关闭页面数据不丢失

### 数据导出

导出的 JSON 文件建议保存到桌面或下载文件夹，不要放到项目目录内。`.gitignore` 已排除 `/exports/`、`/data/` 和 `*.backup.json`，但谨慎起见请自行保管好导出文件。

---

## ❓ 常见问题

<details>
<summary><strong>Q: 我已经在页面里写了很多插件计划，同步到 GitHub 会泄漏吗？</strong></summary>

**A: 不会。** 你的数据在浏览器 localStorage 中，`git push` 只上传项目文件夹里的源代码文件（`.jsx`、`.css`、配置文件等），不会读取浏览器存储。
</details>

<details>
<summary><strong>Q: 多人协作时别人会看到我的数据吗？</strong></summary>

**A:** 数据存在你自己的浏览器里。其他人 `git clone` 后看到的是空面板，他们各自的数据存在他们自己的浏览器中。
</details>

<details>
<summary><strong>Q: 如何迁移数据到另一台电脑？</strong></summary>

**A:** 在当前电脑「数据管理 → 导出 JSON」→ 将文件传到新电脑 → 在新电脑「数据管理 → 导入 JSON」。
</details>

<details>
<summary><strong>Q: 数据会丢失吗？</strong></summary>

**A:** 清除浏览器数据（缓存、Cookie、网站数据）会导致 localStorage 被清空。建议定期导出备份。
</details>

---

## 📤 同步到 GitHub

如果你的项目还没有关联远程仓库：

```bash
# 1. 在 GitHub 新建空仓库（不要勾选任何初始化文件）

# 2. 在项目目录执行
git remote add origin https://github.com/你的用户名/仓库名.git
git add .
git commit -m "init: Minecraft 插件开发计划工具"
git branch -M main
git push -u origin main
```

日常更新：

```bash
git add .
git commit -m "feat: 新增/修复了什么"
git push
```

---

## 📄 许可证

本项目基于 MIT 许可证开源。

---

<div align="center">

**Made with ❤️ for Minecraft plugin developers**

</div>
