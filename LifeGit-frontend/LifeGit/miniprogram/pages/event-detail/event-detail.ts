import * as api from '../../utils/api'

const typeIcons: Record<string, string> = {
  purchase: '🛒', maintenance: '🔧', upgrade: '⬆️',
  experience: '💭', memory: '💖', fault: '⚠️', transfer: '🔄'
}

Page({
  data: {
    eventId: '',
    repoId: '',
    eventIcon: '',
    eventTypeName: '',
    eventTime: '',
    fields: [] as any[]
  },

  onLoad(options: any) {
    this.setData({ eventId: options.id, repoId: options.repoId || '' })
    this.loadEventDetail()
  },

  loadEventDetail() {
    wx.showLoading({ title: '加载中...', mask: true })
    api.getEventDetail(this.data.eventId).then((data: any) => {
      const event = (data && data.event) || data || {}
      const eventType = event.event_type || ''
      const content = event.content || {}
      let schema = data && data.schema

      // schema 缺失时单独请求
      var schemaPromise: Promise<any>
      if (schema && schema.fields) {
        schemaPromise = Promise.resolve(schema)
      } else if (eventType) {
        schemaPromise = api.getEventSchema(eventType).catch(function() { return {} })
      } else {
        schemaPromise = Promise.resolve({})
      }

      return schemaPromise.then((s: any) => {
        wx.hideLoading()
        var fields = (s && s.fields || []).filter(function(f: any) {
          // 只显示用户实际填写过的字段：content 中不存在、空串、空数组都跳过
          if (!content || !(f.field in content)) return false
          var val = content[f.field]
          if (val === null || val === undefined || val === '') return false
          if (Array.isArray(val) && val.length === 0) return false
          return true
        }).map(function(f: any) {
          var val = content[f.field]
          var displayValue = val
          if (f.type === 'boolean') displayValue = val ? '是' : '否'
          else if (f.type === 'rating') displayValue = String(val) + ' 星'
          else if (f.type === 'number' && f.prefix) displayValue = f.prefix + (val || '0')
          else if (f.type === 'select' && f.options) {
            var opt = f.options.find(function(o: any) { return (o.value || o) === val })
            displayValue = opt ? (opt.label || opt) : val
          } else if (Array.isArray(val)) {
            // tags / files 等数组安全显示
            displayValue = val.map(function(v: any) { return (v && typeof v === 'object') ? (v.name || '') : v }).filter(Boolean).join('、')
          }
          return { field: f.field, label: f.label, type: f.type, value: val, displayValue: String(displayValue || '') }
        })

        // 没有 schema fields 时用 content 的 key 兜底显示
        if (fields.length === 0 && content) {
          fields = Object.keys(content).map(function(key) {
            var val = content[key]
            if (Array.isArray(val)) {
              return { field: key, label: key, type: typeof val[0] === 'string' ? 'images' : 'text', value: val, displayValue: '' }
            }
            return { field: key, label: key, type: 'text', value: val, displayValue: String(val || '') }
          })
        }

        this.setData({
          eventIcon: typeIcons[eventType] || '📝',
          eventTypeName: (s && s.name) || eventType,
          eventTime: event.create_time || '',
          fields: fields
        })

        wx.setNavigationBarTitle({ title: (s && s.name) || '事件详情' })
      })
    }).catch(function() {
      wx.hideLoading()
      wx.showToast({ title: '加载失败', icon: 'none' })
    })
  },

  previewImage(e: any) {
    const url = e.currentTarget.dataset.url
    const images: any[] = []
    this.data.fields.forEach((f: any) => {
      if (f.type === 'images' && f.value) {
        f.value.forEach((v: string) => images.push(v))
      }
    })
    wx.previewImage({ current: url, urls: images })
  },

  deleteEvent() {
    wx.showModal({
      title: '删除事件',
      content: '确认删除此事件吗？删除后不可恢复。',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...', mask: true })
          api.deleteEvent(this.data.eventId).then(() => {
            wx.hideLoading()
            wx.showToast({ title: '已删除', icon: 'success' })
            setTimeout(() => wx.navigateBack(), 1500)
          }).catch(() => { wx.hideLoading() })
        }
      }
    })
  }
})
