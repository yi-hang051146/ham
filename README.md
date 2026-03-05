# Ham - 个人主页

一个简洁、现代的个人主页项目，展示个人信息、技能和项目作品。

## 项目简介

这是一个基于HTML和CSS构建的个人主页，采用现代化的设计风格，具有以下特点：
- 响应式设计，适配各种设备
- 模块化的代码结构
- 优雅的动画效果
- 简洁的视觉风格

## 项目结构

```
ham/
├── index.html              # 主页面
├── css/
│   ├── main.css           # 主样式文件
│   ├── variables.css      # CSS变量定义
│   └── components/        # 组件样式目录
│       ├── header.css     # 头部组件样式
│       ├── skills.css     # 技能组件样式
│       ├── projects.css   # 项目组件样式
│       └── footer.css     # 页脚组件样式
├── js/
│   └── components/        # JavaScript组件目录（预留）
├── assets/
│   ├── images/            # 图片资源
│   └── audio/             # 音频资源
├── server.py              # 本地预览服务器
├── start-server.bat       # Windows启动脚本
├── start-server.sh        # Unix/Linux启动脚本
├── .gitignore             # Git忽略文件
└── README.md              # 项目说明文档
```

## 快速开始

### 本地预览

#### 方法1：一键启动（推荐）
- **Windows用户**：双击 `start-server.bat` 文件
- **Mac/Linux用户**：运行 `./start-server.sh`

#### 方法2：命令行启动
```bash
python server.py
```
或
```bash
python3 server.py
```

#### 方法3：使用Python内置服务器
```bash
python -m http.server 8000
```

启动后，浏览器会自动打开 `http://localhost:8000`，你可以实时预览网页效果。

### 开发流程

1. 启动本地服务器
2. 修改HTML或CSS文件
3. 刷新浏览器查看效果
4. 重复步骤2-3直到满意
5. 提交并推送到远程仓库

## 技术栈

- **HTML5** - 页面结构
- **CSS3** - 样式和动画
- **Google Fonts** - 字体资源
  - Inter - 正文字体
  - Plus Jakarta Sans - 标题字体
  - JetBrains Mono - 代码字体

## 开发环境

本项目开发环境：
- **IDE**: 华为 CodeArts IDE
- **Python**: 3.14.1
- **Java**: 1.8.0_451
- **Git**: 2.52.0.windows.1
- **操作系统**: Windows

## 开发日志

### 2026年3月3日

#### 项目重构与优化

**工作内容：**

1. **项目结构模块化重构**
   - 创建了模块化的目录结构
   - 将CSS从HTML中分离到独立文件
   - 按组件拆分样式文件（header、skills、projects、footer）
   - 创建CSS变量文件，便于主题定制

2. **添加项目配置文件**
   - 创建 `.gitignore` 文件，规范版本控制
   - 忽略操作系统生成的文件（.DS_Store、Thumbs.db等）
   - 忽略编辑器配置文件（.vscode、.idea等）
   - 忽略Node.js相关文件（为将来扩展预留）
   - 忽略临时文件和备份文件

3. **本地预览功能**
   - 创建Python本地服务器脚本 `server.py`
   - 创建Windows启动脚本 `start-server.bat`
   - 创建Unix/Linux启动脚本 `start-server.sh`
   - 实现一键启动本地预览功能
   - 自动打开浏览器访问预览页面

4. **开发环境检查**
   - 确认Python 3.14.1环境已配置
   - 确认Java 1.8.0_451环境已配置
   - 确认Git 2.52.0环境已配置
   - 验证CodeArts IDE多语言支持能力

**改进效果：**

- ✅ 代码结构更加清晰，易于维护
- ✅ 样式模块化，便于团队协作
- ✅ 本地预览功能，无需推送即可查看效果
- ✅ 版本控制规范，避免提交不必要的文件
- ✅ 开发效率提升，修改即时可见

**文件变更统计：**
- 新增文件：8个
- 修改文件：1个（index.html）
- 删除内容：从index.html中移除了约300行内联CSS

### 2026年3月3日（下午）

#### 音乐播放器功能增强

**工作内容：**

1. **歌单循环播放功能**
   - 升级音乐播放器，从单曲循环改为歌单循环播放
   - 实现了5首歌曲的播放列表：
     - 希林娜依高 - 微光星海
     - G.E.M.邓紫棋 - 光年之外
     - IU - 에잇
     - 梁静茹 - 情歌
     - 當山みれい - 願い〜あの頃のキミへ〜
   - 添加了自动播放下一首功能
   - 实现了播放列表循环播放

