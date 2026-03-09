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
/**
 * 申请开通店铺
 * @param {Object} data
 * @param {string} data.shop_name - 店铺名称
 * @param {string} data.shop_logo - 店铺Logo
 * @param {string} data.shop_banner - 店铺横幅
 * @param {string} data.description - 店铺简介
 * @param {string} data.location - 店铺地址
 */
export function applyShop(data) {
    return request({
        url: '/api/shop/apply',
        method: 'post',
        data
    })
}

/**
 * 获取我的店铺信息
 */
export function getMyShop() {
    return request({
        url: '/api/shop/my-shop',
        method: 'get'
    })
}
