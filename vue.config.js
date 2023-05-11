// common, uniqm.com, uniqm.net
let webVersion = 'uniqm.com'

module.exports = {
  publicPath: process.env.NODE_ENV === 'production' && (webVersion != 'uniqm.net') ? '/cart' : '/',
};