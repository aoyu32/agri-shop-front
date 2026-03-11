import request from '@/utils/request'

/**
 * 获取商品列表
 */
export function getMerchantProductList(params) {
    return request({
        url: '/api/merchant/product/list',
        method: 'get',
        params
    })
}

/**
 * 获取商品详情
 */
export function getMerchantProductDetail(params) {
    return request({
        url: '/api/merchant/product/detail',
        method: 'get',
        params
    })
}

/**
 * 添加商品
 */
export function addMerchantProduct(data) {
    return request({
        url: '/api/merchant/product/add',
        method: 'post',
        data
    })
}

/**
 * 更新商品
 */
export function updateMerchantProduct(data) {
    return request({
        url: '/api/merchant/product/update',
        method: 'post',
        data
    })
}

/**
 * 切换商品状态
 */
export function toggleProductStatus(data) {
    return request({
        url: '/api/merchant/product/toggle-status',
        method: 'post',
        data
    })
}

/**
 * 删除商品
 */
export function deleteMerchantProduct(data) {
    return request({
        url: '/api/merchant/product/delete',
        method: 'post',
        data
    })
}