2. **播放状态持久化优化**
   - 保存当前播放曲目索引（localStorage.musicTrack）
   - 保存播放进度（localStorage.musicTime）
   - 保存播放状态（localStorage.musicPlaying）
   - 添加节流机制，每5秒保存一次进度，避免频繁写入

3. **错误处理机制**
   - 添加音频加载错误处理
   - 播放失败时自动尝试下一首
   - 添加控制台错误日志，便于调试

4. **个人信息更新**
   - 更新GitHub链接为真实账号：https://github.com/yi-hang051146
   - 更新邮箱地址为：yihangwhu@petalmail.com
   - 将邮箱链接改为纯文本显示，避免垃圾邮件

5. **音频资源管理**
   - 添加了5首FLAC格式的音乐文件到 `assets/audio/` 目录
   - 优化了HTML中的audio标签结构

**技术实现：**

```javascript
// 歌单配置
const playlist = [
    './assets/audio/希林娜依高-微光星海.flac',
    './assets/audio/G.E.M.邓紫棋-光年之外.flac',
    './assets/audio/IU-에잇.flac',
    './assets/audio/情歌-梁静茹.flac',
    './assets/audio/當山みれい-願い〜あの頃のキミへ〜.flac'
];

// 自动播放下一首
bgMusic.addEventListener('ended', function() {
    playNext();
});
```

**改进效果：**

- ✅ 音乐播放器功能更加完善
- ✅ 支持多首歌曲循环播放
- ✅ 播放状态跨页面保持
- ✅ 错误处理更加健壮
- ✅ 个人信息真实有效

**文件变更统计：**
- 修改文件：2个（index.html, js/main.js）
- 新增目录：1个（assets/audio/）
- 新增音频文件：5个（FLAC格式）

### 2026年3月3日（晚上）

#### 课表展示功能

**工作内容：**

1. **智能课表显示系统**
   - 创建了课表展示模块，根据当前时间自动显示课程信息
   - 实现了三种课程状态识别：
     - 进行中：当前正在上课
     - 即将开始：下一节课
     - 已结束/无课：显示空状态
   - 支持按星期自动切换当日课表

2. **课表数据配置**
   - 配置了完整的周课表数据（周一至周五）
   - 包含课程名称、教室位置、上课时间等信息
   - 课程数据结构清晰，便于后续维护和修改
   - 课程列表：
     - 周一：中国金融特色化专题
     - 周二：随机过程、证券投资分析、动态最优化
     - 周三：衍生金融工具、公司金融
     - 周四：常微分方程、投资学
     - 周五：固定收益证券

3. **自动刷新机制**
   - 每分钟自动刷新课表状态
   - 页面可见性检测：页面隐藏时暂停刷新，节省资源
   - 页面重新可见时立即刷新，确保信息准确

4. **视觉设计优化**
   - 设计了精美的课程卡片样式
   - 进行中的课程使用蓝色高亮边框和渐变背景
   - 未开始的课程使用次要样式，hover时增强
   - 空状态使用虚线边框和图标提示
   - 完全响应式设计，适配移动端

5. **模块化架构**
   - 创建独立的 `js/schedule.js` 模块
   - 创建独立的 `css/components/schedule.css` 样式文件
   - 代码结构清晰，易于维护和扩展

**技术实现：**

```javascript
// 课程状态判断
function getCourseStatus(course, currentTime) {
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const startMinutes = timeToMinutes(course.startTime);
    const endMinutes = timeToMinutes(course.endTime);

    if (currentMinutes < startMinutes) {
        return CourseStatus.UPCOMING;
    } else if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
        return CourseStatus.ONGOING;
    } else {
        return CourseStatus.ENDED;
    }
}

// 页面可见性优化
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        clearInterval(refreshInterval);
    } else {
        refreshSchedule();
        refreshInterval = setInterval(refreshSchedule, 60000);
    }
});
```

**改进效果：**

- ✅ 课表信息实时更新，无需手动刷新
- ✅ 智能识别当前课程状态
- ✅ 视觉设计美观，用户体验优秀
- ✅ 性能优化，节省系统资源
- ✅ 代码模块化，易于维护

