<template>
  <div class="product-management">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>{{ pageTitle }}</span>
          <el-button type="primary" @click="handleAdd">
            <i class="iconfont icon-tianjia"></i>
            添加农产品
          </el-button>
        </div>
      </template>

      <!-- 搜索和筛选 -->
      <div class="filter-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索农产品名称"
          style="width: 300px"
          clearable
        >
          <template #prefix>
            <i class="iconfont icon-sousuo"></i>
          </template>
        </el-input>
        <el-select v-model="statusFilter" placeholder="农产品状态" style="width: 150px" clearable>
          <el-option label="全部" value="" />
          <el-option label="在售" value="on_sale" />
          <el-option label="已下架" value="off_sale" />
        </el-select>
        <el-button type="primary" @click="handleSearch">
          <i class="iconfont icon-sousuo"></i>
          搜索
        </el-button>
      </div>

      <!-- 农产品表格 -->
      <el-table
        :data="displayProducts"
        style="width: 100%"
        v-loading="loading"
        :header-cell-style="{ background: '#f5f5f5', color: '#262626', fontWeight: '600' }"
      >
        <el-table-column label="农产品图片" width="100">
          <template #default="{ row }">
            <el-image :src="row.image" style="width: 60px; height: 60px; border-radius: 4px;" fit="cover" />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="农产品名称" min-width="200" />
        <el-table-column prop="category" label="分类" min-width="150" />
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">
            <span class="price">¥{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100">
          <template #default="{ row }">
            <span :class="{ 'low-stock': row.stock < 10 }">{{ row.stock }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="sales" label="销量" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'on_sale' ? 'success' : 'info'">
              {{ row.status === 'on_sale' ? '在售' : '已下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button
              :type="row.status === 'on_sale' ? 'warning' : 'success'"
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'on_sale' ? '下架' : '上架' }}
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑农产品对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="900px"
      @close="resetForm"
    >
      <el-form :model="productForm" :rules="formRules" ref="formRef" label-width="100px">
        <el-tabs v-model="activeTab">
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="basic">
            <el-form-item label="农产品图片" prop="images">
              <div class="image-upload-list">
                <div v-for="(img, index) in productForm.images" :key="index" class="image-item">
                  <el-image :src="img" style="width: 100px; height: 100px; border-radius: 4px;" fit="cover" />
                  <div class="image-actions">
                    <el-button type="danger" size="small" :icon="Delete" circle @click="removeImage(index)" />
                  </div>
                </div>
                <el-upload
                  v-if="productForm.images.length < 5"
                  class="image-uploader"
                  action="#"
                  :show-file-list="false"
                  :auto-upload="false"
                  :on-change="handleImageAdd"
                >
                  <div class="upload-placeholder">
                    <el-icon><Plus /></el-icon>
                    <div>添加图片</div>
                  </div>
                </el-upload>
              </div>
              <div class="form-tip">最多上传5张图片，建议尺寸800x800</div>
            </el-form-item>

            <el-form-item label="农产品名称" prop="name">
              <el-input v-model="productForm.name" placeholder="请输入农产品名称" maxlength="50" show-word-limit />
            </el-form-item>

            <el-form-item label="农产品简介" prop="subtitle">
              <el-input v-model="productForm.subtitle" placeholder="请输入农产品简介" maxlength="100" show-word-limit />
            </el-form-item>

            <el-form-item label="农产品分类" prop="category">
              <el-cascader
                v-model="productForm.category"
                :options="categoryTree"
                :props="cascaderProps"
                placeholder="请选择分类"
                style="width: 100%"
                clearable
              />
              <div class="form-tip">请选择二级分类</div>
            </el-form-item>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="农产品价格" prop="price">
                  <el-input-number v-model="productForm.price" :min="0" :precision="2" :step="0.1" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="原价" prop="originalPrice">
                  <el-input-number v-model="productForm.originalPrice" :min="0" :precision="2" :step="0.1" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="农产品库存" prop="stock">
                  <el-input-number v-model="productForm.stock" :min="0" :step="1" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="单位" prop="unit">
                  <el-input v-model="productForm.unit" placeholder="如：500g/份" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="产地" prop="origin">
              <el-input v-model="productForm.origin" placeholder="请输入产地" />
            </el-form-item>

            <el-form-item label="农产品标签" prop="tags">
              <el-tag
                v-for="tag in productForm.tags"
                :key="tag"
                closable
                @close="removeTag(tag)"
                style="margin-right: 8px;"
              >
                {{ tag }}
              </el-tag>
              <el-input
                v-if="tagInputVisible"
                ref="tagInputRef"
                v-model="tagInputValue"
                size="small"
                style="width: 100px;"
                @keyup.enter="handleTagInputConfirm"
                @blur="handleTagInputConfirm"
              />
              <el-button v-else size="small" @click="showTagInput">+ 添加标签</el-button>
            </el-form-item>
          </el-tab-pane>

          <!-- 规格设置 -->
          <el-tab-pane label="规格设置" name="specs">
            <div class="specs-section">
              <div v-if="productForm.specs.length === 0" class="empty-specs">
                <el-empty description="暂无规格" :image-size="100">
                  <el-button type="primary" icon="Plus" @click="addSpec">添加规格</el-button>
                </el-empty>
              </div>
              <template v-else>
                <div v-for="(spec, index) in productForm.specs" :key="index" class="spec-item">
                  <span class="spec-label">规格{{ index + 1 }}：</span>
                  <el-input v-model="spec.label" placeholder="如：5斤装" style="width: 200px; margin-right: 10px;" />
                  <span class="spec-label">加价：</span>
                  <el-input-number v-model="spec.price" :min="0" :precision="2" placeholder="加价" style="width: 150px; margin-right: 10px;" />
                  <span class="spec-label">库存：</span>
                  <el-input-number v-model="spec.stock" :min="0" placeholder="库存" style="width: 150px; margin-right: 10px;" />
                  <el-button type="danger" icon="Delete" @click="removeSpec(index)">删除</el-button>
                </div>
                <el-button type="primary" icon="Plus" @click="addSpec" style="margin-top: 16px;">添加规格</el-button>
              </template>
            </div>
          </el-tab-pane>

          <!-- 图文详情 -->
          <el-tab-pane label="图文详情" name="detail">
            <div class="editor-container">
              <Editor
                :value="productForm.detail"
                :plugins="editorPlugins"
                @change="handleEditorChange"
              />
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import { Editor } from '@bytemd/vue-next'
import gfm from '@bytemd/plugin-gfm'
import highlight from '@bytemd/plugin-highlight'
import {
  getMerchantProductList,
  getMerchantProductDetail,
  addMerchantProduct,
  updateMerchantProduct,
  toggleProductStatus,
  deleteMerchantProduct
} from '@/apis/merchantProduct'
import { getSystemCategories } from '@/apis/merchantCategory'
import { uploadFile } from '@/apis/oss'
import 'bytemd/dist/index.css'
import 'highlight.js/styles/vs.css'

const route = useRoute()

// 富文本编辑器插件
const editorPlugins = [gfm(), highlight()]

const loading = ref(false)
const products = ref([])
const categories = ref([])
const categoryTree = ref([])
const searchKeyword = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 级联选择器配置
const cascaderProps = {
  value: 'id',
  label: 'name',
  children: 'children',
  checkStrictly: false, // 只能选择二级分类
  emitPath: false
}

// 对话框
const dialogVisible = ref(false)
const dialogTitle = computed(() => productForm.value.id ? '编辑农产品' : '添加农产品')
const formRef = ref(null)
const activeTab = ref('basic')
const tagInputVisible = ref(false)
const tagInputValue = ref('')
const tagInputRef = ref(null)

const productForm = ref({
  id: null,
  name: '',
  subtitle: '',
  category: '',
  price: 0,
  originalPrice: 0,
  stock: 0,
  unit: '',
  origin: '',
  images: [],
  tags: [],
  specs: [],
  detail: '',
  status: 'on_sale',
  sales: 0
})

const formRules = {
  name: [{ required: true, message: '请输入农产品名称', trigger: 'blur' }],
  subtitle: [{ required: true, message: '请输入农产品简介', trigger: 'blur' }],
  category: [{ required: true, message: '请选择农产品分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入农产品价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入农产品库存', trigger: 'blur' }],
  images: [{ required: true, message: '请上传农产品图片', trigger: 'change' }]
}

const pageTitle = computed(() => {
  return '农产品列表'
})

// 获取商品列表
const fetchProducts = async () => {
  loading.value = true
  try {
    const res = await getMerchantProductList({
      keyword: searchKeyword.value,
      status: statusFilter.value,
      page: currentPage.value,
      page_size: pageSize.value
    })
    products.value = res.data.list || []
    total.value = res.data.total || 0
  } catch (error) {
    console.error('获取商品列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取分类列表
const fetchCategories = async () => {
  try {
    const res = await getSystemCategories()
    const list = res.data.list || []
    categories.value = list
    // 构建树形结构
    categoryTree.value = buildTree(list, 0)
  } catch (error) {
    console.error('获取分类列表失败:', error)
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

// 分页显示的商品
const displayProducts = computed(() => {
  return products.value.map(p => {
    // 查找分类名称
    const category = categories.value.find(c => c.id === p.category_id)
    let categoryName = '未分类'
    if (category) {
      // 如果是二级分类，显示"一级分类 > 二级分类"
      if (category.parent_id > 0) {
        const parentCategory = categories.value.find(c => c.id === category.parent_id)
        categoryName = parentCategory ? `${parentCategory.name} > ${category.name}` : category.name
      } else {
        categoryName = category.name
      }
    }
    return {
      ...p,
      category: categoryName
    }
  })
})

// 监听路由变化（已移除添加商品菜单项）

const handleSearch = () => {
  currentPage.value = 1
  fetchProducts()
}

const handleSizeChange = () => {
  currentPage.value = 1
  fetchProducts()
}

const handleCurrentChange = () => {
  fetchProducts()
}

const handleAdd = () => {
  resetForm()
  dialogVisible.value = true
}

const handleEdit = async (row) => {
  try {
    const res = await getMerchantProductDetail({ id: row.id })
    const detail = res.data
    
    productForm.value = {
      id: detail.id,
      name: detail.name,
      subtitle: detail.subtitle || '',
      category: detail.category_id,
      price: detail.price,
      originalPrice: detail.original_price || detail.price,
      unit: detail.unit || '500g/份',
      stock: detail.stock,
      origin: detail.origin || '',
      images: detail.images || [],
      tags: detail.tags || [],
      specs: detail.specs || [],
      detail: detail.detail || '# 农产品详情\n\n请输入农产品详情...',
      status: detail.status,
      sales: row.sales || 0
    }
    activeTab.value = 'basic'
    dialogVisible.value = true
  } catch (error) {
    console.error('获取商品详情失败:', error)
  }
}

// 图片管理
const handleImageAdd = async (file) => {
  if (productForm.value.images.length >= 5) {
    ElMessage.warning('最多只能上传5张图片')
    return
  }
  
  try {
    const res = await uploadFile(file.raw, 'product')
    productForm.value.images.push(res.data.url)
    ElMessage.success('图片上传成功')
  } catch (error) {
    console.error('图片上传失败:', error)
    ElMessage.error('图片上传失败')
  }
}

const removeImage = (index) => {
  productForm.value.images.splice(index, 1)
}

// 标签管理
const showTagInput = () => {
  tagInputVisible.value = true
  nextTick(() => {
    tagInputRef.value?.focus()
  })
}

const handleTagInputConfirm = () => {
  if (tagInputValue.value) {
    if (!productForm.value.tags.includes(tagInputValue.value)) {
      productForm.value.tags.push(tagInputValue.value)
    }
    tagInputValue.value = ''
  }
  tagInputVisible.value = false
}

const removeTag = (tag) => {
  const index = productForm.value.tags.indexOf(tag)
  if (index > -1) {
    productForm.value.tags.splice(index, 1)
  }
}

// 规格管理
const addSpec = () => {
  productForm.value.specs.push({
    label: '',
    price: 0,
    stock: 0
  })
}

const removeSpec = (index) => {
  productForm.value.specs.splice(index, 1)
}

// 富文本编辑器
const handleEditorChange = (value) => {
  productForm.value.detail = value
}

const handleToggleStatus = (row) => {
  const newStatus = row.status === 'on_sale' ? 'off_sale' : 'on_sale'
  const action = newStatus === 'on_sale' ? '上架' : '下架'

  ElMessageBox.confirm(`确定要${action}该农产品吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await toggleProductStatus({ id: row.id })
      ElMessage.success(`${action}成功`)
      fetchProducts()
    } catch (error) {
      console.error('操作失败:', error)
    }
  }).catch(() => {})
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该农产品吗？删除后无法恢复。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteMerchantProduct({ id: row.id })
      ElMessage.success('删除成功')
      fetchProducts()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      const submitData = {
        id: productForm.value.id,
        name: productForm.value.name,
        subtitle: productForm.value.subtitle,
        category_id: productForm.value.category,
        price: productForm.value.price,
        original_price: productForm.value.originalPrice,
        unit: productForm.value.unit,
        stock: productForm.value.stock,
        origin: productForm.value.origin,
        images: productForm.value.images,
        tags: productForm.value.tags,
        specs: productForm.value.specs,
        detail: productForm.value.detail
      }
      
      try {
        if (submitData.id) {
          // 编辑
          await updateMerchantProduct(submitData)
          ElMessage.success('编辑成功')
        } else {
          // 添加
          await addMerchantProduct(submitData)
          ElMessage.success('添加成功')
        }
        dialogVisible.value = false
        fetchProducts()
      } catch (error) {
        console.error('操作失败:', error)
      }
    }
  })
}

const resetForm = () => {
  productForm.value = {
    id: null,
    name: '',
    subtitle: '',
    category: '',
    price: 0,
    originalPrice: 0,
    stock: 0,
    unit: '',
    origin: '',
    images: [],
    tags: [],
    specs: [],
    detail: '# 农产品详情\n\n请输入农产品详情...',
    status: 'on_sale',
    sales: 0
  }
  activeTab.value = 'basic'
  tagInputVisible.value = false
  tagInputValue.value = ''
  formRef.value?.clearValidate()
}

onMounted(() => {
  fetchCategories()
  fetchProducts()
})
</script>

<style lang="scss" scoped>
.product-management {
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

  .filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
  }

  .price {
    color: #f5222d;
    font-weight: 600;
  }

  .low-stock {
    color: #f5222d;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  // 图片上传列表
  .image-upload-list {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;

    .image-item {
      position: relative;

      &:hover .image-actions {
        opacity: 1;
      }

      .image-actions {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s;
        border-radius: 4px;
      }
    }

    .image-uploader {
      .upload-placeholder {
        width: 100px;
        height: 100px;
        border: 1px dashed #d9d9d9;
        border-radius: 4px;
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

        .el-icon {
          font-size: 24px;
          margin-bottom: 4px;
        }

        div {
          font-size: 12px;
        }
      }
    }
  }

  .form-tip {
    font-size: 12px;
    color: #8c8c8c;
    margin-top: 8px;
  }

  // 规格设置
  .specs-section {
    .empty-specs {
      padding: 40px 0;
    }

    .spec-item {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      padding: 12px;
      background: #fafafa;
      border-radius: 4px;

      .spec-label {
        font-size: 14px;
        color: #666;
        margin-right: 8px;
        white-space: nowrap;
      }
    }
  }

  // 富文本编辑器
  .editor-container {
    :deep(.bytemd) {
      height: 500px;
    }
  }
}
</style>
