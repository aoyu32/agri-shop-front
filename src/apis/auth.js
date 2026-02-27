import request from '@/utils/request'

/**
 * 发送验证码
 * @param {string} phone - 手机号
 */
export function sendCode(phone) {
    return request({
        url: '/api/auth/send-code',
        method: 'post',
        data: { phone }
    })
}

/**
 * 用户注册
 * @param {Object} data - 注册数据
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @param {string} data.confirm_password - 确认密码
 * @param {string} data.phone - 手机号
 * @param {string} data.code - 验证码
 * @param {string} data.role - 角色 (consumer/merchant)
 */
export function register(data) {
    return request({
        url: '/api/auth/register',
        method: 'post',
        data
    })
}

/**
 * 用户登录
 * @param {Object} data - 登录数据
 * @param {string} data.username - 用户名或手机号
 * @param {string} data.password - 密码
 * @param {boolean} data.remember - 是否记住密码
 */
export function login(data) {
    return request({
        url: '/api/auth/login',
        method: 'post',
        data
    })
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
    return request({
        url: '/api/auth/user-info',
        method: 'get'
    })
}

/**
 * 重置密码
 * @param {Object} data - 重置密码数据
 * @param {string} data.phone - 手机号
 * @param {string} data.code - 验证码
 * @param {string} data.password - 新密码
 * @param {string} data.confirm_password - 确认新密码
 */
export function resetPassword(data) {
    return request({
        url: '/api/auth/reset-password',
        method: 'post',
        data
    })
}

/**
 * 退出登录
 */
export function logout() {
    return request({
        url: '/api/auth/logout',
        method: 'post'
    })
}