**文件变更统计：**
- 新增文件：2个（js/schedule.js, css/components/schedule.css）
- 修改文件：2个（index.html, css/main.css）

### 2026年3月4日

#### 思源笔记渲染器集成

**工作内容：**

1. **思源笔记 .sy 文件渲染器开发**
   - 创建了完整的 `.sy` 文件渲染器 `js/siyuan-renderer.js`
   - 支持渲染思源笔记导出的 JSON 格式文件
   - 仅支持渲染，不支持编辑（符合静态页面需求）

2. **支持的节点类型**
   - `NodeDocument` - 文档节点
   - `NodeHeading` - 标题节点（H1-H6）
   - `NodeParagraph` - 段落节点
   - `NodeList` / `NodeListItem` - 列表节点（有序/无序）
   - `NodeBlockquote` - 引用块节点
   - `NodeMathBlock` - 数学公式块（使用 KaTeX 渲染）
   - `NodeTable` - 表格节点
   - `NodeSuperBlock` - 超级块节点
   - `NodeCodeBlock` - 代码块（使用 highlight.js 高亮）
   - `NodeTextMark` - 文本标记（加粗、斜体、链接、行内公式等）

3. **标题折叠/展开功能**
   - 点击标题可折叠/展开其下内容
   - 添加折叠指示器（▼）
   - CSS 动画过渡效果
   - 事件委托优化性能

4. **性能优化**
   - 使用 `requestAnimationFrame` 避免阻塞主线程
   - 使用 `DocumentFragment` 减少 DOM 重绘次数
   - 事件委托：折叠事件绑定到容器而非每个标题
   - 块引用缓存：避免重复解析

5. **样式系统**
   - 创建 `css/components/siyuan.css` 样式文件
   - 参考 SiYuan Note 源码的 CSS 变量系统
   - 支持深色模式（跟随页面主题）
   - 响应式设计

6. **笔记本集成**
   - 解析并集成 `大三下.sy.zip` 笔记本
   - 笔记本包含"考点观测"等考研数学笔记
   - 添加到 `data/interests.json` 的"学习"分类

7. **依赖集成**
   - KaTeX CDN - 数学公式渲染
   - highlight.js CDN - 代码语法高亮

**技术实现：**

```javascript
// 渲染器核心
const SiyuanRenderer = (function() {
    function render(syData, container) {
        requestAnimationFrame(() => {
            const fragment = document.createDocumentFragment();
            const docElement = renderNode(syData);
            if (docElement) fragment.appendChild(docElement);
            container.appendChild(fragment);
            
            if (config.collapsible) {
                bindCollapseEvents(container);
            }
        });
    }
    
    // 支持多种节点类型渲染
    function renderNode(node) {
        switch (node.Type) {
            case 'NodeHeading': return renderHeading(node);
            case 'NodeMathBlock': return renderMathBlock(node);
            // ... 更多节点类型
        }
    }
    
    return { render, loadAndRender, getTitle, configure };
})();
```

**改进效果：**

- ✅ 支持在网页中展示思源笔记内容
- ✅ 标题可折叠/展开，便于阅读长文档
- ✅ 数学公式正确渲染（KaTeX）
- ✅ 代码块语法高亮（highlight.js）
- ✅ 性能优化，大文档不卡顿
- ✅ 样式美观，与页面风格一致

**文件变更统计：**
- 新增文件：2个（js/siyuan-renderer.js, css/components/siyuan.css）
- 修改文件：3个（index.html, js/interests.js, data/interests.json）
- 新增目录：1个（data/notes/大三下/）
- 新增笔记文件：8个（.sy 文件）

#### 笔记本多笔记标签页

**工作内容：**

1. **笔记本标签页切换**
   - 支持 `hasSiyuanNotebook` 配置项，用于展示包含多个笔记的笔记本
   - 自动读取 `sort.json` 获取笔记列表并排序
   - 标签页界面，点击切换不同笔记

2. **配置方式**
   ```json
   {
     "title": "大三下考点观测",
     "hasSiyuanNotebook": true,
     "siyuanNotebookPath": "./data/notes/大三下"
   }
   ```

3. **标签页样式**
   - 响应式设计，自动换行
   - 激活状态高亮
   - 平滑切换动画

**改进效果：**

- ✅ 支持笔记本多笔记展示
- ✅ 标签页快速切换
- ✅ 自动加载笔记列表

#### 块引用点击展开

**工作内容：**

