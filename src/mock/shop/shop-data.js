// 店铺mock数据
export const shopData = {
    1: {
        id: 1,
        name: '绿野农场',
        logo: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=200&h=200&fit=crop',
        banner: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&h=300&fit=crop',
        description: '专注有机农产品种植，为您提供新鲜健康的绿色食品',
        location: '山东省潍坊市寿光市',
        openTime: '2020-03-15',
        productCount: 48,
        sales: '12.5k',
        rating: 4.8,
        followers: '3.2k'
    },
    2: {
        id: 2,
        name: '阳光果园',
        logo: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=200&h=200&fit=crop',
        banner: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1400&h=300&fit=crop',
        description: '专业种植各类时令水果，品质保证，新鲜直达',
        location: '陕西省西安市临潼区',
        openTime: '2019-06-20',
        productCount: 32,
        sales: '8.9k',
        rating: 4.9,
        followers: '2.8k'
    }
}

// 店铺农产品数据（参考主页产品卡片格式）
export const shopProducts = {
    1: [
        {
            id: 1,
            name: '有机西红柿',
            image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400',
            description: '有机西红柿，口感鲜美，营养丰富，无农药残留，健康首选',
            tags: ['有机', '包邮', '新鲜直达'],
            price: '15.80',
            unit: '2斤',
            sales: 1250,
            stock: 150,
            category: 'vegetable',
            shopId: 1
        },
        {
            id: 2,
            name: '新鲜黄瓜',
            image: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=400',
            description: '新鲜黄瓜，脆嫩多汁，口感清爽，适合凉拌生食',
            tags: ['新鲜', '包邮', '当日采摘'],
            price: '8.50',
            unit: '3斤',
            sales: 2100,
            stock: 200,
            category: 'vegetable',
            shopId: 1
        },
        {
            id: 3,
            name: '有机生菜',
            image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400',
            description: '有机生菜，绿色健康，口感脆嫩，沙拉必备食材',
            tags: ['有机', '包邮', '绿色健康'],
            price: '12.00',
            unit: '2斤',
            sales: 890,
            stock: 180,
            category: 'vegetable',
            shopId: 1
        },
        {
            id: 4,
            name: '新鲜草莓',
            image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400',
            description: '新鲜草莓，香甜多汁，果香浓郁，当季水果精选',
            tags: ['当季', '顺丰包邮', '新鲜采摘'],
            price: '28.00',
            unit: '2斤',
            sales: 1560,
            stock: 120,
            category: 'fruit',
            shopId: 1
        },
        {
            id: 5,
            name: '红富士苹果',
            image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
            description: '红富士苹果，脆甜多汁，果香浓郁，营养丰富',
            tags: ['精品', '包邮', '产地直发'],
            price: '18.50',
            unit: '5斤',
            sales: 3200,
            stock: 300,
            category: 'fruit',
            shopId: 1
        },
        {
            id: 6,
            name: '有机大米',
            image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
            description: '有机大米，粒粒饱满，口感香糯，健康主食首选',
            tags: ['有机', '包邮', '产地直供'],
            price: '45.00',
            unit: '5斤',
            sales: 980,
            stock: 500,
            category: 'grain',
            shopId: 1
        },
        {
            id: 7,
            name: '新鲜菠菜',
            image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400',
            description: '新鲜菠菜，营养丰富，铁含量高，健康蔬菜',
            tags: ['新鲜', '包邮', '营养丰富'],
            price: '9.80',
            unit: '2斤',
            sales: 750,
            stock: 160,
            category: 'vegetable',
            shopId: 1
        },
        {
            id: 8,
            name: '有机胡萝卜',
            image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400',
            description: '有机胡萝卜，色泽鲜艳，口感脆甜，维生素A丰富',
            tags: ['有机', '包邮', '营养健康'],
            price: '11.50',
            unit: '3斤',
            sales: 1100,
            stock: 220,
            category: 'vegetable',
            shopId: 1
        },
        {
            id: 9,
            name: '新鲜蓝莓',
            image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400',
            description: '新鲜蓝莓，酸甜可口，花青素含量高，美容养颜',
            tags: ['进口', '限量', '营养丰富'],
            price: '35.00',
            unit: '1斤',
            sales: 680,
            stock: 90,
            category: 'fruit',
            shopId: 1
        },
        {
            id: 10,
            name: '有机小米',
            image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400',
            description: '有机小米，粒粒精选，营养丰富，养胃佳品',
            tags: ['有机', '包邮', '养胃健康'],
            price: '38.00',
            unit: '3斤',
            sales: 520,
            stock: 400,
            category: 'grain',
            shopId: 1
        },
        {
            id: 11,
            name: '新鲜西兰花',
            image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400',
            description: '新鲜西兰花，营养价值高，口感脆嫩，健康蔬菜',
            tags: ['新鲜', '包邮', '营养丰富'],
            price: '14.80',
            unit: '2斤',
            sales: 920,
            stock: 140,
            category: 'vegetable',
            shopId: 1
        },
        {
            id: 12,
            name: '有机玉米',
            image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400',
            description: '有机玉米，颗粒饱满，香甜可口，营养健康',
            tags: ['有机', '包邮', '香甜可口'],
            price: '16.00',
            unit: '5斤',
            sales: 1350,
            stock: 280,
            category: 'vegetable',
            shopId: 1
        }
    ],
    2: [
        {
            id: 13,
            name: '新鲜猕猴桃',
            image: 'https://images.unsplash.com/photo-1585059895524-72359e06133a?w=400',
            description: '新鲜猕猴桃，维C之王，酸甜可口，营养丰富',
            tags: ['当季', '包邮', '维C丰富'],
            price: '22.00',
            unit: '3斤',
            sales: 1800,
            stock: 200,
            category: 'fruit',
            shopId: 2
        },
        {
            id: 14,
            name: '红心火龙果',
            image: 'https://images.unsplash.com/photo-1527325678964-54921661f888?w=400',
            description: '红心火龙果，果肉细腻，香甜多汁，营养价值高',
            tags: ['精品', '包邮', '新鲜直达'],
            price: '25.00',
            unit: '3斤',
            sales: 1450,
            stock: 150,
            category: 'fruit',
            shopId: 2
        },
        {
            id: 15,
            name: '新鲜荔枝',
            image: 'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?w=400',
            description: '新鲜荔枝，果肉晶莹，香甜多汁，岭南佳果',
            tags: ['当季', '顺丰包邮', '新鲜采摘'],
            price: '32.00',
            unit: '3斤',
            sales: 980,
            stock: 120,
            category: 'fruit',
            shopId: 2
        },
        {
            id: 16,
            name: '黄金百香果',
            image: 'https://images.unsplash.com/photo-1520342868574-5fa3804e551c?w=400',
            description: '黄金百香果，果香浓郁，酸甜适中，维C含量高',
            tags: ['精品', '包邮', '果香浓郁'],
            price: '28.00',
            unit: '3斤',
            sales: 1250,
            stock: 180,
            category: 'fruit',
            shopId: 2
        },
        {
            id: 17,
            name: '新鲜柠檬',
            image: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=400',
            description: '新鲜柠檬，果汁丰富，酸度适中，美容养颜',
            tags: ['新鲜', '包邮', '美容养颜'],
            price: '18.00',
            unit: '3斤',
            sales: 1680,
            stock: 250,
            category: 'fruit',
            shopId: 2
        },
        {
            id: 18,
            name: '红心柚子',
            image: 'https://images.unsplash.com/photo-1571575173700-afb9492e6a50?w=400',
            description: '红心柚子，果肉饱满，汁多味甜，清火润肺',
            tags: ['精品', '包邮', '产地直发'],
            price: '35.00',
            unit: '4个',
            sales: 890,
            stock: 160,
            category: 'fruit',
            shopId: 2
        },
        {
            id: 19,
            name: '新鲜葡萄',
            image: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400',
            description: '新鲜葡萄，颗粒饱满，香甜多汁，营养丰富',
            tags: ['当季', '包邮', '新鲜采摘'],
            price: '26.00',
            unit: '3斤',
            sales: 1520,
            stock: 200,
            category: 'fruit',
            shopId: 2
        },
        {
            id: 20,
            name: '新鲜桃子',
            image: 'https://images.unsplash.com/photo-1629828874514-944d8c50f5ac?w=400',
            description: '新鲜桃子，果肉细腻，香甜多汁，夏季水果',
            tags: ['当季', '包邮', '香甜多汁'],
            price: '24.00',
            unit: '3斤',
            sales: 1350,
            stock: 180,
            category: 'fruit',
            shopId: 2
        },
        {
            id: 21,
            name: '新鲜西瓜',
            image: 'https://images.unsplash.com/photo-1587049352846-4a222e784210?w=400',
            description: '新鲜西瓜，果肉鲜红，汁多味甜，消暑解渴',
            tags: ['当季', '包邮', '消暑解渴'],
            price: '29.00',
            unit: '1个',
            sales: 2100,
            stock: 150,
            category: 'fruit',
            shopId: 2
        },
        {
            id: 22,
            name: '新鲜哈密瓜',
            image: 'https://images.unsplash.com/photo-1621583832199-d1f5e1c2b7e6?w=400',
            description: '新鲜哈密瓜，果肉香甜，口感细腻，营养丰富',
            tags: ['精品', '包邮', '香甜可口'],
            price: '32.00',
            unit: '1个',
            sales: 780,
            stock: 120,
            category: 'fruit',
            shopId: 2
        },
        {
            id: 23,
            name: '新鲜香蕉',
            image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400',
            description: '新鲜香蕉，果肉软糯，香甜可口，营养丰富',
            tags: ['新鲜', '包邮', '营养丰富'],
            price: '15.00',
            unit: '3斤',
            sales: 2350,
            stock: 300,
            category: 'fruit',
            shopId: 2
        },
        {
            id: 24,
            name: '新鲜橙子',
            image: 'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?w=400',
            description: '新鲜橙子，果汁丰富，酸甜适中，维C含量高',
            tags: ['新鲜', '包邮', '维C丰富'],
            price: '20.00',
            unit: '5斤',
            sales: 1890,
            stock: 250,
            category: 'fruit',
            shopId: 2
        }
    ]
}

// 店铺分类数据
export const shopCategories = {
    1: [
        { id: 'all', name: '全部农产品', count: 12 },
        { id: 'vegetable', name: '新鲜蔬菜', count: 7 },
        { id: 'fruit', name: '时令水果', count: 3 },
        { id: 'grain', name: '粮油米面', count: 2 }
    ],
    2: [
        { id: 'all', name: '全部农产品', count: 12 },
        { id: 'fruit', name: '时令水果', count: 12 }
    ]
}
