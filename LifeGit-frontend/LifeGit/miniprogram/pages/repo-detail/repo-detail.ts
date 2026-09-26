// repo-detail.ts
import * as api from '../../utils/api'

Page({
  data: {
    repoId: '',
    repoInfo: {
      name: '',
      type: 'item',
      brand: '',
      model: '',
      spec: '',
      image: ''
    },
    events: [] as any[],
    isOwner: false,
    issueCount: 0,
    hotIssues: [] as any[],
    isTransferred: false,
    isOriginalOwner: true,
    transferredTime: '',
    newOwner: '',
    hasForkRelations: false,
    forkCount: 0,
    forkRelations: [] as any[]
  },

  onLoad(options: any) {
    this.setData({ repoId: options.id })
    this.loadRepoDetail()
  },

  loadRepoDetail() {
    wx.showLoading({ title: '加载中...', mask: true })

    api.getRepoDetail(this.data.repoId).then((data: any) => {
      wx.hideLoading()
      const repoInfo = data.repoInfo || {}
      const isOwner = String(repoInfo.creatorId) === String(wx.getStorageSync('userId'))
      this.setData({
        repoInfo,
        isOwner,
        isTransferred: !!repoInfo.isTransferred,
        transferredTime: repoInfo.transferredTime || '',
        newOwner: repoInfo.newOwner || '',
        events: (data.events || []).sort((a: any, b: any) => {
          return new Date(b.time).getTime() - new Date(a.time).getTime()
        })
      })
      this.loadHotIssues()
      this.loadForkGraph()
    }).catch(() => {
      wx.hideLoading()
      wx.showToast({ title: '加载失败', icon: 'none' })
    })
  },

  loadForkGraph() {
    // 地点型仓库无fork图谱；未登录时跳过（该接口需要token）
    if (this.data.repoInfo.type === 'place' || !wx.getStorageSync('token')) return
    api.getForkGraph(this.data.repoId).then((data: any) => {
      const intermediate = data.intermediateNodes || []
      this.setData({
        hasForkRelations: intermediate.length > 0,
        forkCount: intermediate.length,
        forkRelations: intermediate.map((n: any) => ({
          id: n.id,
          owner: n.ownerName || '未知'
        })),
        isOriginalOwner: (data.rootNode && data.rootNode.id) === Number(this.data.repoId)
      })
    }).catch(() => {})
  },

  loadHotIssues() {
    api.getIssueList(this.data.repoId, 1, 3).then((data: any) => {
      const pagination = data.pagination || {}
      const hotIssues = (data.issues || []).map((i: any) => ({
        id: i.id,
        title: i.title,
        status: i.status,
        answerCount: i.reply_count || 0,
        time: (i.create_time || '').split(' ')[0],
        hasBestAnswer: !!i.has_best_answer
      }))
      this.setData({ issueCount: pagination.total || 0, hotIssues })
    }).catch(() => {})
  },

  addEvent() {
    var repoType = this.data.repoInfo.type || 'item'
    wx.navigateTo({ url: '/pages/add-event/add-event?repoId=' + this.data.repoId + '&repoType=' + repoType })
  },

  goToIssues() {
    wx.navigateTo({ url: '/pages/issue-list/issue-list?repoId=' + this.data.repoId })
  },

  goToMentions() {
    wx.navigateTo({ url: '/pages/mentions/mentions' })
  },

  askQuestion() {
    wx.navigateTo({ url: '/pages/ask-question/ask-question?repoId=' + this.data.repoId })
  },

  goToIssueDetail(e: any) {
    const issueId = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/issue-detail/issue-detail?id=' + issueId + '&repoId=' + this.data.repoId })
  },

  initiateTransfer() {
    const repoType = this.data.repoInfo.type || 'item'
    if (repoType === 'place') {
      wx.showToast({ title: '地点型仓库不支持转让', icon: 'none' })
      return
    }
    wx.navigateTo({ url: '/pages/transfer-initiate/transfer-initiate?repoId=' + this.data.repoId })
  },

  showForkGraph() {
    wx.navigateTo({ url: '/pages/fork-graph/fork-graph?id=' + this.data.repoId })
  },

  deleteRepo() {
    wx.showModal({
      title: '删除仓库',
      content: '删除后不可恢复，确认删除吗？',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...', mask: true })
          api.deleteRepo(this.data.repoId).then(() => {
            wx.hideLoading()
            wx.showToast({ title: '已删除', icon: 'success' })
            setTimeout(() => wx.navigateBack(), 1500)
          }).catch(() => {
            wx.hideLoading()
          })
        }
      }
    })
  },

  deleteEvent(e: any) {
    const eventId = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除事件',
      content: '确认删除此事件记录吗？',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          api.deleteEvent(eventId).then(() => {
            wx.showToast({ title: '已删除', icon: 'success' })
            this.loadRepoDetail()
          })
        }
      }
    })
  },

  goToEventDetail(e: any) {
    const eventId = e.currentTarget.dataset.id
    const repoId = e.currentTarget.dataset.repoId
    wx.navigateTo({ url: '/pages/event-detail/event-detail?id=' + eventId + '&repoId=' + repoId })
  }
})
