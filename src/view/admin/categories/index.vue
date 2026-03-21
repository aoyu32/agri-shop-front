<template>
  <div class="admin-module">
    <el-card shadow="never">
      <template #header>
        <div class="module-header">
          <div class="header-text">
            <h3>农产品分类管理</h3>
            <p>维护平台分类层级、排序与启用状态</p>
          </div>
          <el-button type="primary" @click="openCreateDialog">新增分类</el-button>
        </div>
      </template>

      <div class="toolbar">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索分类名称"
          clearable
          @keyup.enter="fetchCategories"
        />
        <el-select v-model="filters.status" placeholder="状态" clearable>
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
        <el-button type="primary" @click="fetchCategories">查询</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" row-key="id" style="width: 100%">
        <el-table-column label="层级" width="90">
          <template #default="{ row }">
            <el-tag :type="row.parent_id === 0 ? 'success' : 'info'">
              {{ row.parent_id === 0 ? '一级' : '二级' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="分类名称" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="text-ellipsis-cell">{{ row.icon ? `${row.icon} ${row.name}` : row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="parent_name" label="父级分类" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="text-ellipsis-cell">{{ row.parent_name || '顶级分类' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort_order" label="排序" width="90" />
        <el-table-column prop="child_count" label="子分类数" width="100" />
        <el-table-column prop="product_count" label="商品数" width="90" />
        <el-table-column prop="shop_count" label="店铺使用数" width="110" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updated_at" label="更新时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right" align="center" header-align="center">
          <template #default="{ row }">
            <div class="action-group">
              <el-button type="primary" link size="small" @click="openEditDialog(row)">编辑</el-button>
              <el-button
                :type="row.status === 1 ? 'warning' : 'success'"
                link
                size="small"
                @click="handleToggleStatus(row)"
              >
                {{ row.status === 1 ? '禁用' : '启用' }}
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
          @current-change="fetchCategories"
          @size-change="handlePageSizeChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="640px" @close="resetForm">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="110px">
        <el-form-item label="父级分类">
          <el-select v-model="form.parent_id" placeholder="不选则为一级分类" clearable style="width: 100%">
            <el-option label="顶级分类" :value="0" />
            <el-option
              v-for="item in topLevelOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
          <div class="form-tip">为了保持前台展示结构清晰，这里限制最多两级分类。</div>
        </el-form-item>
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" maxlength="50" />
        </el-form-item>
        <el-form-item label="图标标识">
          <el-input v-model="form.icon" maxlength="30" placeholder="可填 emoji 或简短图标文本" />
        </el-form-item>
        <el-form-item label="排序值">
          <el-input-number v-model="form.sort_order" :min="0" :step="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
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
import {
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategoryDetail,
  getAdminCategoryList,
  updateAdminCategory
} from '@/apis/admin-category'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const formRef = ref(null)
const tableData = ref([])
const allCategories = ref([])

const filters = reactive({
  keyword: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  page_size: 10,
  total: 0
})

const form = reactive({
  id: null,
  parent_id: 0,
  name: '',
  icon: '',
  sort_order: 0,
  status: 1
})

const dialogTitle = computed(() => (form.id ? '编辑分类' : '新增分类'))

const topLevelOptions = computed(() =>
  allCategories.value.filter((item) => item.parent_id === 0 && item.id !== form.id)
)

const formRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 1, max: 50, message: '分类名称长度需为 1-50 个字符', trigger: 'blur' }
  ]
}

const fetchCategories = async () => {
  loading.value = true
  try {
    const res = await getAdminCategoryList({
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

const fetchCategoryOptions = async () => {
  const res = await getAdminCategoryList({
    page: 1,
    page_size: 9999
  })
  allCategories.value = res.data.list || []
}

const refreshData = async () => {
  await Promise.all([fetchCategories(), fetchCategoryOptions()])
}

const handlePageSizeChange = () => {
  pagination.page = 1
  fetchCategories()
}

const openCreateDialog = () => {
  resetForm()
  dialogVisible.value = true
}

const openEditDialog = async (row) => {
  const res = await getAdminCategoryDetail({ id: row.id })
  const category = res.data.category
  Object.assign(form, {
    id: category.id,
    parent_id: category.parent_id || 0,
    name: category.name,
    icon: category.icon || '',
    sort_order: category.sort_order,
    status: category.status
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()
  submitting.value = true
  try {
    const payload = {
      ...form,
      parent_id: form.parent_id || 0
    }
    if (form.id) {
      await updateAdminCategory(payload)
      ElMessage.success('分类更新成功')
    } else {
      await createAdminCategory(payload)
      ElMessage.success('分类创建成功')
    }
    dialogVisible.value = false
    refreshData()
  } finally {
    submitting.value = false
  }
}

const handleToggleStatus = (row) => {
  const nextStatus = row.status === 1 ? 0 : 1
  const actionText = nextStatus === 1 ? '启用' : '禁用'

  ElMessageBox.confirm(`确定要${actionText}分类“${row.name}”吗？`, '提示', {
    type: 'warning'
  })
    .then(async () => {
      await updateAdminCategory({
        id: row.id,
        status: nextStatus
      })
      ElMessage.success(`${actionText}成功`)
      refreshData()
    })
    .catch(() => {})
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除分类“${row.name}”吗？`, '提示', {
    type: 'warning'
  })
    .then(async () => {
      await deleteAdminCategory({ id: row.id })
      ElMessage.success('删除成功')
      refreshData()
    })
    .catch(() => {})
}

const resetForm = () => {
  Object.assign(form, {
    id: null,
    parent_id: 0,
    name: '',
    icon: '',
    sort_order: 0,
    status: 1
  })
  formRef.value?.clearValidate()
}

onMounted(() => {
  refreshData()
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
    grid-template-columns: 1fr 160px 96px;
    gap: 12px;
    margin-bottom: 16px;
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

  .form-tip {
    margin-top: 8px;
    font-size: 12px;
    color: var(--text-secondary-color);
    line-height: 1.6;
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
