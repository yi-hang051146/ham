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
        // 显示错误提示
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

    // 添加点击事件
    grid.querySelectorAll('.interest-card').forEach(card => {
        card.addEventListener('click', () => {
            const categoryId = card.dataset.categoryId;
            openModal(categoryId);
        });
    });
}

/**
 * 打开模态框
 * @param {string} categoryId - 分类ID
 */
function openModal(categoryId) {
    const category = interestsData.categories.find(c => c.id === categoryId);
    if (!category) return;

    const overlay = document.getElementById('modal-overlay');
    const icon = document.getElementById('modal-icon');
    const titleText = document.getElementById('modal-title-text');
    const body = document.getElementById('modal-body');

    // 设置标题
    icon.textContent = category.icon;
    titleText.textContent = category.name;

    // 渲染内容
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

        // 加载思源笔记本（多个笔记）
        body.querySelectorAll('.sy-notebook-container').forEach(container => {
            const notebookPath = container.dataset.notebookPath;
            const notebookTitle = container.dataset.notebookTitle;
            if (notebookPath && typeof loadSiyuanNotebook !== 'undefined') {
                loadSiyuanNotebook(notebookPath, container, notebookTitle);
            }
        });
    }

    // 显示模态框
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * 加载思源笔记本（支持多个笔记的标签页切换）
 * @param {string} notebookPath - 笔记本目录路径
 * @param {HTMLElement} container - 容器元素
 * @param {string} notebookTitle - 笔记本标题
 */
async function loadSiyuanNotebook(notebookPath, container, notebookTitle) {
    try {
        // 读取 sort.json 获取笔记列表
        const sortUrl = `${notebookPath}/.siyuan/sort.json`;
        const sortResponse = await fetch(sortUrl);
        
        if (!sortResponse.ok) {
            // 如果没有 sort.json，尝试直接加载目录下的 .sy 文件
            await loadNotebookWithoutSort(notebookPath, container, notebookTitle);
            return;
        }
        
        const sortData = await sortResponse.json();
        
        // 获取所有笔记文件
        const notes = [];
        
        // 遍历 sort.json 中的键，获取笔记信息
        for (const [noteId, sortOrder] of Object.entries(sortData)) {
            // 检查是否是子目录中的笔记
            const subDirPath = `${notebookPath}/${noteId}`;
            let notePath = `${notebookPath}/${noteId}.sy`;
            let noteTitle = '';
            
            // 尝试加载笔记
            try {
                const noteResponse = await fetch(notePath);
                if (noteResponse.ok) {
                    const noteData = await noteResponse.json();
                    noteTitle = noteData?.Properties?.title || noteId;
                    notes.push({
                        id: noteId,
                        title: noteTitle,
                        path: notePath,
                        order: sortOrder
                    });
                }
            } catch (e) {
                // 忽略加载失败的笔记
            }
            
            // 检查子目录
            try {
                const subDirResponse = await fetch(subDirPath);
                // 如果是目录，遍历其中的 .sy 文件
                // 由于浏览器无法直接列出目录，我们需要在 sort.json 中包含子笔记信息
            } catch (e) {
                // 忽略
            }
        }
        
        // 按 order 排序
        notes.sort((a, b) => a.order - b.order);
        
        if (notes.length === 0) {
            container.innerHTML = '<div class="sy-empty">笔记本为空</div>';
            return;
        }
        
        // 渲染标签页界面
        renderNotebookTabs(notes, container, notebookTitle);
        
    } catch (error) {
        console.error('加载笔记本失败:', error);
        container.innerHTML = `<div class="sy-error">加载笔记本失败: ${error.message}</div>`;
    }
}

/**
 * 渲染笔记本标签页界面
 * @param {Array} notes - 笔记列表
 * @param {HTMLElement} container - 容器元素
 * @param {string} notebookTitle - 笔记本标题
 */
function renderNotebookTabs(notes, container, notebookTitle) {
    // 创建标签页结构
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
            // 切换激活状态
            container.querySelectorAll('.sy-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // 加载对应笔记
            const notePath = tab.dataset.notePath;
            const noteIndex = tab.dataset.noteIndex;
            const contentArea = container.querySelector('.sy-tab-content');
            
            // 检查是否已加载
            let contentDiv = container.querySelector(`.sy-note-content[data-note-index="${noteIndex}"]`);
            if (!contentDiv) {
                // 创建新的内容区域
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
                // 切换显示
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
    // 加载数据
    loadInterestsData();

    // 绑定关闭按钮事件
    const closeBtn = document.getElementById('modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // 点击遮罩层关闭
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal();
            }
        });
    }

    // ESC键关闭
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initInterests);
