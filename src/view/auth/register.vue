<template>
  <div class="auth-page" :class="selectedRole === USER_ROLES.CONSUMER ? 'consumer-mode' : 'merchant-mode'">
    <!-- 角色切换按钮 -->
    <div class="role-switch" :class="selectedRole === USER_ROLES.CONSUMER ? 'consumer-mode' : 'merchant-mode'">
      <el-button
        type="primary"
        size="large"
        @click="toggleRole"
      >
        {{ selectedRole === USER_ROLES.CONSUMER ? '农户注册' : '用户注册' }}
      </el-button>
    </div>

    <div class="auth-container">
      <div class="auth-card" :class="selectedRole === USER_ROLES.CONSUMER ? 'consumer-mode' : 'merchant-mode'">
        <!-- Logo 和标题 -->
        <div class="auth-header" :class="selectedRole === USER_ROLES.CONSUMER ? 'consumer-mode' : 'merchant-mode'">
          <div class="logo">
            <img src="@/assets/logo/logo.jpg" alt="Logo" />
          </div>
          <h2>{{ selectedRole === USER_ROLES.CONSUMER ? '用户注册' : '农户注册' }}</h2>
          <p>加入农产品交易平台</p>
        </div>

        <!-- 注册表单 -->
        <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          class="auth-form"
          :class="selectedRole === USER_ROLES.CONSUMER ? 'consumer-mode' : 'merchant-mode'"
        >
          <el-form-item prop="username">
            <el-input
              v-model="registerForm.username"
              placeholder="请输入用户名"
              clearable
            >
              <template #prefix>
                <i class="iconfont icon-yonghu"></i>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="phone">
            <el-input
              v-model="registerForm.phone"
              placeholder="请输入手机号"
              clearable
            >
              <template #prefix>
                <i class="iconfont icon-shouji"></i>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="code">
            <el-input
              v-model="registerForm.code"
              placeholder="请输入验证码"
              clearable
            >
              <template #prefix>
                <i class="iconfont icon-yanzhengma"></i>
              </template>
              <template #suffix>
                <el-button
                  type="primary"
                  link
                  :disabled="countdown > 0"
                  @click="handleSendCode"
                >
                  {{ countdown > 0 ? `${countdown}秒后重试` : '获取验证码' }}
                </el-button>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码（6-20位）"
              show-password
              clearable
            >
              <template #prefix>
                <i class="iconfont icon-jiesuo"></i>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请确认密码"
              show-password
              clearable
            >
              <template #prefix>
                <i class="iconfont icon-jiesuo"></i>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="agree">
            <el-checkbox v-model="registerForm.agree">
              我已阅读并同意
              <a href="#" class="link">《用户协议》</a>
              和
              <a href="#" class="link">《隐私政策》</a>
            </el-checkbox>
          </el-form-item>

          <el-button
            type="primary"
            class="submit-btn"
            :loading="loading"
            @click="handleRegister"
          >
            注册
          </el-button>

          <div class="form-footer">
            已有账号？
            <router-link to="/auth/login" class="link">立即登录</router-link>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { USER_ROLES } from '@/store/modules/user'

const router = useRouter()

const selectedRole = ref(USER_ROLES.CONSUMER)
const loading = ref(false)
const countdown = ref(0)
const registerFormRef = ref(null)

// 切换角色
const toggleRole = () => {
  selectedRole.value = selectedRole.value === USER_ROLES.CONSUMER 
    ? USER_ROLES.MERCHANT 
    : USER_ROLES.CONSUMER
}

// 注册表单
const registerForm = reactive({
  username: '',
  phone: '',
  code: '',
  password: '',
  confirmPassword: '',
  agree: false
})

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

// 验证确认密码
const validateConfirmPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请确认密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 验证协议
const validateAgree = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请阅读并同意用户协议和隐私政策'))
  } else {
    callback()
  }
}

// 表单验证规则
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, validator: validatePhone, trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位数字', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ],
  agree: [
    { validator: validateAgree, trigger: 'change' }
  ]
}

