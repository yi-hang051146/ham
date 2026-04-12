"""
批量提取思源笔记文档内容
通过 MCP 工具逐个获取文档的 Markdown 内容
"""

# 文档树结构（从 MCP 获取）
doc_tree = [
    {
        "id": "20260115202116-fc0h2kx",
        "name": "随机过程",
        "children": [
            {"id": "20260115203524-u65lesc", "name": "概率论"},
            {"id": "20260326132033-p0b63fh", "name": "测验真题"},
            {"id": "20260329160212-pne7wec", "name": "第一题 詹森不等式"},
            {"id": "20260331142919-0g12xxr", "name": "第二题 条件期望的最优性"},
            {"id": "20260405205349-zul2sw1", "name": "布朗运动"},
            {"id": "20260407192042-sb9umw6", "name": "第七章"}
        ]
    },
    {
        "id": "20260115202119-1xccwe5",
        "name": "常微分方程",
        "children": [
            {"id": "20260207203741-hu7sphy", "name": "寒假复习"},
            {"id": "20260308135848-vd4slah", "name": "为什么将初值问题称为柯西问题"}
        ]
    },
    {
        "id": "20260214081507-0j2zcju",
        "name": "模拟题",
        "children": [
            {"id": "20260214214126-ot1y6sc", "name": "渐近线"},
            {"id": "20260214223131-27ze0lr", "name": "六个基本的指对函数"},
            {"id": "20260214225220-6tab0f8", "name": "偏导数"},
            {"id": "20260215135533-yym375g", "name": "变上限积分"},
            {"id": "20260215152537-mz9li80", "name": "求反函数"},
            {"id": "20260215153352-rf286lw", "name": "矩阵"},
            {"id": "20260305143459-uj111aq", "name": "泊松分布"},
            {"id": "20260318003810-fspcaqa", "name": "线性方程组"},
            {"id": "20260318005912-xokafmc", "name": "边缘分布"},
            {"id": "20260318121701-pqhhwt2", "name": "参数估计"}
        ]
    },
    {
        "id": "20260303183032-j0g9aqk",
        "name": "动态最优化"
    },
    {
        "id": "20260305193649-snv1pof",
        "name": "投资学"
    },
    {
        "id": "20260306094521-f5z0b6b",
        "name": "固定收益证券",
        "children": [
            {
                "id": "20260320103905-h93zts2",
                "name": "DeepSeek",
                "children": [
                    {"id": "20260320103916-sfx4k0w", "name": "熊陡"},
                    {"id": "20260320104300-8phlhy5", "name": "点阵图"},
                    {"id": "20260327110359-5p340o2", "name": "含权债券"}
                ]
            },
            {
                "id": "20260327140822-sx3vbet",
                "name": "九鞅杯",
                "children": [
                    {"id": "20260401200916-ug253nt", "name": "九鞅杯规则变动记录"},
                    {"id": "20260401202514-hhbfanf", "name": "AM Claw对话"}
                ]
            }
        ]
    },
    {
        "id": "20260307160557-vjk9qek",
        "name": "中国金融特色化专题"
    },
    {
        "id": "20260307160621-ooq2tgs",
        "name": "证券投资分析"
    },
    {
        "id": "20260327155353-3fbbjbj",
        "name": "行星科学导论",
        "children": [
            {"id": "20260405205700-4m9nqls", "name": "田晖"}
        ]
    },
    {
        "id": "20260329114645-kmzsfr3",
        "name": "英语单词"
    }
]

# 统计文档数量
def count_docs(tree):
    count = 0
    for doc in tree:
        count += 1
        if 'children' in doc:
            count += count_docs(doc['children'])
    return count

total = count_docs(doc_tree)
print(f"总共需要提取 {total} 个文档")
print("\nAI 助手将逐个调用 MCP 工具提取内容：")
print("mcp__document(action='get_doc', id='文档ID', mode='markdown')")
