<template>
  <div class="security-settings">
    <div class="list-header">
      <h3>安全设置</h3>
    </div>

    <div class="security-items">
      <!-- 修改密码 -->
      <div class="security-item">
        <div class="item-info">
          <div class="item-icon">
            <i class="iconfont icon-jiesuo"></i>
          </div>
          <div class="item-content">
            <div class="item-title">登录密码</div>
            <div class="item-desc">定期更换密码可以提高账号安全性</div>
          </div>
        </div>
        <el-button type="primary" @click="showPasswordDialog = true">修改密码</el-button>
      </div>

      <!-- 手机号绑定 -->
      <div class="security-item">
        <div class="item-info">
          <div class="item-icon">
            <i class="iconfont icon-shouji"></i>
          </div>
          <div class="item-content">
            <div class="item-title">手机号绑定</div>
            <div class="item-desc">已绑定手机号：138****0001</div>
          </div>
        </div>
        <el-button type="primary" @click="showPhoneDialog = true">更换手机号</el-button>
      </div>

      <!-- 账号注销 -->
      <div class="security-item danger">
        <div class="item-info">
          <div class="item-icon">
            <i class="iconfont icon-delete"></i>
          </div>
          <div class="item-content">
            <div class="item-title">账号注销</div>
            <div class="item-desc">注销后账号数据将无法恢复，请谨慎操作</div>
          </div>
        </div>
        <el-button type="danger" @click="handleDeleteAccount">注销账号</el-button>
      </div>
    </div>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="showPasswordDialog"
      title="修改密码"
      width="500px"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入原密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码（6-20位）"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="handleChangePassword">确定</el-button>
      </template>
    </el-dialog>

    <!-- 更换手机号对话框 -->
    <el-dialog
      v-model="showPhoneDialog"
      title="更换手机号"
      width="500px"
    >
      <el-form
        ref="phoneFormRef"
        :model="phoneForm"
        :rules="phoneRules"
        label-width="100px"
      >
        <el-form-item label="新手机号" prop="phone">
          <el-input v-model="phoneForm.phone" placeholder="请输入新手机号" />
        </el-form-item>
        <el-form-item label="验证码" prop="code">
          <el-input v-model="phoneForm.code" placeholder="请输入验证码">
            <template #append>
              <el-button
                :disabled="countdown > 0"
                @click="handleSendCode"
              >
                {{ countdown > 0 ? `${countdown}秒后重试` : '获取验证码' }}
              </el-button>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPhoneDialog = false">取消</el-button>
        <el-button type="primary" @click="handleChangePhone">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const showPasswordDialog = ref(false)
const showPhoneDialog = ref(false)
const countdown = ref(0)
const passwordFormRef = ref(null)
const phoneFormRef = ref(null)

// 修改密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 更换手机号表单
const phoneForm = reactive({
  phone: '',
  code: ''
})

// 验证确认密码
const validateConfirmPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请确认密码'))
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 验证手机号
const validatePhone = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入手机号'))
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的手机号'))
  } else {
    callback()
  }
}

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const phoneRules = {
  phone: [
    { required: true, validator: validatePhone, trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位数字', trigger: 'blur' }
  ]
}

// 修改密码
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return

  try {
    await passwordFormRef.value.validate()
    ElMessage.success('密码修改成功，请重新登录')
    showPasswordDialog.value = false
    // 重置表单
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (error) {
    console.error('表单验证失败', error)
  }
}

// 发送验证码
const handleSendCode = () => {
  if (!phoneForm.phone) {
    ElMessage.warning('请先输入手机号')
    return
  }

  if (!/^1[3-9]\d{9}$/.test(phoneForm.phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }

  ElMessage.success('验证码已发送')
  countdown.value = 60

  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

// 更换手机号
const handleChangePhone = async () => {
  if (!phoneFormRef.value) return

  try {
    await phoneFormRef.value.validate()
    ElMessage.success('手机号更换成功')
    showPhoneDialog.value = false
    // 重置表单
    phoneForm.phone = ''
    phoneForm.code = ''
  } catch (error) {
    console.error('表单验证失败', error)
  }
}

// 注销账号
const handleDeleteAccount = () => {
  ElMessageBox.confirm(
    '注销账号后，您的所有数据将被永久删除且无法恢复。确定要注销账号吗？',
    '警告',
    {
      confirmButtonText: '确定注销',
      cancelButtonText: '取消',
      type: 'error',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(() => {
    ElMessage.success('账号注销申请已提交，将在7个工作日内处理')
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.security-settings {
  .list-header {
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-color);

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary-color);
    }
  }

  .security-items {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .security-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      &.danger {
        border-color: #f56c6c;
        background-color: rgba(245, 108, 108, 0.02);

        .item-icon {
          background-color: rgba(245, 108, 108, 0.1);

          i {
            color: #f56c6c;
          }
        }
      }

      .item-info {
        display: flex;
        align-items: center;
        gap: 16px;
        flex: 1;

        .item-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background-color: rgba(82, 196, 26, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;

          i {
            font-size: 24px;
            color: var(--theme-primary-color);
          }
        }

        .item-content {
          flex: 1;

          .item-title {
            font-size: 16px;
            font-weight: 500;
            color: var(--text-primary-color);
            margin-bottom: 6px;
          }

          .item-desc {
            font-size: 13px;
            color: var(--text-secondary-color);
          }
        }
      }
    }
  }
}
</style>
