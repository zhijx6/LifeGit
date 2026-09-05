// pages/issue-detail/issue-detail.ts
import * as api from '../../utils/api'

Page({
  data: {
    repoId: '',
    issueId: '',
    isOwner: false,
    canSetBest: false,
    issue: {} as any,
    bestAnswer: null as any,
    answers: [] as any[],
    replyText: '',
    showAtModal: false,
    showCommitModal: false,
    selectedUser: '',
    selectedCommit: '',
    selectedAtUsers: [] as string[],
    selectedCommits: [] as string[],
    availableUsers: [] as any[],
    availableCommits: [] as any[]
  },

  onLoad(options: any) {
    this.setData({ issueId: options.id, repoId: options.repoId })
    this.loadIssueDetail()
  },

  loadIssueDetail() {
    wx.showLoading({ title: '加载中...', mask: true })

    api.getIssueDetail(this.data.issueId).then((data: any) => {
      wx.hideLoading()

      const statusMap: Record<string, string> = {
        open: '待解答', answered: '已解答', closed: '已关闭'
      }

      const issueData = data.issue || {}
      const issue = {
        id: issueData.id,
        title: issueData.title,
        content: issueData.content,
        status: issueData.status,
        statusText: statusMap[issueData.status] || issueData.status,
        tags: issueData.tags || [],
        author: {
          id: issueData.creator_id,
          name: '用户' + issueData.creator_id,
          avatar: ''
        },
        createTime: issueData.create_time || ''
      }

      const currentUserId = wx.getStorageSync('userId')
      const isOwner = issueData.creator_id == currentUserId

      // 分离最佳答案和普通回答
      const allReplies = data.replies || []
      let bestAnswer = null
      const answers: any[] = []

      allReplies.forEach((r: any) => {
        const reply = {
          id: r.id,
          content: r.content,
          author: { id: r.author_id, name: '用户' + r.author_id, avatar: '' },
          createTime: r.create_time || '',
          likeCount: 0,
          isLiked: false,
          commitRefs: []
        }
        if (r.is_best_answer) {
          bestAnswer = reply
        } else {
          answers.push(reply)
        }
      })

      this.setData({
        issue,
        bestAnswer,
        answers,
        isOwner,
        canSetBest: isOwner
      })

      // Load participants for @mentions
      api.getIssueParticipants(this.data.repoId).then((pData: any) => {
        const users = (pData || []).map((u: any) => ({
          id: u.id,
          name: '用户' + u.id,
          avatar: ''
        }))
        this.setData({ availableUsers: users })
      }).catch(() => {})
    }).catch(() => {
      wx.hideLoading()
      wx.showToast({ title: '加载失败', icon: 'none' })
    })
  },

  onReplyInput(e: any) {
    this.setData({ replyText: e.detail.value })
  },

  showAtDialog() { this.setData({ showAtModal: true }) },
  hideAtModal() { this.setData({ showAtModal: false, selectedUser: '' }) },

  selectUser(e: any) {
    this.setData({ selectedUser: e.currentTarget.dataset.id })
  },

  confirmAtUser() {
    const { selectedUser, availableUsers } = this.data
    if (!selectedUser) {
      wx.showToast({ title: '请选择用户', icon: 'none' })
      return
    }
    const user = availableUsers.find((u: any) => u.id === selectedUser)
    if (user) {
      this.setData({
        replyText: this.data.replyText + '@' + user.name + ' ',
        selectedAtUsers: [...this.data.selectedAtUsers, selectedUser]
      })
    }
    this.hideAtModal()
  },

  showCommitDialog() { this.setData({ showCommitModal: true }) },
  hideCommitModal() { this.setData({ showCommitModal: false, selectedCommit: '' }) },

  selectCommit(e: any) {
    this.setData({ selectedCommit: e.currentTarget.dataset.id })
  },

  confirmCommitRef() {
    const { selectedCommit, availableCommits } = this.data
    if (!selectedCommit) {
      wx.showToast({ title: '请选择记录', icon: 'none' })
      return
    }
    const commit = availableCommits.find((c: any) => c.id === selectedCommit)
    if (commit) {
      this.setData({
        replyText: this.data.replyText + '\n【引用】' + commit.typeText + '：' + commit.description,
        selectedCommits: [...this.data.selectedCommits, selectedCommit]
      })
    }
    this.hideCommitModal()
  },

  setBestAnswer(e: any) {
    const replyId = e.currentTarget.dataset.id
    wx.showModal({
      title: '设为最佳答案',
      content: '确认将此回答设为最佳答案吗？',
      success: (res) => {
        if (res.confirm) {
          api.setBestReply(replyId).then(() => {
            wx.showToast({ title: '已设为最佳答案', icon: 'success' })
            this.loadIssueDetail()
          })
        }
      }
    })
  },

  closeIssue() {
    wx.showModal({
      title: '关闭问题',
      content: '关闭后将无法继续回答，确认关闭吗？',
      success: (res) => {
        if (res.confirm) {
          api.updateIssueStatus(this.data.issueId, 'closed').then(() => {
            this.setData({ 'issue.status': 'closed', 'issue.statusText': '已关闭' })
            wx.showToast({ title: '问题已关闭', icon: 'success' })
          })
        }
      }
    })
  },

  deleteIssue() {
    wx.showModal({
      title: '删除问题',
      content: '删除后不可恢复，确认删除吗？',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...', mask: true })
          api.deleteIssue(this.data.issueId).then(() => {
            wx.hideLoading()
            wx.showToast({ title: '已删除', icon: 'success' })
            setTimeout(() => wx.navigateBack(), 1500)
          }).catch(() => {
            wx.hideLoading()
          })
        }
      }
    })
  },

  cancelBestAnswer() {
    if (!this.data.bestAnswer) return
    wx.showModal({
      title: '取消最佳答案',
      content: '确认取消最佳答案吗？',
      success: (res) => {
        if (res.confirm) {
          api.cancelBestReply(this.data.bestAnswer.id).then(() => {
            wx.showToast({ title: '已取消', icon: 'success' })
            this.loadIssueDetail()
          })
        }
      }
    })
  },

  submitReply() {
    const { replyText, issueId } = this.data
    if (!replyText.trim()) {
      wx.showToast({ title: '请输入回答内容', icon: 'none' })
      return
    }

    wx.showLoading({ title: '发送中...', mask: true })

    api.createReply(issueId, replyText).then(() => {
      wx.hideLoading()
      wx.showToast({ title: '回答成功', icon: 'success' })
      this.setData({ replyText: '' })
      this.loadIssueDetail()
    }).catch(() => {
      wx.hideLoading()
    })
  }
})
