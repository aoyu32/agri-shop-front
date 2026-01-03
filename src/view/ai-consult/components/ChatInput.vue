<template>
  <div class="chat-input">
    <div class="input-container">
      <!-- 图片预览区域 -->
      <div v-if="imageList.length > 0" class="image-preview">
        <div
          v-for="(image, index) in imageList"
          :key="index"
          class="preview-item"
        >
          <img :src="image.url" :alt="image.name" />
          <div class="preview-actions" @click.stop="removeImage(index)">
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
            :disabled="(!inputValue.trim() && imageList.length === 0) || disabled"
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
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

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

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileChange = (event) => {
  const files = Array.from(event.target.files || [])
  
  if (files.length === 0) return

  // 限制图片数量
  if (imageList.value.length + files.length > 9) {
    ElMessage.warning('最多只能上传9张图片')
    return
  }

  files.forEach(file => {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      ElMessage.warning(`${file.name} 不是图片文件`)
      return
    }

    // 验证文件大小（限制5MB）
    if (file.size > 5 * 1024 * 1024) {
      ElMessage.warning(`${file.name} 文件大小超过5MB`)
      return
    }

    // 创建预览URL
    const reader = new FileReader()
    reader.onload = (e) => {
      imageList.value.push({
        name: file.name,
        file: file,
        url: e.target.result
      })
    }
    reader.readAsDataURL(file)
  })

  // 清空input，以便可以重复选择同一文件
  event.target.value = ''
}

const removeImage = (index) => {
  imageList.value.splice(index, 1)
}

const handleKeyDown = (event) => {
  // Enter发送，Shift+Enter换行
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    if ((inputValue.value.trim() || imageList.value.length > 0) && !props.disabled) {
      handleSend()
    }
  }
}

const handleSend = () => {
  if ((!inputValue.value.trim() && imageList.value.length === 0) || props.disabled) {
    return
  }

  emit('send', {
    content: inputValue.value.trim(),
    images: imageList.value.map(img => ({
      name: img.name,
      file: img.file,
      url: img.url
    }))
  })
  
  // 清空输入和图片
  inputValue.value = ''
  imageList.value = []
}
</script>

<style lang="scss" scoped>
@use './ChatInput.scss' as *;
</style>

