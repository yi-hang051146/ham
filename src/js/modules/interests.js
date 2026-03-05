/**
 * 关注内容模块
 * 功能：展示用户关注的内容分类和详情
 */

const Interests = (function() {
    'use strict';

    // 数据缓存
    let interestsData = null;

    /**
     * 加载数据
     */
    async function loadData() {
        const grid = document.getElementById('interests-grid');
        if (!grid) return;

        grid.innerHTML = `
            <div class="interest-loading">
                <div class="interest-loading-spinner"></div>
                <div class="interest-loading-text">加载中...</div>
            </div>
        `;

        try {
            const response = await fetch('./data/interests.json?v=' + Date.now());
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            interestsData = await response.json();
            renderCards();
        } catch (error) {
            console.error('[Interests] 加载数据失败:', error);
            grid.innerHTML = `
                <div class="interest-empty">
                    <div class="interest-empty-icon">⚠️</div>
                    <div class="interest-empty-text">数据加载失败</div>
                    <div class="interest-empty-detail">错误: ${error.message}</div>
                    <button class="interest-retry-btn" onclick="Interests.loadData()">重试</button>
                </div>
            `;
        }
    }

    /**
     * 渲染卡片
     */
    function renderCards() {
        const grid = document.getElementById('interests-grid');
        if (!grid || !interestsData) return;

        const categories = interestsData.categories;

        if (categories.length === 0) {
            grid.innerHTML = `
                <div class="interest-empty">
                    <div class="interest-empty-icon">📭</div>
                    <div class="interest-empty-text">暂无关注内容</div>
                </div>
            `;
            return;
        }

        grid.innerHTML = categories.map(category => `
            <div class="interest-card" data-category-id="${category.id}">
                <span class="interest-card-count">${category.items.length}</span>
                <span class="interest-card-icon">${category.icon}</span>
                <div class="interest-card-title">${category.name}</div>
                <div class="interest-card-desc">${category.description}</div>
            </div>
        `).join('');

        // 绑定点击事件
        grid.querySelectorAll('.interest-card').forEach(card => {
            card.addEventListener('click', () => {
                const categoryId = card.dataset.categoryId;
                openModal(categoryId);
            });
        });
    }

    /**
     * 打开模态框
     */
    function openModal(categoryId) {
        const category = interestsData.categories.find(c => c.id === categoryId);
        if (!category) return;

        const overlay = document.getElementById('modal-overlay');
        const icon = document.getElementById('modal-icon');
        const titleText = document.getElementById('modal-title-text');
        const body = document.getElementById('modal-body');

        icon.textContent = category.icon;
        titleText.textContent = category.name;

        if (category.items.length === 0) {
            body.innerHTML = `
                <div class="interest-empty">
                    <div class="interest-empty-icon">📭</div>
                    <div class="interest-empty-text">该分类下暂无内容</div>
                </div>
            `;
        } else {
            body.innerHTML = category.items.map(item => `
                <div class="interest-item" data-item-title="${item.title}">
                    <div class="interest-item-title">${item.title}</div>
                    ${item.subtitle ? `<div class="interest-item-subtitle">${item.subtitle}</div>` : ''}
                    ${item.content ? `<div class="interest-item-content">${item.content}</div>` : ''}
                    ${item.rating ? `<div class="interest-item-rating">${item.rating}</div>` : ''}
                    ${item.hasImage && item.imagePath ? `
                        <img src="${item.imagePath}" alt="${item.title}" class="interest-item-image"
                             onerror="this.style.display='none'">
                    ` : ''}
                    ${item.hasSiyuanNote && item.siyuanNotePath ? `
                        <div class="sy-note-container" data-sy-path="${item.siyuanNotePath}">
                            <div class="sy-loading">加载笔记中...</div>
                        </div>
                    ` : ''}
                    ${item.hasSiyuanNotebook && item.siyuanNotebookPath ? `
                        <div class="sy-notebook-container" data-notebook-path="${item.siyuanNotebookPath}" data-notebook-title="${item.title}">
                            <div class="sy-loading">加载笔记本中...</div>
                        </div>
                    ` : ''}
                </div>
            `).join('');

            // 加载思源笔记内容
            body.querySelectorAll('.sy-note-container').forEach(container => {
                const syPath = container.dataset.syPath;
                if (syPath && typeof SiyuanRenderer !== 'undefined') {
                    SiyuanRenderer.loadAndRender(syPath, container);
                }
            });

            // 加载思源笔记本
            body.querySelectorAll('.sy-notebook-container').forEach(container => {
                const notebookPath = container.dataset.notebookPath;
                const notebookTitle = container.dataset.notebookTitle;
                if (notebookPath) {
                    loadSiyuanNotebook(notebookPath, container, notebookTitle);
                }
            });
        }

        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * 关闭模态框
     */
    function closeModal() {
        const overlay = document.getElementById('modal-overlay');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * 加载思源笔记本
     */
    async function loadSiyuanNotebook(notebookPath, container, notebookTitle) {
        let targetContainer = container;
        if (container.classList && container.classList.contains('sy-error')) {
            targetContainer = container.parentElement;
        }

        targetContainer.innerHTML = '<div class="sy-loading">加载笔记本中...</div>';

        try {
            const sortUrl = `${notebookPath}/.siyuan/sort.json?v=${Date.now()}`;
            const sortResponse = await fetch(sortUrl);

            if (!sortResponse.ok) {
                targetContainer.innerHTML = `
                    <div class="sy-error">
                        <div class="sy-error-title">无法加载笔记本目录</div>
                        <div class="sy-error-detail">路径: ${sortUrl}</div>
                        <div class="sy-error-detail">状态: HTTP ${sortResponse.status}</div>
                        <button class="sy-retry-btn" data-notebook-path="${notebookPath}" data-notebook-title="${notebookTitle}">重试</button>
                    </div>
                `;
                return;
            }

            const sortData = await sortResponse.json();
            const notes = [];

            // 并行加载笔记
            const loadPromises = Object.entries(sortData).map(async ([noteId, sortOrder]) => {
                const notePath = `${notebookPath}/${noteId}.sy`;
                try {
                    const noteResponse = await fetch(notePath);
                    if (noteResponse.ok) {
                        const noteData = await noteResponse.json();
                        const title = noteData?.Properties?.title || noteId;

                        const subDirPath = `${notebookPath}/${noteId}`;
                        const subNotes = await loadSubDirectoryNotes(subDirPath, notebookPath);

                        return {
                            id: noteId,
                            title: title,
                            path: notePath,
                            order: sortOrder,
                            hasChildren: subNotes.length > 0,
                            children: subNotes
                        };
                    }
                } catch (e) {
                    console.warn('[Interests] 笔记加载异常:', notePath, e);
                }
                return null;
            });

            const results = await Promise.all(loadPromises);
            for (const note of results) {
                if (note) {
                    notes.push(note);
                }
            }

            // 排序
            notes.sort((a, b) => a.order - b.order);

            if (notes.length === 0) {
                targetContainer.innerHTML = '<div class="sy-empty">笔记本为空</div>';
                return;
            }

            renderNestedNotebookTabs(notes, targetContainer, notebookPath);

        } catch (error) {
            console.error('[Interests] 加载笔记本失败:', error);
            targetContainer.innerHTML = `
                <div class="sy-error">
                    <div class="sy-error-title">加载笔记本失败</div>
                    <div class="sy-error-detail">错误: ${error.message}</div>
                    <button class="sy-retry-btn" data-notebook-path="${notebookPath}" data-notebook-title="${notebookTitle}">重试</button>
                </div>
            `;
        }
    }

    /**
     * 加载子目录笔记
     */
    async function loadSubDirectoryNotes(subDirPath, basePath) {
        const subNotes = [];

        try {
            const subSortUrl = `${subDirPath}/.siyuan/sort.json?v=${Date.now()}`;
            const subSortResponse = await fetch(subSortUrl);

            if (subSortResponse.ok) {
                const subSortData = await subSortResponse.json();

                // 并行加载
                const loadPromises = Object.entries(subSortData).map(async ([noteId, sortOrder]) => {
                    const notePath = `${subDirPath}/${noteId}.sy`;
                    try {
                        const noteResponse = await fetch(notePath);
                        if (noteResponse.ok) {
                            const noteData = await noteResponse.json();
                            const title = noteData?.Properties?.title || noteId;
                            return {
                                id: noteId,
                                title: title,
                                path: notePath,
                                order: sortOrder
                            };
                        }
                    } catch (e) {
                        // 忽略
                    }
                    return null;
                });

                const results = await Promise.all(loadPromises);
                for (const note of results) {
                    if (note) {
                        subNotes.push(note);
                    }
                }

                subNotes.sort((a, b) => a.order - b.order);
            }
        } catch (e) {
            // 忽略
        }

        return subNotes;
    }

    /**
     * 渲染嵌套标签页
     */
    function renderNestedNotebookTabs(notes, container, notebookPath) {
        const hasNested = notes.some(n => n.hasChildren && n.children.length > 0);

        if (!hasNested) {
            renderSimpleTabs(notes, container);
            return;
        }

        container.innerHTML = `
            <div class="sy-notebook sy-notebook-nested">
                <div class="sy-tabs sy-tabs-primary">
                    ${notes.map((note, index) => `
                        <button class="sy-tab ${index === 0 ? 'active' : ''}"
                                data-note-index="${index}"
                                data-has-children="${note.hasChildren}">
                            ${note.title}
                            ${note.hasChildren ? '<span class="sy-tab-arrow">▼</span>' : ''}
                        </button>
                    `).join('')}
                </div>
                <div class="sy-tabs-secondary-container"></div>
                <div class="sy-tab-content">
                    <div class="sy-note-content" data-note-index="0">
                        <div class="sy-loading">加载中...</div>
                    </div>
                </div>
            </div>
        `;

        const firstNote = notes[0];
        initNoteDisplay(container, firstNote, 0, notebookPath);

        container.querySelectorAll('.sy-tabs-primary .sy-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const noteIndex = parseInt(tab.dataset.noteIndex);
                const note = notes[noteIndex];

                container.querySelectorAll('.sy-tabs-primary .sy-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                initNoteDisplay(container, note, noteIndex, notebookPath);
            });
        });
    }

    /**
     * 初始化笔记显示
     */
    function initNoteDisplay(container, note, noteIndex, notebookPath) {
        const secondaryContainer = container.querySelector('.sy-tabs-secondary-container');
        const contentArea = container.querySelector('.sy-tab-content');

        contentArea.innerHTML = '';

        if (note.hasChildren && note.children.length > 0) {
            secondaryContainer.innerHTML = `
                <div class="sy-tabs sy-tabs-secondary">
                    ${note.children.map((child, childIndex) => `
                        <button class="sy-tab ${childIndex === 0 ? 'active' : ''}"
                                data-note-path="${child.path}"
                                data-child-index="${childIndex}">
                            ${child.title}
                        </button>
                    `).join('')}
                </div>
            `;

            const firstChild = note.children[0];
            const contentDiv = document.createElement('div');
            contentDiv.className = 'sy-note-content';
            contentDiv.dataset.noteIndex = noteIndex;
            contentDiv.dataset.childIndex = '0';
            contentDiv.innerHTML = '<div class="sy-loading">加载中...</div>';
            contentArea.appendChild(contentDiv);

            if (typeof SiyuanRenderer !== 'undefined') {
                SiyuanRenderer.loadAndRender(firstChild.path, contentDiv);
            }

            secondaryContainer.querySelectorAll('.sy-tab').forEach(childTab => {
                childTab.addEventListener('click', () => {
                    secondaryContainer.querySelectorAll('.sy-tab').forEach(t => t.classList.remove('active'));
                    childTab.classList.add('active');

                    const childPath = childTab.dataset.notePath;
                    const childIndex = childTab.dataset.childIndex;

                    contentArea.innerHTML = `
                        <div class="sy-note-content" data-note-index="${noteIndex}" data-child-index="${childIndex}">
                            <div class="sy-loading">加载中...</div>
                        </div>
                    `;

                    if (typeof SiyuanRenderer !== 'undefined') {
                        SiyuanRenderer.loadAndRender(childPath, contentArea.querySelector('.sy-note-content'));
                    }
                });
            });
        } else {
            secondaryContainer.innerHTML = '';

            const contentDiv = document.createElement('div');
            contentDiv.className = 'sy-note-content';
            contentDiv.dataset.noteIndex = noteIndex;
            contentDiv.innerHTML = '<div class="sy-loading">加载中...</div>';
            contentArea.appendChild(contentDiv);

            if (typeof SiyuanRenderer !== 'undefined') {
                SiyuanRenderer.loadAndRender(note.path, contentDiv);
            }
        }
    }

    /**
     * 渲染简单标签页
     */
    function renderSimpleTabs(notes, container) {
        container.innerHTML = `
            <div class="sy-notebook">
                <div class="sy-tabs">
                    ${notes.map((note, index) => `
                        <button class="sy-tab ${index === 0 ? 'active' : ''}" data-note-path="${note.path}" data-note-index="${index}">
                            ${note.title}
                        </button>
                    `).join('')}
                </div>
                <div class="sy-tab-content">
                    <div class="sy-note-content" data-note-index="0">
                        <div class="sy-loading">加载中...</div>
                    </div>
                </div>
            </div>
        `;

        const firstNotePath = notes[0].path;
        const contentContainer = container.querySelector('.sy-note-content');
        if (typeof SiyuanRenderer !== 'undefined') {
            SiyuanRenderer.loadAndRender(firstNotePath, contentContainer);
        }

        container.querySelectorAll('.sy-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                container.querySelectorAll('.sy-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                const notePath = tab.dataset.notePath;
                const noteIndex = tab.dataset.noteIndex;
                const contentArea = container.querySelector('.sy-tab-content');

                let contentDiv = container.querySelector(`.sy-note-content[data-note-index="${noteIndex}"]`);
                if (!contentDiv) {
                    container.querySelectorAll('.sy-note-content').forEach(c => c.style.display = 'none');
                    contentDiv = document.createElement('div');
                    contentDiv.className = 'sy-note-content';
                    contentDiv.dataset.noteIndex = noteIndex;
                    contentDiv.innerHTML = '<div class="sy-loading">加载中...</div>';
                    contentArea.appendChild(contentDiv);

                    if (typeof SiyuanRenderer !== 'undefined') {
                        SiyuanRenderer.loadAndRender(notePath, contentDiv);
                    }
                } else {
                    container.querySelectorAll('.sy-note-content').forEach(c => c.style.display = 'none');
                    contentDiv.style.display = 'block';
                }
            });
        });
    }

    /**
     * 初始化
     */
    function init() {
        loadData();

        // 关闭按钮
        const closeBtn = document.getElementById('modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        // 点击遮罩关闭
        const overlay = document.getElementById('modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                // 重试按钮
                const retryBtn = e.target.closest('.sy-retry-btn');
                if (retryBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    const notebookPath = retryBtn.dataset.notebookPath;
                    const notebookTitle = retryBtn.dataset.notebookTitle;
                    const container = retryBtn.closest('.sy-notebook-container');
                    if (container && notebookPath) {
                        loadSiyuanNotebook(notebookPath, container, notebookTitle);
                    }
                    return;
                }

                if (e.target === overlay) {
                    closeModal();
                }
            });
        }

        // ESC 关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
    }

    // 公开 API
    return {
        init,
        loadData,
        openModal,
        closeModal,
    };
})();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Interests;
} else if (typeof window !== 'undefined') {
    window.Interests = Interests;
}
