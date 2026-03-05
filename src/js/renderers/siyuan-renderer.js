/**
 * 思源笔记渲染器
 * 参考: siyuan/app/src/protyle/render/
 *
 * 功能特性：
 * - 支持多种节点类型渲染
 * - 数学公式渲染（KaTeX）
 * - 代码高亮（Highlight.js）
 * - 标题折叠/展开
 * - 请求缓存
 */

const SiyuanRenderer = (function() {
    'use strict';

    // 配置
    const config = {
        collapsible: true,
        cdn: 'https://cdn.jsdelivr.net/npm',
        katexVersion: '0.16.9',
        hljsVersion: '11.9.0',
    };

    // 缓存
    const docCache = new Map();
    const scriptLoaded = {
        katex: false,
        hljs: false,
    };

    /**
     * 加载 KaTeX
     * 参考: siyuan/app/src/protyle/render/mathRender.ts
     */
    async function loadKatex() {
        if (scriptLoaded.katex || typeof window.katex !== 'undefined') {
            scriptLoaded.katex = true;
            return;
        }

        // 加载样式
        Utils.addStyle(
            `${config.cdn}/katex@${config.katexVersion}/dist/katex.min.css`,
            'katex-style'
        );

        // 加载脚本
        await Utils.addScript(
            `${config.cdn}/katex@${config.katexVersion}/dist/katex.min.js`,
            'katex-script'
        );

        scriptLoaded.katex = true;
    }

    /**
     * 加载 Highlight.js
     * 参考: siyuan/app/src/protyle/render/highlightRender.ts
     */
    async function loadHighlight() {
        if (scriptLoaded.hljs || typeof window.hljs !== 'undefined') {
            scriptLoaded.hljs = true;
            return;
        }

        // 加载样式
        Utils.addStyle(
            `${config.cdn}/highlight.js@${config.hljsVersion}/styles/github-dark.min.css`,
            'hljs-style'
        );

        // 加载脚本
        await Utils.addScript(
            `${config.cdn}/highlight.js@${config.hljsVersion}/lib/highlight.min.js`,
            'hljs-script'
        );

        scriptLoaded.hljs = true;
    }

    /**
     * 渲染数学公式
     * @param {string} content - 公式内容
     * @param {HTMLElement} container - 容器元素
     * @param {boolean} displayMode - 是否为块级公式
     */
    async function renderMath(content, container, displayMode = true) {
        await loadKatex();

        if (typeof window.katex === 'undefined') {
            container.textContent = displayMode ? `$$${content}$$` : `$${content}$`;
            return;
        }

        try {
            window.katex.render(content, container, {
                displayMode,
                throwOnError: false,
                trust: true,
            });
        } catch (e) {
            container.textContent = displayMode ? `$$${content}$$` : `$${content}$`;
            console.warn('[SiyuanRenderer] KaTeX 渲染失败:', e);
        }
    }

    /**
     * 渲染代码块
     * @param {string} code - 代码内容
     * @param {string} language - 语言
     * @param {HTMLElement} container - 容器元素
     */
    async function renderCode(code, language, container) {
        await loadHighlight();

        const pre = document.createElement('pre');
        pre.className = 'sy-code-block';

        const codeEl = document.createElement('code');
        if (language) {
            codeEl.className = `language-${language}`;
        }

        codeEl.textContent = code;
        pre.appendChild(codeEl);
        container.appendChild(pre);

        if (typeof window.hljs !== 'undefined') {
            window.hljs.highlightElement(codeEl);
        }
    }

    /**
     * 渲染节点
     * @param {Object} node - 节点数据
     * @returns {HTMLElement|null}
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
            case 'NodeCodeBlock':
                return renderCodeBlock(node);
            case 'NodeTable':
                return renderTable(node);
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

        // 折叠按钮
        const toggle = document.createElement('span');
        toggle.className = 'sy-heading-toggle';
        toggle.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M7 10l5 5 5-5z"/></svg>';
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

        if (mathContent) {
            renderMath(mathContent, div, true);
        }

        return div;
    }

    function renderCodeBlock(node) {
        const container = document.createElement('div');
        container.className = 'sy-code-block-container';
        container.dataset.nodeId = node.ID;

        let codeContent = '';
        if (node.Children) {
            for (const child of node.Children) {
                if (child.Type === 'NodeCodeBlockCode') {
                    codeContent += child.Data || '';
                }
            }
        }

        renderCode(codeContent, node.Language, container);

        return container;
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

    /**
     * 渲染文档
     * @param {Object} syData - 思源文档数据
     * @param {HTMLElement} container - 容器元素
     */
    function render(syData, container) {
        requestAnimationFrame(() => {
            const fragment = document.createDocumentFragment();

            // 渲染文档标题
            if (syData.Properties?.title) {
                const title = document.createElement('h1');
                title.className = 'sy-doc-title';
                title.textContent = syData.Properties.title;
                fragment.appendChild(title);
            }

            // 渲染子节点
            if (syData.Children && syData.Children.length > 0) {
                for (const child of syData.Children) {
                    const element = renderNode(child);
                    if (element) {
                        fragment.appendChild(element);
                    }
                }
            }

            container.innerHTML = '';
            container.appendChild(fragment);
        });
    }

    /**
     * 加载并渲染文档（带缓存）
     * @param {string} url - 文档 URL
     * @param {HTMLElement} container - 容器元素
     */
    async function loadAndRender(url, container) {
        // 检查缓存
        if (docCache.has(url)) {
            render(docCache.get(url), container);
            return;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            // 缓存数据
            docCache.set(url, data);

            render(data, container);
        } catch (error) {
            console.error('[SiyuanRenderer] 加载文档失败:', error);
            container.innerHTML = `<div class="sy-error">加载失败: ${error.message}</div>`;
        }
    }

    /**
     * 获取文档标题
     * @param {Object} syData - 思源文档数据
     * @returns {string}
     */
    function getTitle(syData) {
        return syData?.Properties?.title || '未命名文档';
    }

    /**
     * 配置
     * @param {Object} options - 配置选项
     */
    function configure(options) {
        Object.assign(config, options);
    }

    /**
     * 清除缓存
     */
    function clearCache() {
        docCache.clear();
    }

    // 公开 API
    return {
        render,
        loadAndRender,
        getTitle,
        configure,
        clearCache,
        loadKatex,
        loadHighlight,
    };
})();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SiyuanRenderer;
} else if (typeof window !== 'undefined') {
    window.SiyuanRenderer = SiyuanRenderer;
}
