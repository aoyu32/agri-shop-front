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
        <el-table-column prop="name" label="分类名称" width="200" />
        <el-table-column prop="description" label="分类描述" min-width="300" />
        <el-table-column prop="productCount" label="农产品数量" width="120" />
        <el-table-column prop="sort" label="排序" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
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
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="分类描述" prop="description">
          <el-input 
            v-model="categoryForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入分类描述" 
            maxlength="100" 
            show-word-limit 
          />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="categoryForm.sort" :min="0" :step="1" style="width: 100%" />
          <div class="form-tip">数字越小越靠前</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCategoryStore } from '@/store/modules/category'

const categoryStore = useCategoryStore()

const loading = ref(false)
const categories = computed(() => categoryStore.sortedCategories)

// 对话框
const dialogVisible = ref(false)
const dialogTitle = computed(() => categoryForm.value.id ? '编辑分类' : '添加分类')
const formRef = ref(null)
const categoryForm = ref({
  id: null,
  name: '',
  description: '',
  sort: 0
})

const formRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 20, message: '分类名称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  sort: [{ required: true, message: '请输入排序', trigger: 'blur' }]
}

const handleAdd = () => {
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  categoryForm.value = { ...row }
  dialogVisible.value = true
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
  }).then(() => {
    if (categoryStore.deleteCategory(row.id)) {
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (categoryForm.value.id) {
        // 编辑
        categoryStore.updateCategory(categoryForm.value.id, {
          name: categoryForm.value.name,
          description: categoryForm.value.description,
          sort: categoryForm.value.sort
        })
        ElMessage.success('编辑成功')
      } else {
        // 添加
        categoryStore.addCategory({
          name: categoryForm.value.name,
          description: categoryForm.value.description,
          sort: categoryForm.value.sort
        })
        ElMessage.success('添加成功')
      }
      dialogVisible.value = false
    }
  })
}

const resetForm = () => {
  categoryForm.value = {
    id: null,
    name: '',
    description: '',
    sort: categoryStore.categories.length
  }
  formRef.value?.clearValidate()
}
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
