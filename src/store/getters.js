const getters = {
  objApi: state => state.config,
  token: state => state.user.token,
  roles: state => state.menu.roles,
  menu: state => state.menu.menu,
  uploadFileURL: state => `${state.config.RESOURCE_URL}general/files?token=${state.user.token}`, // 上传地址
  uploadFilesURL: state => `${state.config.RESOURCE_URL}general/files/multi?token=${state.user.token}` // 上传地址
};

export default getters;
