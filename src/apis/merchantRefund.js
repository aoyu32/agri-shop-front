import request from '@/utils/request'

/**
 * 获取农户退款列表
 */
export function getMerchantRefundList(params) {
    return request({
        url: '/api/merchant/order/refund-list',
        method: 'get',
        params
    })
}

/**
 * 获取退款详情
 */
export function getMerchantRefundDetail(params) {
    return request({
        url: '/api/merchant/order/refund-detail',
        method: 'get',
        params
    })
}

/**
 * 同意退款
 */
export function approveRefund(data) {
    return request({
        url: '/api/merchant/order/approve-refund',
        method: 'post',
        data
    })
}

/**
 * 拒绝退款
 */
export function rejectRefund(data) {
    return request({
        url: '/api/merchant/order/reject-refund',
        method: 'post',
        data
    })
}

/**
 * 确认退款完成
 */
export function confirmRefund(data) {
    return request({
        url: '/api/merchant/order/confirm-refund',
        method: 'post',
        data
    })
}

/**
 * 删除退款记录
 */
export function deleteRefund(data) {
    return request({
        url: '/api/merchant/order/delete-refund',
        method: 'post',
        data
    })
}
