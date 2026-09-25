// pages/fork-graph/fork-graph.ts
import * as api from '../../utils/api'

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
    const repoId = options.id || options.repoId || ''
    this.loadForkGraph(repoId)
  },

  /**
   * 加载Fork关系图数据
   */
  loadForkGraph(repoId: string) {
    if (!repoId) {
      wx.showToast({ title: '缺少仓库ID', icon: 'none' })
      return
    }
    wx.showLoading({ title: '加载中...', mask: true })
    api.getForkGraph(repoId).then((data: any) => {
      wx.hideLoading()
      this.setData({
        currentRepo: data.currentRepo,
        rootNode: data.rootNode,
        intermediateNodes: data.intermediateNodes || [],
        totalNodes: data.totalNodes,
        totalTransfers: data.totalTransfers,
        totalEvents: data.totalEvents,
        totalDays: data.totalDays
      })
    }).catch(() => {
      wx.hideLoading()
    })
  }
})
