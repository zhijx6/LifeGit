// pages/issue-list/issue-list.ts
import * as api from '../../utils/api'

Page({
  data: {
    repoId: '',
    activeFilter: 'all',
    stats: { total: 0, answered: 0, open: 0 },
    issues: [] as any[],
    filteredIssues: [] as any[]
  },

  onLoad(options: any) {
    this.setData({ repoId: options.repoId })
    this.loadIssues()
  },

  loadIssues() {
    wx.showLoading({ title: '加载中...', mask: true })

    const status = this.data.activeFilter === 'all' ? '' : this.data.activeFilter
    api.getIssueList(this.data.repoId, 1, 50, status).then((data: any) => {
      wx.hideLoading()

      const statusMap: Record<string, string> = {
        open: '待解答', answered: '已解答', closed: '已关闭'
      }

      const issues = (data.issues || []).map((i: any) => ({
        id: i.id,
        title: i.title,
        content: i.content,
        status: i.status,
        statusText: statusMap[i.status] || i.status,
        hasBestAnswer: !!i.has_best_answer,
        answerCount: i.reply_count || 0,
        author: {
          id: i.creator_id,
          name: '用户' + i.creator_id,
          avatar: ''
        },
        createTime: i.create_time || ''
      }))

      const answeredCount = issues.filter((i: any) => i.status === 'answered').length
      const openCount = issues.filter((i: any) => i.status === 'open').length

      this.setData({
        issues,
        filteredIssues: issues,
        stats: { total: issues.length, answered: answeredCount, open: openCount }
      })
    }).catch(() => {
      wx.hideLoading()
      this.setData({ issues: [], filteredIssues: [] })
    })
  },

  switchFilter(e: any) {
    const filter = e.currentTarget.dataset.filter
    this.setData({ activeFilter: filter })

    if (filter === 'all') {
      this.setData({ filteredIssues: this.data.issues })
    } else {
      this.setData({
        filteredIssues: this.data.issues.filter((i: any) => i.status === filter)
      })
    }
  },

  goToDetail(e: any) {
    const issueId = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/issue-detail/issue-detail?id=' + issueId + '&repoId=' + this.data.repoId })
  },

  askQuestion() {
    wx.navigateTo({ url: '/pages/ask-question/ask-question?repoId=' + this.data.repoId })
  }
})
