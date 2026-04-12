"""
从思源笔记提取数据并生成静态数据文件
支持提取 Markdown 格式（而不是 HTML）
"""

import json
import requests
from pathlib import Path


class SiYuanDataExtractor:
    """思源笔记数据提取器"""

    def __init__(self, api_url: str = "http://127.0.0.1:6806"):
        self.api_url = api_url

    def api_call(self, endpoint: str, data: dict = None):
        """调用思源 API"""
        url = f"{self.api_url}{endpoint}"
        response = requests.post(url, json=data or {})
        result = response.json()

        if result.get("code") != 0:
            raise Exception(f"API 调用失败: {result.get('msg')}")

        return result.get("data")

    def get_notebooks(self):
        """获取所有笔记本"""
        data = self.api_call("/api/notebook/lsNotebooks")
        return data.get("notebooks", [])

    def get_docs(self, notebook_id: str, path: str = "/"):
        """获取文档列表"""
        data = self.api_call("/api/filetree/listDocsByPath", {
            "notebook": notebook_id,
            "path": path
        })
        return data.get("files", [])

    def get_doc_markdown(self, doc_id: str):
        """获取文档的 Markdown 内容"""
        data = self.api_call("/api/export/exportMdContent", {
            "id": doc_id
        })
        return data.get("content", "")

    def get_block_kramdown(self, block_id: str):
        """获取块的 Kramdown 内容（Markdown 格式）"""
        data = self.api_call("/api/block/getBlockKramdown", {
            "id": block_id
        })
        return data.get("kramdown", "")

    def extract_doc_tree(self, notebook_id: str, parent_path: str = "/", max_depth: int = 3, current_depth: int = 0):
        """递归提取文档树"""
        if current_depth >= max_depth:
            return []

        docs = self.get_docs(notebook_id, parent_path)
        result = []

        for doc in docs:
            doc_data = {
                "id": doc["id"],
                "name": doc["name"],
                "content": ""
            }

            # 获取 Markdown 内容
            try:
                markdown = self.get_doc_markdown(doc["id"])
                if markdown:
                    # 清理内容
                    doc_data["content"] = self.clean_markdown(markdown)
            except Exception as e:
                print(f"  警告: 无法获取文档内容 {doc['name']}: {e}")

            # 递归获取子文档
            if doc.get("subFileCount", 0) > 0:
                child_path = f"{parent_path}{doc['name']}/"
                children = self.extract_doc_tree(
                    notebook_id, child_path, max_depth, current_depth + 1
                )
                if children:
                    doc_data["children"] = children

            result.append(doc_data)

        return result

    def clean_markdown(self, markdown: str) -> str:
        """清理 Markdown 内容"""
        if not markdown:
            return ""

        # 移除 YAML front matter
        lines = markdown.split('\n')
        if lines and lines[0].strip() == '---':
            # 查找结束的 ---
            for i in range(1, len(lines)):
                if lines[i].strip() == '---':
                    markdown = '\n'.join(lines[i+1:])
                    break

        # 移除空标题
        markdown = '\n'.join(
            line for line in markdown.split('\n')
            if not line.strip().startswith('#') or line.strip() != '#'
        )

        # 限制长度（避免数据文件过大）
        max_length = 10000
        if len(markdown) > max_length:
            markdown = markdown[:max_length] + "\n\n... (内容已截断)"

        return markdown.strip()

    def extract_all(self, output_file: str, max_depth: int = 3):
        """提取所有数据并保存"""
        print("开始提取思源笔记数据...")

        notebooks = self.get_notebooks()
        result = []

        for notebook in notebooks:
            print(f"\n处理笔记本: {notebook['name']}")

            notebook_data = {
                "id": notebook["id"],
                "name": notebook["name"],
                "docs": []
            }

            # 提取文档树
            docs = self.extract_doc_tree(notebook["id"], "/", max_depth)
            notebook_data["docs"] = docs

            result.append(notebook_data)
            print(f"  提取了 {len(docs)} 个文档")

        # 保存到文件
        output_path = Path(output_file)
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, 'w', encoding='utf-8') as f:
            f.write("// 思源笔记数据 - 自动生成\n")
            f.write("// 由 generate_siyuan_data.py 从思源笔记 API 获取\n\n")
            f.write("export const siyuanNotebooks = ")
            json.dump(result, f, ensure_ascii=False, indent=2)

        print(f"\n✓ 数据已保存到: {output_file}")
        print(f"  共 {len(result)} 个笔记本")

        return result


def main():
    """命令行入口"""
    import argparse

    parser = argparse.ArgumentParser(description='提取思源笔记数据')
    parser.add_argument('-o', '--output', default='src/data/siyuan.js',
                        help='输出文件路径')
    parser.add_argument('--api', default='http://127.0.0.1:6806',
                        help='思源 API 地址')
    parser.add_argument('-d', '--depth', type=int, default=3,
                        help='最大递归深度')

    args = parser.parse_args()

    extractor = SiYuanDataExtractor(args.api)
    extractor.extract_all(args.output, args.depth)


if __name__ == '__main__':
    main()
