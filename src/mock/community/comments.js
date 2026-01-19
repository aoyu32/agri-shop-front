// 帖子评论数据
export const postComments = {
  1: [
    {
      id: 1,
      content: '非常实用的指南！我按照这个方法种植，效果确实不错。特别是土壤改良那部分，很有帮助。',
      author: {
        id: 10,
        name: '种植爱好者',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
      },
      likes: 12,
      createTime: '2024-01-15 11:30:00',
      isLiked: false,
      replies: [
        {
          id: 11,
          content: '同感！我也是按照这个方法，今年的蔬菜长得特别好。',
          author: {
            id: 11,
            name: '农场主老刘',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
          },
          likes: 3,
          createTime: '2024-01-15 12:15:00',
          isLiked: false
        }
      ]
    },
    {
      id: 2,
      content: '请问有机肥料多久施一次比较好？我是新手，不太懂这些。',
      author: {
        id: 12,
        name: '新手小农',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
      },
      likes: 5,
      createTime: '2024-01-15 14:20:00',
      isLiked: true,
      replies: [
        {
          id: 21,
          content: '一般来说，生长期每2-3周施一次就可以了，不要过量。',
          author: {
            id: 1,
            name: '农业专家王老师',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
          },
          likes: 8,
          createTime: '2024-01-15 15:00:00',
          isLiked: false
        }
      ]
    },
    {
      id: 3,
      content: '图片拍得很清楚，步骤也很详细。收藏了，准备照着做！',
      author: {
        id: 13,
        name: '城市农夫',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face'
      },
      likes: 7,
      createTime: '2024-01-15 16:45:00',
      isLiked: false,
      replies: []
    }
  ],
  2: [
    {
      id: 4,
      content: '哇，你家的西红柿长得真好！能分享一下具体的施肥方案吗？',
      author: {
        id: 14,
        name: '菜园新手',
        avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100&h=100&fit=crop&crop=face'
      },
      likes: 15,
      createTime: '2024-01-14 17:30:00',
      isLiked: true,
      replies: [
        {
          id: 41,
          content: '我主要用的是腐熟的鸡粪和复合肥，比例大概是3:1，每半个月施一次。',
          author: {
            id: 2,
            name: '小农夫张三',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
          },
          likes: 12,
          createTime: '2024-01-14 18:00:00',
          isLiked: false
        }
      ]
    },
    {
      id: 5,
      content: '看着就很有食欲！我家的西红柿总是长不大，是不是光照不够？',
      author: {
        id: 15,
        name: '阳台种菜',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
      },
      likes: 8,
      createTime: '2024-01-14 19:15:00',
      isLiked: false,
      replies: []
    }
  ],
  3: [
    {
      id: 6,
      content: '分析得很专业！最近确实感觉到蔬菜价格在上涨，特别是叶菜类。',
      author: {
        id: 16,
        name: '批发商老王',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
      },
      likes: 23,
      createTime: '2024-01-13 10:30:00',
      isLiked: true,
      replies: []
    },
    {
      id: 7,
      content: '请问这个分析是基于哪些数据来源？想了解更多市场信息。',
      author: {
        id: 17,
        name: '合作社负责人',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face'
      },
      likes: 11,
      createTime: '2024-01-13 11:45:00',
      isLiked: false,
      replies: [
        {
          id: 71,
          content: '主要参考了农业部的统计数据和各大批发市场的价格信息。',
          author: {
            id: 3,
            name: '市场分析师李四',
            avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face'
          },
          likes: 15,
          createTime: '2024-01-13 12:20:00',
          isLiked: false
        }
      ]
    }
  ],
  4: [
    {
      id: 8,
      content: '新手建议先从简单的开始，比如小白菜、萝卜这些比较好种的。',
      author: {
        id: 18,
        name: '老农民',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
      },
      likes: 18,
      createTime: '2024-01-12 15:00:00',
      isLiked: false,
      replies: []
    },
    {
      id: 9,
      content: '工具的话，基本的锄头、铲子、浇水壶就够了，不用买太多。',
      author: {
        id: 19,
        name: '园艺师小李',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
      },
      likes: 14,
      createTime: '2024-01-12 16:30:00',
      isLiked: true,
      replies: []
    }
  ],
  5: [
    {
      id: 10,
      content: '这个方法很环保！我也在家里做堆肥，效果确实不错。',
      author: {
        id: 20,
        name: '环保志愿者',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
      },
      likes: 16,
      createTime: '2024-01-11 12:30:00',
      isLiked: false,
      replies: []
    }
  ]
}