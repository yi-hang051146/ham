/**
 * 课表数据 - 汪一航 2025-2026学年第2学期
 * 
 * 格式说明：
 * - day: 周几 (1=周一, 7=周日)
 * - name: 课程名称
 * - teacher: 授课教师
 * - location: 上课地点
 * - startTime: 开始时间 (HH:mm)
 * - endTime: 结束时间 (HH:mm)
 * - colorIndex: 颜色索引 (1-8)，对应 Solarized 色系
 * - weeks: 上课周次，如 [1,16] 表示第1到16周连续；数组中可包含多个范围
 * - noteId: 对应思源笔记的文档ID（可选）
 */

export const scheduleData = [
  // ===== 周一 =====
  // 中国金融特色化专题 6-8节，不同周次不同教师
  { day: 1, name: '中国金融特色化专题', teacher: '周洋', location: '1区6-213', startTime: '14:05', endTime: '16:30', colorIndex: 1, weeks: [1, 3], noteId: '20260307160557-vjk9qek' },
  { day: 1, name: '中国金融特色化专题', teacher: '刘勇', location: '1区6-213', startTime: '14:05', endTime: '16:30', colorIndex: 1, weeks: [4, 7], noteId: '20260307160557-vjk9qek' },
  { day: 1, name: '中国金融特色化专题', teacher: '邹镇涛', location: '1区6-213', startTime: '14:05', endTime: '16:30', colorIndex: 1, weeks: [8, 10], noteId: '20260307160557-vjk9qek' },
  { day: 1, name: '中国金融特色化专题', teacher: '聂禾', location: '1区6-213', startTime: '14:05', endTime: '16:30', colorIndex: 1, weeks: [11, 13], noteId: '20260307160557-vjk9qek' },
  { day: 1, name: '中国金融特色化专题', teacher: '袁威', location: '1区6-213', startTime: '14:05', endTime: '16:30', colorIndex: 1, weeks: [14, 16], noteId: '20260307160557-vjk9qek' },

  // ===== 周二 =====
  { day: 2, name: '随机过程', teacher: '邹镇涛', location: '1区5-401', startTime: '09:50', endTime: '12:15', colorIndex: 2, weeks: [1, 16], noteId: '20260115202116-fc0h2kx' },
  { day: 2, name: '证券投资分析', teacher: '袁威', location: '1区6-106', startTime: '14:05', endTime: '16:30', colorIndex: 3, weeks: [1, 16], noteId: '20260307160621-ooq2tgs' },
  { day: 2, name: '动态最优化', teacher: '熊琛', location: '1区3-402', startTime: '18:30', endTime: '20:55', colorIndex: 5, weeks: [1, 16], noteId: '20260303183032-j0g9aqk' },

  // ===== 周四 =====
  { day: 4, name: '常微分方程', teacher: '罗壮初', location: '1区5-111', startTime: '09:50', endTime: '12:15', colorIndex: 6, weeks: [1, 16], noteId: '20260115202119-1xccwe5' },
  { day: 4, name: '投资学', teacher: '袁威', location: '1区3-002', startTime: '18:30', endTime: '20:55', colorIndex: 4, weeks: [1, 16], noteId: '20260305193649-snv1pof' },

  // ===== 周五 =====
  { day: 5, name: '固定收益证券', teacher: '胡利琴', location: '1区枫-305', startTime: '09:50', endTime: '12:15', colorIndex: 7, weeks: [1, 16], noteId: '20260306094521-f5z0b6b' },
  // 行星科学导论 8-9节 第11周
  { day: 5, name: '行星科学导论', teacher: '付松', location: '1区5-303', startTime: '15:45', endTime: '18:15', colorIndex: 8, weeks: [11, 11], noteId: '20260327155353-3fbbjbj' },
  // 行星科学导论 8-10节 第1-2,4-6,8-10周
  { day: 5, name: '行星科学导论', teacher: '付松', location: '1区5-303', startTime: '15:45', endTime: '18:15', colorIndex: 8, weeks: [1, 2], noteId: '20260327155353-3fbbjbj' },
  { day: 5, name: '行星科学导论', teacher: '付松', location: '1区5-303', startTime: '15:45', endTime: '18:15', colorIndex: 8, weeks: [4, 6], noteId: '20260327155353-3fbbjbj' },
  { day: 5, name: '行星科学导论', teacher: '付松', location: '1区5-303', startTime: '15:45', endTime: '18:15', colorIndex: 8, weeks: [8, 10], noteId: '20260327155353-3fbbjbj' },
  // 行星科学导论 8-10节 第3,7周（地点不同）
  { day: 5, name: '行星科学导论', teacher: '付松', location: '1区计-101', startTime: '15:45', endTime: '18:15', colorIndex: 8, weeks: [3, 3], noteId: '20260327155353-3fbbjbj' },
  { day: 5, name: '行星科学导论', teacher: '付松', location: '1区计-101', startTime: '15:45', endTime: '18:15', colorIndex: 8, weeks: [7, 7], noteId: '20260327155353-3fbbjbj' },
]

/** 时间节次定义 */
export const timeSlots = [
  { label: '3-5节', startTime: '09:50', endTime: '12:15' },
  { label: '6-8节', startTime: '14:05', endTime: '16:30' },
  { label: '8-9节', startTime: '15:45', endTime: '18:15' },
  { label: '11-13节', startTime: '18:30', endTime: '20:55' },
]

/** 星期映射 */
export const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

/** 课程颜色名称映射 */
export const courseColorMap = {
  '中国金融特色化专题': 1,
  '随机过程': 2,
  '证券投资分析': 3,
  '投资学': 4,
  '动态最优化': 5,
  '常微分方程': 6,
  '固定收益证券': 7,
  '行星科学导论': 8,
}