1. **块引用展开功能**
   - 点击 `block-ref` 引用链接可展开显示子笔记内容
   - 再次点击可收起
   - 自动查找子笔记路径（支持多级目录）

2. **路径查找逻辑**
   - 尝试 `{basePath}/{refId}.sy`
   - 尝试 `{basePath}/{refId}/{refId}.sy`
   - 遍历子目录查找 `{parentPath}/{dirId}/{refId}.sy`

3. **展开样式**
   - 左侧紫色边框标识
   - 滑入动画效果
   - 缩进显示层级关系

**技术实现：**

```javascript
// 块引用点击处理
async function handleBlockRefClick(e) {
    const blockRef = e.target.closest('.sy-block-ref');
    if (!blockRef) return;
    
    const refId = blockRef.getAttribute('data-ref-id');
    // 查找并加载引用的笔记
    const expandDiv = document.createElement('div');
    expandDiv.className = 'sy-ref-expanded';
    blockRef.after(expandDiv);
    
    // 尝试多种路径加载
    for (const path of possiblePaths) {
        const response = await fetch(path);
        if (response.ok) {
            SiyuanRenderer.loadAndRender(path, expandDiv);
            break;
        }
    }
}
```

**改进效果：**

- ✅ 点击引用可展开子笔记内容
- ✅ 支持多级目录查找
- ✅ 再次点击可收起
- ✅ 动画效果流畅

**文件变更统计：**
- 修改文件：3个（js/interests.js, js/siyuan-renderer.js, css/components/siyuan.css）

#### 嵌套标签页展示子笔记

**工作内容：**

1. **嵌套标签页方案**
   - 撤销方案B（块引用点击展开），改用方案A（嵌套标签页）
   - 一级标签页显示笔记本根目录下的所有笔记
   - 二级标签页显示子目录中的笔记
   - 层级清晰，导航方便

2. **自动检测子笔记**
   - 检测 `{noteId}/.siyuan/sort.json` 获取子笔记列表
   - 为子目录创建 `sort.json` 文件
   - 支持子笔记排序

3. **界面效果**
   ```
   ┌─────────────────────────────────────────────────────────┐
   │  [高数] [微分方程] [考点观测 ▼] [动态最优化]              │  ← 一级标签页
   ├─────────────────────────────────────────────────────────┤
   │  [渐近线] [偏导数] [变上限积分] [矩阵]...                 │  ← 二级标签页
   ├─────────────────────────────────────────────────────────┤
   │                   当前选中笔记的内容                      │
   └─────────────────────────────────────────────────────────┘
   ```

4. **样式优化**
   - 二级标签页使用浅色背景区分
   - 带子笔记的标签显示下拉箭头标识
   - 响应式设计，移动端自动换行

**技术实现：**

```javascript
// 加载子目录中的笔记
async function loadSubDirectoryNotes(subDirPath, basePath) {
    const subNotes = [];
    const subSortUrl = `${subDirPath}/.siyuan/sort.json`;
    const subSortResponse = await fetch(subSortUrl);
    
    if (subSortResponse.ok) {
        const subSortData = await subSortResponse.json();
        for (const [noteId, sortOrder] of Object.entries(subSortData)) {
            const notePath = `${subDirPath}/${noteId}.sy`;
            // 加载笔记信息...
            subNotes.push({ id: noteId, title, path: notePath, order: sortOrder });
        }
    }
    return subNotes;
}
```

**改进效果：**

- ✅ 层级清晰，一级/二级标签页分离
- ✅ 自动检测并加载子笔记
- ✅ 导航方便，快速切换
- ✅ 移除了无效的块引用点击提示

**文件变更统计：**
- 修改文件：2个（js/interests.js, css/components/siyuan.css）
- 新增文件：1个（data/notes/大三下/20260214081507-0j2zcju/.siyuan/sort.json）

#### 加载体验优化

**工作内容：**

1. **移除冗余模块**
   - 移除"关于我"部分
   - 移除"技能"部分
   - 简化页面结构，聚焦核心内容

2. **加载状态提示**
   - 卡片加载时显示旋转动画
   - 加载失败显示详细错误信息（HTTP状态码）
   - 添加重试按钮，支持一键重试

3. **错误处理改进**
   - 笔记本加载失败显示请求路径和状态码
   - 每个笔记加载失败都有控制台警告日志
   - 添加详细的调试信息

