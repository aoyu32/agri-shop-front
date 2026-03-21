import request from '@/utils/request'

export function getAdminMerchantList(params) {
    return request({
        url: '/api/admin/merchant/list',
        method: 'get',
        params
    })
}

export function getAdminMerchantDetail(params) {
    return request({
        url: '/api/admin/merchant/detail',
        method: 'get',
        params
    })
}

export function getAdminAvailableMerchantUsers() {
    return request({
        url: '/api/admin/merchant/available-users',
        method: 'get'
    })
}

export function createAdminMerchant(data) {
    return request({
        url: '/api/admin/merchant/create',
        method: 'post',
        data
    })
}

export function updateAdminMerchant(data) {
    return request({
        url: '/api/admin/merchant/update',
        method: 'post',
        data
    })
}

export function reviewAdminMerchant(data) {
    return request({
        url: '/api/admin/merchant/review',
        method: 'post',
        data
    })
}

export function toggleAdminMerchantStatus(data) {
    return request({
        url: '/api/admin/merchant/toggle-status',
        method: 'post',
        data
    })
}

export function deleteAdminMerchant(data) {
    return request({
        url: '/api/admin/merchant/delete',
        method: 'post',
        data
    })
}
