<template>
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-section">
          <h3>关于农购宝</h3>
          <p>智能农产品产销服务平台</p>
        </div>
        <div class="footer-section">
          <h3>联系我们</h3>
          <p>客服电话：400-xxx-xxxx</p>
        </div>
        <div class="footer-section">
          <h3>帮助中心</h3>
          <p>常见问题 | 使用指南</p>
        </div>
      </div>
      <div class="footer-copyright">
        © 2025 农购宝 版权所有
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.app-footer {
  background-color: var(--bg-white);
  border-top: 1px solid var(--border-color);
  margin-top: 48px;

  .footer-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 32px 24px 24px;
  }

  .footer-content {
    display: flex;
    justify-content: space-around;
    margin-bottom: 24px;

    .footer-section {
      h3 {
        font-size: 16px;
        color: var(--text-primary-color);
        margin-bottom: 12px;
      }

      p {
        font-size: 14px;
        color: var(--text-secondary-color);
        line-height: 1.8;
      }
    }
  }

  .footer-copyright {
    text-align: center;
    padding-top: 24px;
    border-top: 1px solid var(--border-light-color);
    font-size: 14px;
    color: var(--text-placeholder-color);
  }

  // ==================== 响应式适配 ====================

  // 平板设备 (768px - 1024px)
  @media screen and (max-width: 1024px) {
    .footer-container {
      padding: 24px 16px 20px;
    }

    .footer-content {
      .footer-section {
        h3 {
          font-size: 15px;
        }

        p {
          font-size: 13px;
        }
      }
    }
  }

  // 小屏设备 (481px - 768px)
  @media screen and (max-width: 768px) {
    margin-top: 32px;

    .footer-container {
      padding: 20px 12px 16px;
    }

    .footer-content {
      flex-direction: column;
      gap: 20px;
      margin-bottom: 20px;

      .footer-section {
        text-align: center;

        h3 {
          font-size: 14px;
          margin-bottom: 8px;
        }

        p {
          font-size: 12px;
        }
      }
    }

    .footer-copyright {
      padding-top: 16px;
      font-size: 12px;
    }
  }

  // 手机设备 (最大 480px)
  @media screen and (max-width: 480px) {
    margin-top: 24px;

    .footer-container {
      padding: 16px 8px 12px;
    }

    .footer-content {
      gap: 16px;
      margin-bottom: 16px;

      .footer-section {
        h3 {
          font-size: 13px;
          margin-bottom: 6px;
        }

        p {
          font-size: 11px;
          line-height: 1.6;
        }
      }
    }

    .footer-copyright {
      padding-top: 12px;
      font-size: 11px;
    }
  }
}
</style>