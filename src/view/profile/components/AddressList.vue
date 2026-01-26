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
        <el-form-item label="收货人" prop="name">
          <el-input v-model="form.name" placeholder="请输入收货人姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="省市区" prop="region">
          <el-input v-model="form.region" placeholder="请选择省市区" />
        </el-form-item>
        <el-form-item label="详细地址" prop="detail">
          <el-input
            v-model="form.detail"
            type="textarea"
            :rows="3"
            placeholder="请输入详细地址"
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="form.isDefault">设为默认地址</el-checkbox>
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

const addresses = ref([
  {
    id: 1,
    name: '张三',
    phone: '138****0001',
    region: '北京市 朝阳区',
    detail: '三里屯街道某某小区1号楼101室',
    fullAddress: '北京市 朝阳区 三里屯街道某某小区1号楼101室',
    isDefault: true
  },
  {
    id: 2,
    name: '李四',
    phone: '139****0002',
    region: '上海市 浦东新区',
    detail: '陆家嘴街道某某大厦2栋202室',
    fullAddress: '上海市 浦东新区 陆家嘴街道某某大厦2栋202室',
    isDefault: false
  }
])

const dialogVisible = ref(false)
const formRef = ref(null)
const editingId = ref(null)

const form = ref({
  name: '',
  phone: '',
  region: '',
  detail: '',
  isDefault: false
})

const rules = {
  name: [{ required: true, message: '请输入收货人姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  region: [{ required: true, message: '请选择省市区', trigger: 'blur' }],
  detail: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
}

const dialogTitle = computed(() => {
  return editingId.value ? '编辑地址' : '新增地址'
})

const handleAdd = () => {
  editingId.value = null
  form.value = {
    name: '',
    phone: '',
    region: '',
    detail: '',
    isDefault: false
  }
  dialogVisible.value = true
}

const handleEdit = (address) => {
  editingId.value = address.id
  form.value = {
    name: address.name,
    phone: address.phone,
    region: address.region,
    detail: address.detail,
    isDefault: address.isDefault
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    if (editingId.value) {
      // 编辑
      const index = addresses.value.findIndex(a => a.id === editingId.value)
      if (index > -1) {
        addresses.value[index] = {
          ...addresses.value[index],
          ...form.value,
          fullAddress: `${form.value.region} ${form.value.detail}`
        }
        ElMessage.success('地址修改成功')
      }
    } else {
      // 新增
      const newAddress = {
        id: Date.now(),
        ...form.value,
        fullAddress: `${form.value.region} ${form.value.detail}`
      }
      addresses.value.push(newAddress)
      ElMessage.success('地址添加成功')
    }

    // 如果设为默认，取消其他默认地址
    if (form.value.isDefault) {
      addresses.value.forEach(addr => {
        if (addr.id !== editingId.value) {
          addr.isDefault = false
        }
      })
    }

    dialogVisible.value = false
  } catch (error) {
    console.error('表单验证失败', error)
  }
}

const handleDelete = (address) => {
  ElMessageBox.confirm('确定要删除该地址吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = addresses.value.findIndex(a => a.id === address.id)
    if (index > -1) {
      addresses.value.splice(index, 1)
      ElMessage.success('地址已删除')
    }
  }).catch(() => {})
}

const handleSetDefault = (address) => {
  addresses.value.forEach(addr => {
    addr.isDefault = addr.id === address.id
  })
  ElMessage.success('已设为默认地址')
}
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
