import request from '@/utils/request'

/**
 * 获取店铺销售趋势
 */
export function getShopSalesTrend(timeRange = 'month') {
    return request({
        url: '/api/market-forecast/shop-sales-trend',
        method: 'get',
        params: { time_range: timeRange }
    })
}

/**
 * 获取平台销售趋势
 */
export function getPlatformSalesTrend(timeRange = 'month') {
    return request({
        url: '/api/market-forecast/platform-sales-trend',
        method: 'get',
        params: { time_range: timeRange }
    })
}

/**
 * 获取店铺热销农产品排行
 */
export function getShopProductRank() {
    return request({
        url: '/api/market-forecast/shop-product-rank',
        method: 'get'
    })
}

/**
 * 获取平台热销农产品排行
 */
export function getPlatformProductRank() {
    return request({
        url: '/api/market-forecast/platform-product-rank',
        method: 'get'
    })
}

/**
 * 获取店铺品类销售分布
 */
export function getShopCategoryDistribution() {
    return request({
        url: '/api/market-forecast/shop-category-distribution',
        method: 'get'
    })
}

/**
 * 获取平台品类销售分布
 */
export function getPlatformCategoryDistribution() {
    return request({
        url: '/api/market-forecast/platform-category-distribution',
        method: 'get'
    })
}

/**
 * 获取AI行情预测
 * AI 分析需要较长时间，设置 150 秒超时
 */
export function getAIForecast() {
    return request({
        url: '/api/ai-market/forecast',
        method: 'get',
        timeout: 150000 // 150秒超时
    })
}
