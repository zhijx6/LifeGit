// pages/nlp-result/nlp-result.ts
import * as api from '../../utils/api'

const CATEGORY_MAP: Record<string, { id: string; name: string; desc: string; icon: string }> = {
  item: { id: 'item', name: '物品', desc: '电子产品、交通工具、家用电器等', icon: '📦' },
  place: { id: 'place', name: '地点', desc: '学校、餐厅、商场、公园等场所', icon: '📍' }
}

const ENTITY_TYPE_MAP: Record<string, { icon: string; label: string; class: string }> = {
  brand: { icon: '🏷️', label: '品牌', class: 'brand' },
  product_type: { icon: '📦', label: '类型', class: 'type' },
  color: { icon: '🎨', label: '颜色', class: 'color' },
  specification: { icon: '📐', label: '规格', class: 'spec' },
  location: { icon: '📍', label: '地点', class: 'location' }
}

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
    this.setData({ originalText: text })
    this.analyzeText(text)
  },

  /**
   * 调用后端 AI 接口分析文本
   */
  analyzeText(text: string) {
    wx.showLoading({ title: 'AI分析中...', mask: true })

    api.nlpAnalyze(text)
      .then((data: any) => {
        wx.hideLoading()
        console.log('[NLP] success data:', JSON.stringify(data))
        if (data) {
          this.formatResult(data)
        } else {
          wx.showToast({ title: '分析失败', icon: 'none' })
        }
      })
      .catch((err: any) => {
        wx.hideLoading()
        console.log('[NLP] error:', JSON.stringify(err))
        wx.showToast({ title: '网络错误,请重试', icon: 'none' })
      })
  },

  /**
   * 将 AI 返回结果转换为页面结构
   */
  formatResult(data: any) {
    const { category, structured_name, suggested_fields } = data
    const entities = data.entities || {}

    // 实体列表
    const entityList: any[] = []
    let entityId = 1
    ;(['brand', 'product_type', 'color', 'specification', 'location'] as const).forEach((key) => {
      const values = entities[key] || []
      values.forEach((v: string) => {
        if (v) {
          entityList.push({
            id: entityId++,
            value: v,
            confidence: 90,
            entityType: ENTITY_TYPE_MAP[key] || { icon: '📦', label: '其他', class: 'unknown' }
          })
        }
      })
    })

    // 推荐分类
    const recCat = CATEGORY_MAP[category] || CATEGORY_MAP.item
    const altCats = Object.values(CATEGORY_MAP)
      .filter((c) => c.id !== recCat.id)
      .map((c) => ({ id: c.id, name: c.name, desc: c.desc }))

    // 结构化信息
    const sf = suggested_fields || {}
    const info: any = {
      name: structured_name || sf.product_name || '未命名'
    }
    if (sf.brand) info.brand = sf.brand
    if (sf.model) info.model = sf.model
    if (sf.specification) info.spec = sf.specification
    if (sf.description) info.desc = sf.description
    if (entities && entities.location && entities.location[0]) info.location = entities.location[0]
    if (entities && entities.color && entities.color[0]) info.color = entities.color[0]

    this.setData({
      entities: entityList,
      recommendedCategory: recCat,
      alternativeCategories: altCats,
      structuredInfo: info,
      selectedCategory: recCat.id
    })
  },

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
   * 确认创建仓库
   */
  confirmCreate() {
    const { structuredInfo, selectedCategory, originalText } = this.data

    wx.showLoading({ title: '创建中...', mask: true })

    api.confirmNlpRepo({
      product_name: structuredInfo.name || originalText,
      name: structuredInfo.name || originalText,
      type: selectedCategory === 'place' ? 'place' : 'item',
      brand: structuredInfo.brand || '',
      model: structuredInfo.model || '',
      specification: structuredInfo.spec || '',
      description: structuredInfo.desc || originalText
    })
      .then((data: any) => {
        wx.hideLoading()
        if (data) {
          wx.showToast({ title: '创建成功', icon: 'success' })
          setTimeout(() => {
            wx.switchTab({ url: '/pages/my/my' })
          }, 1500)
        } else {
          wx.showToast({ title: '创建失败', icon: 'none' })
        }
      })
      .catch(() => {
        wx.hideLoading()
        wx.showToast({ title: '网络错误,请重试', icon: 'none' })
      })
  }
})
