
import QRCode from './qrcode.js'

function create (options) {
  // Set default values
  // typeNumber < 1 for automatic calculation
  options = Object.assign({
    width: 512,
    height: 512,
    typeNumber: -1,
    correctLevel: 2, // QRErrorCorrectLevel.H
    background: "#ffffff",
    foreground: "#000000"
  }, options)

  QRCode.api.draw(options.text, 'qr-code-temp', options.width, options.height);

  // Return just built canvas
  return new Promise((resolve, reject) => {
    try {
      setTimeout(() => {
        wx.canvasToTempFilePath({
          canvasId: 'qr-code-temp',
          destWidth: 512,
          destHeight: 512,
          success(oRes) {
            resolve(oRes.tempFilePath || '')
          },
          fail (oRes) {
            reject(new Error((oRes || {}).errMsg || 'QRCode To TempFile Error'))
          }
        })
      }, 1000);
    } catch (oError) {
      reject(oError)
    }
  })
}

export default {
  create
}
