import request from '@/utils/request'

/**
 * 上传单个文件
 */
export const uploadFile = (file, type = 'other') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    return request({
        url: '/api/oss/upload',
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

/**
 * 批量上传文件
 */
export const batchUploadFiles = (files, type = 'other') => {
    const formData = new FormData()
    files.forEach(file => {
        formData.append('files[]', file)
    })
    formData.append('type', type)

    return request({
        url: '/api/oss/batch-upload',
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

/**
 * 上传Base64图片
 */
export const uploadBase64 = (data) => {
    return request({
        url: '/api/oss/upload-base64',
        method: 'post',
        data
    })
}

/**
 * 删除文件
 */
export const deleteFile = (data) => {
    return request({
        url: '/api/oss/delete',
        method: 'post',
        data
    })
}

/**
 * 批量删除文件
 */
export const batchDeleteFiles = (data) => {
    return request({
        url: '/api/oss/batch-delete',
        method: 'post',
        data
    })
}

/**
 * 获取文件列表
 */
export const getFileList = (params) => {
    return request({
        url: '/api/oss/list',
        method: 'get',
        params
    })
}

/**
 * 获取文件信息
 */
export const getFileInfo = (params) => {
    return request({
        url: '/api/oss/info',
        method: 'get',
        params
    })
}

/**
 * 获取签名URL
 */
export const getSignedUrl = (params) => {
    return request({
        url: '/api/oss/signed-url',
        method: 'get',
        params
    })
}

/**
 * 复制文件
 */
export const copyFile = (data) => {
    return request({
        url: '/api/oss/copy',
        method: 'post',
        data
    })
}
