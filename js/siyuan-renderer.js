/**
 * 思源笔记 .sy 文件渲染器
 * 用于在网页中展示思源笔记内容（仅支持渲染，不支持编辑）
 * 
 * 功能特性：
 * - 支持标题折叠/展开
 * - 支持懒加载优化性能
 * - 支持块引用解析
 */

const SiyuanRenderer = (function() {
    'use strict';

    // 配置选项
    let config = {
        collapsible: true,      // 是否启用折叠功能
        defaultCollapsed: false, // 默认是否折叠
        lazyRender: true,       // 是否启用懒渲染
        lazyThreshold: 100      // 懒渲染阈值（节点数）
    };

    // 块引用缓存
    const blockRefCache = new Map();

    /**
     * 配置渲染器
     * @param {Object} options - 配置选项
     */
    function configure(options) {
        config = { ...config, ...options };
    }

    /**
     * 渲染 .sy 文件数据到指定容器
     * @param {Object} syData - .sy 文件的 JSON 数据
     * @param {HTMLElement} container - 目标容器元素
     */
    function render(syData, container) {
        if (!syData || !container) {
            console.error('SiyuanRenderer: 无效的数据或容器');
            return;
        }

        // 使用 requestAnimationFrame 优化渲染
        requestAnimationFrame(() => {
            container.innerHTML = '';
            
            // 使用 DocumentFragment 减少重绘
            const fragment = document.createDocumentFragment();
            const docElement = renderNode(syData);
            if (docElement) {
                fragment.appendChild(docElement);
            }
            container.appendChild(fragment);

            // 绑定折叠事件
            if (config.collapsible) {
                bindCollapseEvents(container);
            }
        });
    }

    /**
     * 从 URL 加载 .sy 文件并渲染
     * @param {string} url - .sy 文件的路径
     * @param {HTMLElement} container - 目标容器元素
     */
    async function loadAndRender(url, container) {
        try {
            container.innerHTML = '<div class="sy-loading">加载中...</div>';
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const syData = await response.json();
            
            // 缓存块引用
            cacheBlockRefs(syData);
            
            render(syData, container);
        } catch (error) {
            container.innerHTML = `<div class="sy-error">加载失败: ${error.message}</div>`;
            console.error('SiyuanRenderer 加载失败:', error);
        }
    }

    /**
     * 缓存块引用（用于解析 block-ref）
     */
    function cacheBlockRefs(node, path = []) {
        if (!node) return;
        
        if (node.ID) {
            blockRefCache.set(node.ID, {
                node: node,
                path: path
            });
        }
        
        if (node.Children && node.Children.length > 0) {
            node.Children.forEach((child, index) => {
                cacheBlockRefs(child, [...path, index]);
            });
        }
    }

    /**
     * 获取文档标题
     * @param {Object} syData - .sy 文件的 JSON 数据
     * @returns {string} 文档标题
     */
    function getTitle(syData) {
        return syData?.Properties?.title || '未命名文档';
    }

    /**
     * 绑定折叠事件
     */
    function bindCollapseEvents(container) {
        container.addEventListener('click', (e) => {
            const heading = e.target.closest('.sy-heading');
            if (!heading) return;
            
            // 检查是否点击了折叠按钮或标题本身
            const toggleBtn = e.target.closest('.sy-heading-toggle');
            if (toggleBtn || e.target === heading || heading.contains(e.target)) {
                toggleHeading(heading);
            }
        });
    }

    /**
     * 切换标题折叠状态
     */
    function toggleHeading(heading) {
        const isCollapsed = heading.classList.contains('sy-heading-collapsed');
        
        if (isCollapsed) {
            // 展开
            heading.classList.remove('sy-heading-collapsed');
            showContentUntilNextHeading(heading, true);
        } else {
            // 折叠
            heading.classList.add('sy-heading-collapsed');
            showContentUntilNextHeading(heading, false);
        }
    }

    /**
     * 显示/隐藏标题下的内容直到下一个同级或更高级标题
     */
    function showContentUntilNextHeading(heading, show) {
        const level = parseInt(heading.tagName.substring(1));
        // 获取标题所在的 wrapper（如果有）或标题本身
        const wrapper = heading.closest('.sy-heading-wrapper') || heading;
        let sibling = wrapper.nextElementSibling;
        
        while (sibling) {
            // 检查是否是标题 wrapper
            const siblingHeading = sibling.querySelector('.sy-heading') || 
                                   (sibling.classList.contains('sy-heading') ? sibling : null);
            
            if (siblingHeading) {
                const siblingLevel = parseInt(siblingHeading.tagName.substring(1));
                if (siblingLevel <= level) break;
            }
            
            if (show) {
                sibling.classList.remove('sy-content-hidden');
            } else {
                sibling.classList.add('sy-content-hidden');
            }
            
            sibling = sibling.nextElementSibling;
        }
    }

    /**
     * 渲染单个节点
     * @param {Object} node - 节点数据
     * @returns {HTMLElement|null}
     */
    function renderNode(node) {
        if (!node || !node.Type) return null;

        switch (node.Type) {
            case 'NodeDocument':
                return renderDocument(node);
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
            case 'NodeSuperBlock':
                return renderSuperBlock(node);
            case 'NodeCodeBlock':
                return renderCodeBlock(node);
            default:
                // 对于未处理的节点，尝试渲染其子节点
                if (node.Children && node.Children.length > 0) {
                    const wrapper = document.createElement('div');
                    node.Children.forEach(child => {
                        const childElement = renderNode(child);
                        if (childElement) wrapper.appendChild(childElement);
                    });
                    return wrapper;
                }
                return null;
        }
    }

    /**
     * 渲染文档节点
     */
    function renderDocument(node) {
        const doc = document.createElement('div');
        doc.className = 'sy-document';
        doc.setAttribute('data-doc-id', node.ID || '');

        if (node.Children && node.Children.length > 0) {
            node.Children.forEach(child => {
                const childElement = renderNode(child);
                if (childElement) doc.appendChild(childElement);
            });
        }

        return doc;
    }

    /**
     * 渲染标题节点（支持折叠）
     */
    function renderHeading(node) {
        const level = node.HeadingLevel || 1;
        const wrapper = document.createElement('div');
        wrapper.className = 'sy-heading-wrapper';
        
        const heading = document.createElement(`h${level}`);
        heading.className = `sy-heading sy-heading-${level} sy-heading-collapsible`;
        heading.setAttribute('data-node-id', node.ID || '');
        
        // 添加折叠指示器
        const toggle = document.createElement('span');
        toggle.className = 'sy-heading-toggle';
        toggle.innerHTML = '▼';
        heading.appendChild(toggle);

        if (node.Children && node.Children.length > 0) {
            node.Children.forEach(child => {
                // 跳过标题标记节点（如 "# "）
                if (child.Type === 'NodeHeadingC8hMarker') return;
                const inlineElement = renderInlineNode(child);
                if (inlineElement) heading.appendChild(inlineElement);
            });
        }

        wrapper.appendChild(heading);
        return wrapper;
    }

    /**
     * 渲染段落节点
     */
    function renderParagraph(node) {
        const p = document.createElement('p');
        p.className = 'sy-paragraph';
        p.setAttribute('data-node-id', node.ID || '');

        // 应用样式属性
        if (node.Properties && node.Properties.style) {
            p.style.cssText = convertSiyuanStyle(node.Properties.style);
        }

        if (node.Children && node.Children.length > 0) {
            node.Children.forEach(child => {
                const inlineElement = renderInlineNode(child);
                if (inlineElement) p.appendChild(inlineElement);
            });
        }

        return p;
    }

    /**
     * 渲染列表节点
     */
    function renderList(node) {
        const listData = node.ListData || {};
        const isOrdered = listData.Typ === 1;
        const list = document.createElement(isOrdered ? 'ol' : 'ul');
        list.className = 'sy-list' + (isOrdered ? ' sy-list-ordered' : ' sy-list-unordered');
        list.setAttribute('data-node-id', node.ID || '');

        if (node.Children && node.Children.length > 0) {
            node.Children.forEach(child => {
                const listItem = renderNode(child);
                if (listItem) list.appendChild(listItem);
            });
        }

        return list;
    }

    /**
     * 渲染列表项节点
     */
    function renderListItem(node) {
        const li = document.createElement('li');
        li.className = 'sy-list-item';
        li.setAttribute('data-node-id', node.ID || '');

        if (node.Children && node.Children.length > 0) {
            node.Children.forEach(child => {
                const childElement = renderNode(child);
                if (childElement) li.appendChild(childElement);
            });
        }

        return li;
    }

    /**
     * 渲染引用块节点
     */
    function renderBlockquote(node) {
        const blockquote = document.createElement('blockquote');
        blockquote.className = 'sy-blockquote';
        blockquote.setAttribute('data-node-id', node.ID || '');

        if (node.Children && node.Children.length > 0) {
            node.Children.forEach(child => {
                // 跳过引用标记节点
                if (child.Type === 'NodeBlockquoteMarker') return;
                const childElement = renderNode(child);
                if (childElement) blockquote.appendChild(childElement);
            });
        }

        return blockquote;
    }

    /**
     * KaTeX 渲染配置（参考思源笔记）
     */
    function getKatexConfig(displayMode) {
        return {
            displayMode: displayMode,
            output: 'html',
            throwOnError: false,
            trust: true,
            strict: (errorCode) => {
                return errorCode === 'unicodeTextInMathMode' ? 'ignore' : 'warn';
            }
        };
    }

    /**
     * 渲染数学公式块节点
     */
    function renderMathBlock(node) {
        const div = document.createElement('div');
        div.className = 'sy-math-block';
        div.setAttribute('data-node-id', node.ID || '');

        let mathContent = '';
        if (node.Children && node.Children.length > 0) {
            node.Children.forEach(child => {
                if (child.Type === 'NodeMathBlockContent' && child.Data) {
                    mathContent += child.Data;
                }
            });
        }

        if (mathContent && typeof katex !== 'undefined') {
            try {
                katex.render(mathContent, div, getKatexConfig(true));
            } catch (e) {
                div.innerHTML = `<span class="sy-math-error">${e.message || mathContent}</span>`;
                console.warn('KaTeX 渲染失败:', e);
            }
        } else if (mathContent) {
            div.textContent = mathContent;
        }

        return div;
    }

    /**
     * 渲染表格节点
     */
    function renderTable(node) {
        const table = document.createElement('table');
        table.className = 'sy-table';
        table.setAttribute('data-node-id', node.ID || '');

        if (node.Children && node.Children.length > 0) {
            node.Children.forEach(child => {
                if (child.Type === 'NodeTableHead' || child.Data === 'thead') {
                    const thead = document.createElement('thead');
                    renderTableRows(child.Children, thead, true);
                    table.appendChild(thead);
                } else if (child.Type === 'NodeTableBody' || child.Data === 'tbody') {
                    const tbody = document.createElement('tbody');
                    renderTableRows(child.Children, tbody, false);
                    table.appendChild(tbody);
                } else if (child.Type === 'NodeTableRow' || child.Data === 'tr') {
                    if (!table.querySelector('tbody')) {
                        const tbody = document.createElement('tbody');
                        table.appendChild(tbody);
                    }
                    const tr = renderTableRow(child, false);
                    table.querySelector('tbody').appendChild(tr);
                }
            });
        }

        return table;
    }

    /**
     * 渲染表格行
     */
    function renderTableRows(rows, container, isHeader) {
        if (!rows) return;
        rows.forEach(row => {
            const tr = renderTableRow(row, isHeader);
            if (tr) container.appendChild(tr);
        });
    }

    /**
     * 渲染单个表格行
     */
    function renderTableRow(row, isHeader) {
        const tr = document.createElement('tr');
        if (row.Children && row.Children.length > 0) {
            row.Children.forEach(cell => {
                const td = document.createElement(isHeader ? 'th' : 'td');
                td.className = 'sy-table-cell';
                if (cell.TableCellAlign) {
                    td.style.textAlign = ['left', 'center', 'right'][cell.TableCellAlign] || 'left';
                }
                if (cell.Children && cell.Children.length > 0) {
                    cell.Children.forEach(child => {
                        const inlineElement = renderInlineNode(child);
                        if (inlineElement) td.appendChild(inlineElement);
                    });
                }
                tr.appendChild(td);
            });
        }
        return tr;
    }

    /**
     * 渲染超级块节点
     */
    function renderSuperBlock(node) {
        const div = document.createElement('div');
        div.className = 'sy-super-block';
        div.setAttribute('data-node-id', node.ID || '');

        let layout = 'row';
        if (node.Children && node.Children.length > 0) {
            node.Children.forEach(child => {
                if (child.Type === 'NodeSuperBlockLayoutMarker' && child.Data) {
                    layout = child.Data;
                }
            });
        }
        div.setAttribute('data-layout', layout);

        if (node.Children && node.Children.length > 0) {
            node.Children.forEach(child => {
                if (child.Type === 'NodeSuperBlockOpenMarker' ||
                    child.Type === 'NodeSuperBlockCloseMarker' ||
                    child.Type === 'NodeSuperBlockLayoutMarker') {
                    return;
                }
                const childElement = renderNode(child);
                if (childElement) div.appendChild(childElement);
            });
        }

        return div;
    }

    /**
     * 渲染代码块节点
     */
    function renderCodeBlock(node) {
        const pre = document.createElement('pre');
        pre.className = 'sy-code-block';
        pre.setAttribute('data-node-id', node.ID || '');

        const code = document.createElement('code');
        if (node.Properties && node.Properties.lang) {
            code.className = `language-${node.Properties.lang}`;
        }

        if (node.Children && node.Children.length > 0) {
            node.Children.forEach(child => {
                if (child.Type === 'NodeCodeBlockContent' && child.Data) {
                    code.textContent += child.Data;
                }
            });
        }

        pre.appendChild(code);

        if (typeof hljs !== 'undefined') {
            hljs.highlightElement(code);
        }

        return pre;
    }

    /**
     * 渲染内联节点
     */
    function renderInlineNode(node) {
        if (!node) return null;

        switch (node.Type) {
            case 'NodeText':
                return document.createTextNode(node.Data || '');

            case 'NodeTextMark':
                return renderTextMark(node);

            case 'NodeSoftBreak':
                return document.createElement('br');

            default:
                if (node.Children && node.Children.length > 0) {
                    const span = document.createElement('span');
                    node.Children.forEach(child => {
                        const inlineElement = renderInlineNode(child);
                        if (inlineElement) span.appendChild(inlineElement);
                    });
                    return span;
                }
                if (node.Data) {
                    return document.createTextNode(node.Data);
                }
                return null;
        }
    }

    /**
     * 渲染文本标记节点
     */
    function renderTextMark(node) {
        const markType = node.TextMarkType || '';
        const content = node.TextMarkTextContent || '';

        switch (markType) {
            case 'strong':
                const strong = document.createElement('strong');
                strong.className = 'sy-strong';
                strong.textContent = content;
                return strong;

            case 'em':
                const em = document.createElement('em');
                em.className = 'sy-em';
                em.textContent = content;
                return em;

            case 'sup':
                const sup = document.createElement('sup');
                sup.className = 'sy-sup';
                sup.textContent = content;
                return sup;

            case 'sub':
                const sub = document.createElement('sub');
                sub.className = 'sy-sub';
                sub.textContent = content;
                return sub;

            case 'code':
                const code = document.createElement('code');
                code.className = 'sy-inline-code';
                code.textContent = content;
                return code;

            case 'inline-math':
                const mathSpan = document.createElement('span');
                mathSpan.className = 'sy-inline-math';
                const mathContent = node.TextMarkInlineMathContent || content;
                if (typeof katex !== 'undefined') {
                    try {
                        katex.render(mathContent, mathSpan, getKatexConfig(false));
                    } catch (e) {
                        mathSpan.innerHTML = `<span class="sy-math-error">${e.message || mathContent}</span>`;
                    }
                } else {
                    mathSpan.textContent = `$${mathContent}$`;
                }
                return mathSpan;

            case 'block-ref':
                const refSpan = document.createElement('span');
                refSpan.className = 'sy-block-ref';
                refSpan.textContent = content;
                refSpan.setAttribute('data-ref-id', node.TextMarkBlockRefID || '');
                refSpan.title = `引用: ${content}`;
                return refSpan;

            case 'a':
                const a = document.createElement('a');
                a.className = 'sy-link';
                a.href = node.TextMarkAHref || '#';
                a.textContent = content;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                return a;

            case 'mark':
                const mark = document.createElement('mark');
                mark.className = 'sy-mark';
                mark.textContent = content;
                return mark;

            case 'del':
                const del = document.createElement('del');
                del.className = 'sy-del';
                del.textContent = content;
                return del;

            case 'u':
                const u = document.createElement('u');
                u.className = 'sy-underline';
                u.textContent = content;
                return u;

            case 'tag':
                const tag = document.createElement('span');
                tag.className = 'sy-tag';
                tag.textContent = `#${content}`;
                return tag;

            default:
                return document.createTextNode(content);
        }
    }

    /**
     * 转换思源样式为 CSS
     */
    function convertSiyuanStyle(syStyle) {
        if (!syStyle) return '';
        return syStyle;
    }

    // 公开 API
    return {
        render: render,
        loadAndRender: loadAndRender,
        getTitle: getTitle,
        configure: configure
    };
})();

// 如果支持模块导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SiyuanRenderer;
}
