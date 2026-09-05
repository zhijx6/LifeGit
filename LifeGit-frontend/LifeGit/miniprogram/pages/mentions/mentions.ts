import * as api from '../../utils/api'

Page({
  data: {
    mentions: [] as any[],
    unreadCount: 0,
    page: 1,
    loading: false
  },

  onLoad() {
    this.loadMentions()
  },

  onShow() {
    this.loadMentions()
  },

  loadMentions() {
    this.setData({ loading: true, page: 1 })
    api.getMyMentions(1, 50).then((data: any) => {
      this.setData({
        mentions: data.mentions || [],
        unreadCount: data.unread_count || 0,
        loading: false
      })
    }).catch(() => {
      this.setData({ loading: false })
    })
  },

  loadMore() {
    // simple impl - already loads 50
  },

  markAllRead() {
    api.readAllMentions().then(() => {
      const mentions = this.data.mentions.map((m: any) => ({ ...m, is_read: 1 }))
      this.setData({ mentions, unreadCount: 0 })
      wx.showToast({ title: '已全部标记已读', icon: 'success' })
    })
  },

  goToIssue(e: any) {
    const issueId = e.currentTarget.dataset.issueId
    const item = this.data.mentions.find((m: any) => m.issue_id === issueId)
    if (item && !item.is_read) {
      api.readMention(item.id).then(() => {
        this.setData({ [`mentions[${this.data.mentions.indexOf(item)}].is_read`]: 1 })
      })
    }
    wx.navigateTo({ url: '/pages/issue-detail/issue-detail?id=' + issueId + '&repoId=' })
  }
})
