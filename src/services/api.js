/**
 * 通用 API 服务
 * 封装 HTTP 请求
 */

/**
 * HTTP 请求封装
 */
class ApiService {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl
  }

  /**
   * 发送请求
   * @param {string} url - 请求 URL
   * @param {Object} options - 请求选项
   */
  async request(url, options = {}) {
    const fullUrl = this.baseUrl + url

    try {
      const response = await fetch(fullUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  /**
   * GET 请求
   * @param {string} url - 请求 URL
   * @param {Object} params - 查询参数
   */
  async get(url, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const fullUrl = queryString ? `${url}?${queryString}` : url

    return this.request(fullUrl, { method: 'GET' })
  }

  /**
   * POST 请求
   * @param {string} url - 请求 URL
   * @param {Object} data - 请求体数据
   */
  async post(url, data = {}) {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  /**
   * PUT 请求
   * @param {string} url - 请求 URL
   * @param {Object} data - 请求体数据
   */
  async put(url, data = {}) {
    return this.request(url, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  /**
   * DELETE 请求
   * @param {string} url - 请求 URL
   */
  async delete(url) {
    return this.request(url, { method: 'DELETE' })
  }
}

// 创建默认实例
export const api = new ApiService()

export default ApiService
