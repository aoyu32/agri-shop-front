import request from '@/utils/request'

/**
 * 获取通知列表
 */
export function getNotificationList(params) {
    return request({
        url: '/api/notification/list',
        method: 'get',
        params
    })
}

/**
 * 获取未读数量
 */
export function getUnreadCount() {
    return request({
        url: '/api/notification/unread-count',
        method: 'get'
    })
}

/**
 * 标记单条通知为已读
 */
export function markAsRead(id) {
    return request({
        url: '/api/notification/mark-read',
        method: 'post',
        data: { id }
    })
}

/**
 * 标记所有通知为已读
 */
export function markAllAsRead() {
    return request({
        url: '/api/notification/mark-all-read',
        method: 'post'
    })
}

/**
 * 删除通知
 */
export function deleteNotification(id) {
    return request({
        url: '/api/notification/delete',
        method: 'post',
        data: { id }
    })
}

/**
 * 清空已读通知
 */
export function clearReadNotifications() {
    return request({
        url: '/api/notification/clear-read',
        method: 'post'
    })
}
