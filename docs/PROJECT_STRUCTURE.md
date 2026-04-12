# 项目结构说明

## 目录组织

```
my-homepage/
├── docs/                    # 文档目录
│   ├── PROJECT_STRUCTURE.md # 项目结构说明
│   └── API.md              # API 文档
├── public/                  # 静态资源（不经过构建处理）
├── scripts/                 # 工具脚本
│   ├── file_converter.py   # 文件转换工具（markitdown）
│   ├── generate_siyuan_data.py  # 数据生成脚本
│   └── import_to_siyuan.py # 导入思源笔记工具
├── src/
│   ├── assets/             # 静态资源（经过构建处理）
│   │   ├── images/         # 图片资源
│   │   └── icons/          # 图标资源
│   ├── components/         # Vue 组件
│   │   ├── layout/         # 布局组件
│   │   ├── notes/          # 笔记相关组件
│   │   └── timetable/      # 课表相关组件
│   ├── composables/        # Vue 组合式函数
│   ├── data/               # 静态数据
│   ├── services/           # 服务层（API 调用）
│   │   ├── siyuan.js       # 思源笔记服务
│   │   └── api.js          # 通用 API 服务
│   ├── styles/             # 样式文件
│   │   ├── variables.css   # CSS 变量
│   │   ├── theme.css       # 主题样式
│   │   └── utilities.css   # 工具类样式
│   ├── utils/              # 工具函数
│   │   ├── markdown.js     # Markdown 处理
│   │   ├── format.js       # 格式化工具
│   │   └── validate.js     # 验证工具
│   ├── views/              # 页面视图（未来扩展）
│   ├── App.vue             # 根组件
│   └── main.js             # 入口文件
├── tests/                  # 测试文件
│   ├── unit/               # 单元测试
│   └── e2e/                # 端到端测试
├── .gitignore              # Git 忽略配置
├── index.html              # HTML 入口
├── package.json            # 项目配置
├── vite.config.js          # Vite 配置
└── README.md               # 项目说明
```

## 模块职责

### 1. components/ - 组件层
- **layout/**: 页面布局组件（头部、侧边栏、页脚等）
- **notes/**: 笔记功能相关组件
- **timetable/**: 课表功能相关组件

### 2. composables/ - 组合式函数
- 封装可复用的逻辑
- 如：`useClassReminder.js`（课表提醒逻辑）

### 3. services/ - 服务层
- **siyuan.js**: 思源笔记 API 封装
- **api.js**: 通用 HTTP 请求封装
- 负责与后端/外部 API 交互

### 4. utils/ - 工具函数
- **markdown.js**: Markdown 渲染和处理
- **format.js**: 数据格式化
- **validate.js**: 数据验证

### 5. data/ - 静态数据
- 存放预生成的静态数据
- 如：`siyuan.js`（思源笔记数据）

### 6. scripts/ - 工具脚本
- Python 脚本用于数据处理和转换
- 如：文件转换、数据导入等

## 扩展建议

### 添加新功能模块
1. 在 `src/components/` 下创建功能目录
2. 在 `src/services/` 中添加对应服务
3. 在 `src/composables/` 中封装逻辑
4. 在 `src/utils/` 中添加工具函数

### 添加新页面
1. 在 `src/views/` 中创建页面组件
2. 在 `src/components/layout/` 中调整布局
3. 更新路由配置（如需要）

### 添加新工具
1. 在 `scripts/` 中创建 Python 脚本
2. 在 `docs/` 中添加使用说明
3. 更新 README.md

## 最佳实践

1. **组件命名**: 使用 PascalCase（如 `AppHeader.vue`）
2. **服务命名**: 使用 camelCase（如 `siyuanService.js`）
3. **工具函数**: 使用 camelCase（如 `formatDate.js`）
4. **样式隔离**: 使用 `scoped` 样式
5. **类型提示**: 考虑使用 TypeScript 或 JSDoc
