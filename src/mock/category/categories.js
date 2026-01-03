// 农产品分类数据（包含一级和二级分类）
export const categoryTree = [
  {
    id: 1,
    name: '水果',
    icon: 'icon-shuiguo',
    children: [
      { id: 101, name: '苹果', parentId: 1 },
      { id: 102, name: '香蕉', parentId: 1 },
      { id: 103, name: '橙子', parentId: 1 },
      { id: 104, name: '葡萄', parentId: 1 },
      { id: 105, name: '芒果', parentId: 1 },
      { id: 106, name: '樱桃', parentId: 1 },
      { id: 107, name: '猕猴桃', parentId: 1 },
      { id: 108, name: '柚子', parentId: 1 }
    ]
  },
  {
    id: 2,
    name: '蔬菜',
    icon: 'icon-shucai',
    children: [
      { id: 201, name: '白菜', parentId: 2 },
      { id: 202, name: '萝卜', parentId: 2 },
      { id: 203, name: '西红柿', parentId: 2 },
      { id: 204, name: '黄瓜', parentId: 2 },
      { id: 205, name: '茄子', parentId: 2 },
      { id: 206, name: '辣椒', parentId: 2 },
      { id: 207, name: '土豆', parentId: 2 },
      { id: 208, name: '菠菜', parentId: 2 }
    ]
  },
  {
    id: 3,
    name: '水产',
    icon: 'icon-shuichan',
    children: [
      { id: 301, name: '鱼类', parentId: 3 },
      { id: 302, name: '虾类', parentId: 3 },
      { id: 303, name: '蟹类', parentId: 3 },
      { id: 304, name: '贝类', parentId: 3 },
      { id: 305, name: '海参', parentId: 3 },
      { id: 306, name: '海带', parentId: 3 }
    ]
  },
  {
    id: 4,
    name: '粮食',
    icon: 'icon-liangshi',
    children: [
      { id: 401, name: '大米', parentId: 4 },
      { id: 402, name: '小麦', parentId: 4 },
      { id: 403, name: '玉米', parentId: 4 },
      { id: 404, name: '小米', parentId: 4 },
      { id: 405, name: '黑米', parentId: 4 },
      { id: 406, name: '糯米', parentId: 4 }
    ]
  },
  {
    id: 5,
    name: '肉禽蛋',
    icon: 'icon-roulei',
    children: [
      { id: 501, name: '猪肉', parentId: 5 },
      { id: 502, name: '牛肉', parentId: 5 },
      { id: 503, name: '羊肉', parentId: 5 },
      { id: 504, name: '鸡肉', parentId: 5 },
      { id: 505, name: '鸭肉', parentId: 5 },
      { id: 506, name: '鸡蛋', parentId: 5 },
      { id: 507, name: '鸭蛋', parentId: 5 }
    ]
  },
  {
    id: 6,
    name: '茶叶',
    icon: 'icon-chaye',
    children: [
      { id: 601, name: '绿茶', parentId: 6 },
      { id: 602, name: '红茶', parentId: 6 },
      { id: 603, name: '乌龙茶', parentId: 6 },
      { id: 604, name: '普洱茶', parentId: 6 },
      { id: 605, name: '白茶', parentId: 6 },
      { id: 606, name: '黄茶', parentId: 6 }
    ]
  },
  {
    id: 7,
    name: '坚果',
    icon: 'icon-jianguo',
    children: [
      { id: 701, name: '核桃', parentId: 7 },
      { id: 702, name: '杏仁', parentId: 7 },
      { id: 703, name: '腰果', parentId: 7 },
      { id: 704, name: '开心果', parentId: 7 },
      { id: 705, name: '夏威夷果', parentId: 7 },
      { id: 706, name: '花生', parentId: 7 }
    ]
  },
  {
    id: 8,
    name: '药材',
    icon: 'icon-yaocai',
    children: [
      { id: 801, name: '人参', parentId: 8 },
      { id: 802, name: '枸杞', parentId: 8 },
      { id: 803, name: '当归', parentId: 8 },
      { id: 804, name: '黄芪', parentId: 8 },
      { id: 805, name: '灵芝', parentId: 8 }
    ]
  }
]

// 筛选选项
export const filterOptions = {
  // 价格区间
  priceRanges: [
    { id: 1, label: '0-50元', min: 0, max: 50 },
    { id: 2, label: '50-100元', min: 50, max: 100 },
    { id: 3, label: '100-200元', min: 100, max: 200 },
    { id: 4, label: '200-500元', min: 200, max: 500 },
    { id: 5, label: '500元以上', min: 500, max: null }
  ],
  // 产地
  origins: [
    { id: 1, name: '山东' },
    { id: 2, name: '河北' },
    { id: 3, name: '河南' },
    { id: 4, name: '陕西' },
    { id: 5, name: '新疆' },
    { id: 6, name: '云南' },
    { id: 7, name: '海南' },
    { id: 8, name: '广东' },
    { id: 9, name: '福建' },
    { id: 10, name: '四川' }
  ],
  // 排序方式
  sortOptions: [
    { id: 1, label: '综合排序', value: 'default' },
    { id: 2, label: '销量优先', value: 'sales' },
    { id: 3, label: '价格从低到高', value: 'price_asc' },
    { id: 4, label: '价格从高到低', value: 'price_desc' },
    { id: 5, label: '最新上架', value: 'newest' }
  ]
}
