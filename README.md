# 我的主页 - 个人知识管理与课表系统

一个基于 Vue 3 + Vite 构建的个人主页系统，集成思源笔记和课表管理功能。

## 📖 目录

- [用户指南](#用户指南)
- [开发文档](#开发文档)
- [功能特性](#功能特性)
- [技术栈](#技术栈)

---

## 🎯 用户指南

### 在线访问

访问地址：[https://your-username.github.io/my-homepage](https://your-username.github.io/my-homepage)

### 功能介绍

#### 1. 课表管理
- 📅 周视图课表展示
- ⏰ 实时课程提醒
- 🔔 浏览器通知支持
- 📱 响应式设计，支持移动端

#### 2. 思源笔记集成
- 📝 笔记本和文档浏览
- 🔍 文档内容展开查看
- 🎨 Markdown 渲染支持
- 📐 LaTeX 数学公式支持
- 🏷️ 课程笔记关联标记

### 使用说明

1. **切换标签页**：点击顶部导航栏切换"课表"和"笔记"
2. **查看笔记**：点击笔记本展开文档列表，点击文档查看内容
3. **课表提醒**：允许浏览器通知后，将在上课前收到提醒

---

## 💻 开发文档

### 环境要求

- Node.js >= 18.0.0
- Python >= 3.8（用于数据处理脚本）
- 思源笔记（可选，用于实时数据同步）

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 项目结构

```
my-homepage/
├── docs/                    # 文档目录
├── scripts/                 # Python 工具脚本
│   ├── file_converter.py   # 文件转换工具
│   └── import_to_siyuan.py # 导入思源笔记工具
├── src/
│   ├── components/         # Vue 组件
│   ├── composables/        # 组合式函数
│   ├── data/               # 静态数据
│   ├── services/           # API 服务
│   ├── utils/              # 工具函数
│   └── App.vue             # 根组件
└── README.md
```

详细结构说明请查看 [PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)

### 数据处理工具

#### 数据更新

思源笔记数据已通过 MCP 提取为 Markdown 格式，存储在 `src/data/siyuan.js`。

如需更新数据，可通过 AI 助手使用 MCP 工具：
1. `mcp__notebook(action='list')` - 获取笔记本列表
2. `mcp__document(action='get_doc', mode='markdown')` - 获取 Markdown 内容

#### 文件转换工具

将各种文件格式转换为 Markdown（使用 markitdown）：

```bash
# 转换单个文件
python scripts/file_converter.py input.pdf -o output_dir

# 批量转换目录
python scripts/file_converter.py input_dir/ -e .pdf .docx
```

#### 导入思源笔记

将 Markdown 文件导入到思源笔记：

```bash
# 导入单个文件
python scripts/import_to_siyuan.py note.md -n "笔记本名称"

# 批量导入目录
python scripts/import_to_siyuan.py notes_dir/ -n "笔记本ID"
```

### 开发指南

#### 添加新组件

1. 在 `src/components/` 对应目录下创建组件
2. 使用 `<script setup>` 语法
3. 使用 scoped 样式

#### 添加新功能模块

1. 在 `src/components/` 创建功能目录
2. 在 `src/services/` 添加 API 服务
3. 在 `src/composables/` 封装逻辑
4. 在 `src/utils/` 添加工具函数

#### 使用思源 API

```javascript
import { siyuanService } from '@/services/siyuan'

// 获取笔记本列表
const notebooks = await siyuanService.getNotebooks()

// 获取文档内容
const content = await siyuanService.getDocContent(docId)
```

### 部署

#### GitHub Pages

1. 修改 `vite.config.js` 设置 base 路径
2. 构建项目：`npm run build`
3. 部署 `dist` 目录到 GitHub Pages

#### 其他平台

构建后的 `dist` 目录可部署到任何静态文件服务器。

---

## ✨ 功能特性

- 🎨 **Solarized 主题**：护眼配色方案
- 📱 **响应式设计**：完美适配各种设备
- ⚡ **快速加载**：Vite 构建，按需加载
- 🔄 **平滑动画**：优雅的页面切换效果
- 📝 **Markdown 支持**：完整的 Markdown 渲染
- 📐 **数学公式**：LaTeX/KaTeX 支持
- 🔔 **智能提醒**：课程开始前自动提醒

---

## 🛠️ 技术栈

### 前端
- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **Marked** - Markdown 解析器
- **KaTeX** - 数学公式渲染

### 工具
- **Python** - 数据处理脚本
- **markitdown** - 文件格式转换
- **思源笔记 API** - 笔记数据源

### 部署
- **GitHub Pages** - 静态网站托管

---

## 📄 许可证

MIT License

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📮 联系方式

如有问题或建议，请提交 Issue。
