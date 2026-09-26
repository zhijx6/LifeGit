// pages/square/square.ts
import * as api from '../../utils/api'

Page({
  data: {
    keyword: '',
    repos: [] as any[],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false
  },

  onLoad() {
    this.loadRepos(true)
  },

  loadRepos(reset: boolean) {
    if (this.data.loading) return
    const page = reset ? 1 : this.data.page + 1
    this.setData({ loading: true })

    api.getSquareRepos(page, this.data.pageSize, this.data.keyword.trim()).then((data: any) => {
      const pagination = data.pagination || {}
      const repos = reset ? (data.repos || []) : this.data.repos.concat(data.repos || [])
      this.setData({
        repos,
        page,
        hasMore: page * this.data.pageSize < (pagination.total || 0),
        loading: false
      })
    }).catch(() => {
      this.setData({ loading: false })
    })
  },

  onKeywordInput(e: any) {
    this.setData({ keyword: e.detail.value })
  },

  onSearch() {
    this.loadRepos(true)
  },

  onClearKeyword() {
    this.setData({ keyword: '' })
    this.loadRepos(true)
  },

  loadMore() {
    if (!this.data.hasMore || this.data.loading) return
    this.loadRepos(false)
  },

  goToRepoDetail(e: any) {
    const repoId = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/repo-detail/repo-detail?id=' + repoId })
  }
})
