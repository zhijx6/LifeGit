import * as api from '../../utils/api'

interface EventConfig {
  icon: string
  title: string
  subtitle: string
}

const eventConfigs: Record<string, EventConfig> = {
  // 物品型事件
  purchase: { icon: '🛒', title: '购入', subtitle: '记录购买信息、开箱体验' },
  maintenance: { icon: '🔧', title: '维护/维修', subtitle: '记录维护保养、维修记录' },
  upgrade: { icon: '⬆️', title: '升级', subtitle: '记录硬件升级、性能提升' },
  experience: { icon: '⭐', title: '使用体验', subtitle: '记录日常使用感受与评价' },
  memory: { icon: '💖', title: '体验节点', subtitle: '记录特殊时刻的深度体验' },
  fault: { icon: '⚠️', title: '故障/缺陷', subtitle: '记录故障现象、售后处理' },
  transfer: { icon: '🔄', title: '转让/出售', subtitle: '记录物品流转、完成生命周期闭环' },
  // 地点型事件
  visit: { icon: '📍', title: '到访打卡', subtitle: '记录每次到访的体验与花费' },
  review: { icon: '⭐', title: '菜品/体验评价', subtitle: '评价菜品口味、环境与服务' },
  info_change: { icon: '✏️', title: '信息变更', subtitle: '记录营业状态、菜单、价格等变更' },
  wishlist: { icon: '🔖', title: '待探/种草', subtitle: '标记想去的地点和理由' }
}

const conditionOptions = ['全新未使用', '九成新', '八成新', '七成新', '可用', '需维修', '故障']
const transferChannelOptions = ['闲鱼', '转转', '朋友圈', '线下交易', '亲友赠送', '其他']
const maintenanceTypeOptions = ['清洁保养', '更换配件', '系统更新', '性能优化', '预防性维护', '其他']
const upgradeTypeOptions = ['硬件升级', '软件升级', '配件改装', '外观改装', '性能优化', '其他']
const faultTypeOptions = ['硬件', '软件', '性能', '外观', '电池', '连接', '其他']
const transferTypeOptions = ['出售', '赠送', '置换', '丢失', '报废', '捐赠']
// 地点型选项
const waitTimeOptions = ['不用等', '15分钟内', '30分钟以上']
const waitTimeValues = ['none', 'within_15', 'over_30']
const overallRatingOptions = ['推荐', '一般', '不推荐']
const overallRatingValues = ['recommend', 'average', 'not_recommend']
const changeTypeOptions = ['营业状态变更', '价格调整', '菜单更新', '装修', '搬址', '歇业']
const changeTypeValues = ['business_status', 'price_change', 'menu_update', 'renovation', 'relocation', 'closure']
const sourceOptions = ['朋友推荐', '小红书', '路过看到', '其他']
const sourceValues = ['friend', 'xiaohongshu', 'passing_by', 'other']
const memoryTypeOptions = ['重要时刻', '难忘回忆', '成就感', '温馨时刻', '挑战突破', '第一次', '其他']
const memoryTypeValues = ['important_moment', 'unforgettable', 'achievement', 'warm_moment', 'challenge', 'first_time', 'other']

