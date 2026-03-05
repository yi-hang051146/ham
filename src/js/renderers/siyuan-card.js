/**
 * 思源笔记卡片渲染器
 * 参考: siyuan/app/src/protyle/
 *
 * 功能特性：
 * - 文档树导航
 * - 思源风格渲染
 * - 标题折叠/展开
 * - 请求缓存
 * - 并行加载
 */

const SiyuanCard = (function() {
    'use strict';

    // 获取基础路径（支持 GitHub Pages 子目录）
    function getBasePath() {
        const path = window.location.pathname;
        // 如果是 GitHub Pages 子目录（如 /ham/），返回子目录路径
        if (path !== '/' && path.endsWith('/')) {
            return path.slice(0, -1);
        }
        // 如果是 index.html 结尾
        if (path.endsWith('index.html')) {
            return path.substring(0, path.lastIndexOf('/'));
        }
        return '';
    }

    // 配置
    let config = {
        notebookPath: getBasePath() + '/data/siyuan',
        defaultNotebook: '20260303125754-igehgl8',
    };

    // 状态
    let state = {
        currentNotebook: null,
        currentDoc: null,
        expandedNodes: new Set(),
    };

    // 文档缓存
    const docCache = new Map();

    // 已知的目录结构
    const knownStructure = {
        '20260303125754-igehgl8': {
            name: '大三下',
            subDirs: ['20260214081507-0j2zcju'],
            childDocs: {
                '20260214081507-0j2zcju': [
                    '20260214214126-ot1y6sc',
                    '20260214223131-27ze0lr',
                    '20260214225220-6tab0f8',
                    '20260215135533-yym375g',
                    '20260215152537-mz9li80',
                    '20260215153352-rf286lw',
                    '20260305143459-uj111aq'
                ]
            }
        }
    };

    /**
     * 初始化
     */
    function init(container, options = {}) {
        config = { ...config, ...options };

        // 创建卡片结构
        container.innerHTML = `
            <div class="sy-card">
                <div class="sy-card-header">
                    <div class="sy-card-title">
                        <svg class="sy-card-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                        </svg>
                        <span>思源</span>
                    </div>
                    <div class="sy-card-actions">
                        <button class="sy-btn sy-btn-icon" id="sy-refresh" title="刷新">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="sy-card-body">
                    <div class="sy-sidebar">
                        <div class="sy-tree-header">
                            <span>文档树</span>
                        </div>
                        <div class="sy-tree-container" id="sy-tree">
                            <div class="sy-loading">加载中...</div>
                        </div>
                    </div>
                    <div class="sy-content">
                        <div class="sy-content-header">
                            <div class="sy-breadcrumb" id="sy-breadcrumb"></div>
                        </div>
                        <div class="sy-content-body" id="sy-content">
                            <div class="sy-empty">请从左侧选择文档</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        bindEvents(container);
        loadNotebooks();
    }

    /**
     * 绑定事件
     */
    function bindEvents(container) {
        // 刷新按钮
        const refreshBtn = container.querySelector('#sy-refresh');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                clearCache();
                loadNotebooks();
            });
        }

        // 文档树点击事件（事件委托）
        const treeContainer = container.querySelector('#sy-tree');
        if (treeContainer) {
            treeContainer.addEventListener('click', (e) => {
                const treeItem = e.target.closest('.sy-tree-item');
                if (!treeItem) return;

                const toggle = e.target.closest('.sy-tree-toggle');
                if (toggle) {
                    toggleTreeNode(treeItem);
                    return;
                }

                const docId = treeItem.dataset.docId;
                const notebookId = treeItem.dataset.notebookId;
                if (docId && notebookId) {
                    loadDocument(notebookId, docId);
                    setActiveTreeItem(treeItem);
                }
            });
        }
    }

    /**
     * 加载笔记本列表
     */
    async function loadNotebooks() {
        const treeContainer = document.getElementById('sy-tree');
        if (!treeContainer) return;

        treeContainer.innerHTML = '<div class="sy-loading">加载中...</div>';

        try {
            const notebooks = await fetchNotebooks();

            if (notebooks.length === 0) {
                treeContainer.innerHTML = '<div class="sy-empty">暂无笔记本</div>';
                return;
            }

            // 渲染笔记本列表
            let html = '<ul class="sy-tree">';
            for (const notebook of notebooks) {
                html += `
                    <li class="sy-tree-item sy-tree-notebook" data-notebook-id="${notebook.id}">
                        <span class="sy-tree-toggle">
                            <svg class="sy-tree-arrow" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                            </svg>
                        </span>
                        <svg class="sy-tree-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
                        </svg>
                        <span class="sy-tree-text">${notebook.name}</span>
                    </li>
                    <ul class="sy-tree-children" data-parent="${notebook.id}" style="display: none;"></ul>
                `;
            }
            html += '</ul>';
            treeContainer.innerHTML = html;

            // 绑定笔记本展开事件
            treeContainer.querySelectorAll('.sy-tree-notebook').forEach(item => {
                const toggle = item.querySelector('.sy-tree-toggle');
                if (toggle) {
                    toggle.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        const notebookId = item.dataset.notebookId;

                        const childrenContainer = treeContainer.querySelector(`ul[data-parent="${notebookId}"]`);

                        if (item.classList.contains('sy-tree-expanded')) {
                            item.classList.remove('sy-tree-expanded');
                            childrenContainer.style.display = 'none';
                        } else {
                            item.classList.add('sy-tree-expanded');
                            childrenContainer.style.display = 'block';

                            if (childrenContainer.children.length === 0) {
                                await loadNotebookDocs(notebookId, childrenContainer);
                            }
                        }
                    });
                }
            });

        } catch (error) {
            console.error('[SiyuanCard] 加载笔记本失败:', error);
            treeContainer.innerHTML = `<div class="sy-error">加载失败: ${error.message}</div>`;
        }
    }

    /**
     * 加载笔记本内的文档列表（并行加载）
     */
    async function loadNotebookDocs(notebookId, container) {
        container.innerHTML = '<div class="sy-loading">加载中...</div>';

        try {
            const docs = await fetchNotebookDocs(notebookId);

            if (docs.length === 0) {
                container.innerHTML = '<li class="sy-tree-empty">暂无文档</li>';
                return;
            }

            let html = '';
            for (const doc of docs) {
                html += renderTreeItem(doc, notebookId, 0);
            }
            container.innerHTML = html;

        } catch (error) {
            console.error('[SiyuanCard] 加载文档列表失败:', error);
            container.innerHTML = '<li class="sy-error">加载失败</li>';
        }
    }

    /**
     * 渲染树节点
     */
    function renderTreeItem(doc, notebookId, depth) {
        const hasChildren = doc.children && doc.children.length > 0;
        const indent = depth * 18;

        let html = `
            <li class="sy-tree-item ${hasChildren ? 'sy-tree-has-children' : ''}"
                data-doc-id="${doc.id}"
                data-notebook-id="${notebookId}"
                style="--sy-indent: ${indent}px">
                <span class="sy-tree-toggle ${hasChildren ? '' : 'sy-tree-toggle-hidden'}">
                    <svg class="sy-tree-arrow" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                    </svg>
                </span>
                <svg class="sy-tree-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                </svg>
                <span class="sy-tree-text">${doc.title}</span>
            </li>
        `;

        if (hasChildren) {
            html += `<ul class="sy-tree-children" data-parent="${doc.id}" style="display: none;">`;
            for (const child of doc.children) {
                html += renderTreeItem(child, notebookId, depth + 1);
            }
            html += '</ul>';
        }

        return html;
    }

    /**
     * 切换树节点展开/折叠
     */
    function toggleTreeNode(item) {
        const docId = item.dataset.docId || item.dataset.notebookId;
        const childrenContainer = item.nextElementSibling;

        if (!childrenContainer || !childrenContainer.classList.contains('sy-tree-children')) {
            return;
        }

        if (item.classList.contains('sy-tree-expanded')) {
            item.classList.remove('sy-tree-expanded');
            childrenContainer.style.display = 'none';
            state.expandedNodes.delete(docId);
        } else {
            item.classList.add('sy-tree-expanded');
            childrenContainer.style.display = 'block';
            state.expandedNodes.add(docId);
        }
    }

    /**
     * 设置当前选中的树节点
     */
    function setActiveTreeItem(item) {
        document.querySelectorAll('.sy-tree-item').forEach(i => {
            i.classList.remove('sy-tree-active');
        });
        item.classList.add('sy-tree-active');
    }

    /**
     * 加载文档内容（带缓存）
     */
    async function loadDocument(notebookId, docId) {
        const contentContainer = document.getElementById('sy-content');
        const breadcrumbContainer = document.getElementById('sy-breadcrumb');

        if (!contentContainer) return;

        contentContainer.innerHTML = '<div class="sy-loading">加载中...</div>';

        try {
            const docData = await fetchDocument(notebookId, docId);

            // 更新面包屑
            if (breadcrumbContainer) {
                breadcrumbContainer.innerHTML = `
                    <span class="sy-breadcrumb-item">${docData.notebookName || '笔记本'}</span>
                    <span class="sy-breadcrumb-separator">/</span>
                    <span class="sy-breadcrumb-item sy-breadcrumb-current">${docData.title}</span>
                `;
            }

            // 渲染文档内容
            renderDocument(docData, contentContainer);

        } catch (error) {
            console.error('[SiyuanCard] 加载文档失败:', error);
            contentContainer.innerHTML = `<div class="sy-error">加载失败: ${error.message}</div>`;
        }
    }

    /**
     * 渲染文档内容
     */
    function renderDocument(docData, container) {
        if (typeof SiyuanRenderer !== 'undefined') {
            SiyuanRenderer.render(docData, container);
        } else {
            container.innerHTML = '<div class="sy-error">渲染器未加载</div>';
        }
    }

    // ==================== 数据获取函数 ====================

    /**
     * 获取笔记本列表
     */
    async function fetchNotebooks() {
        const notebookId = config.defaultNotebook;
        const confUrl = `${config.notebookPath}/${notebookId}/.siyuan/conf.json`;

        const response = await fetch(confUrl);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const confData = await response.json();

        return [{ id: notebookId, name: confData.name || '笔记本' }];
    }

    /**
     * 获取笔记本内的文档列表（并行加载）
     */
    async function fetchNotebookDocs(notebookId) {
        const sortUrl = `${config.notebookPath}/${notebookId}/.siyuan/sort.json`;

        const sortResponse = await fetch(sortUrl);
        if (!sortResponse.ok) {
            throw new Error(`HTTP ${sortResponse.status}`);
        }
        const sortData = await sortResponse.json();

        const docs = [];
        const docIds = Object.keys(sortData);
        const structure = knownStructure[notebookId];

        // 收集所有子文档 ID
        const allChildDocIds = new Set();
        if (structure && structure.childDocs) {
            for (const parentId of Object.keys(structure.childDocs)) {
                for (const childId of structure.childDocs[parentId]) {
                    allChildDocIds.add(childId);
                }
            }
        }

        // 并行加载文档
        const loadPromises = [];

        for (const docId of docIds) {
            if (allChildDocIds.has(docId)) continue;

            loadPromises.push(
                (async () => {
                    try {
                        const docUrl = `${config.notebookPath}/${notebookId}/${docId}.sy`;
                        let docResponse = await fetch(docUrl);

                        if (!docResponse.ok && structure && structure.subDirs) {
                            for (const subDir of structure.subDirs) {
                                const subDocUrl = `${config.notebookPath}/${notebookId}/${subDir}/${docId}.sy`;
                                docResponse = await fetch(subDocUrl);
                                if (docResponse.ok) break;
                            }
                        }

                        if (!docResponse.ok) return null;

                        const docData = await docResponse.json();
                        const children = await fetchChildDocs(notebookId, docId);

                        return {
                            id: docId,
                            title: docData.Properties?.title || '未命名',
                            children: children
                        };
                    } catch (e) {
                        console.warn('[SiyuanCard] 加载文档失败', docId, e);
                        return null;
                    }
                })()
            );
        }

        const results = await Promise.all(loadPromises);

        // 过滤掉失败的请求
        for (const doc of results) {
            if (doc) {
                docs.push(doc);
            }
        }

        return docs;
    }

    /**
     * 获取子文档列表
     */
    async function fetchChildDocs(notebookId, parentId) {
        const children = [];
        const structure = knownStructure[notebookId];

        if (structure && structure.childDocs && structure.childDocs[parentId]) {
            // 并行加载子文档
            const loadPromises = structure.childDocs[parentId].map(async (childId) => {
                try {
                    const docUrl = `${config.notebookPath}/${notebookId}/${parentId}/${childId}.sy`;
                    const docResponse = await fetch(docUrl);

                    if (docResponse.ok) {
                        const docData = await docResponse.json();
                        return {
                            id: childId,
                            title: docData.Properties?.title || '未命名',
                            children: []
                        };
                    }
                } catch (e) {
                    // 忽略
                }
                return null;
            });

            const results = await Promise.all(loadPromises);
            for (const child of results) {
                if (child) {
                    children.push(child);
                }
            }
        }

        return children;
    }

    /**
     * 获取文档内容（带缓存）
     */
    async function fetchDocument(notebookId, docId) {
        const cacheKey = `${notebookId}/${docId}`;

        if (docCache.has(cacheKey)) {
            return docCache.get(cacheKey);
        }

        let docUrl = `${config.notebookPath}/${notebookId}/${docId}.sy`;
        let response = await fetch(docUrl);

        // 尝试子目录
        if (!response.ok) {
            const structure = knownStructure[notebookId];
            if (structure && structure.subDirs) {
                for (const subDir of structure.subDirs) {
                    docUrl = `${config.notebookPath}/${notebookId}/${subDir}/${docId}.sy`;
                    response = await fetch(docUrl);
                    if (response.ok) break;
                }
            }
        }

        // 尝试子文档目录
        if (!response.ok) {
            const structure = knownStructure[notebookId];
            if (structure && structure.childDocs) {
                for (const parentId of Object.keys(structure.childDocs)) {
                    docUrl = `${config.notebookPath}/${notebookId}/${parentId}/${docId}.sy`;
                    response = await fetch(docUrl);
                    if (response.ok) break;
                }
            }
        }

        if (!response.ok) {
            throw new Error('文档不存在');
        }

        const docData = await response.json();

        // 获取笔记本名称
        try {
            const confUrl = `${config.notebookPath}/${notebookId}/.siyuan/conf.json`;
            const confResponse = await fetch(confUrl);
            const confData = await confResponse.json();
            docData.notebookName = confData.name;
        } catch (e) {
            docData.notebookName = '笔记本';
        }

        // 缓存
        docCache.set(cacheKey, docData);

        return docData;
    }

    /**
     * 清除缓存
     */
    function clearCache() {
        docCache.clear();
        if (typeof SiyuanRenderer !== 'undefined') {
            SiyuanRenderer.clearCache();
        }
    }

    // 公开 API
    return {
        init,
        loadNotebooks,
        loadDocument,
        renderDocument,
        clearCache,
        configure: (options) => { Object.assign(config, options); }
    };
})();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SiyuanCard;
} else if (typeof window !== 'undefined') {
    window.SiyuanCard = SiyuanCard;
}
