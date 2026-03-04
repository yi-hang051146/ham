/**
 * 关注内容模块
 * 功能：展示用户关注的内容分类和详情
 */

// 全局变量
let interestsData = null;

/**
 * 加载关注内容数据
 */
async function loadInterestsData() {
    try {
        const response = await fetch('./data/interests.json');
        if (!response.ok) {
            throw new Error('Failed to load interests data');
        }
        interestsData = await response.json();
        renderInterestCards();
    } catch (error) {
        console.error('加载关注内容数据失败:', error);
        const grid = document.getElementById('interests-grid');
        if (grid) {
            grid.innerHTML = `
                <div class="interest-empty">
                    <div class="interest-empty-icon">⚠️</div>
                    <div class="interest-empty-text">数据加载失败，请刷新页面重试</div>
                </div>
            `;
        }
    }
}

/**
 * 渲染关注内容卡片
 */
function renderInterestCards() {
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
 * 加载思源笔记本（支持嵌套标签页）
 */
async function loadSiyuanNotebook(notebookPath, container, notebookTitle) {
    try {
        // 读取 sort.json 获取笔记列表
        const sortUrl = `${notebookPath}/.siyuan/sort.json`;
        const sortResponse = await fetch(sortUrl);
        
        if (!sortResponse.ok) {
            container.innerHTML = '<div class="sy-error">无法加载笔记本目录</div>';
            return;
        }
        
        const sortData = await sortResponse.json();
        
        // 收集所有笔记（包括子目录中的笔记）
        const notes = [];
        const subNotebooks = new Map(); // 存储子笔记本
        
        // 遍历 sort.json 中的键
        for (const [noteId, sortOrder] of Object.entries(sortData)) {
            const notePath = `${notebookPath}/${noteId}.sy`;
            
            // 尝试加载根目录的笔记
            try {
                const noteResponse = await fetch(notePath);
                if (noteResponse.ok) {
                    const noteData = await noteResponse.json();
                    const title = noteData?.Properties?.title || noteId;
                    
                    // 检查是否有子目录
                    const subDirPath = `${notebookPath}/${noteId}`;
                    const subNotes = await loadSubDirectoryNotes(subDirPath, notebookPath);
                    
                    notes.push({
                        id: noteId,
                        title: title,
                        path: notePath,
                        order: sortOrder,
                        hasChildren: subNotes.length > 0,
                        children: subNotes
                    });
                }
            } catch (e) {
                // 忽略加载失败的笔记
            }
        }
        
        // 按 order 排序
        notes.sort((a, b) => a.order - b.order);
        
        if (notes.length === 0) {
            container.innerHTML = '<div class="sy-empty">笔记本为空</div>';
            return;
        }
        
        // 渲染嵌套标签页界面
        renderNestedNotebookTabs(notes, container, notebookPath);
        
    } catch (error) {
        console.error('加载笔记本失败:', error);
        container.innerHTML = `<div class="sy-error">加载笔记本失败: ${error.message}</div>`;
    }
}

/**
 * 加载子目录中的笔记
 */
async function loadSubDirectoryNotes(subDirPath, basePath) {
    const subNotes = [];
    
    try {
        // 尝试读取子目录的 sort.json
        const subSortUrl = `${subDirPath}/.siyuan/sort.json`;
        const subSortResponse = await fetch(subSortUrl);
        
        if (subSortResponse.ok) {
            const subSortData = await subSortResponse.json();
            
            for (const [noteId, sortOrder] of Object.entries(subSortData)) {
                const notePath = `${subDirPath}/${noteId}.sy`;
                
                try {
                    const noteResponse = await fetch(notePath);
                    if (noteResponse.ok) {
                        const noteData = await noteResponse.json();
                        const title = noteData?.Properties?.title || noteId;
                        subNotes.push({
                            id: noteId,
                            title: title,
                            path: notePath,
                            order: sortOrder
                        });
                    }
                } catch (e) {
                    // 忽略
                }
            }
            
            // 按 order 排序
            subNotes.sort((a, b) => a.order - b.order);
        } else {
            // 如果没有 sort.json，尝试直接加载 .sy 文件
            // 由于浏览器限制，无法列出目录，所以尝试常见的 ID 格式
            const possibleIds = [];
            // 从 sort.json 的键中提取可能的子笔记 ID
            // 这里我们尝试加载子目录中可能存在的笔记
            
            // 尝试加载子目录中直接存在的 .sy 文件
            // 通过检查 sort.json 中是否有指向子目录的引用
        }
    } catch (e) {
        // 忽略错误
    }
    
    return subNotes;
}

/**
 * 渲染嵌套标签页界面
 */
function renderNestedNotebookTabs(notes, container, notebookPath) {
    // 检查是否有嵌套结构
    const hasNested = notes.some(n => n.hasChildren && n.children.length > 0);
    
    if (!hasNested) {
        // 没有嵌套，使用简单标签页
        renderSimpleTabs(notes, container);
        return;
    }
    
    // 有嵌套，使用二级标签页
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
    
    // 初始化第一个笔记
    const firstNote = notes[0];
    initNoteDisplay(container, firstNote, 0, notebookPath);
    
    // 绑定一级标签页点击事件
    container.querySelectorAll('.sy-tabs-primary .sy-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const noteIndex = parseInt(tab.dataset.noteIndex);
            const note = notes[noteIndex];
            
            // 切换一级标签页激活状态
            container.querySelectorAll('.sy-tabs-primary .sy-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // 初始化笔记显示
            initNoteDisplay(container, note, noteIndex, notebookPath);
        });
    });
}

/**
 * 初始化笔记显示（处理嵌套情况）
 */
function initNoteDisplay(container, note, noteIndex, notebookPath) {
    const secondaryContainer = container.querySelector('.sy-tabs-secondary-container');
    const contentArea = container.querySelector('.sy-tab-content');
    
    // 清空内容区域
    contentArea.innerHTML = '';
    
    if (note.hasChildren && note.children.length > 0) {
        // 有子笔记，显示二级标签页
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
        
        // 加载第一个子笔记
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
        
        // 绑定二级标签页点击事件
        secondaryContainer.querySelectorAll('.sy-tab').forEach(childTab => {
            childTab.addEventListener('click', () => {
                secondaryContainer.querySelectorAll('.sy-tab').forEach(t => t.classList.remove('active'));
                childTab.classList.add('active');
                
                const childPath = childTab.dataset.notePath;
                const childIndex = childTab.dataset.childIndex;
                
                // 清空并加载新内容
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
        // 没有子笔记，直接显示内容
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
 * 渲染简单标签页（无嵌套）
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
    
    // 加载第一个笔记
    const firstNotePath = notes[0].path;
    const contentContainer = container.querySelector('.sy-note-content');
    if (typeof SiyuanRenderer !== 'undefined') {
        SiyuanRenderer.loadAndRender(firstNotePath, contentContainer);
    }
    
    // 绑定标签页点击事件
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
 * 关闭模态框
 */
function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * 初始化关注内容模块
 */
function initInterests() {
    loadInterestsData();

    const closeBtn = document.getElementById('modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

document.addEventListener('DOMContentLoaded', initInterests);
