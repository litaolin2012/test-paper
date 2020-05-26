export default {
  computed: {
    rootLayout() {
      let parent = this;
      while (parent && parent.$options.name !== 'layout') {
        ({ parent } = parent.$options);
      }
      return parent;
    } // 获取layout实例
  }
};
