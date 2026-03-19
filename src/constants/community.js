/**
 * 社区帖子分类
 */
export const POST_CATEGORIES = [
    { value: 'tech', label: '种植技术' },
    { value: 'market', label: '市场行情' },
    { value: 'share', label: '经验分享' },
    { value: 'question', label: '求助问答' }
]

/**
 * 分类标签映射（用于首页筛选）
 */
export const CATEGORY_TABS = [
    { key: 'all', label: '全部' },
    { key: 'tech', label: '种植技术' },
    { key: 'market', label: '市场行情' },
    { key: 'share', label: '经验分享' },
    { key: 'question', label: '求助问答' }
]

/**
 * 根据分类值获取分类标签
 */
export function getCategoryLabel(value) {
    const category = POST_CATEGORIES.find(item => item.value === value)
    return category ? category.label : '综合讨论'
}
