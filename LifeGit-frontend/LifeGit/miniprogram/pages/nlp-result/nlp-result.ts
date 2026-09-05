// pages/nlp-result/nlp-result.ts
Page({
  data: {
    originalText: '',
    selectedCategory: '',
    entities: [] as any[],
    recommendedCategory: {} as any,
    alternativeCategories: [] as any[],
    structuredInfo: {} as any
  },

  onLoad(options: any) {
    const text = decodeURIComponent(options.text || '')

    this.setData({
      originalText: text
    })

    this.analyzeText(text)
  },

  /**
   * 模拟NLP分析
   */
  analyzeText(text: string) {
    wx.showLoading({
      title: '分析中...',
      mask: true
    })

    // 模拟API调用延迟
    setTimeout(() => {
      wx.hideLoading()
      this.generateMockResult(text)
    }, 800)
  },

  /**
   * 生成模拟分析结果
   */
  generateMockResult(text: string) {
    // 根据输入文本生成不同的模拟结果
    let result: any = {
      entities: [],
      recommendedCategory: {},
      alternativeCategories: [],
      structuredInfo: {}
    }

    // 判断输入类型
    if (text.includes('捷安特') || text.includes('自行车') || text.includes('山地车')) {
      result = this.getBikeResult(text)
    } else if (text.includes('自习室') || text.includes('华北电力') || text.includes('校区')) {
      result = this.getLocationResult(text)
    } else if (text.includes('MacBook') || text.includes('苹果') || text.includes('Apple')) {
      result = this.getLaptopResult(text)
    } else if (text.includes('索尼') || text.includes('耳机') || text.includes('WH')) {
      result = this.getHeadphoneResult(text)
    } else {
      result = this.getDefaultResult(text)
    }

    this.setData({
      entities: result.entities,
      recommendedCategory: result.recommendedCategory,
      alternativeCategories: result.alternativeCategories,
      structuredInfo: result.structuredInfo,
      selectedCategory: result.recommendedCategory.id
    })
  },

  /**
   * 自行车结果
   */
  getBikeResult(text: string) {
    return {
      entities: [
        { id: 1, value: '捷安特', confidence: 95, entityType: { icon: '🏷️', label: '品牌', class: 'brand' } },
        { id: 2, value: '蓝色', confidence: 92, entityType: { icon: '🎨', label: '颜色', class: 'color' } },
        { id: 3, value: '山地车', confidence: 88, entityType: { icon: '🚲', label: '类型', class: 'type' } }
      ],
      recommendedCategory: {
        id: 'transport',
        name: '交通工具',
        desc: '自行车、电动车等个人出行工具',
        icon: '🚲'
      },
      alternativeCategories: [
        { id: 'sports', name: '运动器材', desc: '健身、户外运动装备' },
        { id: 'outdoor', name: '户外装备', desc: '露营、徒步等户外用品' },
        { id: 'other', name: '其他物品', desc: '其他个人物品' }
      ],
      structuredInfo: {
        name: '捷安特蓝色山地车',
        brand: '捷安特',
        model: '山地车',
        color: '蓝色'
      }
    }
  },

  /**
   * 地点结果
   */
  getLocationResult(text: string) {
    return {
      entities: [
        { id: 1, value: '华北电力大学', confidence: 98, entityType: { icon: '🏫', label: '机构', class: 'organization' } },
        { id: 2, value: '二校区', confidence: 95, entityType: { icon: '📍', label: '区域', class: 'location' } },
        { id: 3, value: '三楼', confidence: 93, entityType: { icon: '🏢', label: '楼层', class: 'floor' } },
        { id: 4, value: '自习室', confidence: 96, entityType: { icon: '📚', label: '场所', class: 'place' } }
      ],
      recommendedCategory: {
        id: 'public-facility',
        name: '公共设施',
        desc: '学校、图书馆、公园等公共场所',
        icon: '🏛️'
      },
      alternativeCategories: [
        { id: 'study', name: '学习空间', desc: '教室、图书馆等学习场所' },
        { id: 'landmark', name: '地标建筑', desc: '重要建筑物和纪念地' },
        { id: 'other', name: '其他地点', desc: '其他类型地点' }
      ],
      structuredInfo: {
        name: '华北电力大学二校区三楼自习室',
        location: '华北电力大学二校区三楼',
        spec: '自习室'
      }
    }
  },

  /**
   * 笔记本电脑结果
   */
  getLaptopResult(text: string) {
    return {
      entities: [
        { id: 1, value: 'MacBook Pro', confidence: 96, entityType: { icon: '💻', label: '产品', class: 'product' } },
        { id: 2, value: 'M3', confidence: 94, entityType: { icon: '⚙️', label: '芯片', class: 'chip' } },
        { id: 3, value: '16寸', confidence: 92, entityType: { icon: '📐', label: '尺寸', class: 'size' } },
        { id: 4, value: '512GB', confidence: 93, entityType: { icon: '💾', label: '存储', class: 'storage' } }
      ],
      recommendedCategory: {
        id: 'electronics',
        name: '电子产品',
        desc: '电脑、手机、平板等电子设备',
        icon: '💻'
      },
      alternativeCategories: [
        { id: 'office', name: '办公设备', desc: '工作、学习相关设备' },
        { id: 'company-asset', name: '公司资产', desc: '企业配发的工作设备' },
        { id: 'other', name: '其他物品', desc: '其他个人物品' }
      ],
      structuredInfo: {
        name: 'MacBook Pro M3 16寸',
        brand: 'Apple',
        model: 'MacBook Pro M3',
        spec: '16寸 512GB'
      }
    }
  },

  /**
   * 耳机结果
   */
  getHeadphoneResult(text: string) {
    return {
      entities: [
        { id: 1, value: '索尼', confidence: 97, entityType: { icon: '🏷️', label: '品牌', class: 'brand' } },
        { id: 2, value: 'WH-1000XM5', confidence: 95, entityType: { icon: '📟', label: '型号', class: 'model' } },
        { id: 3, value: '降噪耳机', confidence: 93, entityType: { icon: '🎧', label: '类型', class: 'type' } },
        { id: 4, value: '黑色版', confidence: 91, entityType: { icon: '🎨', label: '颜色', class: 'color' } }
      ],
      recommendedCategory: {
        id: 'electronics',
        name: '电子产品',
        desc: '电脑、手机、音频设备等',
        icon: '🎧'
      },
      alternativeCategories: [
        { id: 'audio', name: '音频设备', desc: '耳机、音箱等音频产品' },
        { id: 'accessory', name: '数码配件', desc: '各种数码周边配件' },
        { id: 'other', name: '其他物品', desc: '其他个人物品' }
      ],
      structuredInfo: {
        name: '索尼WH-1000XM5降噪耳机',
        brand: '索尼',
        model: 'WH-1000XM5',
        color: '黑色',
        spec: '降噪耳机'
      }
    }
  },

  /**
   * 默认结果
   */
  getDefaultResult(text: string) {
    return {
      entities: [
        { id: 1, value: text.substring(0, 10), confidence: 75, entityType: { icon: '📦', label: '识别中', class: 'unknown' } }
      ],
      recommendedCategory: {
        id: 'other',
        name: '其他物品',
        desc: '未能识别具体类型，归为其他',
        icon: '📦'
      },
      alternativeCategories: [
        { id: 'electronics', name: '电子产品', desc: '各类电子设备' },
        { id: 'clothing', name: '服装配饰', desc: '衣服、鞋子、配饰等' },
        { id: 'outdoor', name: '户外装备', desc: '户外运动相关物品' }
      ],
      structuredInfo: {
        name: text.substring(0, 20)
      }
    }
  },

  /**
   * 选择分类
   */
  selectCategory(e: any) {
    const id = e.currentTarget.dataset.id
    this.setData({
      selectedCategory: id
    })
  },

  /**
   * 返回重新描述
   */
  goBack() {
    wx.navigateBack()
  },

  /**
   * 确认创建
   */
  confirmCreate() {
    const { structuredInfo, selectedCategory } = this.data

    wx.showLoading({
      title: '创建中...',
      mask: true
    })

    // 模拟创建过程
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: '创建成功',
        icon: 'success'
      })

      setTimeout(() => {
        wx.switchTab({
          url: '/pages/my/my'
        })
      }, 1500)
    }, 1000)
  }
})
