import request from '@/utils/request'

export function getAdminDashboardOverview() {
    return request({
        url: '/api/admin/dashboard/overview',
        method: 'get'
    })
}
