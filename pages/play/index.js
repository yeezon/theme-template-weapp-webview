
Page({
  data: {
    oConfig: {
      src: '',
      vid: '',
      controls: true,
      autoplay: true,
      objectFit: 'contain'
    }
  },
  onLoad (oQuery) {
    const _oConfig = JSON.parse(decodeURIComponent((oQuery || {}).config || '{}'))

    this.setData({
      oConfig: {
        ...(Object.assign({}, this.data.oConfig, _oConfig))
      }
    })
  }
})
