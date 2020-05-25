import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);
export const commonRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index')
  }
];
export default new Router({
  mode: 'hash',
  base: process.env.BASE_URL, // get vue.config.js publicPath
  routes: commonRoutes,
  scrollBehavior: () => ({ y: 0 })
});
