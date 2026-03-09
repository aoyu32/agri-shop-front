import request from '@/utils/request'

/**
 * 获取当季农产品列表
 * @param {string} season - 季节 (spring/summer/autumn/winter)，不传则返回当前季节
 */
export const getSeasonalProducts = (season) => {
    return request({
        url: '/api/seasonal-product/list',
        method: 'get',
        params: { season }
    })
}

/**
 * 获取所有季节的农产品
 */
export const getAllSeasonalProducts = () => {
    return request({
        url: '/api/seasonal-product/all',
        method: 'get'
    })
}
