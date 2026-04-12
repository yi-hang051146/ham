/**
 * 验证工具函数
 */

/**
 * 验证邮箱
 * @param {string} email - 邮箱地址
 * @returns {boolean} 是否有效
 */
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

/**
 * 验证手机号（中国）
 * @param {string} phone - 手机号
 * @returns {boolean} 是否有效
 */
export function validatePhone(phone) {
  const re = /^1[3-9]\d{9}$/
  return re.test(phone)
}

/**
 * 验证 URL
 * @param {string} url - URL
 * @returns {boolean} 是否有效
 */
export function validateUrl(url) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 验证是否为空
 * @param {any} value - 值
 * @returns {boolean} 是否为空
 */
export function isEmpty(value) {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * 验证是否为数字
 * @param {any} value - 值
 * @returns {boolean} 是否为数字
 */
export function isNumber(value) {
  return !isNaN(parseFloat(value)) && isFinite(value)
}

/**
 * 验证密码强度
 * @param {string} password - 密码
 * @returns {Object} 强度信息
 */
export function validatePassword(password) {
  const result = {
    valid: false,
    strength: 'weak',
    message: ''
  }

  if (password.length < 6) {
    result.message = '密码长度至少6位'
    return result
  }

  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  const strengthCount = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length

  if (strengthCount >= 3) {
    result.strength = 'strong'
    result.message = '密码强度高'
  } else if (strengthCount >= 2) {
    result.strength = 'medium'
    result.message = '密码强度中等'
  } else {
    result.message = '密码强度低'
  }

  result.valid = true
  return result
}
