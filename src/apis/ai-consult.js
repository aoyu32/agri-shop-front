import request from '@/utils/request'

/**
 * 发送消息（流式输出）
 * @param {Object} data - 请求数据
 * @param {Function} onMessage - 接收消息片段的回调函数
 * @param {Function} onError - 错误回调函数
 * @param {Function} onComplete - 完成回调函数
 */
export function sendMessageStream(data, onMessage, onError, onComplete) {
    const token = localStorage.getItem('token')
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

    fetch(`${baseURL}/api/ai-consult/send-message-stream`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    }).then(response => {
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = '' // 用于存储不完整的行

        function read() {
            reader.read().then(({ done, value }) => {
                if (done) {
                    console.log('流式读取完成')
                    if (onComplete) onComplete()
                    return
                }

                // 解码新接收的数据
                const text = decoder.decode(value, { stream: true })
                console.log('收到数据块:', text)
                buffer += text

                // 按行分割，保留最后一个不完整的行
                const lines = buffer.split('\n')
                buffer = lines.pop() || '' // 保存最后一个可能不完整的行

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const jsonStr = line.substring(6).trim()
                            if (!jsonStr) continue

                            const data = JSON.parse(jsonStr)
                            console.log('解析的数据:', data)

                            if (data.error) {
                                if (onError) onError(data.error)
                                return
                            }

                            if (data.type === 'message' && data.content) {
                                console.log('调用 onMessage，内容:', data.content)
                                if (onMessage) onMessage(data.content)
                            } else if (data.type === 'start') {
                                // 开始事件，可以在这里处理初始化
                                console.log('收到 start 事件')
                                if (onMessage) onMessage('', data)
                            } else if (data.type === 'done') {
                                // 完成事件
                                console.log('收到 done 事件')
                                if (onComplete) onComplete(data)
                                return
                            }
                        } catch (e) {
                            console.error('解析SSE数据失败:', e, 'line:', line)
                        }
                    }
                }

                read()
            }).catch(error => {
                console.error('读取流失败:', error)
                if (onError) onError(error.message || '网络错误')
            })
        }

        read()
    }).catch(error => {
        if (onError) onError(error.message || '请求失败')
    })
}

/**
 * 获取会话列表
 */
export function getConversations(params) {
    return request({
        url: '/api/ai-consult/conversations',
        method: 'get',
        params
    })
}

/**
 * 获取会话消息列表
 */
export function getMessages(params) {
    return request({
        url: '/api/ai-consult/messages',
        method: 'get',
        params
    })
}

/**
 * 删除会话
 */
export function deleteConversation(data) {
    return request({
        url: '/api/ai-consult/delete-conversation',
        method: 'post',
        data
    })
}

/**
 * 更新会话标题
 */
export function updateConversationTitle(data) {
    return request({
        url: '/api/ai-consult/update-title',
        method: 'post',
        data
    })
}

/**
 * 清空所有会话
 */
export function clearAllConversations() {
    return request({
        url: '/api/ai-consult/clear-all',
        method: 'post'
    })
}
