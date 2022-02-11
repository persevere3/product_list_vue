import Vue from 'vue';

import axios from 'axios';
import VueAxios from 'vue-axios';

import VeeValidate from 'vee-validate';
import zhTW from 'vee-validate/dist/locale/zh_TW';
import VueI18n from 'vue-i18n';

import App from './App.vue';

Vue.use(VueAxios, axios);

Vue.use(VueI18n);
const i18n = new VueI18n({
  locale: 'zhTW'
});
Vue.use(VeeValidate, {
  events: 'input|blur',
  i18n,
  dictionary: {
    zhTW
  }
});

Vue.config.productionTip = false
axios.defaults.withCredentials = true;

new Vue({
  render: h => h(App),
  i18n,
}).$mount('#app')
