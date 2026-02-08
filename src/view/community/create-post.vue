<template>
  <div class="create-post-page">
    <div class="page-header">
      <h2>发布帖子</h2>
      <el-button @click="handleBack">
        <i class="iconfont icon-fanhui"></i>
        返回
      </el-button>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="post-form"
    >
        <el-form-item label="帖子标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="请输入帖子标题（5-50字）"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="帖子摘要" prop="summary">
          <el-input
            v-model="form.summary"
            type="textarea"
            :rows="3"
            placeholder="请输入帖子摘要，简要描述帖子内容（10-200字）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="封面图片（选填，最多5张）">
          <div class="image-upload-area">
            <div v-for="(image, index) in form.images" :key="index" class="image-item">
              <img :src="image.url" :alt="image.name" />
              <div class="image-mask">
                <i class="iconfont icon-shanchu" @click="handleRemoveImage(index)"></i>
              </div>
            </div>
            <el-upload
              v-if="form.images.length < 5"
              class="image-uploader"
              :show-file-list="false"
              :before-upload="handleImageUpload"
              accept="image/*"
            >
              <div class="upload-trigger">
                <i class="iconfont icon-tupian"></i>
                <span>上传图片</span>
              </div>
            </el-upload>
          </div>
          <div class="upload-tips">
            <i class="iconfont icon-tishi"></i>
            <span>支持jpg、png格式，单张图片不超过5MB</span>
          </div>
        </el-form-item>

        <el-form-item label="帖子内容" prop="content">
          <div class="editor-container">
            <Editor
              :value="form.content"
              :plugins="editorPlugins"
              @change="handleEditorChange"
            />
          </div>
        </el-form-item>

        <el-form-item>
          <div class="form-actions">
            <el-button @click="handleBack">取消</el-button>
            <el-button type="primary" @click="handleSubmit" :loading="submitting">
              发布帖子
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Editor } from '@bytemd/vue-next'
import gfm from '@bytemd/plugin-gfm'
import highlight from '@bytemd/plugin-highlight'
import 'bytemd/dist/index.css'
import 'highlight.js/styles/vs.css'

const router = useRouter()
const formRef = ref(null)
const submitting = ref(false)

// 富文本编辑器插件
const editorPlugins = [gfm(), highlight()]

const form = ref({
  title: '',
  summary: '',
  content: '',
  images: []
})

const rules = {
  title: [
    { required: true, message: '请输入帖子标题', trigger: 'blur' },
    { min: 5, max: 50, message: '标题长度为5-50个字符', trigger: 'blur' }
  ],
  summary: [
    { required: true, message: '请输入帖子摘要', trigger: 'blur' },
    { min: 10, max: 200, message: '摘要长度为10-200个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入帖子内容', trigger: 'blur' },
    { min: 20, message: '内容至少20个字符', trigger: 'blur' }
  ]
}

// 处理编辑器内容变化
const handleEditorChange = (value) => {
  form.value.content = value
}

const handleImageUpload = (file) => {
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.warning('图片大小不能超过 5MB')
    return false
  }

  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.warning('只能上传图片文件')
    return false
  }

  if (form.value.images.length >= 5) {
    ElMessage.warning('最多只能上传5张图片')
    return false
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    form.value.images.push({
      url: e.target.result,
      name: file.name
    })
  }
  reader.readAsDataURL(file)
  return false
}

const handleRemoveImage = (index) => {
  form.value.images.splice(index, 1)
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    
    submitting.value = true
    
    // 模拟发布
    setTimeout(() => {
      ElMessage.success('帖子发布成功！')
      submitting.value = false
      router.push('/community')
    }, 1000)
  } catch (error) {
    console.error('表单验证失败', error)
  }
}

const handleBack = () => {
  router.back()
}
</script>

<style lang="scss" scoped>
.create-post-page {
  background: #fff;
  border-radius: 8px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    padding-bottom: 20px;
    border-bottom: 2px solid #f0f0f0;

    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: var(--text-primary-color);
    }
  }

  .post-form {
      :deep(.el-form-item__label) {
        font-size: 15px;
        font-weight: 600;
        color: var(--text-primary-color);
        margin-bottom: 12px;
      }

      .image-upload-area {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 8px;

        .image-item {
          position: relative;
          width: 120px;
          height: 120px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--border-color);

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .image-mask {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s;

            i {
              font-size: 28px;
              color: #fff;
              cursor: pointer;

              &:hover {
                color: #f5222d;
              }
            }
          }

          &:hover .image-mask {
            opacity: 1;
          }
        }

        .image-uploader {
          width: 120px;
          height: 120px;

          .upload-trigger {
            width: 120px;
            height: 120px;
            border: 2px dashed var(--border-color);
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
              border-color: var(--theme-primary-color);
              color: var(--theme-primary-color);
            }

            i {
              font-size: 32px;
              color: var(--text-placeholder-color);
              margin-bottom: 8px;
            }

            span {
              font-size: 13px;
              color: var(--text-secondary-color);
            }

            &:hover i,
            &:hover span {
              color: var(--theme-primary-color);
            }
          }
        }
      }

      .upload-tips {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: var(--text-secondary-color);

        i {
          font-size: 14px;
        }
      }

      .editor-container {
        width: 100%;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        overflow: hidden;

        :deep(.bytemd) {
          height: 600px;
          width: 100%;
        }
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 24px;
      }
    }
  }
</style>
