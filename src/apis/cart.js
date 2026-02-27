import request from '@/utils/request'

/**
 * 获取购物车列表
 */
export const getCartList = () => {
    return request({
        url: '/api/cart/list',
        method: 'get'
    })
}

/**
 * 添加到购物车
 * @param {Object} data - { product_id, spec_id, quantity }
 */
export const addToCart = (data) => {
    return request({
        url: '/api/cart/add',
        method: 'post',
        data
    })
}

/**
 * 更新购物车商品数量
 * @param {Object} data - { cart_id, quantity }
 */
export const updateCartQuantity = (data) => {
    return request({
        url: '/api/cart/update-quantity',
        method: 'post',
        data
    })
}

/**
 * 切换选中状态
 * @param {Object} data - { cart_id, checked }
 */
export const toggleCartCheck = (data) => {
    return request({
        url: '/api/cart/toggle-check',
        method: 'post',
        data
    })
}

/**
 * 全选/取消全选
 * @param {Object} data - { checked }
 */
export const checkAllCart = (data) => {
    return request({
        url: '/api/cart/check-all',
        method: 'post',
        data
    })
}

/**
 * 删除购物车商品
 * @param {Object} data - { cart_ids: [1, 2, 3] }
 */
export const deleteCartItems = (data) => {
    return request({
        url: '/api/cart/delete',
        method: 'post',
        data
    })
}

/**
 * 清空购物车
 */
export const clearCart = () => {
    return request({
        url: '/api/cart/clear',
        method: 'post'
    })
}

/**
 * 获取购物车统计
 */
export const getCartCount = () => {
    return request({
        url: '/api/cart/count',
        method: 'get'
    })
}
