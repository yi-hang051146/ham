# Ham - 个人主页

一个简洁、现代的个人主页项目，展示个人信息、技能和项目作品。

## 项目简介

这是一个基于 HTML/CSS/JavaScript 构建的个人主页，采用现代化的设计风格，具有以下特点：
- 响应式设计，适配各种设备
- 模块化的代码结构
- 优雅的动画效果
- 简洁的视觉风格
- 思源笔记集成

## 项目结构

```
ham/
├── src/                        # 源代码目录
│   ├── css/                    # CSS 源文件
│   │   ├── variables.css       # 设计变量
│   │   ├── base.css            # 基础样式
│   │   ├── layout.css          # 布局样式
│   │   └── components/         # 组件样式
│   │       ├── header.css
│   │       ├── footer.css
│   │       ├── music-player.css
│   │       ├── schedule.css
│   │       ├── interests.css
│   │       ├── siyuan.css
│   │       └── siyuan-card.css
│   └── js/                     # JavaScript 源文件
│       ├── utils.js            # 工具函数
│       ├── main.js             # 主入口
│       ├── modules/            # 功能模块
│       │   ├── music-player.js
│       │   ├── schedule.js
│       │   └── interests.js
│       └── renderers/          # 渲染器
│           ├── siyuan-renderer.js
│           └── siyuan-card.js
├── dist/                       # 构建输出（生产环境）
│   ├── css/
│   │   └── app.css             # 合并后的 CSS
│   ├── js/
│   │   └── app.js              # 合并后的 JS
│   ├── assets/
│   ├── data/
│   └── index.html
├── assets/                     # 静态资源
│   ├── images/
│   └── audio/
├── data/                       # 数据文件
│   ├── interests.json
│   └── siyuan/
├── scripts/                    # 工具脚本
│   ├── build.py                # 构建脚本
│   ├── server.py               # 本地服务器
│   ├── server-robust.py        # 增强版服务器
│   ├── start-server.bat        # Windows 启动脚本
│   ├── start-server-robust.bat # Windows 增强版启动脚本
│   └── start-server.sh         # Unix/Linux 启动脚本
├── index.html                  # 开发环境入口
├── .gitignore
└── README.md
```

## 快速开始

### 开发环境

1. **启动本地服务器**
   ```bash
   # Windows
   scripts\start-server.bat
   
   # Unix/Linux
   ./scripts/start-server.sh
   
   # 或直接运行
   python scripts/server.py
   ```

2. **修改源代码**
   - 编辑 `src/` 目录下的文件
   - 运行构建脚本生成 `dist/` 文件

3. **构建项目**
   ```bash
   python scripts/build.py
   ```

4. **监听模式**（自动构建）
   ```bash
   python scripts/build.py --watch
   ```

### 生产部署

1. 运行构建脚本
   ```bash
   python scripts/build.py
   ```

2. 将 `dist/` 目录部署到服务器

## 技术栈

- **HTML5** - 页面结构
- **CSS3** - 样式和动画
  - CSS 变量系统
  - 深色模式支持
- **原生 JavaScript** - 交互逻辑
  - 模块化设计
  - 请求缓存
  - 并行加载
- **外部 CDN**
  - Google Fonts
  - KaTeX - 数学公式渲染
  - Highlight.js - 代码高亮

## 核心功能

### 1. 音乐播放器
- 歌单循环播放
- 播放状态持久化
- 自动播放下一首

### 2. 课表显示
- 根据当前时间自动显示课程
- 三种状态：进行中、即将开始、已结束
- 每分钟自动刷新

### 3. 思源笔记渲染器
- 文档树导航
- 支持多种节点类型
- 数学公式渲染（KaTeX）
- 代码高亮（Highlight.js）
- 标题折叠/展开
- 请求缓存
- 并行加载

### 4. 关注内容卡片
- 分类展示
- 模态框详情
- 思源笔记本集成

## 性能优化

### CSS 优化
- 合并所有 CSS 文件，消除 `@import` 阻塞
- 使用 CSS 变量系统，便于主题定制
- 背景动画仅在 hover 时运行

### JavaScript 优化
- 合并所有 JS 文件，减少 HTTP 请求
- 模块化设计，便于维护
- 请求缓存，避免重复请求
- 并行加载，提升加载速度
- 使用 `requestAnimationFrame` 优化渲染

### 网络优化
- 文档缓存机制
- 并行加载笔记
- 字体预加载

## 代码规范

### 新增 JavaScript 模块

位置: `src/js/modules/` 或 `src/js/renderers/`

```javascript
const ModuleName = (function() {
    'use strict';

    // 配置
    let config = {};

    // 状态
    let state = {};

    // 私有方法
    function privateMethod() {}

    // 公开方法
    function init() {}

    return {
        init,
    };
})();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModuleName;
} else if (typeof window !== 'undefined') {
    window.ModuleName = ModuleName;
}
```

### 新增 CSS 组件

位置: `src/css/components/`

