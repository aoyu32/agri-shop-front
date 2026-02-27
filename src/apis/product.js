import request from '@/utils/request'

/**
 * 获取所有商品列表（分页）
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.page_size - 每页数量
 */
export function getAllProducts(params) {
    return request({
        url: '/api/product/list',
        method: 'get',
        params
    })
}

/**
 * 获取热销商品列表
 * @param {number} limit - 数量限制
 */
export function getHotProducts(limit = 10) {
    return request({
        url: '/api/product/hot',
        method: 'get',
        params: { limit }
    })
}

/**
 * 获取促销商品列表
 * @param {number} limit - 数量限制
 */
export function getPromotionProducts(limit = 10) {
    return request({
        url: '/api/product/promotion',
        method: 'get',
        params: { limit }
    })
}

/**
 * 根据分类获取商品列表
 * @param {Object} params - 查询参数
 * @param {number} params.category_id - 分类ID
 * @param {number} params.page - 页码
 * @param {number} params.page_size - 每页数量
 */
export function getProductsByCategory(params) {
    return request({
        url: '/api/product/category',
        method: 'get',
        params
    })
}

/**
 * 获取商品详情
 * @param {number} id - 商品ID
 */
export function getProductDetail(id) {
    return request({
        url: '/api/product/detail',
        method: 'get',
        params: { id }
    })
}

/**
 * 搜索商品
 * @param {Object} params - 搜索参数
 * @param {string} params.keyword - 关键词
 * @param {number} params.page - 页码
 * @param {number} params.page_size - 每页数量
 * @param {string} params.sort_by - 排序方式 (sales, price_asc, price_desc)
 */
export function searchProducts(params) {
    return request({
        url: '/api/product/search',
        method: 'get',
        params
    })
}

/**
 * 高级筛选商品
 * @param {Object} params - 筛选参数
 * @param {number} params.category_id - 分类ID
 * @param {number} params.min_price - 最低价格
 * @param {number} params.max_price - 最高价格
 * @param {string} params.origin - 产地
 * @param {string} params.sort_by - 排序方式 (default, sales, price_asc, price_desc, newest)
 * @param {number} params.page - 页码
 * @param {number} params.page_size - 每页数量
 */
export function filterProducts(params) {
    return request({
        url: '/api/product/filter',
        method: 'get',
        params
    })
}

/**
 * 获取产地列表
 */
export function getOrigins() {
    return request({
        url: '/api/product/origins',
        method: 'get'
    })
}

/**
 * 获取推荐商品
 * @param {Object} params - 参数
 * @param {number} params.category_id - 分类ID（可选）
 * @param {number} params.exclude_id - 排除的商品ID（可选）
 * @param {number} params.limit - 数量限制
 */
export function getRecommendProducts(params) {
    return request({
        url: '/api/product/recommend',
        method: 'get',
        params
    })
}
