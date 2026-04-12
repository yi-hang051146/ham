"""
文件转换工具 - 使用 markitdown 将各种文件格式转换为 Markdown
支持：PDF, Word, HTML, PowerPoint, Excel 等格式
"""

import os
import sys
from pathlib import Path
from markitdown import MarkItDown


class FileConverter:
    """文件转换器，将各种格式转换为 Markdown"""

    def __init__(self, output_dir: str = None):
        """
        初始化转换器

        Args:
            output_dir: 输出目录，默认为当前目录
        """
        self.md = MarkItDown()
        self.output_dir = Path(output_dir) if output_dir else Path.cwd()

    def convert_file(self, file_path: str, output_name: str = None) -> str:
        """
        转换单个文件为 Markdown

        Args:
            file_path: 源文件路径
            output_name: 输出文件名（不含扩展名），默认使用源文件名

        Returns:
            转换后的 Markdown 文件路径
        """
        file_path = Path(file_path)
        if not file_path.exists():
            raise FileNotFoundError(f"文件不存在: {file_path}")

        # 转换文件
        result = self.md.convert(str(file_path))

        # 确定输出文件名
        if output_name is None:
            output_name = file_path.stem

        output_path = self.output_dir / f"{output_name}.md"

        # 写入 Markdown 文件
        output_path.write_text(result.text_content, encoding='utf-8')

        return str(output_path)

    def convert_batch(self, file_paths: list, output_names: list = None) -> list:
        """
        批量转换文件

        Args:
            file_paths: 源文件路径列表
            output_names: 输出文件名列表（可选）

        Returns:
            转换后的 Markdown 文件路径列表
        """
        results = []
        for i, file_path in enumerate(file_paths):
            output_name = output_names[i] if output_names and i < len(output_names) else None
            try:
                result_path = self.convert_file(file_path, output_name)
                results.append(result_path)
                print(f"✓ 转换成功: {file_path} -> {result_path}")
            except Exception as e:
                print(f"✗ 转换失败: {file_path}, 错误: {e}")
        return results

    def convert_directory(self, dir_path: str, extensions: list = None) -> list:
        """
        转换目录下的所有文件

        Args:
            dir_path: 目录路径
            extensions: 文件扩展名列表，如 ['.pdf', '.docx']，默认转换所有支持的格式

        Returns:
            转换后的 Markdown 文件路径列表
        """
        dir_path = Path(dir_path)
        if not dir_path.is_dir():
            raise NotADirectoryError(f"目录不存在: {dir_path}")

        # 默认支持的扩展名
        if extensions is None:
            extensions = ['.pdf', '.docx', '.doc', '.html', '.htm', '.pptx', '.xlsx']

        # 查找所有匹配的文件
        files = []
        for ext in extensions:
            files.extend(dir_path.glob(f'*{ext}'))

        # 转换所有文件
        return self.convert_batch([str(f) for f in files])


def main():
    """命令行入口"""
    import argparse

    parser = argparse.ArgumentParser(description='文件转 Markdown 工具')
    parser.add_argument('input', help='输入文件或目录路径')
    parser.add_argument('-o', '--output', help='输出目录路径')
    parser.add_argument('-e', '--extensions', nargs='+', help='文件扩展名列表（用于目录转换）')

    args = parser.parse_args()

    # 创建转换器
    converter = FileConverter(args.output)

    input_path = Path(args.input)

    if input_path.is_file():
        # 转换单个文件
        result = converter.convert_file(str(input_path))
        print(f"转换完成: {result}")
    elif input_path.is_dir():
        # 转换目录
        results = converter.convert_directory(str(input_path), args.extensions)
        print(f"\n批量转换完成，共 {len(results)} 个文件")
    else:
        print(f"错误: 输入路径不存在: {input_path}")
        sys.exit(1)


if __name__ == '__main__':
    main()
