<template>
  <div class="admin-module">
    <el-card shadow="never">
      <template #header>
        <div class="module-header">
          <div class="header-text">
            <h3>用户管理</h3>
            <p>统一维护消费者与农户账号信息</p>
          </div>
          <el-button type="primary" @click="openCreateDialog">新增用户</el-button>
        </div>
      </template>

      <div class="toolbar">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索用户名、昵称或手机号"
          clearable
          @keyup.enter="handleSearch"
        />
        <el-select v-model="filters.role" placeholder="角色" clearable>
          <el-option label="消费者" value="consumer" />
          <el-option label="农户" value="merchant" />
        </el-select>
        <el-select v-model="filters.status" placeholder="状态" clearable>
          <el-option label="正常" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" style="width: 100%">
        <el-table-column label="头像" width="88">
          <template #default="{ row }">
            <el-avatar :src="row.avatar" :size="42">
              {{ (row.nickname || row.username || '').slice(0, 1) }}
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="text-ellipsis-cell">{{ row.username }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="nickname" label="昵称" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="text-ellipsis-cell">{{ row.nickname || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" min-width="140" />
        <el-table-column prop="role_text" label="角色" width="100" />
        <el-table-column prop="status_text" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status_text }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="店铺数" width="90" align="center">
          <template #default="{ row }">
            <span>{{ row.role === 'merchant' ? (row.shop_count ?? 0) : '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="订单数" width="90" align="center">
          <template #default="{ row }">
            <span>{{ row.role === 'merchant' ? (row.order_count ?? 0) : '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="160" fixed="right" align="center" header-align="center">
          <template #default="{ row }">
            <div class="action-group">
              <el-button
                link
                :type="row.status === 1 ? 'warning' : 'success'"
                size="small"
                @click="handleToggleStatus(row)"
              >
                {{ row.status === 1 ? '禁用' : '启用' }}
              </el-button>
              <el-button link type="primary" size="small" @click="openEditDialog(row)">编辑</el-button>
              <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
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
          @current-change="fetchUsers"
          @size-change="handlePageSizeChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="720px" @close="resetForm">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="110px">
        <el-form-item label="头像">
          <div class="upload-row">
            <el-avatar :src="form.avatar" :size="64">
              {{ (form.nickname || form.username || 'U').slice(0, 1) }}
            </el-avatar>
            <el-upload :show-file-list="false" :auto-upload="false" :on-change="handleAvatarChange">
              <el-button>上传头像</el-button>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" maxlength="50" />
        </el-form-item>
        <el-form-item label="登录密码" prop="password">
          <el-input v-model="form.password" type="password" show-password placeholder="编辑时留空则不修改" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" maxlength="11" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="form.nickname" maxlength="50" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-radio-group v-model="form.role">
            <el-radio value="consumer">消费者</el-radio>
            <el-radio value="merchant">农户</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="form.address" maxlength="200" />
        </el-form-item>
        <el-form-item label="个人简介">
          <el-input v-model="form.bio" type="textarea" :rows="3" maxlength="200" show-word-limit />
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
import { uploadFile } from '@/apis/oss'
import {
  createAdminUser,
  deleteAdminUser,
  getAdminUserDetail,
  getAdminUserList,
  updateAdminUser
} from '@/apis/admin-user'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const tableData = ref([])
const formRef = ref(null)

const filters = reactive({
  keyword: '',
  role: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  page_size: 10,
  total: 0
})

const form = reactive({
  id: null,
  avatar: '',
  username: '',
  password: '',
  phone: '',
  nickname: '',
  role: 'consumer',
  status: 1,
  address: '',
  bio: ''
})

const dialogTitle = computed(() => (form.id ? '编辑用户' : '新增用户'))

const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度需为 3-50 个字符', trigger: 'blur' }
  ],
  password: [
    {
      validator: (_, value, callback) => {
        if (!form.id && !value) {
          callback(new Error('请输入登录密码'))
          return
        }
        if (value && (value.length < 6 || value.length > 20)) {
          callback(new Error('密码长度需为 6-20 个字符'))
          return
        }
        callback()
      },
      trigger: 'blur'
    }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await getAdminUserList({
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

const handleSearch = () => {
  pagination.page = 1
  fetchUsers()
}

const handlePageSizeChange = () => {
  pagination.page = 1
  fetchUsers()
}

const openCreateDialog = () => {
  resetForm()
  dialogVisible.value = true
}

const openEditDialog = async (row) => {
  const res = await getAdminUserDetail({ id: row.id })
  const user = res.data.user
  Object.assign(form, {
    id: user.id,
    avatar: user.avatar || '',
    username: user.username,
    password: '',
    phone: user.phone,
    nickname: user.nickname || '',
    role: user.role,
    status: user.status,
    address: user.address || '',
    bio: user.bio || ''
  })
  dialogVisible.value = true
}

const handleAvatarChange = async (uploadItem) => {
  if (!uploadItem.raw) return
  const res = await uploadFile(uploadItem.raw, 'avatar')
  form.avatar = res.data.url
  ElMessage.success('头像上传成功')
}

const handleSubmit = async () => {
  await formRef.value.validate()
  submitting.value = true
  try {
    const payload = { ...form }
    if (!payload.password) {
      delete payload.password
    }
    if (form.id) {
      await updateAdminUser(payload)
      ElMessage.success('用户更新成功')
    } else {
      await createAdminUser(payload)
      ElMessage.success('用户创建成功')
    }
    dialogVisible.value = false
    fetchUsers()
  } finally {
    submitting.value = false
  }
}

const handleToggleStatus = (row) => {
  const nextStatus = row.status === 1 ? 0 : 1
  const actionText = nextStatus === 1 ? '启用' : '禁用'

  ElMessageBox.confirm(`确定要${actionText}用户“${row.username}”吗？`, '提示', {
    type: 'warning'
  })
    .then(async () => {
      await updateAdminUser({
        id: row.id,
        status: nextStatus
      })
      ElMessage.success(`${actionText}成功`)
      fetchUsers()
    })
    .catch(() => {})
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除用户“${row.username}”吗？`, '提示', {
    type: 'warning'
  })
    .then(async () => {
      await deleteAdminUser({ id: row.id })
      ElMessage.success('删除成功')
      fetchUsers()
    })
    .catch(() => {})
}

const resetForm = () => {
  Object.assign(form, {
    id: null,
    avatar: '',
    username: '',
    password: '',
    phone: '',
    nickname: '',
    role: 'consumer',
    status: 1,
    address: '',
    bio: ''
  })
  formRef.value?.clearValidate()
}

onMounted(() => {
  fetchUsers()
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
    grid-template-columns: 2fr 140px 140px 96px;
    gap: 12px;
    margin-bottom: 16px;
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

  .pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 18px;
  }

  .upload-row {
    display: flex;
    align-items: center;
    gap: 16px;
  }
}

@media screen and (max-width: 900px) {
  .admin-module {
    .toolbar {
      grid-template-columns: 1fr;
    }
  }
}
</style>
