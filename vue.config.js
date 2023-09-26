// demo, common, uniqm.com, uniqm.net
let webVersion = 'demo'

module.exports = {
  publicPath: process.env.NODE_ENV === 'production' && (webVersion != 'uniqm.net') ? '/cart' : '/',
};