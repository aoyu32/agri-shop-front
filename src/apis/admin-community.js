import request from '@/utils/request'

export function getAdminCommunityList(params) {
    return request({
        url: '/api/admin/community/list',
        method: 'get',
        params
    })
}

export function getAdminCommunityDetail(params) {
    return request({
        url: '/api/admin/community/detail',
        method: 'get',
        params
    })
}

export function createAdminCommunityPost(data) {
    return request({
        url: '/api/admin/community/create',
        method: 'post',
        data
    })
}

export function updateAdminCommunityPost(data) {
    return request({
        url: '/api/admin/community/update',
        method: 'post',
        data
    })
}

export function updateAdminCommunityStatus(data) {
    return request({
        url: '/api/admin/community/update-status',
        method: 'post',
        data
    })
}

export function deleteAdminCommunityPost(data) {
    return request({
        url: '/api/admin/community/delete',
        method: 'post',
        data
    })
}
