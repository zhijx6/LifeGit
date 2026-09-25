// pages/transfer-initiate/transfer-initiate.ts
import * as api from '../../utils/api'

Page({
  data: {
    repoId: '',
    repoInfo: {} as any,
    eventCount: 0,
    isGenerating: false,
    transferLink: '',
    qrcodeUrl: '',
    transferCode: '',
    requireVerification: true,
    autoCreateEvent: true,
    transferMessage: ''
  },

  onLoad(options: any) {
    const repoId = options.repoId
    this.setData({ repoId })
    this.loadRepoInfo()
  },

  loadRepoInfo() {
    wx.showLoading({ title: '加载中...', mask: true })
    api.getRepoDetail(this.data.repoId).then((data: any) => {
      wx.hideLoading()
      this.setData({
        repoInfo: data.repoInfo,
        eventCount: data.events ? data.events.length : 0
      })
    }).catch(() => {
      wx.hideLoading()
    })
  },

  /**
   * 生成转让链接(调用后端生成转让码)
   */
  generateTransferLink() {
    this.setData({ isGenerating: true })
    api.initiateTransfer(this.data.repoId, {
      message: this.data.transferMessage,
      auto_create_event: this.data.autoCreateEvent
    }).then((data: any) => {
      const link = 'lifegit://transfer/' + data.transfer_code
      const qrcodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(link)
      this.setData({
        transferLink: link,
        transferCode: data.transfer_code,
        qrcodeUrl: qrcodeUrl,
        isGenerating: false
      })
      wx.showToast({ title: '生成成功', icon: 'success' })
    }).catch(() => {
      this.setData({ isGenerating: false })
    })
  },

  /**
   * 复制转让码
   */
  copyLink() {
    wx.setClipboardData({
      data: this.data.transferCode,
      success: () => {
        wx.showToast({ title: '转让码已复制', icon: 'success' })
      }
    })
  },

  /**
   * 分享链接
   */
  shareLink() {
    wx.showShareMenu({ withShareTicket: true })
  },

  /**
   * 切换验证开关
   */
  toggleVerification() {
    this.setData({
      requireVerification: !this.data.requireVerification
    })
  },

  /**
   * 切换自动创建事件开关
   */
  toggleAutoEvent() {
    this.setData({
      autoCreateEvent: !this.data.autoCreateEvent
    })
  },

  /**
   * 留言输入
   */
  onMessageInput(e: any) {
    this.setData({
      transferMessage: e.detail.value
    })
  },

  /**
   * 返回
   */
  goBack() {
    wx.navigateBack()
  },

  /**
   * 确认转让
   */
  confirmTransfer() {
    if (!this.data.transferLink) {
      wx.showToast({ title: '请先生成转让链接', icon: 'none' })
      return
    }
    wx.showModal({
      title: '确认转让',
      content: '转让码已生成,将转让码发给对方,对方在"我-领取转让"中输入即可接收',
      confirmText: '确认',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '转让码已生成', icon: 'success' })
          setTimeout(() => { wx.navigateBack() }, 1500)
        }
      }
    })
  }
})
