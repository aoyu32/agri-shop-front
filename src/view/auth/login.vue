<template>
  <div
    class="auth-page"
    :class="selectedRole === USER_ROLES.CONSUMER ? 'consumer-mode' : 'merchant-mode'"
  >
    <div class="auth-shell">
      <section class="auth-brand-panel">
        <div>
          <span class="platform-name">农购宝</span>
        </div>

        <h1>安心挑选新鲜农产品</h1>
        <p>进入平台即可浏览优质农产品、参与社区交流，并完成下单与经营管理。</p>

        <div class="brand-points">
          <article class="point-card">
            <h3>消费者端</h3>
            <p>浏览商品、下单购买、参与社区互动。</p>
          </article>

          <article class="point-card">
            <h3>农户端</h3>
            <p>管理店铺、商品、订单与售后业务。</p>
          </article>

          <article class="point-card">
            <h3>管理员端</h3>
            <p>查看平台数据并统一维护核心业务模块。</p>
          </article>
        </div>
      </section>

      <section class="auth-card">
        <div class="auth-card-inner">
          <div class="auth-header">
            <div class="logo">
              <img src="@/assets/logo/logo.png" alt="农购宝" />
            </div>
            <h2>
              {{ selectedRole === USER_ROLES.CONSUMER ? '农购宝用户登录' : '农购宝农户登录' }}
            </h2>
            <p>
              {{
                selectedRole === USER_ROLES.CONSUMER
                  ? '消费者与普通买家从这里进入平台'
                  : '农户账号从这里进入经营后台'
              }}
            </p>
          </div>

          <div class="role-switch">
            <button
              v-for="item in roleOptions"
              :key="item.value"
              type="button"
              class="role-btn"
              :class="{ active: selectedRole === item.value }"
              @click="switchRole(item.value)"
            >
              {{ item.label }}
            </button>
          </div>

          <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="auth-form">
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名/手机号"
                clearable
                @keyup.enter="handleLogin"
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
                @keyup.enter="handleLogin"
              >
                <template #prefix>
                  <i class="iconfont icon-jiesuo"></i>
                </template>
              </el-input>
            </el-form-item>

            <div class="form-options">
              <el-checkbox v-model="loginForm.remember">记住登录状态</el-checkbox>
              <router-link to="/auth/reset-password" class="link">忘记密码</router-link>
            </div>

            <el-button type="primary" class="submit-btn" :loading="loading" @click="handleLogin">
              登录
            </el-button>

            <div class="form-footer">
              还没有账号？
              <router-link to="/auth/register" class="link">立即注册</router-link>
            </div>
          </el-form>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { USER_ROLES, useUserStore } from '@/store/modules/user'

const router = useRouter()
const userStore = useUserStore()

const roleOptions = [
  { value: USER_ROLES.CONSUMER, label: '消费者' },
  { value: USER_ROLES.MERCHANT, label: '农户' },
  { value: USER_ROLES.ADMIN, label: '管理员' }
]

const selectedRole = ref(USER_ROLES.CONSUMER)
const loading = ref(false)
const loginFormRef = ref(null)

const loginForm = reactive({
  username: 'consumer123',
  password: '123456',
  remember: false
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名/手机号', trigger: 'blur' },
    { min: 3, message: '用户名长度不能少于 3 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' }
  ]
}

const switchRole = (role) => {
  selectedRole.value = role

  if (role === USER_ROLES.CONSUMER) {
    loginForm.username = 'consumer123'
    loginForm.password = '123456'
    return
  }

  if (role === USER_ROLES.MERCHANT) {
    loginForm.username = 'farmer123'
    loginForm.password = '123456'
    return
  }

  loginForm.username = ''
  loginForm.password = ''
}

const getRedirectPathByRole = (role) => {
  if (role === USER_ROLES.ADMIN) {
    return '/admin'
  }

  if (role === USER_ROLES.MERCHANT) {
    return '/merchant/profile'
  }

  return '/home'
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    await loginFormRef.value.validate()
    loading.value = true

    const res = await userStore.login({
      username: loginForm.username,
      password: loginForm.password,
      remember: loginForm.remember
    })

    const loginRole = res?.data?.user?.role || userStore.userInfo.role
    if (loginRole) {
      selectedRole.value = loginRole
    }

    ElMessage.success('登录成功')
    await router.replace(getRedirectPathByRole(loginRole))
  } catch (error) {
    if (error !== false) {
      console.error('登录失败:', error)
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
  padding: 36px;
  position: relative;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  &.consumer-mode {
    background-image: url('https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1920&q=80');

    &::before {
      background: rgba(82, 196, 26, 0.12);
    }
  }

  &.merchant-mode {
    background-image: url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80');

    &::before {
      background: rgba(56, 142, 60, 0.16);
    }
  }
}

.auth-shell {
  width: min(1045px, calc(100vw - 72px));
  min-height: 620px;
  display: grid;
  grid-template-columns: minmax(0, 1.02fr) minmax(400px, 0.82fr);
  border-radius: 28px;
  overflow: hidden;
  position: relative;
  z-index: 1;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.14);
}

