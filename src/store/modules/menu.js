const menu = {
  state: {
    roles: [],
    menuList: []
  },
  mutations: {
    SET_ROLES: (state, roles) => {
      state.roles = roles;
    },
    SET_MENULIST: (state, menuList) => {
      state.menuList = menuList;
    }
  },
  actions: {
    GetMenuList({ commit, state }) {
      this._vm.$axios.get('common/permissions/current').then(res => {
        console.log(res);
      });
    }
  }
};

export default menu;