4. **界面效果**
   ```
   加载中：
     ⟳ 加载中...

   加载失败：
     ⚠️ 数据加载失败
     错误: HTTP 404
     [重试]
   ```

**改进效果：**

- ✅ 页面更简洁，移除冗余内容
- ✅ 加载状态清晰可见
- ✅ 错误信息详细，便于排查问题
- ✅ 支持重试，提升用户体验

**文件变更统计：**
- 修改文件：4个（index.html, js/interests.js, css/components/interests.css, css/components/siyuan.css）

### 2026年3月5日

#### 跨设备加载问题修复

**工作内容：**

1. **中文路径编码问题**
   - 问题：`./data/notes/大三下/.siyuan/sort.json` 在其他设备上返回 HTTP 404
   - 原因：URL 编码问题，中文路径在不同环境下处理不一致
   - 解决：将 `大三下` 目录重命名为 `junior-spring`
   - 更新 `interests.json` 中的路径配置

2. **重试按钮嵌套问题**
   - 问题：点击重试按钮会创建嵌套的错误框
   - 原因：事件委托逻辑有误，`e.target.closest('.sy-notebook-container')` 找不到正确容器
   - 解决：使用 `data-*` 属性存储路径信息，优化事件处理逻辑

**改进效果：**

- ✅ 跨设备加载正常
- ✅ 重试按钮不再产生嵌套错误框

**文件变更统计：**
- 重命名目录：`data/notes/大三下` → `data/notes/junior-spring`
- 修改文件：2个（js/interests.js, data/interests.json）

#### CDN 资源异步加载

**工作内容：**

1. **性能优化**
   - 问题：KaTeX 和 highlight.js CDN 加载慢，阻塞页面渲染
   - 解决：添加 `async` 属性，使 CDN 资源异步加载
   - 效果：核心脚本不再被外部资源阻塞

**文件变更统计：**
- 修改文件：1个（index.html）

#### JavaScript 语法错误修复

**工作内容：**

1. **大括号不匹配问题**
   - 问题：`interests.js` 第 272 行报错 `Unexpected identifier '

- [x] 添加JavaScript交互功能（音乐播放器已完成）
- [ ] 实现深色模式切换
- [ ] 添加更多页面（博客、项目详情等）
- [ ] 集成构建工具（Webpack/Vite）
- [ ] 添加SEO优化
- [ ] 实现多语言支持
- [ ] 添加音乐播放器可视化效果
- [ ] 实现音乐播放列表管理界面

## 许可证

© 2024 Ham. All rights reserved.

## 联系方式

- GitHub: [yi-hang051146](https://github.com/yi-hang051146)
- Email: yihangwhu@petalmail.com
`
   - 原因：之前编辑遗留了重复的代码块和多余的 `};`
   - 解决：删除重复代码，修复大括号匹配

2. **调试日志添加**
   - 添加详细的 `console.log` 日志，便于定位问题
   - 日志覆盖：初始化、数据加载、卡片渲染、事件绑定

**改进效果：**

- ✅ JavaScript 语法错误修复
- ✅ 调试日志便于问题排查

**文件变更统计：**
- 修改文件：1个（js/interests.js）

#### 浏览器缓存问题修复

**工作内容：**

1. **强制刷新缓存**
   - 问题：华为 IDE 无法使用 Ctrl+Shift+R 强制刷新
   - 解决：给 `interests.json` 请求添加时间戳参数 `?v=Date.now()`
   - 效果：每次请求都绕过浏览器缓存

**技术实现：**

```javascript
const response = await fetch('./data/interests.json?v=' + Date.now());
```

**改进效果：**

- ✅ 无需手动清除缓存
- ✅ 数据更新即时生效

**文件变更统计：**
- 修改文件：1个（js/interests.js）

#### 卡片排序优化

**工作内容：**

1. **调整卡片顺序**
   - 将"学习"和"考研"卡片移到最前面
   - 顺序：学习 → 考研 → 电影 → 音乐 → UP主 → 游戏 → 其它

**文件变更统计：**
- 修改文件：1个（data/interests.json）

#### Frontend Design 全面优化

**工作内容：**

