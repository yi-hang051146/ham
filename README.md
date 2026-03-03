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

## 后续计划

- [ ] 添加JavaScript交互功能
- [ ] 实现深色模式切换
- [ ] 添加更多页面（博客、项目详情等）
- [ ] 集成构建工具（Webpack/Vite）
- [ ] 添加SEO优化
- [ ] 实现多语言支持

## 许可证

© 2024 Ham. All rights reserved.

## 联系方式

- GitHub: [yourusername](https://github.com/yourusername)
- Email: your@email.com
