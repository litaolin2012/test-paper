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
import axios from './utils/axios';
import ElementUI from 'element-ui';
import './permission';
import './styles/index.scss';

import formClear from './utils/form-clear';

Vue.use(ElementUI, {
  size: 'small' // set element-ui default size
});
Vue.use(Vuex);

// 加载VueWechatTitle插件
Vue.use(VueWeChatTitle);

// vue指令
Object.entries(directive).map(([key, value]) => Vue.directive(key, value));

Vue.config.productionTip = false;
Vue.prototype.$verify = verify;
Vue.prototype.$axios = axios;
Vue.prototype.$formClear = formClear;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
