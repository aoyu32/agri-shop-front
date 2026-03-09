import request from '@/utils/request'

/**
 * 添加收藏
 */
export const addFavorite = (data) => {
    return request({
        url: '/api/favorite/add',
        method: 'post',
        data
    })
}

/**
 * 取消收藏
 */
export const removeFavorite = (data) => {
    return request({
        url: '/api/favorite/remove',
        method: 'post',
        data
    })
}

/**
 * 切换收藏状态
 */
export const toggleFavorite = (data) => {
    return request({
        url: '/api/favorite/toggle',
        method: 'post',
        data
    })
}

/**
 * 获取收藏列表
 */
export const getFavoriteList = (params) => {
    return request({
        url: '/api/favorite/list',
        method: 'get',
        params
    })
}

/**
 * 检查是否已收藏
 */
export const checkFavorite = (params) => {
    return request({
        url: '/api/favorite/check',
        method: 'get',
        params
    })
}

/**
 * 批量删除收藏
 */
export const batchRemoveFavorite = (data) => {
    return request({
        url: '/api/favorite/batch-remove',
        method: 'post',
        data
    })
}

/**
 * 获取收藏统计
 */
export const getFavoriteStatistics = () => {
    return request({
        url: '/api/favorite/statistics',
        method: 'get'
    })
}
