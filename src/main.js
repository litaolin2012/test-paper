import 'babel-polyfill';
import Vue from 'vue';
import VueWeChatTitle from 'vue-wechat-title';
import 'font-awesome/scss/font-awesome.scss';
import Vuex from 'vuex';
import App from './App.vue';
import router from './router';
import store from './store';
import directive from './directive';
import verify from './utils/verify';

import ElementUI from 'element-ui';

Vue.use(ElementUI);
Vue.use(Vuex);
import './styles/index.scss';

// 加载VueWechatTitle插件
Vue.use(VueWeChatTitle);

// vue指令
Object.entries(directive).map(([key, value]) => Vue.directive(key, value));

Vue.config.productionTip = false;
Vue.prototype.$verify = verify;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
