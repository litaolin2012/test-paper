const getters = {
  objApi: state => state.config,
  token: state => state.user.token,
  roles: state => state.menu.roles
};

export default getters;
