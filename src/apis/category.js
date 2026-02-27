import request from '@/utils/request'

/**
 * 获取分类列表（一级分类）
 */
export function getCategoryList() {
    return request({
        url: '/api/category/list',
        method: 'get'
    })
}

/**
 * 获取分类树（包含子分类）
 */
export function getCategoryTree() {
    return request({
        url: '/api/category/tree',
        method: 'get'
    })
}

/**
 * 获取分类详情
 * @param {number} id - 分类ID
 */
export function getCategoryDetail(id) {
    return request({
        url: '/api/category/detail',
        method: 'get',
        params: { id }
    })
}
