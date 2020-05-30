import router from './router';
import store from './store';

// const whiteList = ['/login'] // whiteList为免登录白名单

router.beforeEach((to, from, next) => {
  if (store.getters.token) {
    if (!store.getters.menu.length) {
      store.dispatch('CONFIG_GET');
      store.dispatch('GetMenuList').then(() => {
        next({ name: 'user' });
      });
    } else {
      next();
      // console.log()
      // next();
    }
  } else {
    store.dispatch('CONFIG_GET');
    if (to.path === '/login') {
      next();
    } else {
      next('/login');
    }
  }
});
