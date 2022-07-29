import QRCode from '../../utils/qrcode/index'

Page({
  data: {
    getNum: 0,
    img: '',
    showTips: false,
    oInfo: {
      title: '',
      path: '',
      image: ''
    },
    oDraw: {
      nPixelRatio: wx.getSystemInfoSync().pixelRatio, // 优化大小限制，优化 iOS 端锯齿问题
      width: 1080,
      height: 1980,
      elements: []
    }
  },
  onShareAppMessage(oRes) {
    const _oInfo = this.data.oInfo || {}
    const oConfig = {}

    oConfig.title = _oInfo.title || ''
    oConfig.path = _oInfo.path || ''
    oConfig.imageUrl = _oInfo.image || ''

    return oConfig
  },
  onLoad(oQuery) {
    if (oQuery) {
      this.init(JSON.parse(decodeURIComponent((oQuery || {}).config || '') || null) || {})
    }
  },
  init(oConfig) {
    const oInfo = oConfig.info || {}
    const oImage = oConfig.image || {}

    const oInfoFixed = {
      title: oInfo.title || '',
      path: `/pages/index/index?web_url=${encodeURIComponent(oInfo.url || '')}`,
      image: oInfo.image || ''
    }

    const oImageFixed = {
      width: oImage.width || 1080,
      height: oImage.height || 1980,
      elements: []
    }

    for (const oElement of (oImage.elements || [])) {
      let oElementFixed = {}

      if (oElement.type === 'fillRect') {
        oElementFixed = Object.assign({
          type: 'fillRect',
          color: '#ffffff',
          width: 0,
          height: 0,
          x: 0,
          y: 0
        }, oElement)
      } else if (oElement.type === 'qrcode') {
        oElementFixed = Object.assign({
          type: 'qrcode',
          text: '',
          path: '',
          width: null,
          height: null,
          x: 0,
          y: 0
        }, oElement)
      } else if (oElement.type === 'image') {
        oElementFixed = Object.assign({
          type: 'image',
          url: '',
          path: '',
          width: null,
          height: null,
          x: 0,
          y: 0
        }, oElement)
      } else if (oElement.type === 'text') {
        oElementFixed = Object.assign({
          type: 'text',
          text: '',
          color: '#000000',
          font_weight: 'normal',
          text_align: 'left',
          font_family: 'SWISSCB',
          font_size: 32,
          x: 32,
          y: 32
        }, oElement)
      } else {
        oElementFixed = {
          type: null
        }
      }

      oImageFixed.elements.push(oElementFixed)
    }

    this.setData({
      oInfo: oInfoFixed,
      oDraw: oImageFixed
    })

    this.getData()
  },
  getData() {
    wx.showLoading({
      title: '加载中..',
      mask: true
    })

    const _oDraw = this.data.oDraw

    _oDraw.elements.forEach((oItem, index) => {
      if (/^(image|qrcode)$/.test(oItem.type)) {
        if (oItem.url) {
          this.setData({ getNum: ++this.data.getNum })
          this.getOnlineImage(oItem.url).then(oRes => {
            const oNewData = {}
            oNewData[`oDraw.elements[${index}].path`] = oRes.path || ''
            this.setData(oNewData)

            this.setData({ getNum: --this.data.getNum })
            this.fnCheckDraw()
          }).catch(oError => {
            const oNewData = {}
            oNewData[`oDraw.elements[${index}].path`] = ''
            this.setData(oNewData)

            this.setData({ getNum: --this.data.getNum })
            this.fnCheckDraw()

            wx.showToast({
              title: '加载失败，请重新进入',
              icon: 'none'
            })
          })
        } else if (oItem.text) {
          this.setData({ getNum: ++this.data.getNum })
          this.getQRCode(oItem.text).then(tempFilePath => {
            const oNewData = {}
            oNewData[`oDraw.elements[${index}].path`] = tempFilePath || ''
            this.setData(oNewData)

            this.setData({ getNum: --this.data.getNum })
            this.fnCheckDraw()
          }).catch(oError => {
            const oNewData = {}
            oNewData[`oDraw.elements[${index}].path`] = ''
            this.setData(oNewData)

            this.setData({ getNum: --this.data.getNum })
            this.fnCheckDraw()

            wx.showToast({
              title: '加载失败，请重新进入',
              icon: 'none'
            })
          })
        }
      }
    })

    if (this.data.getNum < 1) {
      this.fnCheckDraw()
    }
  },
  getOnlineImage(url) {
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: url,
        success(oRes) {
          resolve(oRes)
        },
        fail(oRes) {
          reject(new Error((oRes || {}).errMsg || 'Get Image Error'))
        }
      })
    })
  },
  // 获取二维码
  getQRCode(text) {
    return QRCode.create({ text })
  },
  fnCheckDraw() {
    if (this.data.getNum < 1) {
      this.setData({ getNum: 0 })

      this.fnDrawImg()
    }
  },
  fnDrawImg() {
    const _oDraw = this.data.oDraw || {}
    const _width = _oDraw.width
    const _height = _oDraw.height

    const ctx = wx.createCanvasContext('shareCanvas')

    for (const oItem of _oDraw.elements) {
      if (/^(image|qrcode)$/.test(oItem.type) && oItem.path) {
        // 绘制图像到画布
        ctx.drawImage(oItem.path, oItem.x, oItem.y, oItem.width, oItem.height)
      } else if (oItem.type === 'fillRect') {
        // 绘制矩形
        ctx.setFillStyle(oItem.color)
        ctx.fillRect(oItem.x, oItem.y, oItem.width, oItem.height)
      } else if (oItem.type === 'text') {
        // 绘制文字
        ctx.font = `normal ${oItem['font_weight'] || 'normal'} ${oItem['font_size']}px ${oItem['font_family']}`
        ctx.setFillStyle(oItem.color)
        ctx.setTextAlign(oItem['text_align'])
        ctx.fillText(oItem.text.slice(0, 18), oItem.x, oItem.y)
        ctx.fillText(oItem.text.slice(18, 36), oItem.x, oItem.y + 40)
        ctx.fillText(oItem.text.slice(36, 54), oItem.x, oItem.y + 40 * 2)
      }
    }

    ctx.draw(false, () => {
      this.fnCreateImgTempPath()
    })
  },
  fnCreateImgTempPath() {
    const _oDraw = this.data.oDraw || {}

    wx.canvasToTempFilePath({
      canvasId: 'shareCanvas',
      destWidth: _oDraw.width,
      destHeight: _oDraw.height,
      success: (oRes) => {
        this.setData({
          img: oRes.tempFilePath
        })
      }
    })
  },
  onImgLoaded() {
    wx.hideLoading()
  },
  // 保存图片
  fnSaveImg: function () {
    const self = this

    wx.hideLoading()
    const scope = 'scope.writePhotosAlbum'
    wx.getSetting({
      success(res) {
        if (res.authSetting[scope]) {
          self.fnSaveImgToAlbum()
        } else if (res.authSetting[scope] === undefined) { // 从未授权
          wx.authorize({
            scope: scope,
            success() {
              self.fnSaveImgToAlbum()
            },
            fail() {
              wx.showToast({
                title: '授权失败',
                icon: 'none',
                duration: 1500
              })
            }
          })
        } else if (res.authSetting[scope] === false) { // 初次授权拒绝后
          self.setData({
            showTips: true
          })
        }
      }
    })

  },
  // 保存到相册
  fnSaveImgToAlbum: function () {
    wx.showLoading({
      title: '保存中',
      mask: true
    })
    wx.saveImageToPhotosAlbum({
      filePath: this.data.img,
      success() {
        wx.hideLoading()
        wx.showToast({
          title: '分享图保存成功！',
          icon: 'none',
          duration: 2000,
          mask: true
        })
      },
      fail() {
        wx.showToast({
          title: '保存失败，请重试',
          icon: 'none',
          duration: 2000,
          mask: true
        })
      }
    })
  },
  fnOpenSetting: function (res) {
    const success = res.detail.authSetting['scope.writePhotosAlbum']
    this.closeTips()
    if (success) {
      this.fnSaveImgToAlbum()
    } else {
      wx.showToast({
        title: '授权失败',
        icon: 'none',
        duration: 1500
      })
    }
  },
  closeTips: function () {
    this.setData({
      showTips: false
    })
  }
})