<template>
  <div class="address-list">
    <div class="list-header">
      <h3>收货地址</h3>
      <el-button type="primary" @click="handleAdd">新增地址</el-button>
    </div>

    <div v-if="addresses.length === 0" class="empty-state">
      <i class="iconfont icon-didian"></i>
      <p>还没有收货地址</p>
      <el-button type="primary" @click="handleAdd">添加地址</el-button>
    </div>

    <div v-else class="address-grid">
      <div
        v-for="address in addresses"
        :key="address.id"
        class="address-card"
        :class="{ default: address.isDefault }"
      >
        <div class="address-header">
          <div class="user-info">
            <span class="name">{{ address.name }}</span>
            <span class="phone">{{ address.phone }}</span>
          </div>
          <el-tag v-if="address.isDefault" type="success" size="small">默认</el-tag>
        </div>

        <div class="address-content">
          <i class="iconfont icon-didian"></i>
          <span>{{ address.fullAddress }}</span>
        </div>

        <div class="address-actions">
          <el-button text size="small" @click="handleEdit(address)">编辑</el-button>
          <el-button text size="small" @click="handleDelete(address)">删除</el-button>
          <el-button
            v-if="!address.isDefault"
            text
            size="small"
            @click="handleSetDefault(address)"
          >
            设为默认
          </el-button>
        </div>
      </div>
    </div>

    <!-- 添加/编辑地址对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="收货人" prop="receiver_name">
          <el-input v-model="form.receiver_name" placeholder="请输入收货人姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="receiver_phone">
          <el-input v-model="form.receiver_phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="省市区" prop="addressCode">
          <el-cascader
            v-model="form.addressCode"
            :options="regionData"
            placeholder="请选择省市区"
            style="width: 100%"
            clearable
          />
        </el-form-item>
        <el-form-item label="详细地址" prop="detail_address">
          <el-input
            v-model="form.detail_address"
            type="textarea"
            :rows="3"
            placeholder="请输入详细地址"
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="form.is_default">设为默认地址</el-checkbox>
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
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { regionData } from 'element-china-area-data'
import {
  getAddressList,
  addAddress,
  updateAddress,
  deleteAddress as deleteAddressApi,
  setDefaultAddress
} from '@/apis/address'

const addresses = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const formRef = ref(null)
const editingId = ref(null)

const form = ref({
  receiver_name: '',
  receiver_phone: '',
  addressCode: [],
  detail_address: '',
  is_default: false
})

const rules = {
  receiver_name: [{ required: true, message: '请输入收货人姓名', trigger: 'blur' }],
  receiver_phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  addressCode: [{ required: true, message: '请选择省市区', trigger: 'change' }],
  detail_address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
}

const dialogTitle = computed(() => {
  return editingId.value ? '编辑地址' : '新增地址'
})

// 获取地址列表
const fetchAddresses = async () => {
  try {
    loading.value = true
    const res = await getAddressList()
    addresses.value = res.data.list.map(addr => ({
      ...addr,
      addressCode: [addr.province_code, addr.city_code, addr.district_code].filter(Boolean),
      name: addr.receiver_name,
      phone: addr.receiver_phone,
      fullAddress: addr.full_address,
      isDefault: addr.is_default === 1
    }))
  } catch (error) {
    ElMessage.error(error.message || '获取地址列表失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  editingId.value = null
  form.value = {
    receiver_name: '',
    receiver_phone: '',
    addressCode: [],
    detail_address: '',
    is_default: false
  }
  dialogVisible.value = true
}

const handleEdit = (address) => {
  editingId.value = address.id
  form.value = {
    receiver_name: address.receiver_name,
    receiver_phone: address.receiver_phone,
    addressCode: address.addressCode || [],
    detail_address: address.detail_address,
    is_default: address.is_default === 1
  }
  dialogVisible.value = true
}

const getRegionText = (addressCode) => {
  if (!addressCode || addressCode.length === 0) return ''
  
  const findRegion = (code, data) => {
    for (const item of data) {
      if (item.value === code) return item.label
      if (item.children) {
        const found = findRegion(code, item.children)
        if (found) return found
      }
    }
    return ''
  }

  const province = findRegion(addressCode[0], regionData)
  const city = addressCode[1] ? findRegion(addressCode[1], regionData) : ''
  const district = addressCode[2] ? findRegion(addressCode[2], regionData) : ''

  return [province, city, district].filter(Boolean).join(' ')
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    const regionText = getRegionText(form.value.addressCode)

    const data = {
      receiver_name: form.value.receiver_name,
      receiver_phone: form.value.receiver_phone,
      province_code: form.value.addressCode[0] || '',
      province_name: regionText.split(' ')[0] || '',
      city_code: form.value.addressCode[1] || '',
      city_name: regionText.split(' ')[1] || '',
      district_code: form.value.addressCode[2] || '',
      district_name: regionText.split(' ')[2] || '',
      detail_address: form.value.detail_address,
      is_default: form.value.is_default ? 1 : 0
    }

    if (editingId.value) {
      await updateAddress(editingId.value, data)
      ElMessage.success('地址修改成功')
    } else {
      await addAddress(data)
      ElMessage.success('地址添加成功')
    }

    dialogVisible.value = false
    fetchAddresses()
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message)
    }
  }
}

const handleDelete = (address) => {
  ElMessageBox.confirm('确定要删除该地址吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteAddressApi(address.id)
      ElMessage.success('地址已删除')
      fetchAddresses()
    } catch (error) {
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => {})
}

const handleSetDefault = async (address) => {
  try {
    await setDefaultAddress(address.id)
    ElMessage.success('已设为默认地址')
    fetchAddresses()
  } catch (error) {
    ElMessage.error(error.message || '设置失败')
  }
}

onMounted(() => {
  fetchAddresses()
})
</script>

<style lang="scss" scoped>
.address-list {
  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-color);

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary-color);
    }
  }

  .empty-state {
    text-align: center;
    padding: 80px 20px;

    i {
      font-size: 80px;
      color: var(--text-placeholder-color);
      margin-bottom: 20px;
    }

    p {
      font-size: 16px;
      color: var(--text-secondary-color);
      margin-bottom: 24px;
    }
  }

  .address-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;

    .address-card {
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 16px;
      transition: all 0.3s;

      &.default {
        border-color: var(--theme-primary-color);
        background-color: rgba(82, 196, 26, 0.02);
      }

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .address-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;

          .name {
            font-size: 16px;
            font-weight: 600;
            color: var(--text-primary-color);
          }

          .phone {
            font-size: 14px;
            color: var(--text-secondary-color);
          }
        }
      }

      .address-content {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin-bottom: 12px;
        padding: 12px;
        background-color: var(--bg-gray);
        border-radius: 6px;
        font-size: 14px;
        color: var(--text-primary-color);
        line-height: 1.6;

        i {
          font-size: 16px;
          color: var(--theme-primary-color);
          margin-top: 2px;
        }
      }

      .address-actions {
        display: flex;
        gap: 8px;
        padding-top: 12px;
        border-top: 1px solid var(--border-color);
      }
    }
  }
}
</style>
