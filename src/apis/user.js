import request from '@/utils/request'

/**
 * 获取用户信息
 */
export const getUserInfo = () => {
    return request({
        url: '/api/user/info',
        method: 'get'
    })
}

/**
 * 更新用户信息
 */
export const updateUserInfo = (data) => {
    return request({
        url: '/api/user/update',
        method: 'post',
        data
    })
}

/**
 * 更新头像
 */
export const updateAvatar = (data) => {
    return request({
        url: '/api/user/update-avatar',
        method: 'post',
        data
    })
}

/**
 * 修改密码
 */
export const changePassword = (data) => {
    return request({
        url: '/api/user/change-password',
        method: 'post',
        data
    })
}

/**
 * 更换手机号
 */
export const changePhone = (data) => {
    return request({
        url: '/api/user/change-phone',
        method: 'post',
        data
    })
}

/**
 * 发送验证码（用于更换手机号）
 */
export const sendVerifyCode = (data) => {
    return request({
        url: '/api/user/send-code',
        method: 'post',
        data
    })
}

/**
 * 注销账号
 */
export const deleteAccount = (data) => {
    return request({
        url: '/api/user/delete-account',
        method: 'post',
        data
    })
}

/**
 * 获取用户统计信息
 */
export const getUserStatistics = () => {
    return request({
        url: '/api/user/statistics',
        method: 'get'
    })
}
