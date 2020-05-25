import axios from 'axios';

export const CONFIG_GET = 'CONFIG_GET';

export const DEPLOY_TYPES = {
  0: 'admins',
  admins: '0',
  1: 'supplier',
  supplier: '1',
  2: 'maker',
  maker: '2'
}; // 部署类型枚举

// 公用配置
const CONFIG_COMMON = {
  IMAGE_URL: '?x-oss-process=image/resize,w_', // 图片地址后缀
  DEPLOY_TYPES // 部署类型枚举
};

// 本地开发调试使用
const CONFIG_DEV = {
  APP_NAME: '思洋企服', // 应用名
  DEPLOY_URL: ['localhost', 'localhost', 'localhost'], // 部署地址（0：后台，1：供应商，2：创客）
  ROLE_NAME: ['管理后台', '供应商中心', '创客中心'], // 角色名（0：后台，1：供应商，2：创客）
  DEPLOY_TYPE: DEPLOY_TYPES.admins, // 部署类型
  RESOURCE_URL: 'http://106.53.100.47:8092/'// 后台地址
};

export default {
  state: {
    APP_NAME: '',
    DEPLOY_TYPES: {},
    DEPLOY_URL: [],
    ROLE_NAME: [],
    USER_TYPE: '',
    DEPLOY_TYPE: '',
    RESOURCE_URL: '',
    WEB_URL: '',
    IMAGE_URL: ''
  },
  mutations: {
    [CONFIG_GET](state, config) {
      Object.assign(state, config);
    }
  },
  actions: {
    async [CONFIG_GET]({ commit, state }) {
      try {
        if (!state.RESOURCE_URL) {
          const { NODE_ENV } = process.env;
          const { protocol, host } = window.location;
          const WEB_URL = `${protocol}//${host}/`;
          if (NODE_ENV === 'development') {
            commit(CONFIG_GET, Object.assign({ WEB_URL }, CONFIG_COMMON, CONFIG_DEV));
          } else {
            await axios.get(`/config.json?nowTime=${new Date().getTime()}`)
              .then((response) => {
                const { DEPLOY_URL } = response.data;
                const deployType = DEPLOY_URL.indexOf(host);
                const DEPLOY_TYPE = String(deployType);
                Object.assign(response.data, { WEB_URL, DEPLOY_TYPE });
                commit(CONFIG_GET, Object.assign(CONFIG_COMMON, response.data));
              })
              .catch((error) => {
                console.error(error);
                throw new Error(error);
              });
          }
        }
      } catch (error) {
        console.error(error);
        throw new Error(error);
      }
    }
  }
};
