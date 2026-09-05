// pages/ask-question/ask-question.ts
import * as api from '../../utils/api'

Page({
  data: {
    repoId: '',
    questionTitle: '',
    questionContent: '',
    tags: [] as string[],
    tagInput: '',
    isAnonymous: false,
    relatedCommits: [] as any[],
    availableCommits: [] as any[],
    showCommitSelector: false,
    selectedCommits: [] as string[]
  },

  onLoad(options: any) {
    this.setData({ repoId: options.repoId })
    this.loadAvailableCommits()
  },

  loadAvailableCommits() {
    api.getEventList(this.data.repoId).then((data: any) => {
      const typeNames: Record<string, string> = {
        purchase: '购入', maintenance: '维护', upgrade: '升级',
        experience: '体验', fault: '故障', transfer: '转让', memory: '体验节点'
      }
      const typeIcons: Record<string, string> = {
        purchase: '🛒', maintenance: '🔧', upgrade: '⬆️',
        experience: '💭', fault: '⚠️', transfer: '🔄', memory: '💖'
      }

      const commits = (data.events || []).map((e: any) => ({
        id: e.id,
        type: typeNames[e.event_type] || e.event_type,
        icon: typeIcons[e.event_type] || '📝',
        description: e.content_description || '',
        time: e.create_time || ''
      }))

      this.setData({ availableCommits: commits })
    }).catch(() => {})
  },

  onTitleInput(e: any) {
    this.setData({ questionTitle: e.detail.value })
    this.updateCanSubmit()
  },
  onContentInput(e: any) {
    this.setData({ questionContent: e.detail.value })
    this.updateCanSubmit()
  },
  onTagInput(e: any) { this.setData({ tagInput: e.detail.value }) },

  addTag() {
    const { tagInput, tags } = this.data
    const tag = tagInput.trim()
    if (!tag) return
    if (tags.length >= 5) {
      wx.showToast({ title: '最多添加5个标签', icon: 'none' })
      return
    }
    if (tags.includes(tag)) {
      wx.showToast({ title: '标签已存在', icon: 'none' })
      return
    }
    this.setData({ tags: [...tags, tag], tagInput: '' })
  },

  removeTag(e: any) {
    const tag = e.currentTarget.dataset.tag
    this.setData({ tags: this.data.tags.filter(t => t !== tag) })
  },

  toggleAnonymous() { this.setData({ isAnonymous: !this.data.isAnonymous }) },

  showCommitSelector() { this.setData({ showCommitSelector: true }) },
  hideCommitSelector() { this.setData({ showCommitSelector: false }) },

  toggleCommit(e: any) {
    const commitId = e.currentTarget.dataset.id
    const { selectedCommits } = this.data
    if (selectedCommits.includes(commitId)) {
      this.setData({ selectedCommits: selectedCommits.filter(id => id !== commitId) })
    } else {
      this.setData({ selectedCommits: [...selectedCommits, commitId] })
    }
  },

  confirmCommitSelection() {
    const { selectedCommits, availableCommits } = this.data
    const selected = availableCommits.filter(c => selectedCommits.includes(c.id))
    this.setData({ relatedCommits: selected, showCommitSelector: false })
  },

  removeCommit(e: any) {
    const commitId = e.currentTarget.dataset.id
    this.setData({ relatedCommits: this.data.relatedCommits.filter(c => c.id !== commitId) })
  },

  updateCanSubmit() {
    const { questionTitle, questionContent } = this.data
    this.setData({ canSubmit: !!(questionTitle.trim() && questionContent.trim()) })
  },

  submitQuestion() {
    const { questionTitle, questionContent, repoId } = this.data

    if (!questionTitle.trim() || !questionContent.trim()) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }

    wx.showLoading({ title: '发布中...', mask: true })

    api.createIssue(repoId, questionTitle, questionContent).then(() => {
      wx.hideLoading()
      wx.showToast({ title: '提问成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    }).catch(() => {
      wx.hideLoading()
    })
  }
})
