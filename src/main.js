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
import routerFilter from './utils/router-filter';
import ElementUI from 'element-ui';

Vue.use(ElementUI);
Vue.use(Vuex);
import './styles/index.scss';

// 加载VueWechatTitle插件
Vue.use(VueWeChatTitle);

// 登录拦截处理
routerFilter(router, store);

// vue指令
Object.entries(directive).map(([key, value]) => Vue.directive(key, value));

Vue.config.productionTip = false;
Vue.prototype.$verify = verify;
Vue.prototype.$axios = axios;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
