import request from '@/utils/request'

/**
 * 获取地址列表
 */
export function getAddressList() {
    return request({
        url: '/api/address/list',
        method: 'get'
    })
}

/**
 * 获取地址详情
 */
export function getAddressDetail(id) {
    return request({
        url: `/api/address/detail/${id}`,
        method: 'get'
    })
}

/**
 * 添加地址
 */
export function addAddress(data) {
    return request({
        url: '/api/address/add',
        method: 'post',
        data
    })
}

/**
 * 更新地址
 */
export function updateAddress(id, data) {
    return request({
        url: `/api/address/update/${id}`,
        method: 'post',
        data
    })
}

/**
 * 删除地址
 */
export function deleteAddress(id) {
    return request({
        url: `/api/address/delete/${id}`,
        method: 'post'
    })
}

/**
 * 设置默认地址
 */
export function setDefaultAddress(id) {
    return request({
        url: `/api/address/set-default/${id}`,
        method: 'post'
    })
}

/**
 * 获取默认地址
 */
export function getDefaultAddress() {
    return request({
        url: '/api/address/default',
        method: 'get'
    })
}
