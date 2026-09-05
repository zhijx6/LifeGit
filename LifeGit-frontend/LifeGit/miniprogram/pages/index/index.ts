// index.ts
import * as api from '../../utils/api'

Page({
  data: {
    motto: 'Hello World',
    userInfo: {
      avatarUrl: '',
      nickName: '',
    },
    hasUserInfo: false,
    showModal: false,
    formData: {
      name: '',
      brand: '',
      model: '',
      spec: '',
      type: 'item',
      images: [] as string[]
    }
  },
  onLoad() {
    const nickname = wx.getStorageSync('nickname') || ''
    const token = wx.getStorageSync('token')
    this.setData({
      'userInfo.nickName': nickname,
      hasUserInfo: !!nickname && !!token
    })
  },
  onShow() {},

  onImageError() {
    console.log('Banner图片加载失败')
  },

  goToLogin() {
    wx.navigateTo({ url: '/pages/login/login' })
  },

  onChooseAvatar(e: any) {
    const { avatarUrl } = e.detail
    const { nickName } = this.data.userInfo
    this.setData({
      "userInfo.avatarUrl": avatarUrl,
      hasUserInfo: nickName && avatarUrl,
    })
  },
  onInputChange(e: any) {
    const nickName = e.detail.value
    const { avatarUrl } = this.data.userInfo
    this.setData({
      "userInfo.nickName": nickName,
      hasUserInfo: nickName && avatarUrl,
    })
  },

  /**
   * 扫码创建仓库
   */
  scanCreateRepo() {
    wx.scanCode({
      success: (res) => {
        const barcode = res.result
        wx.showLoading({ title: '识别中...' })

        api.scanRepo(barcode).then((data: any) => {
          wx.hideLoading()
          const info = data.product_info
          wx.showModal({
            title: '商品信息',
            content: `产品: ${info.product_name}\n品牌: ${info.brand}\n型号: ${info.model || '-'}\n规格: ${info.specification || '-'}`,
            confirmText: '确认创建',
            success: (modalRes) => {
              if (modalRes.confirm) {
                wx.showLoading({ title: '创建中...' })
                api.confirmScanRepo({
                  product_name: info.product_name,
                  brand: info.brand,
                  model: info.model,
                  specification: info.specification,
                  main_image: info.main_image,
                  name: info.product_name,
                  type: 'item'
                }).then(() => {
                  wx.hideLoading()
                  wx.showToast({ title: '创建成功', icon: 'success' })
                }).catch(() => wx.hideLoading())
              }
            }
          })
        }).catch(() => {
          wx.hideLoading()
          wx.showToast({ title: '识别失败', icon: 'none' })
        })
      },
      fail: () => {
        wx.showToast({ title: '扫码失败', icon: 'none' })
      }
    })
  },

  showManualCreate() {
    this.setData({ showModal: true })
  },

  hideModal() {
    this.setData({
      showModal: false,
      formData: { name: '', brand: '', model: '', spec: '', type: 'item', images: [] as string[] }
    })
  },

  stopPropagation() {},

  onNameInput(e: any) { this.setData({ 'formData.name': e.detail.value }) },
  onBrandInput(e: any) { this.setData({ 'formData.brand': e.detail.value }) },
  onModelInput(e: any) { this.setData({ 'formData.model': e.detail.value }) },
  onSpecInput(e: any) { this.setData({ 'formData.spec': e.detail.value }) },

  onTypeSelect(e: any) {
    this.setData({ 'formData.type': e.currentTarget.dataset.type })
  },

  chooseImage() {
    const that = this
    wx.chooseImage({
      count: 9 - this.data.formData.images.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        that.setData({
          'formData.images': that.data.formData.images.concat(res.tempFilePaths)
        })
      }
    })
  },

  deleteImage(e: any) {
    const index = e.currentTarget.dataset.index
    const images = this.data.formData.images
    images.splice(index, 1)
    this.setData({ 'formData.images': images })
  },

  confirmCreate() {
    const { name, brand, model, spec, type, images } = this.data.formData

    if (!name) {
      wx.showToast({ title: '请输入名称', icon: 'none' })
      return
    }

    wx.showLoading({ title: '创建中...', mask: true })

    const uploadPromise = images.length > 0
      ? Promise.all(images.map((img: string) => api.uploadImage(img)))
      : Promise.resolve([])

    uploadPromise.then((urls: any[]) => {
      return api.createRepo({
        product_name: name,
        brand: brand || '未知品牌',
        model: model || '',
        specification: spec || '',
        type: type,
        main_image: urls[0] || ''
      })
    }).then(() => {
      wx.hideLoading()
      wx.showToast({ title: '仓库创建成功', icon: 'success' })
      this.hideModal()
    }).catch(() => {
      wx.hideLoading()
    })
  },

  goToNLPCreate() {
    wx.navigateTo({ url: '/pages/nlp-input/nlp-input' })
  }
})
