<template>
  <div class="siyuan-notes">
    <div class="notes-header">
      <div class="notes-title-row">
        <svg class="notes-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
        <h2 class="notes-title">思源笔记</h2>
      </div>
      <div class="notes-status connected">
        <span class="status-dot"></span>
        <span class="status-text">已连接</span>
      </div>
    </div>

    <!-- 笔记本列表 -->
    <div class="notebooks-container">
      <div 
        v-for="notebook in notebooks" 
        :key="notebook.id" 
        class="notebook-section"
      >
        <div 
          class="notebook-header"
          @click="toggleNotebook(notebook.id)"
        >
          <svg class="notebook-arrow" :class="{ expanded: expandedNotebooks.has(notebook.id) }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
          <svg class="notebook-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          <span class="notebook-name">{{ notebook.name }}</span>
          <span class="notebook-count">{{ notebook.docs.length }}</span>
        </div>

        <Transition name="expand">
          <div v-if="expandedNotebooks.has(notebook.id)" class="notebook-docs">
            <div 
              v-for="doc in notebook.docs" 
              :key="doc.id" 
              class="doc-item"
            >
              <div class="doc-row" @click="toggleDoc(doc.id)">
                <svg class="doc-arrow" :class="{ expanded: expandedDocs.has(doc.id) }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
                <svg class="doc-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <span class="doc-name">{{ doc.name }}</span>
                <!-- 课程关联标记 -->
                <span v-if="isCourseNote(doc.id)" class="course-badge">课</span>
              </div>

              <!-- 展开内容 -->
              <Transition name="expand">
                <div v-if="expandedDocs.has(doc.id)" class="doc-expand">
                  <!-- 笔记内容 -->
                  <div v-if="doc.content" class="doc-content" v-html="renderNoteMarkdown(doc.content)"></div>
                  <p v-else class="doc-content-empty">暂无内容</p>
                  <!-- 子文档 -->
                  <div v-if="doc.children?.length" class="doc-children">
                    <div class="children-label">子文档</div>
                    <div 
                      v-for="child in doc.children" 
                      :key="child.id" 
                      class="child-item"
                      @click="toggleChild(child.id)"
                    >
                      <svg v-if="child.content || child.children?.length" class="child-arrow" :class="{ expanded: expandedChildren.has(child.id) }" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 !8 9"/>
                      </svg>
                      <span v-else class="child-dot"></span>
                      <span class="child-name">{{ child.name }}</span>
                    </div>
                    <!-- 子文档展开内容 -->
                    <div v-for="child in doc.children" :key="'c-'+child.id">
                      <Transition name="expand">
                        <div v-if="expandedChildren.has(child.id)" class="child-expand">
                          <div v-if="child.content" class="child-content" v-html="renderNoteMarkdown(child.content)"></div>
                          <p v-else class="doc-content-empty">暂无内容</p>
                          <!-- 三级子文档 -->
                          <div v-if="child.children?.length" class="doc-children nested">
                            <div class="children-label">子文档</div>
                            <div v-for="grand in child.children" :key="grand.id" class="child-item">
                              <span class="child-dot"></span>
                              <span class="child-name">{{ grand.name }}</span>
                            </div>
                          </div>
                        </div>
                      </Transition>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { siyuanNotebooks, courseNoteMap } from '../../data/siyuan.js'
import { renderNoteMarkdown } from '../../utils/markdown.js'

const notebooks = siyuanNotebooks

const expandedNotebooks = reactive(new Set([notebooks[0]?.id]))
const expandedDocs = reactive(new Set())
const expandedChildren = reactive(new Set())

function toggleNotebook(id) {
  if (expandedNotebooks.has(id)) {
    expandedNotebooks.delete(id)
  } else {
    expandedNotebooks.add(id)
  }
}

function toggleDoc(id) {
  if (expandedDocs.has(id)) {
    expandedDocs.delete(id)
  } else {
    expandedDocs.add(id)
  }
}

function toggleChild(id) {
  if (expandedChildren.has(id)) {
    expandedChildren.delete(id)
  } else {
    expandedChildren.add(id)
  }
}

function isCourseNote(docId) {
  return Object.values(courseNoteMap).includes(docId)
}
</script>

<style scoped>
.siyuan-notes {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
}

.notes-header {
  padding: 18px 22px;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.notes-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.notes-icon {
  color: var(--sol-cyan);
}

.notes-title {
  font-family: var(--font-serif);
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.notes-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
}

.notes-status .status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.notes-status.connected .status-dot {
  background: var(--sol-green);
}

.notes-status.connected .status-text {
  color: var(--sol-green);
}

/* 笔记本列表 */
.notebooks-container {
  padding: 8px 0;
}

.notebook-section {
  border-bottom: 1px solid var(--border-light);
}

.notebook-section:last-child {
  border-bottom: none;
}

.notebook-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  cursor: pointer;
  transition: background var(--transition-fast);
  user-select: none;
}

.notebook-header:hover {
  background: var(--bg-card-hover);
}

.notebook-arrow {
  color: var(--text-muted);
  transition: transform var(--transition-fast);
  flex-shrink: 0;
}

.notebook-arrow.expanded {
  transform: rotate(180deg);
}

.notebook-icon {
  color: var(--sol-yellow);
  flex-shrink: 0;
}

.notebook-name {
  font-weight: 600;
  font-size: 0.92rem;
  color: var(--text-primary);
  flex: 1;
}

.notebook-count {
  font-size: 0.72rem;
  color: var(--text-muted);
  background: var(--bg-secondary);
  padding: 1px 8px;
  border-radius: 10px;
}

/* 文档列表 */
.notebook-docs {
  padding: 0 18px 8px 28px;
}

.doc-item {
  margin-bottom: 2px;
}

