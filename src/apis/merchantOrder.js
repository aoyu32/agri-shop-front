import request from '@/utils/request'

/**
 * 获取农户订单列表
 * @param {Object} params
 * @param {string} params.status - 订单状态 (pending/shipped/completed/refund)
 * @param {string} params.keyword - 搜索关键词
 * @param {number} params.page - 页码
 * @param {number} params.page_size - 每页数量
 */
export const getMerchantOrderList = (params) => {
    return request({
        url: '/api/merchant/order/list',
        method: 'get',
        params
    })
}

/**
 * 获取订单详情
 * @param {number} orderId - 订单ID
 */
export const getMerchantOrderDetail = (orderId) => {
    return request({
        url: '/api/merchant/order/detail',
        method: 'get',
        params: { order_id: orderId }
    })
}

/**
 * 发货
 * @param {Object} data
 * @param {number} data.order_id - 订单ID
 * @param {string} data.logistics - 物流公司
 * @param {string} data.tracking_no - 物流单号
 */
export const shipOrder = (data) => {
    return request({
        url: '/api/merchant/order/ship',
        method: 'post',
        data
    })
}

/**
 * 同意退款
 * @param {number} orderId - 订单ID
 */
export const approveRefund = (orderId) => {
    return request({
        url: '/api/merchant/order/approve-refund',
        method: 'post',
        data: { order_id: orderId }
    })
}

/**
 * 拒绝退款
 * @param {Object} data
 * @param {number} data.order_id - 订单ID
 * @param {string} data.reject_reason - 拒绝原因
 */
export const rejectRefund = (data) => {
    return request({
        url: '/api/merchant/order/reject-refund',
        method: 'post',
        data
    })
}

/**
 * 删除订单
 * @param {number} orderId - 订单ID
 */
export const deleteMerchantOrder = (orderId) => {
    return request({
        url: '/api/merchant/order/delete',
        method: 'post',
        data: { order_id: orderId }
    })
}

/**
 * 获取订单统计
 */
export const getMerchantOrderStatistics = () => {
    return request({
        url: '/api/merchant/order/statistics',
        method: 'get'
    })
}
