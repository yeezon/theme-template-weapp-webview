
const oApp = getApp()

Page({
  data: {
    err: '',
    isLoading: false
  },
  fnAuth () {
    const self = this

    wx.getUserProfile({
      desc: '用于完善会员资料',
      success (oRes) {
        const _resName = oRes?.userInfo?.nickName || ''
        const _resAvatar = oRes?.userInfo?.avatarUrl || ''

        wx.login({
          success (oRes) {
            if (oRes.code) {
              global.yhsd.sdk.weapp.auth({
                code: oRes.code
              }, _oRes => {
                self.setData({
                  isLoading: false
                })

                const _oData = _oRes.res || {}

                if (_oData.code === 200) {
                  const _name = encodeURIComponent(_resName || '')
                  const _avatar = encodeURIComponent(_resAvatar || '')

                  oApp.globalData.toURL = `${oApp.configs.host_url}/account/social/login?uid=${_oData.uid}&name=${_name}&avatar_url=${_avatar}&type=weixin&token=${_oData.token}&unionid=${_oData.unionid || ''}` // 注意有可能是 null，GET 会被当字符串 null

                  setTimeout(() => {
                    // 无需 isLoading = false，体验更佳
                    if (getCurrentPages().length > 1) {
                      wx.navigateBack()
                    } else {
                      wx.redirectTo({
                        url: '/pages/index/index'
                      })
                    }
                  }, 50)
                } else {
                  self.setData({
                    err: '获取登录信息失败，请重试'
                  })
                }
              })
            } else {
              self.setData({
                err: '获取用户登录态失败，请重试',
                isLoading: false
              })
            }
          },
          fail () {
            self.setData({
              err: '获取用户登录态失败，请重试',
              isLoading: false
            })
          }
        })
      },
      fail () {
        self.setData({
          err: '获取用户信息失败，请重试',
          isLoading: false
        })
      }
    })

    self.setData({
      err: '',
      isLoading: true
    })
  }
})
