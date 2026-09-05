import * as api from '../../utils/api'

const defaultIcons: Record<string, string> = {
  'shopping-cart': '🛒', 'tool': '🔧', 'upgrade': '⬆️',
  'star': '⭐', 'heart': '💖', 'alert-circle': '⚠️', 'swap': '🔄',
  'map-pin': '📍', 'bookmark': '🔖', 'edit': '✏️'
}

const placeFallbackTypes = [
  { value: 'visit', name: '到访打卡', icon: '📍', color: '#52c41a' },
  { value: 'review', name: '菜品/体验评价', icon: '⭐', color: '#faad14' },
  { value: 'info_change', name: '信息变更', icon: '✏️', color: '#1890ff' },
  { value: 'wishlist', name: '待探/种草', icon: '🔖', color: '#722ed1' }
]

const itemFallbackTypes = [
  { value: 'purchase', name: '购入', icon: '🛒', color: '#52c41a' },
  { value: 'maintenance', name: '维护保养', icon: '🔧', color: '#1890ff' },
  { value: 'upgrade', name: '升级改装', icon: '⬆️', color: '#722ed1' },
  { value: 'experience', name: '使用体验', icon: '⭐', color: '#faad14' },
  { value: 'memory', name: '体验节点', icon: '💖', color: '#eb2f96' },
  { value: 'fault', name: '故障维修', icon: '⚠️', color: '#f5222d' },
  { value: 'transfer', name: '转让出售', icon: '🔄', color: '#13c2c2' }
]

Page({
  data: {
    repoId: '',
    repoType: 'item',
    eventTypes: [] as any[],
    isPlace: false
  },

  onLoad(options: any) {
    const repoType = options.repoType || 'item'
    this.setData({
      repoId: options.repoId || '',
      repoType: repoType,
      isPlace: repoType === 'place' || repoType === 'location'
    })
    this.loadEventTypes()
  },

  loadEventTypes() {
    const apiRepoType = this.data.isPlace ? 'place' : 'item'
    api.getEventTypes(apiRepoType).then((data: any[]) => {
      const types = (data || []).map((t: any) => ({
        value: t.value,
        name: t.name,
        icon: defaultIcons[t.icon] || '📝',
        color: t.color || '#333'
      }))
      this.setData({ eventTypes: types })
    }).catch(() => {
      this.setData({
        eventTypes: this.data.isPlace ? placeFallbackTypes : itemFallbackTypes
      })
    })
  },

  selectEventType(e: any) {
    const type = e.currentTarget.dataset.type
    wx.navigateTo({
      url: `/pages/event-form/event-form?type=${type}&repoId=${this.data.repoId}&repoType=${this.data.repoType}`
    })
  }
})
