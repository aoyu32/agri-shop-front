import request from '@/utils/request'

/**
 * 获取用户信息
 */
export function getUserInfo() {
    return request({
        url: '/api/user/info',
        method: 'get'
    })
}

/**
 * 更新用户信息
 */
export function updateUserInfo(data) {
    return request({
        url: '/api/user/update',
        method: 'post',
        data
    })
}

/**
 * 更新用户头像
 */
export function updateAvatar(data) {
    return request({
        url: '/api/user/update',
        method: 'post',
        data
    })
}

/**
 * 修改密码
 */
export function changePassword(data) {
    return request({
        url: '/api/user/change-password',
        method: 'post',
        data
    })
}

/**
 * 更换手机号
 */
export function changePhone(data) {
    return request({
        url: '/api/user/change-phone',
        method: 'post',
        data
    })
}

/**
 * 发送验证码
 */
export function sendCode(data) {
    return request({
        url: '/api/user/send-code',
        method: 'post',
        data
    })
}

/**
 * 发送验证码（别名）
 */
export function sendVerifyCode(data) {
    return sendCode(data)
}

/**
 * 获取用户统计信息
 */
export function getUserStatistics() {
    return request({
        url: '/api/user/statistics',
        method: 'get'
    })
}

/**
 * 获取首页统计数据
 */
export function getHomeStatistics() {
    return request({
        url: '/api/user/home-statistics',
        method: 'get'
    })
}

/**
 * 注销账号
 */
export function deleteAccount(data) {
    return request({
        url: '/api/user/delete-account',
        method: 'post',
        data
    })
}
