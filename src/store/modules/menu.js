// 菜单平铺
function menuFlat(menu) {
  let _menu = [];
  menu.map((item) => {
    _menu.push(item);
    if (item.child[0]) {
      _menu = _menu.concat(menuFlat(item.child));
    }
    return true;
  });
  return _menu;
}

const menu = {
  state: {
    roles: [],
    menu: [],
    menuFlat: []
  },
  mutations: {
    SET_ROLES: (state, roles) => {
      state.roles = roles;
    },
    SET_MENULIST: (state, menu) => {
      state.menu = menu;
      state.menuFlat = menuFlat(menu);
    }
  },
  actions: {
    GetMenuList({ commit, state }) {
      return state.menu.length ? Promise.resolve(state.menu)
        : new Promise((resolve, reject) => {
          this._vm.$axios.get('common/permissions/current').then(res => {
            commit('SET_MENULIST', res.data);
            resolve(res.data);
          });
        });
    }
  }
};

export default menu;
