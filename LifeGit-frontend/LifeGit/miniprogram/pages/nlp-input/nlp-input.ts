// pages/nlp-input/nlp-input.ts
Page({
  data: {
    inputText: '',
    selectedExample: -1,
    examples: [
      {
        icon: '🚲',
        text: '我的那辆蓝色捷安特山地车'
      },
      {
        icon: '📚',
        text: '华北电力大学二校区三楼的自习室'
      },
      {
        icon: '💻',
        text: '公司发的MacBook Pro M3 16寸 512GB'
      },
      {
        icon: '🎧',
        text: '索尼WH-1000XM5降噪耳机黑色版'
      }
    ]
  },

  onLoad() {

  },

  /**
   * 输入变化
   */
  onInputChange(e: any) {
    this.setData({
      inputText: e.detail.value,
      selectedExample: -1
    })
  },

  /**
   * 清除输入
   */
  clearInput() {
    this.setData({
      inputText: '',
      selectedExample: -1
    })
  },

  /**
   * 选择示例
   */
  selectExample(e: any) {
    const index = e.currentTarget.dataset.index
    const example = this.data.examples[index]

    this.setData({
      inputText: example.text,
      selectedExample: index
    })
  },

  /**
   * 分析文本
   */
  analyzeText() {
    const { inputText } = this.data

    if (!inputText.trim()) {
      wx.showToast({
        title: '请输入描述内容',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: 'AI分析中...',
      mask: true
    })

    // 模拟NLP分析过程
    setTimeout(() => {
      wx.hideLoading()

      // 跳转到结果页面
      wx.navigateTo({
        url: `/pages/nlp-result/nlp-result?text=${encodeURIComponent(inputText)}`
      })
    }, 1500)
  }
})
