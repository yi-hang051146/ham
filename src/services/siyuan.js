/**
 * 思源笔记服务
 * 封装与思源笔记 API 的交互
 */

const SIYUAN_API = 'http://127.0.0.1:6806'

/**
 * 思源笔记 API 服务
 */
export const siyuanService = {
  /**
   * 获取所有笔记本
   */
  async getNotebooks() {
    const response = await fetch(`${SIYUAN_API}/api/notebook/lsNotebooks`)
    const result = await response.json()
    if (result.code === 0) {
      return result.data.notebooks
    }
    throw new Error(result.msg)
  },

  /**
   * 获取笔记本下的文档列表
   * @param {string} notebookId - 笔记本 ID
   */
  async getDocs(notebookId) {
    const response = await fetch(`${SIYUAN_API}/api/filetree/listDocsByPath`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notebook: notebookId, path: '/' })
    })
    const result = await response.json()
    if (result.code === 0) {
      return result.data.files
    }
    throw new Error(result.msg)
  },

  /**
   * 获取文档内容
   * @param {string} docId - 文档 ID
   */
  async getDocContent(docId) {
    const response = await fetch(`${SIYUAN_API}/api/filetree/getDoc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: docId })
    })
    const result = await response.json()
    if (result.code === 0) {
      return result.data.content
    }
    throw new Error(result.msg)
  },

  /**
   * 搜索文档
   * @param {string} query - 搜索关键词
   */
  async searchDocs(query) {
    const response = await fetch(`${SIYUAN_API}/api/search/fullTextSearchBlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    })
    const result = await response.json()
    if (result.code === 0) {
      return result.data.blocks
    }
    throw new Error(result.msg)
  },

  /**
   * 创建文档
   * @param {string} notebookId - 笔记本 ID
   * @param {string} path - 文档路径
   * @param {string} markdown - Markdown 内容
   */
  async createDoc(notebookId, path, markdown) {
    const response = await fetch(`${SIYUAN_API}/api/filetree/createDoc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notebook: notebookId,
        path,
        markdown
      })
    })
    const result = await response.json()
    if (result.code === 0) {
      return result.data
    }
    throw new Error(result.msg)
  }
}

export default siyuanService
