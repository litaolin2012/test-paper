import Vue from 'vue';
import Vuex from 'vuex';
import config from './modules/config';
import user from './modules/user';
import loadingServer from './modules/loading-server';
import getters from './getters';

Vue.use(Vuex);

export default new Vuex.Store({
  getters,
  modules: {
    config,
    user,
    loadingServer
  }
});
