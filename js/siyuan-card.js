/**
 * 思源笔记卡片渲染器
 * 参考思源原生渲染方案，实现文档树和内容展示
 * 
 * 功能特性：
 * - 文档树导航
 * - 思源风格渲染
 * - 标题折叠/展开
 * - 数学公式、代码高亮支持
 */

const SiyuanCard = (function() {
    'use strict';

    // 配置选项
    let config = {
        notebookPath: './data/siyuan',
        defaultNotebook: '20260303125754-igehgl8',
    };

    // 状态管理
    const state = {
        currentNotebook: null,
        currentDoc: null,
        expandedNodes: new Set(),
    };

    // 块引用缓存
    const blockRefCache = new Map();

    // 已知的子目录和子文档映射
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

    console.log('[SiyuanCard] 模块加载');

    /**
     * 初始化思源卡片
     */
    function init(container, options = {}) {
        console.log('[SiyuanCard] init 开始', container);
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

        console.log('[SiyuanCard] 卡片结构已创建');
        bindEvents(container);
        loadNotebooks();
    }

    /**
     * 绑定事件
     */
    function bindEvents(container) {
        console.log('[SiyuanCard] bindEvents');
        
        // 刷新按钮
        const refreshBtn = container.querySelector('#sy-refresh');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                console.log('[SiyuanCard] 刷新按钮点击');
                loadNotebooks();
            });
        }

        // 文档树点击事件
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
                    console.log('[SiyuanCard] 文档点击', docId);
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
        console.log('[SiyuanCard] loadNotebooks 开始');
        const treeContainer = document.getElementById('sy-tree');
        if (!treeContainer) {
            console.error('[SiyuanCard] 找不到 sy-tree 容器');
            return;
        }
        
        treeContainer.innerHTML = '<div class="sy-loading">加载中...</div>';

        try {
            const notebooks = await fetchNotebooks();
            console.log('[SiyuanCard] 获取到笔记本列表', notebooks);
            
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
            console.log('[SiyuanCard] 笔记本列表渲染完成');

            // 绑定笔记本展开事件
            treeContainer.querySelectorAll('.sy-tree-notebook').forEach(item => {
                const toggle = item.querySelector('.sy-tree-toggle');
                if (toggle) {
                    toggle.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        const notebookId = item.dataset.notebookId;
                        console.log('[SiyuanCard] 笔记本展开点击', notebookId);
                        
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
     * 加载笔记本内的文档列表
     */
    async function loadNotebookDocs(notebookId, container) {
        console.log('[SiyuanCard] loadNotebookDocs', notebookId);
        container.innerHTML = '<div class="sy-loading">加载中...</div>';

        try {
            const docs = await fetchNotebookDocs(notebookId);
            console.log('[SiyuanCard] 获取到文档列表', docs);
            
            if (docs.length === 0) {
                container.innerHTML = '<li class="sy-tree-empty">暂无文档</li>';
                return;
            }

            let html = '';
            for (const doc of docs) {
                html += renderTreeItem(doc, notebookId, 0);
            }
            container.innerHTML = html;
            console.log('[SiyuanCard] 文档列表渲染完成');

        } catch (error) {
            console.error('[SiyuanCard] 加载文档列表失败:', error);
            container.innerHTML = `<li class="sy-error">加载失败</li>`;
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
     * 加载文档内容
     */
    async function loadDocument(notebookId, docId) {
        console.log('[SiyuanCard] loadDocument', notebookId, docId);
        const contentContainer = document.getElementById('sy-content');
        const breadcrumbContainer = document.getElementById('sy-breadcrumb');
        
        if (!contentContainer) {
            console.error('[SiyuanCard] 找不到 sy-content 容器');
            return;
        }
        
        contentContainer.innerHTML = '<div class="sy-loading">加载中...</div>';

        try {
            const docData = await fetchDocument(notebookId, docId);
            console.log('[SiyuanCard] 获取到文档数据', docData);
            
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
        console.log('[SiyuanCard] renderDocument');
        cacheBlockRefs(docData);

        const docContainer = document.createElement('div');
        docContainer.className = 'sy-document';
        docContainer.dataset.docId = docData.ID;

        // 渲染文档标题
        const title = document.createElement('h1');
        title.className = 'sy-doc-title';
        title.textContent = docData.Properties?.title || '未命名文档';
        docContainer.appendChild(title);

        // 渲染子节点
        if (docData.Children && docData.Children.length > 0) {
            const fragment = document.createDocumentFragment();
            for (const child of docData.Children) {
                const element = renderNode(child);
                if (element) {
                    fragment.appendChild(element);
                }
            }
            docContainer.appendChild(fragment);
        }

        container.innerHTML = '';
        container.appendChild(docContainer);

        // 代码高亮
        if (typeof hljs !== 'undefined') {
            container.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        }
        
        console.log('[SiyuanCard] 文档渲染完成');
    }

    /**
     * 渲染单个节点
     */
    function renderNode(node) {
        if (!node || !node.Type) return null;

        switch (node.Type) {
            case 'NodeDocument':
                return renderDocumentNode(node);
            case 'NodeHeading':
                return renderHeading(node);
            case 'NodeParagraph':
                return renderParagraph(node);
            case 'NodeList':
                return renderList(node);
            case 'NodeListItem':
                return renderListItem(node);
            case 'NodeBlockquote':
                return renderBlockquote(node);
            case 'NodeMathBlock':
                return renderMathBlock(node);
            case 'NodeTable':
                return renderTable(node);
            case 'NodeCodeBlock':
                return renderCodeBlock(node);
            case 'NodeThematicBreak':
                return renderThematicBreak();
            case 'NodeSuperBlock':
                return renderSuperBlock(node);
            default:
                return null;
        }
    }

    function renderDocumentNode(node) {
        const container = document.createElement('div');
        container.className = 'sy-document-content';
        if (node.Children) {
            for (const child of node.Children) {
                const el = renderNode(child);
                if (el) container.appendChild(el);
            }
        }
        return container;
    }

    function renderHeading(node) {
        const level = node.HeadingLevel || 1;
        const heading = document.createElement(`h${level}`);
        heading.className = 'sy-heading';
        heading.dataset.nodeId = node.ID;
        
        if (node.Properties?.fold === '1') {
            heading.classList.add('sy-heading-collapsed');
        }

        if (node.Children) {
            for (const child of node.Children) {
                const inline = renderInlineNode(child);
                if (inline) heading.appendChild(inline);
            }
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'sy-heading-wrapper';
        wrapper.appendChild(heading);

        const toggle = document.createElement('span');
        toggle.className = 'sy-heading-toggle';
        toggle.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M7 10l5 5 5-5z"/></svg>`;
        heading.insertBefore(toggle, heading.firstChild);

        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleHeadingCollapse(wrapper, level);
        });

        return wrapper;
    }

    function toggleHeadingCollapse(wrapper, level) {
        const heading = wrapper.querySelector('.sy-heading');
        const isCollapsed = heading.classList.contains('sy-heading-collapsed');
        
        if (isCollapsed) {
            heading.classList.remove('sy-heading-collapsed');
            showContentUntilNextHeading(wrapper, level, true);
        } else {
            heading.classList.add('sy-heading-collapsed');
            showContentUntilNextHeading(wrapper, level, false);
        }
    }

    function showContentUntilNextHeading(wrapper, level, show) {
        let sibling = wrapper.nextElementSibling;
        while (sibling) {
            const siblingHeading = sibling.querySelector('.sy-heading');
            if (siblingHeading) {
                const siblingLevel = parseInt(siblingHeading.tagName.substring(1));
                if (siblingLevel <= level) break;
            }
            sibling.classList.toggle('sy-content-hidden', !show);
            sibling = sibling.nextElementSibling;
        }
    }

    function renderParagraph(node) {
        const p = document.createElement('p');
        p.className = 'sy-paragraph';
        p.dataset.nodeId = node.ID;
        if (node.Children) {
            for (const child of node.Children) {
                const inline = renderInlineNode(child);
                if (inline) p.appendChild(inline);
            }
        }
        return p;
    }

    function renderList(node) {
        const isOrdered = node.ListData?.Typ === 1;
        const list = document.createElement(isOrdered ? 'ol' : 'ul');
        list.className = 'sy-list';
        list.dataset.nodeId = node.ID;
        if (node.Children) {
            for (const child of node.Children) {
                const el = renderNode(child);
                if (el) list.appendChild(el);
            }
        }
        return list;
    }

    function renderListItem(node) {
        const li = document.createElement('li');
        li.className = 'sy-list-item';
        li.dataset.nodeId = node.ID;
        if (node.Children) {
            for (const child of node.Children) {
                const el = renderNode(child);
                if (el) li.appendChild(el);
            }
        }
        return li;
    }

    function renderBlockquote(node) {
        const bq = document.createElement('blockquote');
        bq.className = 'sy-blockquote';
        bq.dataset.nodeId = node.ID;
        if (node.Children) {
            for (const child of node.Children) {
                const el = renderNode(child);
                if (el) bq.appendChild(el);
            }
        }
        return bq;
    }

    function renderMathBlock(node) {
        const div = document.createElement('div');
        div.className = 'sy-math-block';
        div.dataset.nodeId = node.ID;
        
        let mathContent = '';
        if (node.Children) {
            for (const child of node.Children) {
                if (child.Type === 'NodeMathBlockContent') {
                    mathContent += child.Data || '';
                }
            }
        }
        
        if (typeof katex !== 'undefined' && mathContent) {
            try {
                katex.render(mathContent, div, { displayMode: true, throwOnError: false });
            } catch (e) {
                div.textContent = `$$${mathContent}$$`;
            }
        } else {
            div.textContent = `$$${mathContent}$$`;
        }
        return div;
    }

    function renderCodeBlock(node) {
        const pre = document.createElement('pre');
        pre.className = 'sy-code-block';
        pre.dataset.nodeId = node.ID;
        
        const code = document.createElement('code');
        if (node.Language) {
            code.className = `language-${node.Language}`;
        }
        
        let codeContent = '';
        if (node.Children) {
            for (const child of node.Children) {
                if (child.Type === 'NodeCodeBlockCode') {
                    codeContent += child.Data || '';
                }
            }
        }
        
        code.textContent = codeContent;
        pre.appendChild(code);
        return pre;
    }

    function renderTable(node) {
        const table = document.createElement('table');
        table.className = 'sy-table';
        table.dataset.nodeId = node.ID;
        
        if (node.Children) {
            const tbody = document.createElement('tbody');
            for (const child of node.Children) {
                if (child.Type === 'NodeTableRow') {
                    const tr = document.createElement('tr');
                    if (child.Children) {
                        for (const cell of child.Children) {
                            if (cell.Type === 'NodeTableCell') {
                                const td = document.createElement('td');
                                if (cell.Children) {
                                    for (const inline of cell.Children) {
                                        const el = renderInlineNode(inline);
                                        if (el) td.appendChild(el);
                                    }
                                }
                                tr.appendChild(td);
                            }
                        }
                    }
                    tbody.appendChild(tr);
                }
            }
            table.appendChild(tbody);
        }
        return table;
    }

    function renderThematicBreak() {
        const hr = document.createElement('hr');
        hr.className = 'sy-thematic-break';
        return hr;
    }

    function renderSuperBlock(node) {
        const div = document.createElement('div');
        div.className = 'sy-super-block';
        div.dataset.nodeId = node.ID;
        if (node.Children) {
            for (const child of node.Children) {
                const el = renderNode(child);
                if (el) div.appendChild(el);
            }
        }
        return div;
    }

    function renderInlineNode(node) {
        if (!node) return null;

        switch (node.Type) {
            case 'NodeText':
                return document.createTextNode(node.Data || '');
            case 'NodeTextMark':
                return renderTextMark(node);
            case 'NodeBackslash':
                if (node.Children && node.Children[0]?.Type === 'NodeBackslashContent') {
                    return document.createTextNode(node.Children[0].Data || '');
                }
                return document.createTextNode('');
            case 'NodeCodeSpan':
                const code = document.createElement('code');
                code.className = 'sy-code-inline';
                code.textContent = node.Data || '';
                return code;
            default:
                if (node.Children) {
                    const span = document.createElement('span');
                    for (const child of node.Children) {
                        const el = renderInlineNode(child);
                        if (el) span.appendChild(el);
                    }
                    return span;
                }
                return document.createTextNode(node.Data || '');
        }
    }

    function renderTextMark(node) {
        const type = node.TextMarkType || '';
        const content = node.TextMarkTextContent || '';
        const types = type.split(' ');
        
        let element = document.createTextNode(content);
        
        for (const t of types) {
            switch (t) {
                case 'strong':
                    const strong = document.createElement('strong');
                    strong.appendChild(element);
                    element = strong;
                    break;
                case 'em':
                    const em = document.createElement('em');
                    em.appendChild(element);
                    element = em;
                    break;
                case 'u':
                    const u = document.createElement('u');
                    u.appendChild(element);
                    element = u;
                    break;
                case 's':
                    const s = document.createElement('s');
                    s.appendChild(element);
                    element = s;
                    break;
                case 'mark':
                    const mark = document.createElement('mark');
                    mark.className = 'sy-mark';
                    mark.appendChild(element);
                    element = mark;
                    break;
                case 'code':
                    const code = document.createElement('code');
                    code.className = 'sy-code-inline';
                    code.appendChild(element);
                    element = code;
                    break;
                case 'a':
                    const a = document.createElement('a');
                    a.href = node.TextMarkAHref || '#';
                    a.target = '_blank';
                    a.className = 'sy-link';
                    a.appendChild(element);
                    element = a;
                    break;
                case 'block-ref':
                    const ref = document.createElement('span');
                    ref.className = 'sy-block-ref';
                    ref.dataset.refId = node.TextMarkBlockRefID || '';
                    ref.appendChild(element);
                    element = ref;
                    break;
                case 'sup':
                    const sup = document.createElement('sup');
                    sup.appendChild(element);
                    element = sup;
                    break;
                case 'sub':
                    const sub = document.createElement('sub');
                    sub.appendChild(element);
                    element = sub;
                    break;
                case 'tag':
                    const tag = document.createElement('span');
                    tag.className = 'sy-tag';
                    tag.appendChild(element);
                    element = tag;
                    break;
            }
        }
        return element;
    }

    function cacheBlockRefs(node, path = []) {
        if (!node) return;
        if (node.ID) {
            blockRefCache.set(node.ID, { node, path });
        }
        if (node.Children) {
            node.Children.forEach((child, index) => {
                cacheBlockRefs(child, [...path, index]);
            });
        }
    }

    // ==================== 数据获取函数 ====================

    async function fetchNotebooks() {
        console.log('[SiyuanCard] fetchNotebooks');
        try {
            const notebookId = config.defaultNotebook;
            const confUrl = `${config.notebookPath}/${notebookId}/.siyuan/conf.json`;
            console.log('[SiyuanCard] 请求配置', confUrl);
            
            const response = await fetch(confUrl);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const confData = await response.json();
            console.log('[SiyuanCard] 配置数据', confData);
            
            return [{ id: notebookId, name: confData.name || '笔记本' }];
        } catch (error) {
            console.error('[SiyuanCard] fetchNotebooks 失败', error);
            throw error;
        }
    }

    async function fetchNotebookDocs(notebookId) {
        console.log('[SiyuanCard] fetchNotebookDocs', notebookId);
        const sortUrl = `${config.notebookPath}/${notebookId}/.siyuan/sort.json`;
        console.log('[SiyuanCard] 请求 sort.json', sortUrl);
        
        try {
            const sortResponse = await fetch(sortUrl);
            if (!sortResponse.ok) {
                throw new Error(`HTTP ${sortResponse.status}`);
            }
            const sortData = await sortResponse.json();
            console.log('[SiyuanCard] sort.json 数据', sortData);
            
            const docs = [];
            const docIds = Object.keys(sortData);
            const structure = knownStructure[notebookId];
            
            // 收集所有子文档 ID（用于过滤）
            const allChildDocIds = new Set();
            if (structure && structure.childDocs) {
                for (const parentId of Object.keys(structure.childDocs)) {
                    for (const childId of structure.childDocs[parentId]) {
                        allChildDocIds.add(childId);
                    }
                }
            }
            
            for (const docId of docIds) {
                // 跳过子文档（它们会作为父文档的 children 显示）
                if (allChildDocIds.has(docId)) {
                    continue;
                }
                
                try {
                    // 只从根目录加载
                    const docUrl = `${config.notebookPath}/${notebookId}/${docId}.sy`;
                    const docResponse = await fetch(docUrl);
                    
                    if (!docResponse.ok) {
                        // 如果根目录没有，可能是子目录中的文档（如 20260214081507-0j2zcju）
                        // 尝试从子目录加载
                        if (structure && structure.subDirs) {
                            for (const subDir of structure.subDirs) {
                                const subDocUrl = `${config.notebookPath}/${notebookId}/${subDir}/${docId}.sy`;
                                const subDocResponse = await fetch(subDocUrl);
                                if (subDocResponse.ok) {
                                    const docData = await subDocResponse.json();
                                    const children = await fetchChildDocs(notebookId, docId);
                                    docs.push({
                                        id: docId,
                                        title: docData.Properties?.title || '未命名',
                                        children: children
                                    });
                                    break;
                                }
                            }
                        }
                        continue;
                    }
                    
                    const docData = await docResponse.json();
                    const children = await fetchChildDocs(notebookId, docId);
                    
                    docs.push({
                        id: docId,
                        title: docData.Properties?.title || '未命名',
                        children: children
                    });
                } catch (e) {
                    console.log('[SiyuanCard] 加载文档失败', docId, e);
                }
            }
            
            return docs;
        } catch (error) {
            console.error('[SiyuanCard] fetchNotebookDocs 失败', error);
            throw error;
        }
    }

    async function fetchChildDocs(notebookId, parentId) {
        const children = [];
        const structure = knownStructure[notebookId];
        
        if (structure && structure.childDocs && structure.childDocs[parentId]) {
            for (const childId of structure.childDocs[parentId]) {
                try {
                    const docUrl = `${config.notebookPath}/${notebookId}/${parentId}/${childId}.sy`;
                    const docResponse = await fetch(docUrl);
                    
                    if (docResponse.ok) {
                        const docData = await docResponse.json();
                        children.push({
                            id: childId,
                            title: docData.Properties?.title || '未命名',
                            children: []
                        });
                    }
                } catch (e) {
                    // 忽略
                }
            }
        }
        
        return children;
    }

    async function fetchDocument(notebookId, docId) {
        console.log('[SiyuanCard] fetchDocument', notebookId, docId);
        
        let docUrl = `${config.notebookPath}/${notebookId}/${docId}.sy`;
        let response = await fetch(docUrl);
        
        // 如果根目录没有，尝试子目录
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
        
        // 还没有，尝试在子文档目录中查找
        if (!response.ok) {
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
        console.log('[SiyuanCard] 文档数据', docData);
        
        // 获取笔记本名称
        try {
            const confUrl = `${config.notebookPath}/${notebookId}/.siyuan/conf.json`;
            const confResponse = await fetch(confUrl);
            const confData = await confResponse.json();
            docData.notebookName = confData.name;
        } catch (e) {
            docData.notebookName = '笔记本';
        }
        
        return docData;
    }

    // 公开 API
    return {
        init,
        loadNotebooks,
        loadDocument,
        renderDocument,
        configure: (options) => { config = { ...config, ...options }; }
    };
})();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SiyuanCard;
}
