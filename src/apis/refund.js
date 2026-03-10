import request from '@/utils/request'

/**
 * 申请退款
 */
export function applyRefund(data) {
    return request({
        url: '/api/refund/apply',
        method: 'post',
        data
    })
}

/**
 * 获取我的退款列表
 */
export function getMyRefundList(params) {
    return request({
        url: '/api/refund/my-list',
        method: 'get',
        params
    })
}

/**
 * 获取退款详情
 */
export function getRefundDetail(params) {
    return request({
        url: '/api/refund/detail',
        method: 'get',
        params
    })
}

/**
 * 取消退款申请
 */
export function cancelRefund(data) {
    return request({
        url: '/api/refund/cancel',
        method: 'post',
        data
    })
}
