
const oApp = getApp()

Page({
  data: {
    src: '',
    err: '',
    isPaying: false,
    orderNo: '',
    shopName: oApp.configs.shop.name,
    sum: '',
    isPaid: false
  },
  onLoad: function (oQuery) {
    const _orderNo = (oQuery || {}).order_no || ''
    const _sum = parseFloat(((oQuery || {}).sum/100) || 0).toFixed(2)

    this.setData({
      orderNo: _orderNo,
      sum: _sum
    }, () => {
      this.fnPay()
    })
  },
  fnBack () {
    wx.navigateBack()
  },
  fnPay () {
    const self = this
    const _orderNo = (self.data || {}).orderNo || ''

    if (_orderNo) {
      wx.login({
        success (oRes) {
          if (oRes.code) {
            global.yhsd.sdk.weapp.payment({
              code: oRes.code,
              order_no: _orderNo
            }, _oRes => {
              const _oData = _oRes.res || {}

              if (_oData.code === 200) {
                const oPay = _oData.object || {}

                wx.requestPayment({
                  timeStamp: oPay.timeStamp,
                  nonceStr: oPay.nonceStr,
                  package: oPay.package,
                  signType: oPay.signType,
                  paySign: oPay.paySign,
                  success (_oRes) {
                    self.setData({
                      isPaid: true,
                      isPaying: false
                    })

                    oApp.globalData.toURL = `${oApp.configs.host_url}/account/orders/${_orderNo}`
                  },
                  fail (_oRes) {
                    let err = '调用支付接口失败，请重试'

                    if (/cancel/ig.test(_oRes.errMsg)) {
                      err = '支付已取消'
                    }

                    self.setData({
                      err: err,
                      isPaid: false,
                      isPaying: false
                    })
                  }
                })
              } else {
                self.setData({
                  err: '获取支付信息失败，请重试',
                  isPaid: false,
                  isPaying: false
                })
              }
            })
          } else {
            self.setData({
              err: '获取用户登录态失败，请重试',
              isPaid: false,
              isPaying: false
            })
            // console.log(oRes.errMsg)
          }
        },
        fail (oRes) {
          self.setData({
            err: '获取用户登录态失败，请重试',
            isPaid: false,
            isPaying: false
          })
          // console.log(oRes.errMsg)
        }
      })

      self.setData({
        err: '',
        isPaying: true
      })
    } else {
      self.setData({
        err: '缺少相关参数，请返回重试'
      })
    }
  }
})
