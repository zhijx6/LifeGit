// pages/login/login.ts
import * as api from '../../utils/api'

Page({
  data: {
    isLogin: true,
    account: '',
    password: '',
    nickname: '',
    loading: false
  },

  toggleMode() {
    this.setData({ isLogin: !this.data.isLogin })
  },

  onAccountInput(e: any) {
    this.setData({ account: e.detail.value })
  },

  onPasswordInput(e: any) {
    this.setData({ password: e.detail.value })
  },

  onNicknameInput(e: any) {
    this.setData({ nickname: e.detail.value })
  },

  submit() {
    var isLogin = this.data.isLogin
    var account = this.data.account
    var password = this.data.password
    var nickname = this.data.nickname

    if (!account) {
      wx.showToast({ title: '请输入手机号或邮箱', icon: 'none' })
      return
    }
    if (!password || password.length < 6) {
      wx.showToast({ title: '密码至少6位', icon: 'none' })
      return
    }

    this.setData({ loading: true })

    var loginPromise
    if (isLogin) {
      loginPromise = api.authLogin({ account: account, password: password })
    } else {
      loginPromise = api.authRegister({ phone: account, password: password, nickname: nickname })
    }

    var that = this
    loginPromise.then(function(data: any) {
      wx.removeStorageSync('token')
      wx.removeStorageSync('userId')
      wx.removeStorageSync('nickname')
      wx.setStorageSync('token', data.token)
      wx.setStorageSync('userId', data.user_id)
      if (data.nickname) {
        wx.setStorageSync('nickname', data.nickname)
      }
      wx.showToast({ title: isLogin ? '登录成功' : '注册成功', icon: 'success' })
      setTimeout(function() {
        wx.switchTab({ url: '/pages/index/index' })
      }, 1000)
    }).catch(function() {
      // api.js 已处理 toast
    }).finally(function() {
      that.setData({ loading: false })
    })
  }
})