1. **设计系统升级 (variables.css)**
   - 扩展完整的色彩系统，包括渐变、阴影、间距等设计令牌
   - 添加深色模式支持（自动检测系统偏好）
   - 建立统一的动画时长和缓动函数系统
   - 创建可复用的设计变量（圆角、间距、阴影层级等）
   - 新增渐变系统：`--gradient-primary`、`--gradient-secondary`、`--gradient-accent`
   - 新增阴影系统：从 `--shadow-xs` 到 `--shadow-xl` 的完整层级

2. **视觉层次增强 (main.css)**
   - 添加动态背景装饰（渐变光晕效果，使用 `::before` 和 `::after` 伪元素）
   - 实现页面元素的渐入动画（`fadeInUp` 动画）
   - 优化排版系统，标题使用渐变文字效果
   - 增强按钮的微交互（光泽扫过效果、图标旋转动画）
   - Section 标签添加动态下划线动画

3. **Header 组件优化 (header.css)**
   - 头像添加脉冲光环效果（`pulse-ring` 动画）
   - 头像添加闪烁效果（`shimmer` 动画）
   - 标题使用渐变文字和动态下划线
   - 状态指示器增强悬停交互效果
   - 所有元素都有精心设计的入场动画（延迟加载效果）

4. **卡片系统升级 (interests.css)**
   - 卡片添加顶部渐变条动画（hover 时展开）
   - 实现错落有致的入场动画（每个卡片延迟 0.05s）
   - 图标悬停时有弹跳旋转效果（使用 `--ease-bounce` 缓动）
   - 计数徽章使用渐变背景替代纯色
   - 卡片 hover 时添加边框光晕效果

5. **模态框优化 (interests.css)**
   - 增强背景模糊效果（`backdrop-filter: blur(8px)`）
   - 添加底部渐变装饰线
   - 关闭按钮悬停时有旋转 90° 动画
   - 内容项添加左侧渐变条动画
   - 内容项 hover 时有横向位移效果

6. **音乐播放器升级 (music-player.css)**
   - 使用渐变背景替代纯色背景
   - 添加涟漪扩散动画（`ripple` 动画）
   - 播放时有脉冲呼吸效果
   - 悬停时有旋转和缩放动画
   - 播放按钮尺寸增大（48px → 56px）

**设计风格：**

采用 **Minimalist Modern** 设计风格，核心特点：
- **Electric Blue 渐变主题**：使用 #0052FF 到 #7B9CFF 的渐变贯穿整个设计
- **流畅的动画系统**：所有动画都使用精心调校的缓动函数
- **深色模式支持**：自动适配系统深色模式偏好
- **微交互细节**：每个可交互元素都有细腻的反馈动画
- **视觉层次清晰**：通过阴影、边框、渐变建立明确的层次关系

**技术实现：**

```css
/* 渐变系统 */
--gradient-primary: linear-gradient(135deg, #0052FF 0%, #4D7CFF 50%, #7B9CFF 100%);

/* 动画系统 */
--duration-fast: 150ms;
--duration-normal: 250ms;
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

/* 深色模式 */
@media (prefers-color-scheme: dark) {
    :root {
        --background: #0A0E1A;
        --foreground: #F8FAFC;
        /* ... */
    }
}
```

**改进效果：**

- ✅ 视觉设计更加现代、精致、富有活力
- ✅ 动画流畅自然，用户体验优秀
- ✅ 深色模式自动适配，保护用户视力
- ✅ 微交互细腻，每个操作都有反馈
- ✅ 性能优化，动画不卡顿
- ✅ 响应式设计完善，移动端体验优秀

**文件变更统计：**
- 修改文件：5个（css/variables.css, css/main.css, css/components/header.css, css/components/interests.css, css/components/music-player.css）

## 后续计划

- [x] 添加JavaScript交互功能（音乐播放器已完成）
- [x] 思源笔记卡片渲染器（已完成）
- [ ] 实现深色模式切换
- [ ] 添加更多页面（博客、项目详情等）
- [ ] 集成构建工具（Webpack/Vite）
- [ ] 添加SEO优化
- [ ] 实现多语言支持
- [ ] 添加音乐播放器可视化效果
- [ ] 实现音乐播放列表管理界面

### 2026年3月5日（下午）

#### 思源笔记卡片渲染器重构

**工作内容：**

1. **全新思源卡片渲染器**
   - 参考思源原生渲染方案，重新设计渲染器架构
   - 创建独立的 `js/siyuan-card.js` 模块
   - 创建独立的 `css/components/siyuan-card.css` 样式文件
   - 采用思源风格的 CSS 变量系统（`--sy-*` 前缀）

