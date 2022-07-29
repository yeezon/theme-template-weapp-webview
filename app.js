
import './vendors/jssdk.js'
const oConfig = require('./app.config.js')

global.yhsd = global.yhsd || {}
global.yhsd.YOU_API_URL = oConfig.you_api_url
global.yhsd.API_URL = oConfig.api_url
global.yhsd.SITE_ALIAS = oConfig.alias
global.yhsd.SITE_ID = oConfig.shop.site_id
global.yhsd.SESSION_TOKEN = ''

App({
  configs: { ...oConfig },
  globalData: {
    toURL: ''
  },
  onShow (options) {
    // 转发支持
    if (options.query && options.query.web_url) {
      this.globalData.toURL = decodeURIComponent(options.query.web_url)
    }
  }
})