// 发送验证码
const handleSendCode = async () => {
  if (!registerForm.phone) {
    ElMessage.warning('请先输入手机号')
    return
  }

  if (!/^1[3-9]\d{9}$/.test(registerForm.phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }

  // 模拟发送验证码
  ElMessage.success('验证码已发送')
  countdown.value = 60

  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

// 注册处理
const handleRegister = async () => {
  if (!registerFormRef.value) return

  try {
    await registerFormRef.value.validate()
    loading.value = true

    // 模拟注册API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    ElMessage.success('注册成功，请登录')
    router.push('/auth/login')
  } catch (error) {
    if (error !== false) {
      ElMessage.error('注册失败，请检查输入')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 20px;
  position: relative;
  transition: all 0.5s ease;

  // 消费者背景 - 绿色菜园
  &.consumer-mode {
    background-image: url('https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=1920&q=80');
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(82, 196, 26, 0.15);
      z-index: 0;
    }
  }

  // 农户背景 - 丰收农田
  &.merchant-mode {
    background-image: url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=80');
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(56, 142, 60, 0.18);
      z-index: 0;
    }
  }

  .role-switch {
    position: absolute;
    top: 30px;
    right: 40px;
    z-index: 10;

    .el-button {
      background: rgba(255, 255, 255, 0.95);
      border: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-weight: 500;
      transition: all 0.3s ease;

      &:hover {
        background: #fff;
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
      }
    }

    &.consumer-mode .el-button {
      color: var(--theme-primary-color);
      
      &:hover {
        color: var(--theme-primary-dark);
      }
    }

    &.merchant-mode .el-button {
      color: #388e3c;
      
      &:hover {
        color: #2e7d32;
      }
    }
  }

  .auth-container {
    width: 100%;
    max-width: 420px;
    position: relative;
    z-index: 1;

    .auth-card {
      background: rgba(255, 255, 255, 0.75);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.3);
      transition: all 0.3s ease;

      &.consumer-mode {
        border-top: 1px solid var(--theme-primary-color);
      }

      &.merchant-mode {
        border-top: 1px solid #388e3c;
      }

      .auth-header {
        text-align: center;
        margin-bottom: 30px;

        .logo {
          width: 80px;
          height: 80px;
          margin: 0 auto 20px;
          border-radius: 50%;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        h2 {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 8px;
          transition: color 0.3s ease;
        }

        p {
          font-size: 14px;
          color: var(--text-secondary-color);
        }

        &.consumer-mode {
          .logo {
            border: 3px solid var(--theme-primary-color);
          }

          h2 {
            color: var(--theme-primary-color);
          }
        }

        &.merchant-mode {
          .logo {
            border: 3px solid #388e3c;
          }

          h2 {
            color: #388e3c;
          }
        }
      }

      .auth-form {
        .el-form-item {
          margin-bottom: 18px;
        }

        :deep(.el-input) {
          height: 40px;
          
          .el-input__wrapper {
            padding: 8px 15px;
            border-radius: 8px;
            box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color)) inset;
          }

          .el-input__inner {
            height: 24px;
            line-height: 24px;
          }

          .el-input__prefix {
            margin-right: 8px;

            .iconfont {
              font-size: 18px;
              color: var(--text-placeholder-color);
            }
          }

          .el-input__suffix {
            .el-input__suffix-inner {
              display: flex;
              align-items: center;
            }

            .el-button {
              font-size: 13px;
              padding: 0;
            }
          }

          .el-input__password {
            font-size: 16px;
          }
        }

        .link {
          text-decoration: none;
          transition: color 0.3s ease;

          &:hover {
            text-decoration: underline;
          }
        }

        &.consumer-mode {
          .link {
            color: var(--theme-primary-color);
          }

          .form-footer .link {
            color: var(--theme-primary-color);
          }

          .submit-btn {
            background: var(--theme-primary-color);
            border-color: var(--theme-primary-color);

            &:hover {
              background: var(--theme-primary-dark);
              border-color: var(--theme-primary-dark);
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(82, 196, 26, 0.4);
            }
          }
        }

        &.merchant-mode {
          .link {
            color: #388e3c;
          }

          .form-footer .link {
            color: #388e3c;
          }

          .submit-btn {
            background: linear-gradient(135deg, #388e3c 0%, #2e7d32 100%);
            border: none;

            &:hover {
              background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(56, 142, 60, 0.4);
            }
          }
        }

        .submit-btn {
          width: 100%;
          height: 44px;
          font-size: 16px;
          border-radius: 8px;
          margin-top: 8px;
          margin-bottom: 16px;
          transition: all 0.3s ease;
        }

        .form-footer {
          text-align: center;
          font-size: 13px;
          color: var(--text-secondary-color);

          .link {
            text-decoration: none;
            margin-left: 4px;

            &:hover {
              text-decoration: underline;
            }
          }
        }
      }
    }
  }

  @media screen and (max-width: 768px) {
    .role-switch {
      top: 20px;
      right: 20px;

      .el-button {
        padding: 8px 16px;
        font-size: 14px;
      }
    }
  }

  @media screen and (max-width: 480px) {
    padding: 12px;

    .role-switch {
      top: 15px;
      right: 15px;

      .el-button {
        padding: 8px 12px;
        font-size: 13px;
      }
    }

    .auth-container {
      .auth-card {
        padding: 24px;
      }
    }
  }
}
</style>
