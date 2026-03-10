import request from '@/utils/request'

/**
 * 提交订单评价
 */
export function submitReview(data) {
    return request({
        url: '/api/review/submit',
        method: 'post',
        data
    })
}

/**
 * 获取待评价订单列表
 */
export function getPendingReviewList(params) {
    return request({
        url: '/api/review/pending-list',
        method: 'get',
        params
    })
}

/**
 * 获取我的评价列表
 */
export function getMyReviews(params) {
    return request({
        url: '/api/review/my-reviews',
        method: 'get',
        params
    })
}

/**
 * 获取商品评价列表
 */
export function getProductReviews(params) {
    return request({
        url: '/api/review/product-reviews',
        method: 'get',
        params
    })
}


/**
 * 删除评价
 */
export function deleteReview(data) {
    return request({
        url: '/api/review/delete',
        method: 'post',
        data
    })
}
