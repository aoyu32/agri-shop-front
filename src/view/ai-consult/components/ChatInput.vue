<template>
  <div class="chat-input">
    <div class="input-container">
      <!-- 图片预览区域 -->
      <div v-if="imageList.length > 0" class="image-preview">
        <div
          v-for="(image, index) in imageList"
          :key="index"
          class="preview-item"
          :class="{ uploading: image.uploading }"
        >
          <img :src="image.url" :alt="image.name" />
          <!-- 上传中遮罩 -->
          <div v-if="image.uploading" class="uploading-mask">
            <el-icon class="is-loading">
              <Loading />
            </el-icon>
            <span>上传中...</span>
          </div>
          <!-- 删除按钮 -->
          <div v-else class="preview-actions" @click.stop="removeImage(index)">
            <i class="iconfont icon-close"></i>
          </div>
        </div>
      </div>

      <!-- 输入框区域 -->
      <div class="input-wrapper">
        <el-input
          v-model="inputValue"
          type="textarea"
          :rows="4"
          :disabled="disabled"
          placeholder="输入您的问题，按Enter发送，Shift+Enter换行..."
          resize="none"
          @keydown="handleKeyDown"
          class="input-textarea"
        />
        <div class="input-toolbar">
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            multiple
            style="display: none"
            @change="handleFileChange"
          />
          <div
            class="upload-btn"
            :class="{ disabled: disabled }"
            @click="triggerFileInput"
            title="上传图片"
          >
            <i class="iconfont icon-tupian"></i>
          </div>
          <el-button
            type="primary"
            :disabled="isButtonDisabled"
            :loading="disabled"
            @click="handleSend"
            class="send-btn"
          >
            发送
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { uploadFile } from '@/apis/oss'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['send'])

const inputValue = ref('')
const imageList = ref([])
const fileInputRef = ref(null)

// 是否有图片正在上传
const isUploading = computed(() => {
  return imageList.value.some(img => img.uploading)
})

// 计算发送按钮是否禁用
const isButtonDisabled = computed(() => {
  // 如果正在发送消息，禁用
  if (props.disabled) return true
  
  // 如果有图片正在上传，禁用
  if (isUploading.value) return true
  
  // 获取已上传成功的图片数量
  const uploadedImages = imageList.value.filter(img => !img.uploading)
  
  // 如果没有输入文本且没有已上传的图片，禁用
  if (!inputValue.value.trim() && uploadedImages.length === 0) return true
  
  return false
})

const triggerFileInput = () => {
  if (props.disabled) return
  fileInputRef.value?.click()
}

const handleFileChange = async (event) => {
  const files = Array.from(event.target.files || [])
  
  if (files.length === 0) return

  // 限制图片数量
  if (imageList.value.length + files.length > 9) {
    ElMessage.warning('最多只能上传9张图片')
    event.target.value = ''
    return
  }

  // 处理每个文件
  for (const file of files) {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      ElMessage.warning(`${file.name} 不是图片文件`)
      continue
    }

    // 验证文件大小（限制5MB）
    if (file.size > 5 * 1024 * 1024) {
      ElMessage.warning(`${file.name} 文件大小超过5MB`)
      continue
    }

    // 创建本地预览URL
    const localUrl = URL.createObjectURL(file)
    
    // 添加到列表（标记为上传中）
    const imageItem = {
      name: file.name,
      file: file,
      url: localUrl,
      ossUrl: null,
      uploading: true
    }
    imageList.value.push(imageItem)

    // 立即上传到 OSS
    try {
      const res = await uploadFile(file, 'ai-consult')
      
      if (res.code === 200) {
        // 上传成功，找到对应的图片项并更新
        const index = imageList.value.indexOf(imageItem)
        if (index > -1) {
          // 创建新对象替换，确保响应式更新
          imageList.value[index] = {
            ...imageItem,
            ossUrl: res.data.url,
            url: res.data.url,
            uploading: false
          }
          // 释放本地预览URL
          URL.revokeObjectURL(localUrl)
          console.log('图片上传成功:', res.data.url)
        }
      } else {
        throw new Error(res.message || '上传失败')
      }
    } catch (error) {
      console.error('图片上传失败:', error)
      ElMessage.error(`${file.name} 上传失败：${error.message || '未知错误'}`)
      // 移除上传失败的图片
      const index = imageList.value.indexOf(imageItem)
      if (index > -1) {
        imageList.value.splice(index, 1)
      }
      // 释放本地预览URL
      URL.revokeObjectURL(localUrl)
    }
  }

  // 清空input，以便可以重复选择同一文件
  event.target.value = ''
}

const removeImage = (index) => {
  const image = imageList.value[index]
  // 如果是本地预览URL，释放它
  if (image.url && image.url.startsWith('blob:')) {
    URL.revokeObjectURL(image.url)
  }
  imageList.value.splice(index, 1)
}

const handleKeyDown = (event) => {
  // Enter发送，Shift+Enter换行
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    if (!isButtonDisabled.value) {
      handleSend()
    }
  }
}

const handleSend = () => {
  if (isButtonDisabled.value) {
    return
  }

  // 只发送已上传成功的图片的 OSS URL
  const uploadedImages = imageList.value
    .filter(img => !img.uploading && img.ossUrl)
    .map(img => img.ossUrl)

  emit('send', {
    content: inputValue.value.trim(),
    images: uploadedImages
  })
  
  // 清空输入和图片
  inputValue.value = ''
  // 释放所有本地预览URL
  imageList.value.forEach(img => {
    if (img.url && img.url.startsWith('blob:')) {
      URL.revokeObjectURL(img.url)
    }
  })
  imageList.value = []
}
</script>

<style lang="scss" scoped>
@use './ChatInput.scss' as *;
</style>

