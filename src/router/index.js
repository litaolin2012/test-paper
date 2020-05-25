import Vue from 'vue';
import Router from 'vue-router';
import { DEPLOY_TYPES } from '../store/modules/config';

Vue.use(Router);
const { admins } = DEPLOY_TYPES;
export const commonRoutes = [
  {
    path: '',
    meta: {
      title: '',
      whiteList: [admins],
      noAuth: true
    },
    redirect: { name: 'login' }
  }, // 默认指向
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/common/login/index')
  }
];
export default new Router({
  mode: 'hash',
  base: process.env.BASE_URL, // get vue.config.js publicPath
  routes: commonRoutes,
  scrollBehavior: () => ({ y: 0 })
});
