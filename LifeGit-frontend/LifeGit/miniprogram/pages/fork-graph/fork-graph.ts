// pages/fork-graph/fork-graph.ts
Page({
  data: {
    currentRepo: {} as any,
    rootNode: {} as any,
    intermediateNodes: [] as any[],
    totalNodes: 0,
    totalTransfers: 0,
    totalEvents: 0,
    totalDays: 0
  },

  onLoad(options: any) {
    const repoId = options.id || ''
    this.loadForkGraph(repoId)
  },

  /**
   * 加载Fork关系图数据
   */
  loadForkGraph(repoId: string) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    // 模拟API调用
    setTimeout(() => {
      wx.hideLoading()

      const mockData = {
        currentRepo: {
          id: 'repo123',
          name: 'Apple iPhone 15 Pro',
          brand: 'Apple',
          model: 'A2650',
          spec: '256GB, 钛金属原色',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=iphone%2015%20pro&image_size=square',
          owner: '科技爱好者',
          ownerAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=avatar&image_size=square',
          eventCount: 12,
          createdAt: '2024-03-15',
          updatedAt: '2024-12-20'
        },
        rootNode: {
          id: 'repo_root',
          ownerName: '数码达人',
          ownerAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=avatar1&image_size=square',
          createdAt: '2024-03-15'
        },
        intermediateNodes: [
          {
            id: 'repo_fork1',
            ownerName: '摄影爱好者',
            ownerAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=avatar2&image_size=square',
            fromOwner: '数码达人',
            receivedAt: '2024-06-20',
            eventCount: 8
          },
          {
            id: 'repo_fork2',
            ownerName: '学生小王',
            ownerAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=avatar3&image_size=square',
            fromOwner: '摄影爱好者',
            receivedAt: '2024-09-15',
            eventCount: 5
          }
        ],
        totalNodes: 4,
        totalTransfers: 3,
        totalEvents: 25,
        totalDays: 280
      }

      this.setData(mockData)
    }, 800)
  }
})
