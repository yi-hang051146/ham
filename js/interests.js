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
            </div>
        `).join('');

        // 加载思源笔记内容
        body.querySelectorAll('.sy-note-container').forEach(container => {
            const syPath = container.dataset.syPath;
            if (syPath && typeof SiyuanRenderer !== 'undefined') {
                SiyuanRenderer.loadAndRender(syPath, container);
            }
        });
    }

    // 显示模态框
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
