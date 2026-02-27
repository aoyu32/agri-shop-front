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
