// pages/transfer-initiate/transfer-initiate.ts
Page({
  data: {
    repoId: '',
    repoInfo: {} as any,
    eventCount: 0,
    isGenerating: false,
    transferLink: '',
    qrcodeUrl: '',
    requireVerification: true,
    autoCreateEvent: true,
    transferMessage: ''
  },

  onLoad(options: any) {
    const repoId = options.repoId
    this.setData({ repoId })
    this.loadRepoInfo()
  },

  /**
   * 加载仓库信息
   */
  loadRepoInfo() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    // 模拟数据
    setTimeout(() => {
      wx.hideLoading()

      const mockRepoInfo = {
        id: this.data.repoId,
        name: 'Apple iPhone 15 Pro',
        brand: 'Apple',
        model: 'A2650',
        spec: '256GB, 钛金属原色',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=iphone%2015%20pro%20product%20photo&image_size=square'
      }

      this.setData({
        repoInfo: mockRepoInfo,
        eventCount: 8
      })
    }, 500)
  },

  /**
   * 生成转让链接
   */
  generateTransferLink() {
    this.setData({ isGenerating: true })

    // 模拟API调用
    setTimeout(() => {
      const transferCode = 'TF' + Date.now().toString(36).toUpperCase()
      const link = `https://your-domain.com/transfer/${transferCode}`

      // 生成二维码
      const qrcodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`

      this.setData({
        transferLink: link,
        qrcodeUrl: qrcodeUrl,
        isGenerating: false
      })

      wx.showToast({
        title: '生成成功',
        icon: 'success'
      })
    }, 1500)
  },

  /**
   * 复制链接
   */
  copyLink() {
    wx.setClipboardData({
      data: this.data.transferLink,
      success: () => {
        wx.showToast({
          title: '链接已复制',
          icon: 'success'
        })
      }
    })
  },

  /**
   * 分享链接
   */
  shareLink() {
    wx.showShareMenu({
      withShareTicket: true
    })
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
      wx.showToast({
        title: '请先生成转让链接',
        icon: 'none'
      })
      return
    }

    wx.showModal({
      title: '确认转让',
      content: '确认后将生成转让链接，原仓库状态将变更为"已转让"',
      confirmText: '确认',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.completeTransfer()
        }
      }
    })
  },

  /**
   * 完成转让
   */
  completeTransfer() {
    wx.showLoading({
      title: '处理中...',
      mask: true
    })

    setTimeout(() => {
      wx.hideLoading()

      // 更新仓库状态
      this.setData({
        isTransferred: true
      })

      wx.showToast({
        title: '转让链接已生成',
        icon: 'success'
      })

      // 返回仓库详情页并刷新
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }, 1000)
  }
})
