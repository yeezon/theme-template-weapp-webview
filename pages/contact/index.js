
const oApp = getApp()

Page({
  data: {
    err: '',
    content: '',
    isLoading: false
  },
  onLoad (oQuery) {
    this.init()
  },
  init () {
    this.getPage()
  },
  getPage () {
    this.setData({
      isLoading: true
    })

    global.yhsd.sdk.page.get('contact-weapp', oRes => {
      oRes = (oRes || {}).res || {}

      if (oRes.code === 200) {
        const oPage = oRes.page || {}

        this.setData({
          content: (oPage.content_html || oPage.mobile_content_html || '').replace(/\<img/gi, '<img class="rt-img"')
        })
      }

      this.setData({
        isLoading: false
      })
    })
  }
})
