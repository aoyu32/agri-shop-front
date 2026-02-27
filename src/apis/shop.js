import request from '@/utils/request'

/**
 * 获取推荐店铺列表
 * @param {number} limit - 数量限制
 */
export function getRecommendedShops(limit = 10) {
    return request({
        url: '/api/shop/recommended',
        method: 'get',
        params: { limit }
    })
}

/**
 * 获取店铺详情
 * @param {number} id - 店铺ID
 */
export function getShopDetail(id) {
    return request({
        url: '/api/shop/detail',
        method: 'get',
        params: { id }
    })
}
