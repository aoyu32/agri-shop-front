import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCategoryStore = defineStore('category', () => {
    // 分类列表
    const categories = ref([
        { id: 1, name: '蔬菜', description: '新鲜蔬菜，绿色健康', productCount: 15, sort: 1, createTime: '2024-01-15 10:30' },
        { id: 2, name: '水果', description: '时令水果，香甜可口', productCount: 20, sort: 2, createTime: '2024-01-15 10:31' },
        { id: 3, name: '粮油', description: '优质粮油，营养丰富', productCount: 8, sort: 3, createTime: '2024-01-15 10:32' },
        { id: 4, name: '禽蛋', description: '新鲜禽蛋，蛋白质丰富', productCount: 5, sort: 4, createTime: '2024-01-15 10:33' },
        { id: 5, name: '其他', description: '其他农产品', productCount: 2, sort: 5, createTime: '2024-01-15 10:34' }
    ])

    // 按排序获取分类列表
    const sortedCategories = computed(() => {
        return [...categories.value].sort((a, b) => a.sort - b.sort)
    })

    // 添加分类
    const addCategory = (category) => {
        const newCategory = {
            ...category,
            id: Date.now(),
            productCount: 0,
            createTime: new Date().toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }).replace(/\//g, '-')
        }
        categories.value.push(newCategory)
        return newCategory
    }

    // 更新分类
    const updateCategory = (id, data) => {
        const index = categories.value.findIndex(c => c.id === id)
        if (index > -1) {
            categories.value[index] = {
                ...categories.value[index],
                ...data
            }
            return true
        }
        return false
    }

    // 删除分类
    const deleteCategory = (id) => {
        const index = categories.value.findIndex(c => c.id === id)
        if (index > -1) {
            categories.value.splice(index, 1)
            return true
        }
        return false
    }

    // 获取分类
    const getCategoryById = (id) => {
        return categories.value.find(c => c.id === id)
    }

    return {
        categories,
        sortedCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategoryById
    }
})