Page({
  data: {
    eventType: '',
    repoId: '',
    repoType: 'item',
    eventConfig: {} as EventConfig,
    today: '',
    channels: ['官网', '天猫', '京东', '线下门店', '其他'],
    channelIndex: -1,
    conditionOptions,
    conditionIndex: -1,
    transferChannelOptions,
    transferChannelIndex: -1,
    maintenanceTypeOptions,
    maintenanceTypeIndex: -1,
    upgradeTypeOptions,
    upgradeTypeIndex: -1,
    faultTypeOptions,
    faultTypeIndex: -1,
    transferTypeOptions,
    transferTypeIndex: -1,
    experienceRating: 0,
    // 地点型 picker 索引
    waitTimeOptions,
    waitTimeIndex: -1,
    overallRatingOptions,
    overallRatingIndex: -1,
    changeTypeOptions,
    changeTypeIndex: -1,
    sourceOptions,
    sourceIndex: -1,
    memoryTypeOptions,
    memoryTypeIndex: -1,
    overallRatingIndex: -1,
    changeTypeIndex: -1,
    sourceIndex: -1,
    // 地点型评分
    tasteRating: 0,
    environmentRating: 0,
    serviceRating: 0,
    // 体验节点评分
    emotionalRating: 0,
    // 转让相关
    repoInfo: {} as any,
    isGenerating: false,
    transferLink: '',
    qrcodeUrl: '',
    requireVerification: true,
    autoCreateEvent: true,
    formData: {
      // 购入事件
      purchaseDate: '',
      price: '',
      channel: '',
      unboxImages: [] as string[],
      initialExperience: '',
      // 维护/维修事件
      maintenanceDate: '',
      maintenanceItem: '',
      maintenanceCost: '',
      repairShop: '',
      partImages: [] as string[],
      receiptImages: [] as string[],
      // 升级事件
      upgradeDate: '',
      upgradeItem: '',
      upgradeCost: '',
      performanceExperience: '',
      // 使用体验事件
      experienceDate: '',
      experienceTitle: '',
      sceneDescription: '',
      experienceFeeling: '',
      experienceImages: [] as string[],
      // 体验节点事件
      memoryDate: '',
      memoryTitle: '',
      memoryType: '',
      participants: '',
      location: '',
      emotionalRating: 0,
      keywords: '',
      storyBackground: '',
      emotionalExperience: '',
      learnings: '',
      memoryImages: [] as string[],
      // 故障/缺陷事件
      faultDate: '',
      faultPhenomenon: '',
      faultFrequency: '',
      isResolved: '',
      officialResponse: '',
      // 转让/出售事件
      transferDate: '',
      transferPrice: '',
      transferCondition: '',
      transferAccessories: '',
      transferReason: '',
      transferChannel: '',
      transferMessage: '',
      transferTips: '',
      transferImages: [] as string[],
      transferReceiptImages: [] as string[],
      // === 地点型事件 ===
      // 到访打卡
      visitDate: '',
      waitTime: '',
      amountPaid: '',
      visitPhotos: [] as string[],
      // 菜品/体验评价
      overallRating: '',
      tasteRating: 0,
      environmentRating: 0,
      serviceRating: 0,
      perCapitaCost: '',
      recommendedDishes: '',
      dislikedDishes: '',
      detailReview: '',
      reviewImages: [] as string[],
      // 信息变更
      changeType: '',
      changeDescription: '',
      evidenceImages: [] as string[],
      // 待探/种草
      reason: '',
      source: '',
      plannedDate: ''
    }
  },

  onLoad(options: any) {
    const { type, repoId, repoType } = options
    const today = new Date().toISOString().split('T')[0]

    this.setData({
      eventType: type,
      repoId: repoId,
      repoType: repoType || 'item',
      eventConfig: eventConfigs[type] || eventConfigs.purchase,
      today,
      'formData.visitDate': today,
      'formData.memoryDate': today
    })

    wx.setNavigationBarTitle({
      title: eventConfigs[type] && eventConfigs[type].title || '添加事件'
    })

    if (type === 'transfer') {
      this.loadRepoInfo(repoId)
    }
  },

  loadRepoInfo(repoId: string) {
    api.getRepoDetail(repoId).then((data: any) => {
      this.setData({ repoInfo: data.repoInfo || {} })
    }).catch(() => {})
  },

  // ===== 购入事件 =====
  onPurchaseDateChange(e: any) { this.setData({ 'formData.purchaseDate': e.detail.value }) },
  onPriceInput(e: any) { this.setData({ 'formData.price': e.detail.value }) },
  onChannelChange(e: any) {
    const index = parseInt(e.detail.value)
    this.setData({ channelIndex: index, 'formData.channel': this.data.channels[index] })
  },
  onInitialExperienceInput(e: any) { this.setData({ 'formData.initialExperience': e.detail.value }) },
  chooseUnboxImage() {
    const that = this
    wx.chooseImage({
      count: 9 - this.data.formData.unboxImages.length,
      sizeType: ['compressed'], sourceType: ['album', 'camera'],
      success(res) { that.setData({ 'formData.unboxImages': that.data.formData.unboxImages.concat(res.tempFilePaths) }) }
    })
  },
  deleteUnboxImage(e: any) {
    const images = this.data.formData.unboxImages
    images.splice(e.currentTarget.dataset.index, 1)
    this.setData({ 'formData.unboxImages': images })
  },

  // ===== 维护/维修事件 =====
  onMaintenanceDateChange(e: any) { this.setData({ 'formData.maintenanceDate': e.detail.value }) },
  onMaintenanceTypeChange(e: any) {
    const index = parseInt(e.detail.value)
    this.setData({ maintenanceTypeIndex: index, 'formData.maintenanceType': maintenanceTypeOptions[index] })
  },
  onMaintenanceItemInput(e: any) { this.setData({ 'formData.maintenanceItem': e.detail.value }) },
  onMaintenanceCostInput(e: any) { this.setData({ 'formData.maintenanceCost': e.detail.value }) },
  onRepairShopInput(e: any) { this.setData({ 'formData.repairShop': e.detail.value }) },
  choosePartImage() {
    const that = this
    wx.chooseImage({
      count: 9 - this.data.formData.partImages.length,
      sizeType: ['compressed'], sourceType: ['album', 'camera'],
      success(res) { that.setData({ 'formData.partImages': that.data.formData.partImages.concat(res.tempFilePaths) }) }
    })
  },
  deletePartImage(e: any) {
    const images = this.data.formData.partImages
    images.splice(e.currentTarget.dataset.index, 1)
    this.setData({ 'formData.partImages': images })
  },
  chooseReceiptImage() {
    const that = this
    wx.chooseImage({
      count: 9 - this.data.formData.receiptImages.length,
      sizeType: ['compressed'], sourceType: ['album', 'camera'],
      success(res) { that.setData({ 'formData.receiptImages': that.data.formData.receiptImages.concat(res.tempFilePaths) }) }
    })
  },
  deleteReceiptImage(e: any) {
    const images = this.data.formData.receiptImages
    images.splice(e.currentTarget.dataset.index, 1)
    this.setData({ 'formData.receiptImages': images })
  },

  // ===== 升级事件 =====
  onUpgradeDateChange(e: any) { this.setData({ 'formData.upgradeDate': e.detail.value }) },
  onUpgradeTypeChange(e: any) {
    const index = parseInt(e.detail.value)
    this.setData({ upgradeTypeIndex: index, 'formData.upgradeType': upgradeTypeOptions[index] })
  },
  onUpgradeItemInput(e: any) { this.setData({ 'formData.upgradeItem': e.detail.value }) },
  onUpgradeCostInput(e: any) { this.setData({ 'formData.upgradeCost': e.detail.value }) },
  onPerformanceExperienceInput(e: any) { this.setData({ 'formData.performanceExperience': e.detail.value }) },

  // ===== 使用体验事件 =====
  onExperienceDateChange(e: any) { this.setData({ 'formData.experienceDate': e.detail.value }) },
  onExperienceTitleInput(e: any) { this.setData({ 'formData.experienceTitle': e.detail.value }) },
  setRating(e: any) {
    const rating = parseInt(e.currentTarget.dataset.value)
    this.setData({ experienceRating: rating, 'formData.experienceRating': rating })
  },
  onSceneDescriptionInput(e: any) { this.setData({ 'formData.sceneDescription': e.detail.value }) },
  onExperienceFeelingInput(e: any) { this.setData({ 'formData.experienceFeeling': e.detail.value }) },
  chooseExperienceImage() {
    const that = this
    wx.chooseImage({
      count: 9 - this.data.formData.experienceImages.length,
      sizeType: ['compressed'], sourceType: ['album', 'camera'],
      success(res) { that.setData({ 'formData.experienceImages': that.data.formData.experienceImages.concat(res.tempFilePaths) }) }
    })
  },
  deleteExperienceImage(e: any) {
    const images = this.data.formData.experienceImages
    images.splice(e.currentTarget.dataset.index, 1)
    this.setData({ 'formData.experienceImages': images })
  },

  // ===== 体验节点事件 =====
  onMemoryDateChange(e: any) { this.setData({ 'formData.memoryDate': e.detail.value }) },
  onMemoryTitleInput(e: any) { this.setData({ 'formData.memoryTitle': e.detail.value }) },
  onMemoryTypeChange(e: any) {
    const index = parseInt(e.detail.value)
    this.setData({ memoryTypeIndex: index, 'formData.memoryType': memoryTypeValues[index] })
  },
  onParticipantsInput(e: any) { this.setData({ 'formData.participants': e.detail.value }) },
  onLocationInput(e: any) { this.setData({ 'formData.location': e.detail.value }) },
  setEmotionalRating(e: any) {
    const rating = parseInt(e.currentTarget.dataset.value)
    this.setData({ emotionalRating: rating, 'formData.emotionalRating': rating })
  },
  onKeywordsInput(e: any) { this.setData({ 'formData.keywords': e.detail.value }) },
  onStoryBackgroundInput(e: any) { this.setData({ 'formData.storyBackground': e.detail.value }) },
  onEmotionalExperienceInput(e: any) { this.setData({ 'formData.emotionalExperience': e.detail.value }) },
  onLearningsInput(e: any) { this.setData({ 'formData.learnings': e.detail.value }) },
  chooseMemoryImage() {
    const that = this
    wx.chooseImage({
      count: 12 - this.data.formData.memoryImages.length,
      sizeType: ['compressed'], sourceType: ['album', 'camera'],
      success(res) { that.setData({ 'formData.memoryImages': that.data.formData.memoryImages.concat(res.tempFilePaths) }) }
    })
  },
  deleteMemoryImage(e: any) {
    const images = this.data.formData.memoryImages
    images.splice(e.currentTarget.dataset.index, 1)
    this.setData({ 'formData.memoryImages': images })
  },

  // ===== 故障/缺陷事件 =====
  onFaultDateChange(e: any) { this.setData({ 'formData.faultDate': e.detail.value }) },
  onFaultTypeChange(e: any) {
    const index = parseInt(e.detail.value)
    this.setData({ faultTypeIndex: index, 'formData.faultType': faultTypeOptions[index] })
  },
  onFaultPhenomenonInput(e: any) { this.setData({ 'formData.faultPhenomenon': e.detail.value }) },
  onFaultFrequencyChange(e: any) { this.setData({ 'formData.faultFrequency': e.currentTarget.dataset.value }) },
  onIsResolvedChange(e: any) { this.setData({ 'formData.isResolved': e.currentTarget.dataset.value }) },
  onOfficialResponseInput(e: any) { this.setData({ 'formData.officialResponse': e.detail.value }) },

  // ===== 转让/出售事件 =====
  onTransferDateChange(e: any) { this.setData({ 'formData.transferDate': e.detail.value }) },
  onTransferTypeChange(e: any) {
    const index = parseInt(e.detail.value)
    this.setData({ transferTypeIndex: index, 'formData.transferType': transferTypeOptions[index] })
  },
  onTransferPriceInput(e: any) { this.setData({ 'formData.transferPrice': e.detail.value }) },
  onConditionChange(e: any) {
    const index = parseInt(e.detail.value)
    this.setData({ conditionIndex: index, 'formData.transferCondition': conditionOptions[index] })
  },
  onTransferAccessoriesInput(e: any) { this.setData({ 'formData.transferAccessories': e.detail.value }) },
  onTransferReasonInput(e: any) { this.setData({ 'formData.transferReason': e.detail.value }) },
  onTransferChannelChange(e: any) {
    const index = parseInt(e.detail.value)
    this.setData({ transferChannelIndex: index, 'formData.transferChannel': transferChannelOptions[index] })
  },
  onTransferMessageInput(e: any) { this.setData({ 'formData.transferMessage': e.detail.value }) },
  onTransferTipsInput(e: any) { this.setData({ 'formData.transferTips': e.detail.value }) },
  chooseTransferImage() {
    const that = this
    wx.chooseImage({
      count: 9 - this.data.formData.transferImages.length,
      sizeType: ['compressed'], sourceType: ['album', 'camera'],
      success(res) { that.setData({ 'formData.transferImages': that.data.formData.transferImages.concat(res.tempFilePaths) }) }
    })
  },
  deleteTransferImage(e: any) {
    const images = this.data.formData.transferImages
    images.splice(e.currentTarget.dataset.index, 1)
    this.setData({ 'formData.transferImages': images })
  },
  chooseTransferReceiptImage() {
    const that = this
    wx.chooseImage({
      count: 9 - this.data.formData.transferReceiptImages.length,
      sizeType: ['compressed'], sourceType: ['album', 'camera'],
      success(res) { that.setData({ 'formData.transferReceiptImages': that.data.formData.transferReceiptImages.concat(res.tempFilePaths) }) }
    })
  },
  deleteTransferReceiptImage(e: any) {
    const images = this.data.formData.transferReceiptImages
    images.splice(e.currentTarget.dataset.index, 1)
    this.setData({ 'formData.transferReceiptImages': images })
  },

  // ===== 转让链接/设置 =====
  generateTransferLink() {
    this.setData({ isGenerating: true })
    setTimeout(() => {
      const transferCode = 'TF' + Date.now().toString(36).toUpperCase()
      const link = `https://your-domain.com/transfer/${transferCode}`
      const qrcodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`
      this.setData({ transferLink: link, qrcodeUrl, isGenerating: false })
      wx.showToast({ title: '生成成功', icon: 'success' })
    }, 1500)
  },
  copyLink() {
    wx.setClipboardData({ data: this.data.transferLink, success: () => wx.showToast({ title: '链接已复制', icon: 'success' }) })
  },
  toggleVerification() { this.setData({ requireVerification: !this.data.requireVerification }) },
  toggleAutoEvent() { this.setData({ autoCreateEvent: !this.data.autoCreateEvent }) },

  // ===== 地点型：到访打卡 =====
  onVisitDateChange(e: any) { this.setData({ 'formData.visitDate': e.detail.value }) },
  onWaitTimeChange(e: any) {
    const index = parseInt(e.detail.value)
    this.setData({ waitTimeIndex: index, 'formData.waitTime': waitTimeValues[index] })
  },
  onAmountPaidInput(e: any) { this.setData({ 'formData.amountPaid': e.detail.value }) },
  chooseVisitPhoto() {
    const that = this
    wx.chooseImage({
      count: 9 - this.data.formData.visitPhotos.length,
      sizeType: ['compressed'], sourceType: ['album', 'camera'],
      success(res) { that.setData({ 'formData.visitPhotos': that.data.formData.visitPhotos.concat(res.tempFilePaths) }) }
    })
  },
  deleteVisitPhoto(e: any) {
    const images = this.data.formData.visitPhotos
    images.splice(e.currentTarget.dataset.index, 1)
    this.setData({ 'formData.visitPhotos': images })
  },

  // ===== 地点型：菜品/体验评价 =====
  onOverallRatingChange(e: any) {
    const index = parseInt(e.detail.value)
    this.setData({ overallRatingIndex: index, 'formData.overallRating': overallRatingValues[index] })
  },
  onOverallRatingTap(e: any) {
    const index = parseInt(e.currentTarget.dataset.index)
    this.setData({ overallRatingIndex: index, 'formData.overallRating': overallRatingValues[index] })
  },
  setTasteRating(e: any) {
    const rating = parseInt(e.currentTarget.dataset.value)
    this.setData({ tasteRating: rating, 'formData.tasteRating': rating })
  },
  setEnvironmentRating(e: any) {
    const rating = parseInt(e.currentTarget.dataset.value)
    this.setData({ environmentRating: rating, 'formData.environmentRating': rating })
  },
  setServiceRating(e: any) {
    const rating = parseInt(e.currentTarget.dataset.value)
    this.setData({ serviceRating: rating, 'formData.serviceRating': rating })
  },
  onPerCapitaCostInput(e: any) { this.setData({ 'formData.perCapitaCost': e.detail.value }) },
  onRecommendedDishesInput(e: any) { this.setData({ 'formData.recommendedDishes': e.detail.value }) },
  onDislikedDishesInput(e: any) { this.setData({ 'formData.dislikedDishes': e.detail.value }) },
  onDetailReviewInput(e: any) { this.setData({ 'formData.detailReview': e.detail.value }) },
  chooseReviewImage() {
    const that = this
    wx.chooseImage({
      count: 9 - this.data.formData.reviewImages.length,
      sizeType: ['compressed'], sourceType: ['album', 'camera'],
      success(res) { that.setData({ 'formData.reviewImages': that.data.formData.reviewImages.concat(res.tempFilePaths) }) }
    })
  },
  deleteReviewImage(e: any) {
    const images = this.data.formData.reviewImages
    images.splice(e.currentTarget.dataset.index, 1)
    this.setData({ 'formData.reviewImages': images })
  },

  // ===== 地点型：信息变更 =====
  onChangeTypeChange(e: any) {
    const index = parseInt(e.detail.value)
    this.setData({ changeTypeIndex: index, 'formData.changeType': changeTypeValues[index] })
  },
  onChangeDescriptionInput(e: any) { this.setData({ 'formData.changeDescription': e.detail.value }) },
  chooseEvidenceImage() {
    const that = this
    wx.chooseImage({
      count: 9 - this.data.formData.evidenceImages.length,
      sizeType: ['compressed'], sourceType: ['album', 'camera'],
      success(res) { that.setData({ 'formData.evidenceImages': that.data.formData.evidenceImages.concat(res.tempFilePaths) }) }
    })
  },
  deleteEvidenceImage(e: any) {
    const images = this.data.formData.evidenceImages
    images.splice(e.currentTarget.dataset.index, 1)
    this.setData({ 'formData.evidenceImages': images })
  },

  // ===== 地点型：待探/种草 =====
  onReasonInput(e: any) { this.setData({ 'formData.reason': e.detail.value }) },
  onSourceChange(e: any) {
    const index = parseInt(e.detail.value)
    this.setData({ sourceIndex: index, 'formData.source': sourceValues[index] })
  },
  onPlannedDateChange(e: any) { this.setData({ 'formData.plannedDate': e.detail.value }) },

  onCancel() { wx.navigateBack() },

  // ===== 构建事件数据 =====
  buildEventData(): any {
    const fd = this.data.formData
    const map: Record<string, any> = {
      purchase: {
        purchase_date: fd.purchaseDate,
        price: parseFloat(fd.price) || 0,
        channel: fd.channel,
        initial_experience: fd.initialExperience
      },
      maintenance: {
        maintenance_date: fd.maintenanceDate,
        maintenance_project: fd.maintenanceItem,
        maintenance_type: fd.maintenanceType || '其他',
        cost: parseFloat(fd.maintenanceCost) || 0,
        service_provider: fd.repairShop
      },
      upgrade: {
        upgrade_date: fd.upgradeDate,
        upgrade_items: fd.upgradeItem,
        upgrade_type: fd.upgradeType || '其他',
        cost: parseFloat(fd.upgradeCost) || 0,
        performance_improvement: fd.performanceExperience
      },
      experience: {
        experience_date: fd.experienceDate,
        rating: fd.experienceRating || 5,
        content: fd.experienceTitle + '\n' + (fd.sceneDescription || ''),
        content_detail: fd.experienceFeeling
      },
      memory: {
        memory_date: fd.memoryDate,
        memory_title: fd.memoryTitle,
        memory_type: fd.memoryType,
        participants: fd.participants,
        location: fd.location,
        emotional_rating: fd.emotionalRating || 0,
        keywords: fd.keywords ? fd.keywords.split(/[,，、\s]+/).filter(Boolean) : [],
        story_background: fd.storyBackground,
        emotional_experience: fd.emotionalExperience,
        learnings: fd.learnings
      },
      fault: {
        fault_date: fd.faultDate,
        fault_description: fd.faultPhenomenon,
        fault_frequency: fd.faultFrequency || 'first',
        fault_type: fd.faultType || '其他',
        is_repaired: fd.isResolved === 'yes',
        official_response: fd.officialResponse
      },
      transfer: {
        transfer_date: fd.transferDate,
        transfer_type: fd.transferType || '出售',
        transfer_price: parseFloat(fd.transferPrice) || 0,
        item_condition: fd.transferCondition,
        includes_accessories: fd.transferAccessories,
        transfer_reason: fd.transferReason,
        transfer_channel: fd.transferChannel,
        message_to_next_owner: fd.transferMessage,
        usage_tips: fd.transferTips
      },
      // 地点型事件
      visit: {
        visit_date: fd.visitDate,
        wait_time: fd.waitTime || 'none',
        amount_paid: parseFloat(fd.amountPaid) || 0
      },
      review: {
        overall_rating: fd.overallRating,
        taste_rating: fd.tasteRating,
        environment_rating: fd.environmentRating,
        service_rating: fd.serviceRating,
        per_capita_cost: parseFloat(fd.perCapitaCost) || 0,
        recommended_dishes: fd.recommendedDishes ? fd.recommendedDishes.split(/[,，、\s]+/).filter(Boolean) : [],
        disliked_dishes: fd.dislikedDishes ? fd.dislikedDishes.split(/[,，、\s]+/).filter(Boolean) : [],
        detail_review: fd.detailReview
      },
      info_change: {
        change_type: fd.changeType,
        change_description: fd.changeDescription
      },
      wishlist: {
        reason: fd.reason,
        source: fd.source,
        planned_date: fd.plannedDate
      }
    }
    return map[this.data.eventType]
  },

  // ===== 提交流程 =====
  onSubmit() {
    if (!this.validateForm()) return

    const eventData = this.buildEventData()
    const that = this

    // 先调用后端检查是否需要确认
    api.checkEventConfirmation(this.data.eventType, eventData).then(function(check: any) {
      if (check && check.requires) {
        wx.showModal({
          title: check.title || '负面信息确认',
          content: check.message || '此记录将公开，可能帮助他人避坑，是否确认提交？',
          confirmText: '确认提交',
          cancelText: '再想想',
          success: function(res) {
            if (res.confirm) {
              that.submitForm()
            }
          }
        })
      } else {
        that.submitForm()
      }
    }).catch(function() {
      // 检查接口失败时直接提交
      that.submitForm()
    })
  },

  submitForm() {
    const { eventType, repoId } = this.data
    const fd = this.data.formData
    const eventData = this.buildEventData()
    const that = this

    // 需要上传图片的事件类型
    var imageFields: Array<{key: string, field: string}> = []
    if (eventType === 'transfer') {
      imageFields = [
        { key: 'transferImages', field: 'item_photos' },
        { key: 'transferReceiptImages', field: 'transfer_receipt_photos' }
      ]
    } else if (eventType === 'visit') {
      imageFields = [{ key: 'visitPhotos', field: 'photos' }]
    } else if (eventType === 'review') {
      imageFields = [{ key: 'reviewImages', field: 'images' }]
    } else if (eventType === 'info_change') {
      imageFields = [{ key: 'evidenceImages', field: 'evidence_images' }]
    }

    var allPaths: string[] = []
    for (var i = 0; i < imageFields.length; i++) {
      allPaths = allPaths.concat(fd[imageFields[i].key] || [])
    }

    var uploadPromise = allPaths.length > 0
      ? Promise.all(allPaths.map(function(img: string) { return api.uploadImage(img) }))
      : Promise.resolve([] as string[])

    wx.showLoading({ title: '保存中...', mask: true })

    uploadPromise.then(function(urls: string[]) {
      var offset = 0
      for (var i = 0; i < imageFields.length; i++) {
        var arr = (fd as any)[imageFields[i].key] as string[]
        if (arr && arr.length > 0) {
          ;(eventData as any)[imageFields[i].field] = urls.slice(offset, offset + arr.length)
          offset += arr.length
        }
      }

      // 地点型评价 overall_rating 为 not_recommend 时设置 skip_confirmation
      var skip = eventType !== 'review' || (eventData as any).overall_rating !== 'not_recommend'
      return api.createEvent(repoId, eventType, eventData, skip)
    }).then(function() {
      wx.hideLoading()
      if (eventType === 'transfer') {
        if (!that.data.transferLink) {
          that.generateTransferLink()
        } else {
          wx.showToast({ title: '转让完成', icon: 'success' })
          setTimeout(function() { wx.navigateBack() }, 1500)
        }
      } else {
        wx.showToast({ title: '保存成功', icon: 'success' })
        setTimeout(function() { wx.navigateBack() }, 1500)
      }
    }).catch(function(err: any) {
      console.error('submitForm error:', JSON.stringify(err))
      wx.hideLoading()
      if (err && err.code === 202) {
        wx.showModal({
          title: '评价确认',
          content: '你给出了不推荐的评价，确认提交吗？',
          confirmText: '确认提交',
          cancelText: '再想想',
          success: function(res) {
            if (res.confirm) {
              that.submitWithConfirmation()
            }
          }
        })
      } else if (err && err.message) {
        wx.showToast({ title: err.message, icon: 'none' })
      } else {
        wx.showToast({ title: '保存失败', icon: 'none' })
      }
    })
  },

  submitWithConfirmation() {
    const { eventType, repoId } = this.data
    const eventData = this.buildEventData()
    wx.showLoading({ title: '保存中...', mask: true })
    api.createEvent(repoId, eventType, eventData, true).then(function() {
      wx.hideLoading()
      wx.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(function() { wx.navigateBack() }, 1500)
    }).catch(function(err: any) {
      wx.hideLoading()
      wx.showToast({ title: (err && err.message) || '保存失败', icon: 'none' })
    })
  },

  // ===== 表单验证 =====
  validateForm(): boolean {
    const { eventType, formData: fd } = this.data

    switch (eventType) {
      case 'purchase':
        if (!fd.purchaseDate) { wx.showToast({ title: '请选择购入时间', icon: 'none' }); return false }
        if (!fd.price) { wx.showToast({ title: '请输入购入价格', icon: 'none' }); return false }
        break
      case 'maintenance':
        if (!fd.maintenanceDate) { wx.showToast({ title: '请选择维护时间', icon: 'none' }); return false }
        if (!fd.maintenanceType) { wx.showToast({ title: '请选择维护类型', icon: 'none' }); return false }
        if (!fd.maintenanceItem) { wx.showToast({ title: '请输入维护项目', icon: 'none' }); return false }
        break
      case 'upgrade':
        if (!fd.upgradeDate) { wx.showToast({ title: '请选择升级时间', icon: 'none' }); return false }
        if (!fd.upgradeType) { wx.showToast({ title: '请选择升级类型', icon: 'none' }); return false }
        if (!fd.upgradeItem) { wx.showToast({ title: '请输入升级项目', icon: 'none' }); return false }
        break
      case 'experience':
        if (!fd.experienceDate) { wx.showToast({ title: '请选择体验时间', icon: 'none' }); return false }
        if (!fd.experienceRating) { wx.showToast({ title: '请选择评分', icon: 'none' }); return false }
        if (!fd.experienceTitle) { wx.showToast({ title: '请输入体验标题', icon: 'none' }); return false }
        break
      case 'memory':
        if (!fd.memoryDate) { wx.showToast({ title: '请选择体验时间', icon: 'none' }); return false }
        if (!fd.memoryTitle) { wx.showToast({ title: '请输入标题', icon: 'none' }); return false }
        if (!fd.memoryType) { wx.showToast({ title: '请选择体验类型', icon: 'none' }); return false }
        break
      case 'fault':
        if (!fd.faultDate) { wx.showToast({ title: '请选择发生时间', icon: 'none' }); return false }
        if (!fd.faultType) { wx.showToast({ title: '请选择故障类型', icon: 'none' }); return false }
        if (!fd.faultPhenomenon) { wx.showToast({ title: '请输入故障现象', icon: 'none' }); return false }
        break
      case 'transfer':
        if (!fd.transferDate) { wx.showToast({ title: '请选择转让时间', icon: 'none' }); return false }
        if (!fd.transferType) { wx.showToast({ title: '请选择转让类型', icon: 'none' }); return false }
        if (!fd.transferPrice) { wx.showToast({ title: '请输入转让价格', icon: 'none' }); return false }
        break
      // 地点型验证
      case 'visit':
        if (!fd.visitDate) { wx.showToast({ title: '请选择到访日期', icon: 'none' }); return false }
        break
      case 'review':
        if (!fd.overallRating) { wx.showToast({ title: '请选择总体评价', icon: 'none' }); return false }
        if (!fd.tasteRating) { wx.showToast({ title: '请选择口味评分', icon: 'none' }); return false }
        if (!fd.environmentRating) { wx.showToast({ title: '请选择环境评分', icon: 'none' }); return false }
        if (!fd.serviceRating) { wx.showToast({ title: '请选择服务评分', icon: 'none' }); return false }
        break
      case 'info_change':
        if (!fd.changeType) { wx.showToast({ title: '请选择变更类型', icon: 'none' }); return false }
        if (!fd.changeDescription) { wx.showToast({ title: '请填写变更描述', icon: 'none' }); return false }
        break
      case 'wishlist':
        if (!fd.reason) { wx.showToast({ title: '请填写想去的理由', icon: 'none' }); return false }
        if (!fd.source) { wx.showToast({ title: '请选择信息来源', icon: 'none' }); return false }
        break
    }
    return true
  }
})
