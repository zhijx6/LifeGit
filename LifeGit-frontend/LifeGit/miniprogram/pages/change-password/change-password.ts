import * as api from '../../utils/api'

Page({
  data: {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    loading: false
  },

  onOldPasswordInput(e: any) { this.setData({ oldPassword: e.detail.value }) },
  onNewPasswordInput(e: any) { this.setData({ newPassword: e.detail.value }) },
  onConfirmPasswordInput(e: any) { this.setData({ confirmPassword: e.detail.value }) },

  submit() {
    const { oldPassword, newPassword, confirmPassword } = this.data

    if (!oldPassword) {
      wx.showToast({ title: '请输入当前密码', icon: 'none' })
      return
    }
    if (!newPassword || newPassword.length < 6) {
      wx.showToast({ title: '新密码至少6位', icon: 'none' })
      return
    }
    if (newPassword !== confirmPassword) {
      wx.showToast({ title: '两次密码不一致', icon: 'none' })
      return
    }
    if (oldPassword === newPassword) {
      wx.showToast({ title: '新密码不能与当前密码相同', icon: 'none' })
      return
    }

    this.setData({ loading: true })

    api.changePassword({
      old_password: oldPassword,
      new_password: newPassword
    }).then(() => {
      wx.showToast({ title: '修改成功，请重新登录', icon: 'success' })
      wx.removeStorageSync('token')
      wx.removeStorageSync('userId')
      wx.removeStorageSync('nickname')
      setTimeout(() => {
        wx.reLaunch({ url: '/pages/login/login' })
      }, 1500)
    }).catch(() => {
    }).finally(() => {
      this.setData({ loading: false })
    })
  }
})