.auth-brand-panel {
  padding: 38px 40px;
  color: #23411d;
  background: linear-gradient(180deg, rgba(237, 247, 222, 0.84), rgba(244, 250, 234, 0.84));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  .brand-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 120px;
    height: 44px;
    padding: 0 18px;
    border-radius: 14px;
    background: rgba(187, 229, 164, 0.78);
    box-shadow: inset 0 0 0 1px rgba(82, 196, 26, 0.08);
    font-size: 14px;
    font-weight: 700;
    color: #23411d;
    letter-spacing: 0.4px;
  }

  h1 {
    margin: 24px 0 12px;
    max-width: 640px;
    font-size: clamp(28px, 2.4vw, 40px);
    line-height: 1.15;
    font-weight: 800;
    letter-spacing: 0.3px;
    color: var(--theme-primary-color);
    font-family: 'Quicksand', serif;
  }

  p {
    margin: 0;
    max-width: 620px;
    font-size: 15px;
    line-height: 1.8;
    color: rgba(35, 65, 29, 0.8);
  }
}

.brand-points {
  margin-top: 52px;
  display: grid;
  gap: 14px;
  max-width: 620px;
}

.point-card {
  padding: 16px 18px;
  min-height: 82px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.45);
  box-shadow: 0 10px 24px rgba(61, 101, 33, 0.06);

  h3 {
    margin: 0 0 8px;
    font-size: 16px;
    font-weight: 700;
    color: #23411d;
  }

  p {
    margin: 0;
    font-size: 14px;
    line-height: 1.65;
    color: rgba(35, 65, 29, 0.72);
  }
}

.auth-card {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 22px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.auth-card-inner {
  width: min(430px, 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.auth-header {
  text-align: center;
  margin-bottom: 22px;
  width: 100%;

  .logo {
    width: 74px;
    height: 74px;
    margin: 0 auto 12px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 18px;
    }
  }

  h2 {
    margin: 0 0 10px;
    font-size: 22px;
    line-height: 1.2;
    font-weight: 800;
    color: #23411d;
  }

  p {
    margin: 0;
    font-size: 13px;
    line-height: 1.6;
    color: rgba(35, 65, 29, 0.68);
  }
}

.role-switch {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 18px;
}

.role-btn {
  height: 42px;
  border-radius: 14px;
  border: 1px solid rgba(82, 196, 26, 0.16);
  background: rgba(255, 255, 255, 0.94);
  color: rgba(35, 65, 29, 0.74);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(82, 196, 26, 0.38);
    color: var(--theme-primary-dark);
    transform: translateY(-1px);
  }

  &.active {
    border-color: transparent;
    background: var(--theme-primary-color);
    color: #fff;
    box-shadow: 0 10px 22px rgba(82, 196, 26, 0.22);
  }
}

.auth-form {
  width: 100%;

  .el-form-item {
    margin-bottom: 16px;
  }

  :deep(.el-input__wrapper) {
    min-height: 46px;
    border-radius: 14px;
    box-shadow: 0 0 0 1px rgba(82, 196, 26, 0.14) inset;
    background: rgba(255, 255, 255, 0.94);
  }

  :deep(.el-input__prefix) {
    color: var(--text-placeholder-color);
    padding-right: 6px;
  }

  :deep(.el-input__inner) {
    font-size: 14px;
  }
}

.platform-name {
  font-size: 24px;
  font-weight: bold;
  color: var(--theme-primary-color);
  font-family: 'Quicksand', serif;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 2px 0 14px;
}

.link {
  font-size: 12px;
  color: var(--theme-primary-dark);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.submit-btn {
  width: 100%;
  height: 46px;
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
  background: var(--theme-primary-color);
  box-shadow: 0 12px 24px rgba(82, 196, 26, 0.18);

  &:hover {
    background: var(--theme-primary-dark);
  }
}

.form-footer {
  margin-top: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: rgba(35, 65, 29, 0.58);
}

@media screen and (max-width: 1200px) {
  .auth-shell {
    width: min(980px, calc(100vw - 48px));
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .auth-brand-panel {
    padding-bottom: 28px;
  }

  .auth-card {
    padding-top: 10px;
    padding-bottom: 30px;
  }
}

@media screen and (max-width: 860px) {
  .auth-page {
    padding: 18px;
  }

  .auth-shell {
    width: 100%;
    border-radius: 22px;
  }

  .auth-brand-panel {
    padding: 28px 22px;

    h1 {
      font-size: 26px;
      color: var(--theme-primary-color);
      font-family: 'Quicksand', serif;
    }

    p {
      font-size: 14px;
    }
  }

  .brand-points {
    margin-top: 22px;
    gap: 12px;
  }

  .point-card {
    padding: 14px 16px;
    min-height: auto;

    h3 {
      font-size: 15px;
    }

    p {
      font-size: 13px;
    }
  }

  .auth-card {
    padding: 18px 16px 24px;
  }

  .auth-header {
    h2 {
      font-size: 20px;
    }

    p {
      font-size: 13px;
    }
  }

  .role-switch {
    grid-template-columns: 1fr;
  }

  .role-btn {
    height: 40px;
    font-size: 14px;
  }

  .auth-form {
    :deep(.el-input__wrapper) {
      min-height: 44px;
    }

    :deep(.el-input__inner) {
      font-size: 14px;
    }
  }

  .submit-btn {
    height: 44px;
    font-size: 14px;
  }

  .form-footer {
    font-size: 12px;
  }
}
</style>
