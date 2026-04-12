import { Marked } from 'marked'
import katex from 'katex'

// 自定义 marked 实例
const marked = new Marked({
  gfm: true,
  breaks: true,
})

// KaTeX 渲染行内数学公式 $...$
function renderInlineMath(text) {
  return text.replace(/\$([^$]+)\$/g, (match, formula) => {
    try {
      return katex.renderToString(formula, {
        throwOnError: false,
        displayMode: false,
      })
    } catch {
      return match
    }
  })
}

// KaTeX 渲染块级数学公式 $$...$$
function renderBlockMath(text) {
  return text.replace(/\$\$([^$]+)\$\$/g, (match, formula) => {
    try {
      return katex.renderToString(formula, {
        throwOnError: false,
        displayMode: true,
      })
    } catch {
      return match
    }
  })
}

// 去除 YAML front matter
function stripFrontMatter(md) {
  return md.replace(/^---\n[\s\S]*?\n---\n*/, '')
}

// 去除思源特有的空标题行（如 "## \n"）
function cleanSiYuanMarkdown(md) {
  return md.replace(/^##\s*\n/gm, '')
}

/**
 * 渲染思源笔记的 markdown 为 HTML
 * 支持：GFM、LaTeX 公式、任务列表、嵌套列表
 */
export function renderNoteMarkdown(md) {
  if (!md) return ''
  
  let content = stripFrontMatter(md)
  content = cleanSiYuanMarkdown(content)
  
  // 先处理块级数学公式（在 marked 解析前）
  content = renderBlockMath(content)
  
  // marked 解析
  let html = marked.parse(content)
  
  // 再处理行内数学公式（在 marked 解析后，避免被转义）
  html = renderInlineMath(html)
  
  return html
}