```css
/* 组件名称 */

.component-name {
    /* 样式 */
}

.component-name__element {
    /* 元素样式 */
}

.component-name--modifier {
    /* 修饰符样式 */
}

@media (prefers-color-scheme: dark) {
    .component-name {
        /* 深色模式 */
    }
}
```

### 新增数据文件

位置: `data/`

- JSON 文件: `data/数据名.json`
- 思源数据: `data/siyuan/笔记本ID/`

### 新增 Python 脚本

位置: `scripts/`

## 构建脚本

### 命令

```bash
# 完整构建
python scripts/build.py

# 只构建 CSS
python scripts/build.py --css

# 只构建 JS
python scripts/build.py --js

# 监听模式
python scripts/build.py --watch
```

### 输出

- `dist/css/app.css` - 合并后的 CSS（约 52 KB）
- `dist/js/app.js` - 合并后的 JS（约 81 KB）

## 开发日志

### 2026年3月6日

#### 项目架构重构与性能优化

**工作内容：**

1. **目录结构重组**
   - 创建 `src/` 目录存放源代码
   - 创建 `dist/` 目录存放构建输出
   - 创建 `scripts/` 目录存放工具脚本
   - 移除旧的 `css/` 和 `js/` 目录
   - 将服务器脚本和启动脚本移至 `scripts/` 目录

2. **构建系统**
   - 创建 `scripts/build.py` 构建脚本
   - 支持 CSS/JS 文件合并
   - 支持监听模式自动构建
   - 自动复制静态资源到 `dist/` 目录

3. **CSS 优化**
   - 合并所有 CSS 文件为单个 `app.css`
   - 消除 `@import` 阻塞，提升首屏渲染速度
   - 背景动画仅在 hover 时运行，减少 GPU 消耗
   - 文件大小：52 KB

4. **JavaScript 重构**
   - 参考思源原生方法重构代码
   - 创建 `utils.js` 工具函数模块
   - 模块化设计：`modules/` 和 `renderers/`
   - 添加请求缓存机制
   - 实现并行加载笔记
   - 合并所有 JS 文件为单个 `app.js`
   - 文件大小：81 KB

5. **思源渲染器优化**
   - 参考 `siyuan/app/src/protyle/render/` 实现
   - 动态加载 KaTeX 和 Highlight.js
   - 文档缓存避免重复请求
   - 并行加载提升速度

**改进效果：**

- ✅ 代码结构清晰，源码与构建产物分离
- ✅ 减少 HTTP 请求（CSS: 9→1, JS: 5→1）
- ✅ 消除 CSS `@import` 阻塞
- ✅ 请求缓存避免重复加载
- ✅ 并行加载提升笔记加载速度
- ✅ 构建自动化，支持监听模式

#### 移动端响应式优化

**工作内容：**

1. **头像图片优化**
   - 移动端（640px 以下）头像从 140px 缩小到 100px
   - 减少移动端内存占用和加载时间

2. **标题和文字优化**
   - 移动端主标题从 56px 缩小到 36px
   - tagline 从 20px 缩小到 16px
   - status 按钮尺寸适配移动端

3. **布局优化**
   - header 区域移动端 padding 调整
   - section 间距适配移动端
   - 链接按钮移动端垂直排列

**改进效果：**

- ✅ 移动端显示更加协调
- ✅ 图片尺寸适配移动设备
- ✅ 文字大小适合移动端阅读

#### 构建流程优化

**工作内容：**

1. **构建输出优化**
   - 构建脚本同时输出到 `dist/` 目录和根目录
   - 根目录生成 `css/app.css` 和 `js/app.js`
   - 方便开发和部署

2. **路径调整**
   - `index.html` 引用根目录的 `./css/app.css` 和 `./js/app.js`
   - 避免部署时路径问题

**改进效果：**

- ✅ 开发时直接访问根目录即可
- ✅ 部署时无需修改路径
- ✅ 构建产物统一管理

#### 思源数据路径修复

**问题：** 手机访问 GitHub Pages 时思源笔记加载失败（HTTP 404）

**原因：** 使用相对路径 `./data/siyuan`，在 GitHub Pages 子目录下路径不正确

**修复：**
- 动态获取基础路径，支持 GitHub Pages 子目录部署
- 自动检测 `window.location.pathname` 获取正确的路径前缀

**改进效果：**

- ✅ 本地开发和 GitHub Pages 部署都能正常工作
- ✅ 支持子目录部署（如 `/ham/`）

**文件变更统计：**
- 新增目录：3 个（src/, dist/, scripts/）
- 新增文件：15 个
- 删除目录：2 个（旧 css/, js/）
- 移动文件：5 个（服务器脚本和启动脚本）

## 开发环境

- **IDE**: 华为 CodeArts IDE
- **Python**: 3.14.1
- **Git**: 2.52.0.windows.1
- **操作系统**: Windows

## 许可证

© 2024 Ham. All rights reserved.

## 联系方式

- GitHub: [yi-hang051146](https://github.com/yi-hang051146)
- Email: yihangwhu@petalmail.com
