import Vue from 'vue';
import Vuex from 'vuex';
import config from './modules/config';
import getters from './getters';

Vue.use(Vuex);

export default new Vuex.Store({
  getters,
  modules: {
    config
  }
});
