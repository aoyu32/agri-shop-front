import request from '@/utils/request'

export function getAdminUserList(params) {
    return request({
        url: '/api/admin/user/list',
        method: 'get',
        params
    })
}

export function getAdminUserDetail(params) {
    return request({
        url: '/api/admin/user/detail',
        method: 'get',
        params
    })
}

export function createAdminUser(data) {
    return request({
        url: '/api/admin/user/create',
        method: 'post',
        data
    })
}

export function updateAdminUser(data) {
    return request({
        url: '/api/admin/user/update',
        method: 'post',
        data
    })
}

export function deleteAdminUser(data) {
    return request({
        url: '/api/admin/user/delete',
        method: 'post',
        data
    })
}
