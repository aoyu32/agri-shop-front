import request from '@/utils/request'

/**
 * 获取帖子列表
 */
export function getPostList(params) {
    return request({
        url: '/api/community/posts',
        method: 'get',
        params
    })
}

/**
 * 获取热门帖子
 */
export function getHotPosts(params) {
    return request({
        url: '/api/community/hot-posts',
        method: 'get',
        params
    })
}

/**
 * 获取用户统计
 */
export function getUserStats() {
    return request({
        url: '/api/community/user-stats',
        method: 'get'
    })
}

/**
 * 创建帖子
 */
export function createPost(data) {
    return request({
        url: '/api/community/create',
        method: 'post',
        data
    })
}

/**
 * 点赞/取消点赞帖子
 */
export function togglePostLike(data) {
    return request({
        url: '/api/community/toggle-like',
        method: 'post',
        data
    })
}

/**
 * 获取帖子详情
 */
export function getPostDetail(params) {
    return request({
        url: '/api/post/detail',
        method: 'get',
        params
    })
}

/**
 * 获取相关推荐帖子
 */
export function getRelatedPosts(params) {
    return request({
        url: '/api/post/related',
        method: 'get',
        params
    })
}

/**
 * 获取评论列表
 */
export function getCommentList(params) {
    return request({
        url: '/api/post-comment/list',
        method: 'get',
        params
    })
}

/**
 * 发表评论
 */
export function createComment(data) {
    return request({
        url: '/api/post-comment/create',
        method: 'post',
        data
    })
}

/**
 * 点赞/取消点赞评论
 */
export function toggleCommentLike(data) {
    return request({
        url: '/api/post-comment/toggle-like',
        method: 'post',
        data
    })
}
