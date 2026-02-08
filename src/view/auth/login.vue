<template>
  <div class="auth-page" :class="selectedRole === USER_ROLES.CONSUMER ? 'consumer-mode' : 'merchant-mode'">
    <!-- 角色切换按钮 -->
    <div class="role-switch" :class="selectedRole === USER_ROLES.CONSUMER ? 'consumer-mode' : 'merchant-mode'">
      <el-button
        type="primary"
        size="large"
        @click="toggleRole"
      >
        {{ selectedRole === USER_ROLES.CONSUMER ? '农户登录' : '用户登录' }}
      </el-button>
    </div>

    <div class="auth-container">
      <div class="auth-card" :class="selectedRole === USER_ROLES.CONSUMER ? 'consumer-mode' : 'merchant-mode'">
        <!-- Logo 和标题 -->
        <div class="auth-header" :class="selectedRole === USER_ROLES.CONSUMER ? 'consumer-mode' : 'merchant-mode'">
          <div class="logo">
            <img src="@/assets/logo/logo.jpg" alt="Logo" />
          </div>
          <h2>{{ selectedRole === USER_ROLES.CONSUMER ? '用户登录' : '农户登录' }}</h2>
          <p>农产品交易平台</p>
        </div>

        <!-- 登录表单 -->
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="auth-form"
          :class="selectedRole === USER_ROLES.CONSUMER ? 'consumer-mode' : 'merchant-mode'"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名/手机号"
              clearable
            >
              <template #prefix>
                <i class="iconfont icon-yonghu"></i>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              show-password
              clearable
            >
              <template #prefix>
                <i class="iconfont icon-jiesuo"></i>
              </template>
            </el-input>
          </el-form-item>

          <div class="form-options">
            <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
            <router-link to="/auth/reset-password" class="link">忘记密码？</router-link>
          </div>

          <el-button
            type="primary"
            class="submit-btn"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>

          <div class="form-footer">
            还没有账号？
            <router-link to="/auth/register" class="link">立即注册</router-link>
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
import { useUserStore, USER_ROLES } from '@/store/modules/user'

const router = useRouter()
const userStore = useUserStore()

const selectedRole = ref(USER_ROLES.CONSUMER)
const loading = ref(false)
const loginFormRef = ref(null)

// 切换角色
const toggleRole = () => {
  selectedRole.value = selectedRole.value === USER_ROLES.CONSUMER 
    ? USER_ROLES.MERCHANT 
    : USER_ROLES.CONSUMER
  
  // 切换角色时自动填充对应的测试账号
  if (selectedRole.value === USER_ROLES.CONSUMER) {
    loginForm.username = 'consumer123'
    loginForm.password = '123456'
  } else {
    loginForm.username = 'farmer123'
    loginForm.password = '123456'
  }
}

// 登录表单（默认填充消费者测试账号）
const loginForm = reactive({
  username: 'consumer123',
  password: '123456',
  remember: false
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名/手机号', trigger: 'blur' },
    { min: 3, message: '用户名至少3个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6个字符', trigger: 'blur' }
  ]
}

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    await loginFormRef.value.validate()
    loading.value = true

    // 模拟登录API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 模拟登录成功
    const mockUserData = {
      [USER_ROLES.CONSUMER]: {
        id: 1,
        username: loginForm.username,
        avatar: 'https://i.pravatar.cc/150?img=1',
        role: USER_ROLES.CONSUMER
      },
      [USER_ROLES.MERCHANT]: {
        id: 2,
        username: loginForm.username,
        avatar: 'https://i.pravatar.cc/150?img=13',
        role: USER_ROLES.MERCHANT
      }
    }

    userStore.setUserInfo(mockUserData[selectedRole.value])
    
    if (selectedRole.value === USER_ROLES.CONSUMER) {
      userStore.setCartCount(3)
    }
    userStore.setUnreadMessages(5)

    ElMessage.success('登录成功')

    // 所有角色登录后都跳转到首页，首页会根据角色显示不同内容
    router.push('/home')
  } catch (error) {
    if (error !== false) {
      ElMessage.error('登录失败，请检查输入')
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

  // 消费者背景 - 清新农田
  &.consumer-mode {
    background-image: url('https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1920&q=80');
    
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

  // 农户背景 - 金色麦田
  &.merchant-mode {
    background-image: url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80');
    
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

    // 消费者模式按钮
    &.consumer-mode .el-button {
      color: var(--theme-primary-color);
      
      &:hover {
        color: var(--theme-primary-dark);
      }
    }

    // 农户模式按钮
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

      // 消费者模式卡片
      &.consumer-mode {
        border-top: 1px solid var(--theme-primary-color);
      }

      // 农户模式卡片
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

        // 消费者模式标题
        &.consumer-mode {
          .logo {
            border: 3px solid var(--theme-primary-color);
          }

          h2 {
            color: var(--theme-primary-color);
          }
        }

        // 农户模式标题
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
          }

          .el-input__password {
            font-size: 16px;
          }
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;

          .link {
            font-size: 13px;
            text-decoration: none;
            transition: color 0.3s ease;

            &:hover {
              text-decoration: underline;
            }
          }
        }

        // 消费者模式链接
        &.consumer-mode {
          .form-options .link {
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
            }
          }
        }

        // 农户模式链接
        &.merchant-mode {
          .form-options .link {
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
