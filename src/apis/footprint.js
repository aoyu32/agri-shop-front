import request from '@/utils/request'

/**
 * 添加浏览记录
 */
export const addFootprint = (data) => {
    return request({
        url: '/api/footprint/add',
        method: 'post',
        data
    })
}

/**
 * 获取足迹列表
 */
export const getFootprintList = (params) => {
    return request({
        url: '/api/footprint/list',
        method: 'get',
        params
    })
}

/**
 * 按日期分组获取足迹
 */
export const getFootprintListByDate = (params) => {
    return request({
        url: '/api/footprint/list-by-date',
        method: 'get',
        params
    })
}

/**
 * 删除单条足迹
 */
export const deleteFootprint = (data) => {
    return request({
        url: '/api/footprint/delete',
        method: 'post',
        data
    })
}

/**
 * 批量删除足迹
 */
export const batchDeleteFootprint = (data) => {
    return request({
        url: '/api/footprint/batch-delete',
        method: 'post',
        data
    })
}

/**
 * 清空所有足迹
 */
export const clearFootprint = () => {
    return request({
        url: '/api/footprint/clear',
        method: 'post'
    })
}

/**
 * 获取足迹统计
 */
export const getFootprintStatistics = () => {
    return request({
        url: '/api/footprint/statistics',
        method: 'get'
    })
}
