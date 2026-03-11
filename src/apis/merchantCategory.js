import request from '@/utils/request'

/**
 * 获取系统分类列表（供农户选择）
 */
export function getSystemCategories() {
    return request({
        url: '/api/merchant/category/system-list',
        method: 'get'
    })
}

/**
 * 获取店铺分类列表
 */
export function getMerchantCategoryList() {
    return request({
        url: '/api/merchant/category/list',
        method: 'get'
    })
}

/**
 * 添加分类到店铺
 */
export function addMerchantCategory(data) {
    return request({
        url: '/api/merchant/category/add',
        method: 'post',
        data
    })
}

/**
 * 更新分类
 */
export function updateMerchantCategory(data) {
    return request({
        url: '/api/merchant/category/update',
        method: 'post',
        data
    })
}

/**
 * 切换分类状态
 */
export function toggleCategoryStatus(data) {
    return request({
        url: '/api/merchant/category/toggle-status',
        method: 'post',
        data
    })
}

/**
 * 删除店铺分类
 */
export function deleteMerchantCategory(data) {
    return request({
        url: '/api/merchant/category/delete',
        method: 'post',
        data
    })
}
