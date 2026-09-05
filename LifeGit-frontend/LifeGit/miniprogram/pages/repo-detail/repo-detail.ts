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
      this.setData({
        repoInfo: data.repoInfo || {},
        events: (data.events || []).sort((a: any, b: any) => {
          return new Date(b.time).getTime() - new Date(a.time).getTime()
        })
      })
    }).catch(() => {
      wx.hideLoading()
      wx.showToast({ title: '加载失败', icon: 'none' })
    })
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
    wx.navigateTo({ url: '/pages/event-form/event-form?type=transfer&repoId=' + this.data.repoId })
  },

  showForkGraph() {
    wx.navigateTo({ url: '/pages/fork-graph/fork-graph?repoId=' + this.data.repoId })
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
