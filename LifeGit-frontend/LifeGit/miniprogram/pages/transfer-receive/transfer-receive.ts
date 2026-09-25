// pages/transfer-receive/transfer-receive.ts
import * as api from '../../utils/api'

Page({
  data: {
    transferCode: '',
    repoInfo: {} as any,
    originalOwner: {} as any,
    transferMessage: '',
    inheritedEvents: [] as any[],
    receiverName: '',
    autoCreateEvent: true
  },

  onLoad(options: any) {
    const transferCode = options.code || ''
    this.setData({ transferCode })
    this.loadTransferInfo()
  },

  /**
   * 加载转让信息(仓库 + 原主人 + 继承事件)
   */
  loadTransferInfo() {
    wx.showLoading({ title: '加载中...', mask: true })
    api.getTransferInfo(this.data.transferCode).then((data: any) => {
      wx.hideLoading()
      const repo = data.repo || {}
      const repoInfo = {
        id: repo.id,
        name: repo.name || repo.product_name || '',
        type: repo.type || 'item',
        brand: repo.brand || '',
        model: repo.model || '',
        spec: repo.specification || '',
        image: repo.main_image || repo.cover_image || ''
      }

      const typeIcons: any = {
        purchase: '🛒', maintenance: '🔧', upgrade: '⬆️',
        experience: '💭', memory: '💖', fault: '⚠️', transfer: '🔄'
      }
      const typeNames: any = {
        purchase: '购入', maintenance: '维护/维修', upgrade: '升级',
        experience: '体验节点', memory: '记忆', fault: '故障', transfer: '转让'
      }
      const events = (data.inherited_events || []).map((e: any) => {
        let desc = ''
        if (e.content) {
          try {
            const c = typeof e.content === 'string' ? JSON.parse(e.content) : e.content
            desc = c.description || c.purchase_location || c.maintenance_project || c.upgrade_item || c.experience_summary || c.memory_title || c.fault_description || c.transfer_reason || ''
          } catch (e) {
            desc = ''
          }
        }
        return {
          id: e.id,
          type: typeNames[e.event_type] || e.event_type,
          icon: typeIcons[e.event_type] || '📝',
          typeClass: e.event_type,
          description: desc,
          time: e.create_time ? e.create_time.split(' ')[0] : ''
        }
      })

      this.setData({
        repoInfo: repoInfo,
        originalOwner: data.original_owner || {},
        transferMessage: data.message || '',
        inheritedEvents: events
      })
    }).catch(() => {
      wx.hideLoading()
    })
  },

  /**
   * 昵称输入
   */
  onNameInput(e: any) {
    this.setData({
      receiverName: e.detail.value
    })
  },

  /**
   * 切换自动创建事件
   */
  toggleAutoCreateEvent() {
    this.setData({
      autoCreateEvent: !this.data.autoCreateEvent
    })
  },

  /**
   * 拒绝接收
   */
  declineTransfer() {
    wx.showModal({
      title: '拒绝接收',
      content: '确认拒绝接收这个物品吗？',
      confirmText: '确认拒绝',
      confirmColor: '#f5576c',
      success: (res) => {
        if (res.confirm) {
          api.declineTransfer(this.data.transferCode).then(() => {
            wx.showToast({ title: '已拒绝', icon: 'success' })
            setTimeout(() => {
              wx.switchTab({ url: '/pages/index/index' })
            }, 1500)
          })
        }
      }
    })
  },

  /**
   * 确认接收(Fork 新仓库并继承全部历史)
   */
  acceptTransfer() {
    if (!this.data.receiverName) {
      wx.showToast({ title: '请输入你的昵称', icon: 'none' })
      return
    }

    wx.showLoading({ title: '接收中...', mask: true })
    api.acceptTransfer(this.data.transferCode, {
      receiver_name: this.data.receiverName,
      auto_create_event: this.data.autoCreateEvent
    }).then((data: any) => {
      wx.hideLoading()
      wx.showToast({ title: '接收成功！', icon: 'success', duration: 2000 })
      setTimeout(() => {
        wx.redirectTo({ url: '/pages/repo-detail/repo-detail?id=' + data.new_repo_id })
      }, 2000)
    }).catch(() => {
      wx.hideLoading()
    })
  }
})
