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

/**
 * 点赞评价
 */
export function likeReview(data) {
    return request({
        url: '/api/review/like',
        method: 'post',
        data
    })
}

/**
 * 取消点赞评价
 */
export function unlikeReview(data) {
    return request({
        url: '/api/review/unlike',
        method: 'post',
        data
    })
}

/**
 * 商家获取评价列表
 */
export function getMerchantReviews(params) {
    return request({
        url: '/api/review/merchant-reviews',
        method: 'get',
        params
    })
}

/**
 * 商家回复评价
 */
export function merchantReplyReview(data) {
    return request({
        url: '/api/review/merchant-reply',
        method: 'post',
        data
    })
}

/**
 * 商家删除回复
 */
export function merchantDeleteReply(data) {
    return request({
        url: '/api/review/merchant-delete-reply',
        method: 'post',
        data
    })
}
