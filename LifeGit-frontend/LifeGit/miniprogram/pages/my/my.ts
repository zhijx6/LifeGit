// pages/my/my.ts
import * as api from '../../utils/api'

Page({
  data: {
    repos: [] as any[],
    loading: false,
    hasLogin: false,
    nickname: '',
    userId: '',
    showNicknameModal: false,
    newNickname: ''
  },

  onLoad() {
    this.loadMyRepos()
    const token = wx.getStorageSync('token')
    const nickname = wx.getStorageSync('nickname') || ''
    const userId = wx.getStorageSync('userId') || ''
    this.setData({ hasLogin: !!token, nickname, userId })
  },

  onShow() {
    const token = wx.getStorageSync('token')
    const nickname = wx.getStorageSync('nickname') || ''
    const userId = wx.getStorageSync('userId') || ''
    this.setData({ hasLogin: !!token, nickname, userId })
    if (token) {
      this.loadMyRepos()
    } else {
      this.setData({ repos: [], loading: false })
    }
  },

  loadMyRepos() {
    this.setData({ loading: true })

    api.getMyRepos().then((data: any) => {
      this.setData({
        repos: data.repos || [],
        loading: false
      })
    }).catch(() => {
      this.setData({ loading: false, repos: [] })
    })
  },

  goToRepoDetail(e: any) {
    const repoId = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/repo-detail/repo-detail?id=' + repoId })
  },

  goToCreate() {
    wx.switchTab({ url: '/pages/index/index' })
  },

  goToChangePassword() {
    wx.navigateTo({ url: '/pages/change-password/change-password' })
  },

  showEditNickname() {
    this.setData({ showNicknameModal: true, newNickname: this.data.nickname })
  },

  hideEditNickname() {
    this.setData({ showNicknameModal: false })
  },

  onNicknameInput(e: any) {
    this.setData({ newNickname: e.detail.value })
  },

  saveNickname() {
    const nickname = this.data.newNickname.trim()
    if (!nickname) {
      wx.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }
    wx.showLoading({ title: '保存中...', mask: true })
    api.updateProfile({ nickname }).then(() => {
      wx.hideLoading()
      wx.setStorageSync('nickname', nickname)
      this.setData({ nickname, showNicknameModal: false })
      wx.showToast({ title: '修改成功', icon: 'success' })
    }).catch(() => {
      wx.hideLoading()
    })
  },

  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确认退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('token')
          wx.removeStorageSync('userId')
          wx.removeStorageSync('nickname')
          wx.reLaunch({ url: '/pages/login/login' })
        }
      }
    })
  },

  onPullDownRefresh() {
    this.loadMyRepos()
    setTimeout(() => wx.stopPullDownRefresh(), 1000)
  }
})
