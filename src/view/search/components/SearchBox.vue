<template>
  <div class="search-box">
    <div class="search-container">
      <div class="search-input-group">
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="请输入商品名称"
          class="search-input"
          @keyup.enter="handleSearch"
        />
        <button class="search-btn" @click="handleSearch">
          <i class="iconfont icon-sousuo"></i>
          搜索
        </button>
      </div>
      
      <div class="hot-search">
        <span class="hot-label">热门搜索：</span>
        <div class="hot-tags">
          <span
            v-for="keyword in hotKeywords"
            :key="keyword"
            class="hot-tag"
            @click="handleHotKeywordClick(keyword)"
          >
            {{ keyword }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { hotSearchKeywords } from '@/mock/search/search-results'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  hasSearched: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'search', 'hot-keyword-click'])

const searchKeyword = ref(props.modelValue)
const hotKeywords = hotSearchKeywords.slice(0, 10)

// 监听外部值变化
watch(() => props.modelValue, (newValue) => {
  searchKeyword.value = newValue
})

// 监听内部值变化
watch(searchKeyword, (newValue) => {
  emit('update:modelValue', newValue)
})

const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  emit('search', searchKeyword.value.trim())
}

const handleHotKeywordClick = (keyword) => {
  searchKeyword.value = keyword
  emit('hot-keyword-click', keyword)
}
</script>

<style lang="scss" scoped>
.search-box {
  background: #fff;
  border-radius: 10px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .search-container {
    max-width: 800px;
    margin: 0 auto;

    .search-input-group {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      border: 1px solid #e4e7ed;
      border-radius: 10px;
      overflow: hidden;
      transition: border-color 0.3s;

      &:hover {
        border-color: var(--theme-primary-color);
      }

      &:focus-within {
        border-color: var(--theme-primary-color);
        box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.1);
      }

      .search-input {
        flex: 1;
        height: 48px;
        padding: 0 20px;
        border: none;
        outline: none;
        font-size: 15px;
        color: var(--text-primary-color);
        background: transparent;

        &::placeholder {
          color: #c0c4cc;
        }
      }

      .search-btn {
        height: 48px;
        padding: 0 24px;
        background: var(--theme-primary-color);
        color: #fff;
        border: none;
        cursor: pointer;
        font-size: 15px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: background-color 0.3s;

        &:hover {
          background: var(--theme-primary-dark);
        }

        i {
          font-size: 16px;
        }
      }
    }

    .hot-search {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;

      .hot-label {
        font-size: 14px;
        color: var(--text-secondary-color);
        white-space: nowrap;
      }

      .hot-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .hot-tag {
          padding: 6px 12px;
          font-size: 13px;
          color: var(--text-secondary-color);
          background: #f5f7fa;
          border: 1px solid #e4e7ed;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s;
          white-space: nowrap;

          &:hover {
            color: var(--theme-primary-color);
            background: rgba(82, 196, 26, 0.08);
            border-color: var(--theme-primary-color);
          }
        }
      }
    }
  }

  // 响应式适配
  @media screen and (max-width: 768px) {
    padding: 20px;

    .search-container {
      .search-input-group {
        margin-bottom: 16px;

        .search-input {
          height: 44px;
          padding: 0 16px;
          font-size: 14px;
        }

        .search-btn {
          height: 44px;
          padding: 0 20px;
          font-size: 14px;

          i {
            font-size: 15px;
          }
        }
      }

      .hot-search {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;

        .hot-tags {
          width: 100%;
          justify-content: center;

          .hot-tag {
            padding: 5px 10px;
            font-size: 12px;
          }
        }
      }
    }
  }

  @media screen and (max-width: 480px) {
    padding: 16px;

    .search-container {
      .search-input-group {
        flex-direction: column;
        
        .search-input {
          width: 100%;
          border-bottom: 1px solid #e4e7ed;
        }

        .search-btn {
          width: 100%;
          justify-content: center;
        }
      }
    }
  }
}
</style>