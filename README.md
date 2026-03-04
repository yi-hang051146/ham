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

## 后续计划

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
