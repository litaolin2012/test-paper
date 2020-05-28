import router from './router';
import store from './store';

// const whiteList = ['/login'] // whiteList为免登录白名单

router.beforeEach((to, from, next) => {
  if (store.getters.token) {
    if (to.path === '/login') {
      next();
    } else {
      if (!store.getters.roles.length) {
        store.dispatch('GetMenuList');
      }
      // next();
    }
  } else {
    next({ name: 'login' });
  }
});
