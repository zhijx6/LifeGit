// app.ts
App<IAppOption>({
  globalData: {},
  onLaunch() {
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 检查是否已登录
    const token = wx.getStorageSync('token')
    if (!token) {
      // 未登录，跳转到登录页（login 是 pages 数组第一项，会自动作为启动页）
    }
  },
})
