<template>
  <div class="admin-module">
    <el-card shadow="never">
      <template #header>
        <div class="module-header">
          <div class="header-text">
            <h3>社区管理</h3>
            <p>统一维护帖子内容、上下架状态与推荐属性</p>
          </div>
          <el-button type="primary" @click="openCreateDialog">新增帖子</el-button>
        </div>
      </template>

      <div class="toolbar">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索标题、摘要或正文"
          clearable
          @keyup.enter="handleSearch"
        />
        <el-select v-model="filters.category" placeholder="分类" clearable>
          <el-option
            v-for="item in POST_CATEGORIES"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-select v-model="filters.status" placeholder="状态" clearable>
          <el-option label="已删除" :value="0" />
          <el-option label="已上架" :value="1" />
          <el-option label="审核中" :value="2" />
          <el-option label="已下架" :value="3" />
        </el-select>
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" style="width: 100%">
        <el-table-column label="帖子标题" min-width="260" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="title-text text-ellipsis-cell">{{ row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column label="头像" width="88">
          <template #default="{ row }">
            <el-avatar :src="row.author?.avatar" :size="34">
              {{ (row.author?.username || 'U').slice(0, 1) }}
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column label="作者账号" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="author-text text-ellipsis-cell">{{ row.author?.username || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="作者昵称" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="author-text text-ellipsis-cell">{{ row.author?.nickname || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="分类" width="120">
          <template #default="{ row }">
            <el-tag effect="plain">{{ getCategoryLabel(row.category) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="view_count" label="浏览" width="80" />
        <el-table-column prop="like_count" label="点赞" width="80" />
        <el-table-column prop="comment_count" label="评论" width="80" />
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">{{ row.status_text }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="发布时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right" align="center" header-align="center">
          <template #default="{ row }">
            <div class="action-group">
              <el-button type="primary" link size="small" @click="openEditDialog(row)">编辑</el-button>
              <el-button
                v-if="row.status !== 1"
                type="success"
                link
                size="small"
                @click="handleStatusChange(row, 1)"
              >
                上架
              </el-button>
              <el-button
                v-if="row.status === 1"
                type="warning"
                link
                size="small"
                @click="handleStatusChange(row, 3)"
              >
                下架
              </el-button>
              <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.page_size"
          :page-sizes="[10, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="fetchPosts"
          @size-change="handlePageSizeChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="960px" top="4vh" @close="resetForm">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="110px">
        <div class="dialog-grid">
          <el-form-item label="发布用户" prop="user_id">
            <el-select v-model="form.user_id" filterable placeholder="请选择发布用户">
              <el-option
                v-for="item in authorOptions"
                :key="item.id"
                :label="`${item.nickname || item.username}（${item.phone}）`"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="帖子分类" prop="category">
            <el-select v-model="form.category" placeholder="请选择分类">
              <el-option
                v-for="item in POST_CATEGORIES"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </div>

        <el-form-item label="帖子标题" prop="title">
          <el-input v-model="form.title" maxlength="100" show-word-limit />
        </el-form-item>

        <el-form-item label="帖子摘要" prop="summary">
          <el-input v-model="form.summary" type="textarea" :rows="3" maxlength="300" show-word-limit />
        </el-form-item>

        <el-form-item label="帖子图片">
          <div class="image-list">
            <div v-for="(image, index) in form.images" :key="`${image}-${index}`" class="image-item">
              <img :src="image" alt="帖子图片" />
              <div class="image-mask">
                <el-button circle size="small" type="danger" @click="removeImage(index)">删</el-button>
              </div>
            </div>
            <el-upload
              v-if="form.images.length < 5"
              class="image-uploader"
              :show-file-list="false"
              :auto-upload="false"
              :on-change="handleImageUpload"
              accept="image/*"
            >
              <div class="upload-trigger">
                <span>上传图片</span>
                <small>最多 5 张</small>
              </div>
            </el-upload>
          </div>
          <div class="form-tip">所有图片均通过上传接口处理，不支持手动输入 URL。</div>
        </el-form-item>

        <div class="dialog-grid">
          <el-form-item label="状态">
            <el-select v-model="form.status">
              <el-option label="已上架" :value="1" />
              <el-option label="审核中" :value="2" />
              <el-option label="已下架" :value="3" />
            </el-select>
          </el-form-item>
          <el-form-item label="标签">
            <el-input v-model="tagInput" placeholder="多个标签用中文逗号或英文逗号分隔" />
          </el-form-item>
        </div>

        <div class="dialog-grid">
          <el-form-item label="置顶">
            <el-switch v-model="form.is_top" :active-value="1" :inactive-value="0" />
          </el-form-item>
          <el-form-item label="精华">
            <el-switch v-model="form.is_essence" :active-value="1" :inactive-value="0" />
          </el-form-item>
        </div>

        <el-form-item label="帖子正文" prop="content">
          <div class="editor-container">
            <Editor :value="form.content" :plugins="editorPlugins" @change="handleEditorChange" />
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Editor } from '@bytemd/vue-next'
import gfm from '@bytemd/plugin-gfm'
import highlight from '@bytemd/plugin-highlight'
import 'bytemd/dist/index.css'
import 'highlight.js/styles/vs.css'
import { getAdminUserList } from '@/apis/admin-user'
import {
  createAdminCommunityPost,
  deleteAdminCommunityPost,
  getAdminCommunityDetail,
  getAdminCommunityList,
  updateAdminCommunityPost,
  updateAdminCommunityStatus
} from '@/apis/admin-community'
import { uploadFile } from '@/apis/oss'
import { POST_CATEGORIES, getCategoryLabel } from '@/constants/community'

const editorPlugins = [gfm(), highlight()]

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const formRef = ref(null)
const tableData = ref([])
const authorOptions = ref([])
const tagInput = ref('')

const filters = reactive({
  keyword: '',
  category: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  page_size: 10,
  total: 0
})

const form = reactive({
  id: null,
  user_id: null,
  title: '',
  category: '',
  summary: '',
  content: '',
  images: [],
  status: 1,
  is_top: 0,
  is_essence: 0
})

const dialogTitle = computed(() => (form.id ? '编辑帖子' : '新增帖子'))

const formRules = {
  user_id: [{ required: true, message: '请选择发布用户', trigger: 'change' }],
  title: [
    { required: true, message: '请输入帖子标题', trigger: 'blur' },
    { min: 5, max: 100, message: '标题长度需为 5-100 个字符', trigger: 'blur' }
  ],
  category: [{ required: true, message: '请选择帖子分类', trigger: 'change' }],
  summary: [
    { required: true, message: '请输入帖子摘要', trigger: 'blur' },
    { min: 10, max: 300, message: '摘要长度需为 10-300 个字符', trigger: 'blur' }
  ],
  content: [
    {
      validator: (_, value, callback) => {
        if (!value || value.trim().length < 20) {
          callback(new Error('帖子正文至少需要 20 个字符'))
          return
        }
        callback()
      },
      trigger: 'blur'
    }
  ]
}

const parseTags = () =>
  tagInput.value
    .split(/[，,]/)
    .map((item) => item.trim())
    .filter(Boolean)

const fillTags = (tags = []) => {
  tagInput.value = Array.isArray(tags) ? tags.join('，') : ''
}

const fetchPosts = async () => {
  loading.value = true
  try {
    const res = await getAdminCommunityList({
      ...filters,
      page: pagination.page,
      page_size: pagination.page_size
    })
    tableData.value = res.data.list || []
    pagination.total = res.data.total || 0
  } finally {
    loading.value = false
  }
}

const fetchAuthors = async () => {
  const res = await getAdminUserList({
    page: 1,
    page_size: 500
  })
  authorOptions.value = res.data.list || []
}

const handleSearch = () => {
  pagination.page = 1
  fetchPosts()
}

const handlePageSizeChange = () => {
  pagination.page = 1
  fetchPosts()
}

const openCreateDialog = async () => {
  resetForm()
  if (!authorOptions.value.length) {
    await fetchAuthors()
  }
  dialogVisible.value = true
}

const openEditDialog = async (row) => {
  if (!authorOptions.value.length) {
    await fetchAuthors()
  }
  const res = await getAdminCommunityDetail({ id: row.id })
  const post = res.data.post
  Object.assign(form, {
    id: post.id,
    user_id: post.user_id,
    title: post.title,
    category: post.category,
    summary: post.summary,
    content: post.content,
    images: Array.isArray(post.images) ? [...post.images] : [],
    status: post.status,
    is_top: post.is_top,
    is_essence: post.is_essence
  })
  fillTags(post.tags)
  dialogVisible.value = true
}

const handleEditorChange = (value) => {
  form.content = value
}

const handleImageUpload = async (uploadItem) => {
  if (!uploadItem.raw) return
  if (!uploadItem.raw.type.startsWith('image/')) {
    ElMessage.warning('只能上传图片文件')
    return
  }
  if (uploadItem.raw.size / 1024 / 1024 > 5) {
    ElMessage.warning('图片大小不能超过 5MB')
    return
  }
  const res = await uploadFile(uploadItem.raw, 'community')
  form.images.push(res.data.url)
  ElMessage.success('图片上传成功')
}

const removeImage = (index) => {
  form.images.splice(index, 1)
}

const handleSubmit = async () => {
  await formRef.value.validate()
  submitting.value = true
  try {
    const payload = {
      ...form,
      images: [...form.images],
      tags: parseTags()
    }
    if (form.id) {
      await updateAdminCommunityPost(payload)
      ElMessage.success('帖子更新成功')
    } else {
      await createAdminCommunityPost(payload)
      ElMessage.success('帖子创建成功')
    }
    dialogVisible.value = false
    fetchPosts()
  } finally {
    submitting.value = false
  }
}

const handleStatusChange = (row, status) => {
  const action = status === 1 ? '上架' : '下架'
  ElMessageBox.confirm(`确定${action}帖子“${row.title}”吗？`, '提示', {
    type: 'warning'
  })
    .then(async () => {
      await updateAdminCommunityStatus({ id: row.id, status })
      ElMessage.success(`${action}成功`)
      fetchPosts()
    })
    .catch(() => {})
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除帖子“${row.title}”吗？`, '提示', {
    type: 'warning'
  })
    .then(async () => {
      await deleteAdminCommunityPost({ id: row.id })
      ElMessage.success('删除成功')
      fetchPosts()
    })
    .catch(() => {})
}

const statusTagType = (status) => {
  if (status === 1) return 'success'
  if (status === 2) return 'warning'
  if (status === 3) return 'info'
  return 'danger'
}

const resetForm = () => {
  Object.assign(form, {
    id: null,
    user_id: null,
    title: '',
    category: '',
    summary: '',
    content: '',
    images: [],
    status: 1,
    is_top: 0,
    is_essence: 0
  })
  tagInput.value = ''
  formRef.value?.clearValidate()
}

onMounted(() => {
  fetchPosts()
})
</script>

<style lang="scss" scoped>
.admin-module {
  .module-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .header-text {
    h3 {
      margin: 0 0 6px;
      font-size: 18px;
    }

    p {
      margin: 0;
      color: var(--text-secondary-color);
      font-size: 13px;
    }
  }

  .toolbar {
    display: grid;
    grid-template-columns: 2fr 160px 160px 96px;
    gap: 12px;
    margin-bottom: 16px;
  }

  .title-text {
    font-weight: 600;
    color: var(--text-primary-color);
  }

  .author-text {
    color: var(--text-secondary-color);
  }

  .pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 18px;
  }

  .action-group {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    white-space: nowrap;
  }

  .text-ellipsis-cell {
    display: block;
    width: 100%;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dialog-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  .editor-container {
    width: 100%;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    overflow: hidden;
  }

  .image-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .image-item {
    position: relative;
    width: 120px;
    height: 120px;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--border-color);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .image-mask {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.42);
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    &:hover .image-mask {
      opacity: 1;
    }
  }

  .image-uploader {
    width: 120px;
    height: 120px;
  }

  .upload-trigger {
    width: 120px;
    height: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    border: 1px dashed var(--theme-primary-color);
    color: var(--theme-primary-dark);
    background: rgba(82, 196, 26, 0.04);
    cursor: pointer;

    small {
      margin-top: 6px;
      color: var(--text-secondary-color);
    }
  }

  .form-tip {
    margin-top: 8px;
    font-size: 12px;
    color: var(--text-secondary-color);
    line-height: 1.6;
  }
}

@media screen and (max-width: 1100px) {
  .admin-module {
    .toolbar,
    .dialog-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
