import Vue from 'vue';

import VeeValidate from 'vee-validate';
import zhTW from 'vee-validate/dist/locale/zh_TW';
import VueI18n from 'vue-i18n';

import App from './App.vue';

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

export default function createApp() {
  const app = new Vue({
      i18n,
      render: h => h(App),
  })
  return { app }
}