2. **文档树导航功能**
   - 左侧显示笔记本和文档树结构
   - 支持笔记本展开/折叠
   - 支持子文档嵌套显示
   - 点击文档即可在右侧查看内容

3. **支持的节点类型**
   - `NodeDocument` - 文档节点
   - `NodeHeading` - 标题节点（H1-H6，支持折叠/展开）
   - `NodeParagraph` - 段落节点
   - `NodeList` / `NodeListItem` - 列表节点
   - `NodeBlockquote` - 引用块
   - `NodeMathBlock` - 数学公式块（KaTeX 渲染）
   - `NodeCodeBlock` - 代码块（highlight.js 高亮）
   - `NodeTable` - 表格
   - `NodeThematicBreak` - 分隔线
   - `NodeSuperBlock` - 超级块
   - `NodeTextMark` - 文本标记（加粗、斜体、链接、块引用、标签等）

4. **数据本地化**
   - 将思源数据从 `D:\SiYuan\data` 复制到仓库 `data/siyuan/` 目录
   - 避免与思源软件运行时数据冲突
   - 数据结构：
     ```
     data/siyuan/20260303125754-igehgl8/
     ├── .siyuan/
     │   ├── conf.json      # 笔记本配置
     │   └── sort.json      # 文档排序
     ├── *.sy               # 根目录文档
     └── 20260214081507-0j2zcju/  # 子目录
         └── *.sy           # 子文档
     ```

5. **样式系统**
   - 参考思源原生 CSS 变量系统
   - 支持深色模式（自动检测系统偏好）
   - 响应式设计，移动端自适应
   - 完整的文档树和内容区样式

6. **调试日志系统**
   - 添加详细的 `console.log` 日志
   - 覆盖：模块加载、初始化、数据获取、渲染等关键步骤
   - 便于问题排查和调试

**技术实现：**

```javascript
// 思源卡片模块
const SiyuanCard = (function() {
    // 已知的目录结构（避免不必要的 404 请求）
    const knownStructure = {
        '20260303125754-igehgl8': {
            name: '大三下',
            subDirs: ['20260214081507-0j2zcju'],
            childDocs: {
                '20260214081507-0j2zcju': [
                    '20260214214126-ot1y6sc',  // 渐近线
                    '20260214223131-27ze0lr',  // 六个基本的指对函数
                    // ...
                ]
            }
        }
    };
    
    // 渲染节点
    function renderNode(node) {
        switch (node.Type) {
            case 'NodeHeading': return renderHeading(node);
            case 'NodeMathBlock': return renderMathBlock(node);
            // ...
        }
    }
    
    return { init, loadNotebooks, loadDocument };
})();
```

**界面效果：**

```
┌─────────────────────────────────────────────────────────────┐
│  📄 思源                                              [刷新] │
├──────────────────┬──────────────────────────────────────────┤
│ 文档树           │ 大三下 / 高数                             │
│                  ├──────────────────────────────────────────┤
│ ▼ 📁 大三下      │                                          │
│   📄 高数        │ # 高数                                    │
│   📄 微分方程    │                                          │
│   ▶ 📁 考点观测  │ ## 2026-01-19 11:51:46                   │
│   📄 动态最优化  │                                          │
│                  │ 三种类型：                                │
│                  │ 1. 水平渐近线...                          │
│                  │                                          │
└──────────────────┴──────────────────────────────────────────┘
```

**改进效果：**

- ✅ 文档树导航，快速切换文档
- ✅ 子文档嵌套显示，层级清晰
- ✅ 标题折叠/展开，便于阅读长文档
- ✅ 数学公式正确渲染（KaTeX）
- ✅ 代码块语法高亮（highlight.js）
- ✅ 数据本地化，不与思源软件冲突
- ✅ 深色模式支持
- ✅ 响应式设计
- ✅ 调试日志完善

**文件变更统计：**
- 新增文件：2个（js/siyuan-card.js, css/components/siyuan-card.css）
- 新增目录：1个（data/siyuan/20260303125754-igehgl8/）
- 新增数据文件：16个（.sy 文件 + 配置文件）
- 修改文件：3个（index.html, css/main.css, server.py）

## 许可证

© 2024 Ham. All rights reserved.

## 联系方式

- GitHub: [yi-hang051146](https://github.com/yi-hang051146)
- Email: yihangwhu@petalmail.com
