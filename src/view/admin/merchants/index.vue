<template>
  <div class="admin-module">
    <el-card shadow="never">
      <template #header>
        <div class="module-header">
          <div class="header-text">
            <h3>店铺管理</h3>
            <p>管理农户店铺、开店申请与平台推荐信息</p>
          </div>
          <el-button type="primary" @click="openCreateDialog">新增店铺</el-button>
        </div>
      </template>

      <div class="toolbar">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索店铺名称、农户信息或联系方式"
          clearable
          @keyup.enter="handleSearch"
        />
        <el-select v-model="filters.audit_status" placeholder="审核状态" clearable>
          <el-option label="待审核" :value="0" />
          <el-option label="审核通过" :value="1" />
          <el-option label="审核驳回" :value="2" />
        </el-select>
        <el-select v-model="filters.status" placeholder="营业状态" clearable>
          <el-option label="营业中" :value="1" />
          <el-option label="已关闭" :value="0" />
        </el-select>
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" style="width: 100%">
        <el-table-column label="店铺" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="shop-cell">
              <el-avatar shape="square" :src="row.shop_logo" :size="54" />
              <div class="shop-meta">
                <strong class="text-ellipsis-cell">{{ row.shop_name }}</strong>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="农户账号" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="merchant-cell text-ellipsis-cell">
              {{ row.merchant?.nickname || row.merchant?.username }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="联系电话" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="merchant-phone-cell text-ellipsis-cell">{{ row.merchant?.phone }}</span>
          </template>
        </el-table-column>
        <el-table-column label="地址" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="address-cell text-ellipsis-cell">{{ row.location || '未填写地址' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="audit_status_text" label="审核状态" width="110">
          <template #default="{ row }">
            <el-tag :type="auditTagType(row.audit_status)">{{ row.audit_status_text }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status_text" label="营业状态" width="110">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status_text }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="推荐" width="90">
          <template #default="{ row }">
            <el-tag :type="row.is_recommended ? 'warning' : 'info'">
              {{ row.is_recommended ? '已推荐' : '普通' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="product_count" label="商品数" width="90" />
        <el-table-column prop="created_at" label="申请时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right" align="center" header-align="center">
          <template #default="{ row }">
            <div class="action-group">
              <el-button type="primary" link size="small" @click="openEditDialog(row)">编辑</el-button>
              <el-button
                v-if="row.audit_status === 0"
                type="success"
                link
                size="small"
                @click="openReviewDialog(row, 1)"
              >
                通过
              </el-button>
              <el-button
                v-if="row.audit_status === 0"
                type="warning"
                link
                size="small"
                @click="openReviewDialog(row, 2)"
              >
                驳回
              </el-button>
              <el-button
                :type="row.status === 1 ? 'warning' : 'success'"
                link
                size="small"
                @click="toggleStatus(row)"
              >
                {{ row.status === 1 ? '关闭' : '开启' }}
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
          @current-change="fetchShops"
          @size-change="handlePageSizeChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="760px" @close="resetForm">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="110px">
        <el-form-item v-if="!form.id" label="绑定农户" prop="user_id">
          <el-select v-model="form.user_id" filterable placeholder="请选择未开店的农户账号">
            <el-option
              v-for="item in merchantUsers"
              :key="item.id"
              :label="`${item.nickname || item.username}（${item.phone}）`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="店铺 Logo" prop="shop_logo">
          <div class="upload-row">
            <el-avatar shape="square" :src="form.shop_logo" :size="64" />
            <el-upload :show-file-list="false" :auto-upload="false" :on-change="(file) => handleUpload(file, 'shop_logo')">
              <el-button>上传 Logo</el-button>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="店铺横幅" prop="shop_banner">
          <div class="upload-row banner-row">
            <img v-if="form.shop_banner" :src="form.shop_banner" alt="店铺横幅" class="banner-preview" />
            <div v-else class="banner-empty">未上传横幅</div>
            <el-upload :show-file-list="false" :auto-upload="false" :on-change="(file) => handleUpload(file, 'shop_banner')">
              <el-button>上传横幅</el-button>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="店铺名称" prop="shop_name">
          <el-input v-model="form.shop_name" maxlength="50" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.phone" maxlength="11" />
        </el-form-item>
        <el-form-item label="店铺地址" prop="location">
          <el-input v-model="form.location" maxlength="200" />
        </el-form-item>
        <el-form-item label="店铺简介">
          <el-input v-model="form.description" type="textarea" :rows="3" maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item label="推荐店铺">
          <el-switch v-model="form.is_recommended" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="营业状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="reviewDialogVisible" :title="reviewForm.audit_status === 1 ? '审核通过' : '审核驳回'" width="480px">
      <el-form :model="reviewForm" label-width="100px">
        <el-form-item v-if="reviewForm.audit_status === 2" label="驳回原因" required>
          <el-input v-model="reviewForm.audit_reason" type="textarea" :rows="4" maxlength="200" show-word-limit />
        </el-form-item>
        <el-alert
          v-else
          title="确认通过该店铺申请后，商户即可进入农户端后台进行经营管理。"
          type="success"
          :closable="false"
        />
      </el-form>

      <template #footer>
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReview">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { uploadFile } from '@/apis/oss'
import {
  createAdminMerchant,
  deleteAdminMerchant,
  getAdminAvailableMerchantUsers,
  getAdminMerchantDetail,
  getAdminMerchantList,
  reviewAdminMerchant,
  toggleAdminMerchantStatus,
  updateAdminMerchant
} from '@/apis/admin-merchant'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const reviewDialogVisible = ref(false)
const formRef = ref(null)
const tableData = ref([])
const merchantUsers = ref([])

const filters = reactive({
  keyword: '',
  audit_status: '',
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
  shop_logo: '',
  shop_banner: '',
  shop_name: '',
  phone: '',
  location: '',
  description: '',
  is_recommended: 0,
  status: 1
})

const reviewForm = reactive({
  id: null,
  audit_status: 1,
  audit_reason: ''
})

const dialogTitle = computed(() => (form.id ? '编辑店铺' : '新增店铺'))

const formRules = {
  user_id: [{ required: true, message: '请选择绑定农户', trigger: 'change' }],
  shop_logo: [{ required: true, message: '请上传店铺 Logo', trigger: 'change' }],
  shop_banner: [{ required: true, message: '请上传店铺横幅', trigger: 'change' }],
  shop_name: [
    { required: true, message: '请输入店铺名称', trigger: 'blur' },
    { min: 2, max: 50, message: '店铺名称长度需为 2-50 个字符', trigger: 'blur' }
  ],
  location: [{ required: true, message: '请输入店铺地址', trigger: 'blur' }]
}

const fetchShops = async () => {
  loading.value = true
  try {
    const res = await getAdminMerchantList({
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

const fetchMerchantUsers = async () => {
  const res = await getAdminAvailableMerchantUsers()
  merchantUsers.value = res.data.list || []
}

const handleSearch = () => {
  pagination.page = 1
  fetchShops()
}

const handlePageSizeChange = () => {
  pagination.page = 1
  fetchShops()
}

const openCreateDialog = async () => {
  resetForm()
  await fetchMerchantUsers()
  dialogVisible.value = true
}

const openEditDialog = async (row) => {
  const res = await getAdminMerchantDetail({ id: row.id })
  const shop = res.data.shop
  Object.assign(form, {
    id: shop.id,
    user_id: shop.user_id,
    shop_logo: shop.shop_logo || '',
    shop_banner: shop.shop_banner || '',
    shop_name: shop.shop_name,
    phone: shop.merchant?.phone || '',
    location: shop.location || '',
    description: shop.description || '',
    is_recommended: shop.is_recommended,
    status: shop.status
  })
  dialogVisible.value = true
}

const handleUpload = async (uploadItem, field) => {
  if (!uploadItem.raw) return
  const res = await uploadFile(uploadItem.raw, 'shop')
  form[field] = res.data.url
  ElMessage.success('图片上传成功')
}

const handleSubmit = async () => {
  await formRef.value.validate()
  submitting.value = true
  try {
    if (form.id) {
      await updateAdminMerchant({ ...form })
      ElMessage.success('店铺更新成功')
    } else {
      await createAdminMerchant({
        ...form,
        audit_status: 1
      })
      ElMessage.success('店铺创建成功')
    }
    dialogVisible.value = false
    fetchShops()
  } finally {
    submitting.value = false
  }
}

const openReviewDialog = (row, status) => {
  Object.assign(reviewForm, {
    id: row.id,
    audit_status: status,
    audit_reason: ''
  })
  reviewDialogVisible.value = true
}

const submitReview = async () => {
  if (reviewForm.audit_status === 2 && !reviewForm.audit_reason.trim()) {
    ElMessage.warning('请输入驳回原因')
    return
  }
  await reviewAdminMerchant({ ...reviewForm })
  ElMessage.success(reviewForm.audit_status === 1 ? '审核通过' : '审核驳回')
  reviewDialogVisible.value = false
  fetchShops()
}

const toggleStatus = (row) => {
  ElMessageBox.confirm(`确定${row.status === 1 ? '关闭' : '开启'}店铺“${row.shop_name}”吗？`, '提示', {
    type: 'warning'
  })
    .then(async () => {
      await toggleAdminMerchantStatus({ id: row.id })
      ElMessage.success('状态更新成功')
      fetchShops()
    })
    .catch(() => {})
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除店铺“${row.shop_name}”吗？`, '提示', {
    type: 'warning'
  })
    .then(async () => {
      await deleteAdminMerchant({ id: row.id })
      ElMessage.success('删除成功')
      fetchShops()
    })
    .catch(() => {})
}

const auditTagType = (status) => {
  if (status === 1) return 'success'
  if (status === 2) return 'danger'
  return 'warning'
}

const resetForm = () => {
  Object.assign(form, {
    id: null,
    user_id: null,
    shop_logo: '',
    shop_banner: '',
    shop_name: '',
    phone: '',
    location: '',
    description: '',
    is_recommended: 0,
    status: 1
  })
  formRef.value?.clearValidate()
}

onMounted(() => {
  fetchShops()
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

  .shop-cell {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  .shop-meta {
    min-width: 0;
  }

  .merchant-cell,
  .merchant-phone-cell,
  .address-cell {
    color: var(--text-secondary-color);
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

  .banner-row {
    align-items: flex-start;
  }

  .banner-preview,
  .banner-empty {
    width: 220px;
    height: 90px;
    border-radius: 14px;
    object-fit: cover;
    border: 1px solid var(--border-color);
  }

  .banner-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-placeholder-color);
    background: #fafafa;
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
