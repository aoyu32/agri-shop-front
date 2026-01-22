<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <!-- Logo 和标题 -->
        <div class="auth-header">
          <div class="logo">
            <img src="@/assets/logo/logo.jpg" alt="Logo" />
          </div>
          <h2>重置密码</h2>
          <p>通过手机号重置您的密码</p>
        </div>

        <!-- 重置密码表单 -->
        <el-form
          ref="resetFormRef"
          :model="resetForm"
          :rules="resetRules"
          class="auth-form"
        >
          <el-form-item prop="phone">
            <el-input
              v-model="resetForm.phone"
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
              v-model="resetForm.code"
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
              v-model="resetForm.password"
              type="password"
              placeholder="请输入新密码（6-20位）"
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
              v-model="resetForm.confirmPassword"
              type="password"
              placeholder="请确认新密码"
              show-password
              clearable
            >
              <template #prefix>
                <i class="iconfont icon-jiesuo"></i>
              </template>
            </el-input>
          </el-form-item>

          <el-button
            type="primary"
            class="submit-btn"
            :loading="loading"
            @click="handleReset"
          >
            重置密码
          </el-button>

          <div class="form-footer">
            <router-link to="/auth/login" class="link">返回登录</router-link>
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

const router = useRouter()

const loading = ref(false)
const countdown = ref(0)
const resetFormRef = ref(null)

// 重置密码表单
const resetForm = reactive({
  phone: '',
  code: '',
  password: '',
  confirmPassword: ''
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
  } else if (value !== resetForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 表单验证规则
const resetRules = {
  phone: [
    { required: true, validator: validatePhone, trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位数字', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 发送验证码
const handleSendCode = async () => {
  if (!resetForm.phone) {
    ElMessage.warning('请先输入手机号')
    return
  }

  if (!/^1[3-9]\d{9}$/.test(resetForm.phone)) {
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

// 重置密码处理
const handleReset = async () => {
  if (!resetFormRef.value) return

  try {
    await resetFormRef.value.validate()
    loading.value = true

    // 模拟重置密码API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    ElMessage.success('密码重置成功，请登录')
    router.push('/auth/login')
  } catch (error) {
    if (error !== false) {
      ElMessage.error('重置失败，请检查输入')
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
  background-image: url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=80');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 20px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(27, 94, 32, 0.3);
    z-index: 0;
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
      border-top: 1px solid #2e7d32;

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
          border: 3px solid #2e7d32;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        h2 {
          font-size: 24px;
          font-weight: 600;
          color: #2e7d32;
          margin-bottom: 8px;
        }

        p {
          font-size: 14px;
          color: var(--text-secondary-color);
        }
      }

      .auth-form {
        .el-form-item {
          margin-bottom: 20px;
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

        .submit-btn {
          width: 100%;
          height: 44px;
          font-size: 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
          border: none;
          transition: all 0.3s ease;

          &:hover {
            background: linear-gradient(135deg, #1b5e20 0%, #0d4715 100%);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(46, 125, 50, 0.4);
          }
        }

        .form-footer {
          text-align: center;
          font-size: 13px;

          .link {
            color: #2e7d32;
            text-decoration: none;

            &:hover {
              text-decoration: underline;
            }
          }
        }
      }
    }
  }

  @media screen and (max-width: 480px) {
    padding: 12px;

    .auth-container {
      .auth-card {
        padding: 24px;
      }
    }
  }
}
</style>
