import request from '@/utils/request'

/**
 * 获取商家数据概览
 */
export function getMerchantDashboard() {
    return request({
        url: '/api/merchant/dashboard',
        method: 'get'
    })
}
