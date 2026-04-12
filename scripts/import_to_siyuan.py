"""
将 Markdown 文件导入到思源笔记
使用 MCP (Model Context Protocol) 与思源笔记交互
"""

import os
import json
import requests
from pathlib import Path


class SiYuanImporter:
    """思源笔记导入器"""

    def __init__(self, api_url: str = "http://127.0.0.1:6806"):
        """
        初始化导入器

        Args:
            api_url: 思源笔记 API 地址
        """
        self.api_url = api_url

    def create_notebook(self, name: str) -> str:
        """
        创建笔记本

        Args:
            name: 笔记本名称

        Returns:
            笔记本 ID
        """
        url = f"{self.api_url}/api/notebook/createNotebook"
        data = {"name": name}

        response = requests.post(url, json=data)
        result = response.json()

        if result.get("code") == 0:
            return result["data"]["notebook"]["id"]
        else:
            raise Exception(f"创建笔记本失败: {result.get('msg')}")

    def create_document(self, notebook_id: str, path: str, markdown: str) -> str:
        """
        创建文档

        Args:
            notebook_id: 笔记本 ID
            path: 文档路径（如 /文件夹/文档名）
            markdown: Markdown 内容

        Returns:
            文档 ID
        """
        url = f"{self.api_url}/api/filetree/createDoc"
        data = {
            "notebook": notebook_id,
            "path": path,
            "markdown": markdown
        }

        response = requests.post(url, json=data)
        result = response.json()

        if result.get("code") == 0:
            return result["data"]
        else:
            raise Exception(f"创建文档失败: {result.get('msg')}")

    def import_markdown_file(self, notebook_id: str, md_file: str, parent_path: str = "/") -> str:
        """
        导入单个 Markdown 文件

        Args:
            notebook_id: 笔记本 ID
            md_file: Markdown 文件路径
            parent_path: 父文档路径

        Returns:
            文档 ID
        """
        md_path = Path(md_file)
        if not md_path.exists():
            raise FileNotFoundError(f"文件不存在: {md_file}")

        # 读取 Markdown 内容
        content = md_path.read_text(encoding='utf-8')

        # 构建文档路径
        doc_name = md_path.stem
        doc_path = f"{parent_path}/{doc_name}" if parent_path != "/" else f"/{doc_name}"

        # 创建文档
        return self.create_document(notebook_id, doc_path, content)

    def import_directory(self, notebook_id: str, dir_path: str, parent_path: str = "/") -> list:
        """
        批量导入目录下的 Markdown 文件

        Args:
            notebook_id: 笔记本 ID
            dir_path: 目录路径
            parent_path: 父文档路径

        Returns:
            文档 ID 列表
        """
        dir_path = Path(dir_path)
        if not dir_path.is_dir():
            raise NotADirectoryError(f"目录不存在: {dir_path}")

        results = []
        md_files = list(dir_path.glob("*.md"))

        for md_file in md_files:
            try:
                doc_id = self.import_markdown_file(notebook_id, str(md_file), parent_path)
                results.append(doc_id)
                print(f"✓ 导入成功: {md_file.name} -> {doc_id}")
            except Exception as e:
                print(f"✗ 导入失败: {md_file.name}, 错误: {e}")

        return results


def main():
    """命令行入口"""
    import argparse

    parser = argparse.ArgumentParser(description='Markdown 导入思源笔记工具')
    parser.add_argument('input', help='输入 Markdown 文件或目录路径')
    parser.add_argument('-n', '--notebook', required=True, help='笔记本 ID 或名称')
    parser.add_argument('-p', '--path', default='/', help='父文档路径')
    parser.add_argument('--api', default='http://127.0.0.1:6806', help='思源 API 地址')

    args = parser.parse_args()

    # 创建导入器
    importer = SiYuanImporter(args.api)

    # 如果 notebook 参数不是 ID，则创建新笔记本
    notebook_id = args.notebook
    if not notebook_id.startswith("20"):  # 思源 ID 通常以 20 开头
        print(f"创建笔记本: {notebook_id}")
        notebook_id = importer.create_notebook(notebook_id)
        print(f"笔记本 ID: {notebook_id}")

    input_path = Path(args.input)

    if input_path.is_file():
        # 导入单个文件
        doc_id = importer.import_markdown_file(notebook_id, str(input_path), args.path)
        print(f"导入完成，文档 ID: {doc_id}")
    elif input_path.is_dir():
        # 导入目录
        doc_ids = importer.import_directory(notebook_id, str(input_path), args.path)
        print(f"\n批量导入完成，共 {len(doc_ids)} 个文档")
    else:
        print(f"错误: 输入路径不存在: {input_path}")
        sys.exit(1)


if __name__ == '__main__':
    main()