.doc-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.doc-row:hover {
  background: var(--bg-card-hover);
}

.doc-arrow {
  color: var(--text-muted);
  transition: transform var(--transition-fast);
  flex-shrink: 0;
}

.doc-arrow.expanded {
  transform: rotate(180deg);
}

.doc-icon {
  color: var(--sol-cyan);
  flex-shrink: 0;
}

.doc-name {
  font-size: 0.88rem;
  color: var(--text-primary);
  font-weight: 500;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.course-badge {
  font-size: 0.65rem;
  padding: 0px 5px;
  border-radius: 4px;
  background: rgba(181, 137, 0, 0.15);
  color: var(--sol-yellow);
  font-weight: 600;
  flex-shrink: 0;
}

/* 展开内容 */
.doc-expand {
  padding: 8px 8px 8px 24px;
  animation: fadeSlideIn 0.25s ease;
}

@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.doc-content {
  font-size: 0.84rem;
  color: var(--text-secondary);
  line-height: 1.7;
  padding: 14px 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border-left: 2px solid var(--sol-cyan);
  margin-bottom: 8px;
  max-height: 500px;
  overflow-y: auto;
}

.doc-content :deep(h1) {
  font-family: var(--font-serif);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 12px 0 6px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--border-light);
}

.doc-content :deep(h2) {
  font-family: var(--font-serif);
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 10px 0 5px;
}

.doc-content :deep(h3) {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 8px 0 4px;
}

.doc-content :deep(h4) {
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 6px 0 3px;
}

.doc-content :deep(p) {
  margin: 4px 0;
}

.doc-content :deep(strong) {
  color: var(--text-primary);
  font-weight: 600;
}

.doc-content :deep(em) {
  color: var(--text-secondary);
  font-style: italic;
}

.doc-content :deep(code) {
  background: rgba(42, 161, 152, 0.1);
  color: var(--sol-cyan);
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 0.8rem;
  font-family: 'Consolas', 'Monaco', monospace;
}

.doc-content :deep(pre) {
  background: var(--sol-base03);
  color: var(--sol-base1);
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  overflow-x: auto;
  margin: 8px 0;
  font-size: 0.78rem;
}

.doc-content :deep(pre code) {
  background: none;
  color: inherit;
  padding: 0;
}

.doc-content :deep(hr) {
  border: none;
  border-top: 1px solid var(--border-light);
  margin: 10px 0;
}

.doc-content :deep(ul),
.doc-content :deep(ol) {
  padding-left: 20px;
  margin: 4px 0;
}

.doc-content :deep(li) {
  margin: 2px 0;
}

.doc-content :deep(blockquote) {
  border-left: 3px solid var(--sol-yellow);
  padding-left: 12px;
  margin: 8px 0;
  color: var(--text-muted);
}

.doc-content :deep(a) {
  color: var(--sol-cyan);
  text-decoration: none;
}

.doc-content :deep(a:hover) {
  text-decoration: underline;
}

/* KaTeX 公式样式 */
.doc-content :deep(.katex-display) {
  margin: 10px 0;
  overflow-x: auto;
  overflow-y: hidden;
}

.doc-content :deep(.katex) {
  font-size: 0.95em;
}

/* 任务列表 */
.doc-content :deep(input[type="checkbox"]) {
  margin-right: 6px;
  accent-color: var(--sol-yellow);
}

.doc-content-empty {
  font-size: 0.82rem;
  color: var(--text-muted);
  font-style: italic;
  padding: 12px 14px;
}

/* 子文档 */
.doc-children {
  padding: 4px 0 0;
}

.children-label {
  font-size: 0.72rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  padding-left: 4px;
}

.child-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.15s;
}

.child-item:hover {
  background: var(--bg-hover);
}

.child-arrow {
  flex-shrink: 0;
  transition: transform 0.2s;
  color: var(--text-muted);
}

.child-arrow.expanded {
  transform: rotate(90deg);
}

.child-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--text-muted);
  flex-shrink: 0;
}

.child-name {
  font-size: 0.82rem;
  color: var(--text-muted);
}

.child-expand {
  margin: 6px 0 6px 18px;
  padding: 10px 14px;
  background: var(--bg);
  border-left: 3px solid var(--sol-cyan);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  max-height: 400px;
  overflow-y: auto;
}

.child-content {
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--text-primary);
}

.child-content :deep(h1) { font-size: 1.05rem; font-weight: 600; margin: 8px 0 4px; color: var(--text-primary); }
.child-content :deep(h2) { font-size: 0.95rem; font-weight: 600; margin: 6px 0 3px; color: var(--text-primary); }
.child-content :deep(h3) { font-size: 0.9rem; font-weight: 600; margin: 4px 0 2px; color: var(--text-secondary); }
.child-content :deep(p) { margin: 3px 0; }
.child-content :deep(strong) { color: var(--sol-yellow); font-weight: 600; }
.child-content :deep(code) { background: var(--bg-highlight); padding: 1px 4px; border-radius: 3px; font-size: 0.8rem; }
.child-content :deep(pre) { background: var(--bg-highlight); padding: 8px; border-radius: var(--radius-sm); overflow-x: auto; font-size: 0.78rem; }
.child-content :deep(ul), .child-content :deep(ol) { padding-left: 16px; margin: 3px 0; }
.child-content :deep(li) { margin: 2px 0; }
.child-content :deep(.katex) { font-size: 0.9em; }
.child-content :deep(.katex-display) { margin: 6px 0; overflow-x: auto; }

.doc-children.nested {
  margin-top: 8px;
  padding-left: 4px;
  border-left: 2px solid var(--border-light);
}

/* 展开动画 */
.expand-enter-active {
  transition: all 0.25s ease;
  overflow: hidden;
}

.expand-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
