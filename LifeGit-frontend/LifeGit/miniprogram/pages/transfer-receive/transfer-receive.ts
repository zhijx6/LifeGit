// pages/transfer-receive/transfer-receive.ts
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
   * 加载转让信息
   */
  loadTransferInfo() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    // 模拟API调用
    setTimeout(() => {
      wx.hideLoading()

      const mockData = {
        repoInfo: {
          id: 'repo123',
          name: 'Apple iPhone 15 Pro',
          brand: 'Apple',
          model: 'A2650',
          spec: '256GB, 钛金属原色',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=iphone%2015%20pro&image_size=square'
        },
        originalOwner: {
          id: 'u1',
          name: '科技爱好者',
          avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=avatar&image_size=square'
        },
        transferMessage: '这款手机我用了半年，功能完好，希望下一个主人能好好对待它。电池健康度还有95%，有保护套和原装充电器。',
        inheritedEvents: [
          {
            id: 'e1',
            type: '购入',
            icon: '🛒',
            typeClass: 'purchase',
            description: '2024年3月购入，官网购买',
            time: '2024-03-15'
          },
          {
            id: 'e2',
            type: '维护/维修',
            icon: '🔧',
            typeClass: 'maintenance',
            description: '更换原装保护膜',
            time: '2024-04-20'
          },
          {
            id: 'e3',
            type: '升级',
            icon: '⬆️',
            typeClass: 'upgrade',
            description: '升级存储到512GB',
            time: '2024-05-10'
          },
          {
            id: 'e4',
            type: '体验节点',
            icon: '💭',
            typeClass: 'experience',
            description: '使用3个月体验总结',
            time: '2024-06-15'
          }
        ]
      }

      this.setData(mockData)
    }, 800)
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
          wx.showToast({
            title: '已拒绝',
            icon: 'success'
          })

          setTimeout(() => {
            wx.switchTab({
              url: '/pages/index/index'
            })
          }, 1500)
        }
      }
    })
  },

  /**
   * 确认接收
   */
  acceptTransfer() {
    if (!this.data.receiverName) {
      wx.showToast({
        title: '请输入你的昵称',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '接收中...',
      mask: true
    })

    // 模拟API调用
    setTimeout(() => {
      wx.hideLoading()

      wx.showToast({
        title: '接收成功！',
        icon: 'success',
        duration: 2000
      })

      setTimeout(() => {
        // 跳转到新创建的仓库详情页
        wx.redirectTo({
          url: `/pages/repo-detail/repo-detail?id=new_repo_${Date.now()}`
        })
      }, 2000)
    }, 1500)
  }
})
