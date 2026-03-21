import request from '@/utils/request'

export function getAdminCategoryList(params) {
    return request({
        url: '/api/admin/category/list',
        method: 'get',
        params
    })
}

export function getAdminCategoryDetail(params) {
    return request({
        url: '/api/admin/category/detail',
        method: 'get',
        params
    })
}

export function createAdminCategory(data) {
    return request({
        url: '/api/admin/category/create',
        method: 'post',
        data
    })
}

export function updateAdminCategory(data) {
    return request({
        url: '/api/admin/category/update',
        method: 'post',
        data
    })
}

export function deleteAdminCategory(data) {
    return request({
        url: '/api/admin/category/delete',
        method: 'post',
        data
    })
}
