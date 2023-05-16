// common, demo, uniqm.com, uniqm.net
let webVersion = 'common'

module.exports = {
  publicPath: process.env.NODE_ENV === 'production' && (webVersion != 'uniqm.net') ? '/cart' : '/',
};