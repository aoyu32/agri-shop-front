import request from '@/utils/request'

/**
 * 创建订单
 * @param {Object} data - { cart_ids, receiver_name, receiver_phone, receiver_address, remark }
 */
export const createOrder = (data) => {
    return request({
        url: '/api/order/create',
        method: 'post',
        data
    })
}

/**
 * 获取订单列表
 * @param {Object} params - { status, page, limit }
 */
export const getOrderList = (params) => {
    return request({
        url: '/api/order/list',
        method: 'get',
        params
    })
}

/**
 * 获取订单详情
 * @param {Number} id - 订单ID
 */
export const getOrderDetail = (id) => {
    return request({
        url: '/api/order/detail',
        method: 'get',
        params: { id }
    })
}

/**
 * 取消订单
 * @param {Object} data - { id, reason }
 */
export const cancelOrder = (data) => {
    return request({
        url: '/api/order/cancel',
        method: 'post',
        data
    })
}

/**
 * 确认收货
 * @param {Number} id - 订单ID
 */
export const confirmOrder = (id) => {
    return request({
        url: '/api/order/confirm',
        method: 'post',
        data: { id }
    })
}

/**
 * 删除订单
 * @param {Number} id - 订单ID
 */
export const deleteOrder = (id) => {
    return request({
        url: '/api/order/delete',
        method: 'post',
        data: { id }
    })
}

/**
 * 获取订单统计
 */
export const getOrderStatistics = () => {
    return request({
        url: '/api/order/statistics',
        method: 'get'
    })
}
/**
 * 支付订单
 * @param {Object} data - { id, payment_method }
 */
export const payOrder = (data) => {
    return request({
        url: '/api/order/pay',
        method: 'post',
        data
    })
}
