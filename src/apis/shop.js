import request from '@/utils/request'

/**
 * 获取推荐店铺列表
 */
export function getRecommendedShops(params) {
    return request({
        url: '/api/shop/recommended',
        method: 'get',
        params
    })
}

/**
 * 获取店铺详情
 */
export function getShopDetail(params) {
    return request({
        url: '/api/shop/detail',
        method: 'get',
        params
    })
}

/**
 * 获取店铺页面（包含分类和商品）
 */
export function getShopPage(params) {
    return request({
        url: '/api/shop/page',
        method: 'get',
        params
    })
}

/**
 * 申请开通店铺
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

/**
 * 更新店铺设置
 */
export function updateShopSettings(data) {
    return request({
        url: '/api/shop/update-settings',
        method: 'post',
        data
    })
}
