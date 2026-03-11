<template>
  <div class="category-management">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>分类管理</span>
          <el-button type="primary" @click="handleAdd">
            <i class="iconfont icon-tianjia"></i>
            添加分类
          </el-button>
        </div>
      </template>

      <!-- 分类表格 -->
      <el-table
        :data="categories"
        style="width: 100%"
        v-loading="loading"
        :header-cell-style="{ background: '#f5f5f5', color: '#262626', fontWeight: '600' }"
      >
        <el-table-column label="一级分类" width="180">
          <template #default="{ row }">
            <span v-if="row.parent_name">{{ row.parent_name }}</span>
            <span v-else>{{ row.icon }} {{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="二级分类" width="180">
          <template #default="{ row }">
            <span v-if="row.parent_name">{{ row.icon }} {{ row.name }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="productCount" label="农产品数量" width="120" />
        <el-table-column prop="sort" label="排序" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button 
              :type="row.status === 1 ? 'warning' : 'success'" 
              size="small" 
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑分类对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="resetForm"
    >
      <el-form :model="categoryForm" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="选择分类" prop="category_id">
          <el-cascader
            v-model="categoryForm.category_id"
            :options="systemCategories"
            :props="cascaderProps"
            placeholder="请选择分类"
            style="width: 100%"
            clearable
          />
          <div class="form-tip">从系统分类中选择要添加到店铺的分类</div>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="categoryForm.sort" :min="0" :step="1" style="width: 100%" />
          <div class="form-tip">数字越小越靠前</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getSystemCategories,
  getMerchantCategoryList,
  addMerchantCategory,
  updateMerchantCategory,
  toggleCategoryStatus,
  deleteMerchantCategory
} from '@/apis/merchantCategory'

const loading = ref(false)
const categories = ref([])
const systemCategories = ref([])

// 级联选择器配置
const cascaderProps = {
  value: 'id',
  label: 'name',
  children: 'children',
  checkStrictly: true,
  emitPath: false
}

// 对话框
const dialogVisible = ref(false)
const dialogTitle = computed(() => categoryForm.value.id ? '编辑分类' : '添加分类')
const formRef = ref(null)
const submitting = ref(false)
const categoryForm = ref({
  id: null,
  category_id: null,
  name: '',
  sort: 0
})

const formRules = {
  category_id: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  sort: [{ required: true, message: '请输入排序', trigger: 'blur' }]
}

// 获取系统分类列表
const fetchSystemCategories = async () => {
  try {
    const res = await getSystemCategories()
    // 构建树形结构
    const list = res.data.list || []
    systemCategories.value = buildTree(list, 0)
  } catch (error) {
    console.error('获取系统分类失败:', error)
  }
}

// 构建树形结构
const buildTree = (list, parentId) => {
  const tree = []
  for (const item of list) {
    if (item.parent_id === parentId) {
      const children = buildTree(list, item.id)
      const node = {
        id: item.id,
        name: item.icon ? `${item.icon} ${item.name}` : item.name,
        children: children.length > 0 ? children : undefined
      }
      tree.push(node)
    }
  }
  return tree
}

// 获取店铺分类列表
const fetchCategories = async () => {
  loading.value = true
  try {
    const res = await getMerchantCategoryList()
    categories.value = res.data.list || []
  } catch (error) {
    console.error('获取分类列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  categoryForm.value = {
    id: row.id,
    category_id: row.category_id,
    name: row.name,
    sort: row.sort
  }
  dialogVisible.value = true
}

const handleToggleStatus = async (row) => {
  const action = row.status === 1 ? '禁用' : '启用'
  ElMessageBox.confirm(`确定要${action}该分类吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await toggleCategoryStatus({ id: row.id })
      ElMessage.success(`${action}成功`)
      fetchCategories()
    } catch (error) {
      console.error('操作失败:', error)
    }
  }).catch(() => {})
}

const handleDelete = (row) => {
  if (row.productCount > 0) {
    ElMessage.warning('该分类下还有农产品，无法删除')
    return
  }

  ElMessageBox.confirm('确定要删除该分类吗？删除后无法恢复。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteMerchantCategory({ id: row.id })
      ElMessage.success('删除成功')
      fetchCategories()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        if (categoryForm.value.id) {
          // 编辑
          await updateMerchantCategory({
            id: categoryForm.value.id,
            category_id: categoryForm.value.category_id,
            sort: categoryForm.value.sort
          })
          ElMessage.success('编辑成功')
        } else {
          // 添加
          await addMerchantCategory({
            category_id: categoryForm.value.category_id,
            sort: categoryForm.value.sort
          })
          ElMessage.success('添加成功')
        }
        dialogVisible.value = false
        fetchCategories()
      } catch (error) {
        console.error('操作失败:', error)
      } finally {
        submitting.value = false
      }
    }
  })
}

const resetForm = () => {
  categoryForm.value = {
    id: null,
    category_id: null,
    name: '',
    sort: categories.value.length
  }
  formRef.value?.clearValidate()
}

onMounted(() => {
  fetchSystemCategories()
  fetchCategories()
})
</script>

<style lang="scss" scoped>
.category-management {
  :deep(.el-card__header) {
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 16px;
      font-weight: 600;
      color: #262626;
    }
  }

  :deep(.el-card__body) {
    padding: 20px;
  }

  .form-tip {
    font-size: 12px;
    color: #8c8c8c;
    margin-top: 8px;
  }
}
</style>
