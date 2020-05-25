<template>
  <div id="app" v-wechat-title="`${config.APP_NAME}${config.DEPLOY_TYPE ? config.ROLE_NAME[config.DEPLOY_TYPE] : ''}`">
    <router-view/>
  </div>
</template>

<script>
  export default {
    name: 'App',
    computed: {
      config() {
        return this.$store.state.config;
      } // 初始化配置对象
    }
  };
</script>

<style lang="scss" scoped>
</style>
