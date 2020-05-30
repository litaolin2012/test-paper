import local from './local';
// import { MENU_CLEAR } from './menu';

export const USER_GET = 'USER_GET';
export const USER_SET = 'USER_SET';
export const USER_CLEAR = 'USER_CLEAR';
export const USER_LOGOUT = 'USER_LOGOUT';
export const USER_LOCAL_NAME = 'SYQF-user';

/* eslint-disable no-param-reassign */
export default {
  state: local.getItem(USER_LOCAL_NAME) || {
    id: '',
    name: '',
    username: '',
    loginCnt: '',
    loginTime: '',
    token: ''
  },
  mutations: {
    [USER_SET](state, user) {
      Object.assign(state, user);
      local.setItem(USER_LOCAL_NAME, state);
    },
    [USER_CLEAR](state) {
      state = {
        id: '',
        name: '',
        username: '',
        loginTime: '',
        token: ''
      };
      local.removeItem(USER_LOCAL_NAME, state);
    }
  },
  actions: {
    async [USER_GET]({ state, dispatch }, loading = true) {
      if (!state.id) {
        if (loading) {
          this._vm.onLoading = this._vm.$loading({
            text: '加载中...',
            background: 'rgba(255,255,255,.4)'
          });
        }
        await Promise.all([this._vm.$axios.get('common/users/current'), this._vm.$axios.get('common/permissions/owns')])
          .then((response) => {
            // dispatch(MENU_CLEAR);
            dispatch(USER_SET, Object.assign({ permissions: response[1].data }, response[0].data));
          });
      }
    }, // 获取用户信息
    async [USER_SET]({ commit, dispatch }, user) {
      if (user instanceof Object) {
        commit(USER_SET, user);
        if (!user.type) {
          const roles = 'admin';
          commit('SET_ROLES', [roles]);
        }
      } else {
        await dispatch(USER_GET);
      }
    }, // 设置用户信息
    [USER_CLEAR]({ commit }) {
      commit(USER_CLEAR);
    }, // 清空用户信息
    async [USER_LOGOUT]({ dispatch }) {
      await this._vm.$axios.post('logout', { errorBack: true })
        .then(() => {
          // dispatch(MENU_CLEAR);
          dispatch(USER_CLEAR);
          window.location.href = `${this.state.config.WEB_URL}login`;
        });
    } // 退出
  }
};
