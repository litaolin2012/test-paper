import { CONFIG_GET } from '../../store/modules/config';
import { USER_GET } from '../../store/modules/user';
import { MENU_GET } from '../../store/modules/menu';

// 验证菜单是否有权限
function checkMenuAuth(menuFlat, name) {
  return menuFlat.findIndex(item => item.href === name) !== -1;
}
// 获取当前菜单
function getMenu(menuFlat, name) {
  return menuFlat.find(item => item.href === name);
}
// 获取子菜单路由名
function getMenuChildHref(menu) {
  const { child, href } = menu;
  if (child && child[0]) {
    return getMenuChildHref(child[0]);
  }
  return href;
}

export default (router, store) => {
  router.beforeEach((to, from, next) => {
    const { name, meta: { noAuth, noMenuAuth, hasChild }} = to;
    const { name: _name } = from;
    store.dispatch(CONFIG_GET).then(() => {
      if (noAuth) {
        next();
      } else {
        store.dispatch(USER_GET).then(() => {
          const { id } = store.state.user;
          if (id) {
            store.dispatch(MENU_GET, _name).then(() => {
              const { menuFlat } = store.state.menu;
              if (noMenuAuth || (checkMenuAuth(menuFlat, name) && !hasChild)) {
                next();
              } else {
                const menu = getMenu(menuFlat, name);
                const __name = menu ? getMenuChildHref(menu) : menuFlat[0].href;
                next({ replace: true, name: __name });
              }
            });
          } else {
            next({ name: 'login' });
          }
        });
      }
    });
  });
};
