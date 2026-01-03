// 简化的阴历转换工具
// 注意：这是一个简化版本，实际项目中建议使用专业的阴历转换库如 lunar-javascript

// 阴历月份名称
const lunarMonths = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊']

// 阴历日期名称
const lunarDays = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
]

/**
 * 获取阴历日期（简化版）
 * 注意：这是一个简化的实现，实际应该使用专业的阴历转换库
 * @param {Date} date - 阳历日期
 * @returns {string} 阴历日期字符串，格式：X月XX
 */
export function getLunarDate(date = new Date()) {
  // 这里使用一个简化的映射
  // 实际项目中应该使用专业的阴历转换库，如：
  // import { Lunar } from 'lunar-javascript'
  // const lunar = Lunar.fromDate(date)
  // return lunar.toString()
  
  // 简化处理：基于阳历日期计算一个近似的阴历日期
  // 实际阴历转换需要复杂的算法，这里仅作示例
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  // 简化的阴历月份计算（实际应该根据阴历算法）
  const lunarMonthIndex = (month - 1) % 12
  const lunarMonth = lunarMonths[lunarMonthIndex]
  
  // 简化的阴历日期计算（实际应该根据阴历算法）
  const lunarDayIndex = (day - 1) % 30
  const lunarDay = lunarDays[lunarDayIndex]
  
  return `${lunarMonth}月${lunarDay}`
}

