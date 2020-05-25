<template>
  <span class="password-eye fa" :class="{ 'fa-eye': checkType, 'fa-eye-slash': !checkType }"
        @click.stop="changeType()"></span>
</template>

<script>
  export default {
    name: 'passwordEye',
    props: {
      value: {
        required: true,
      }, // 密码框类型
    },
    data() {
      return {};
    },
    computed: {
      checkType() {
        return this.value === 'text';
      }, // 密码框类型是否为text
    },
    methods: {
      changeType() {
        this.$emit('input', this.checkType ? 'password' : 'text');
      }, // 切换密码框输入类型
    },
  };
</script>

<style lang="scss" scoped>
  .password-eye {
    position: absolute;
    top: 50%;
    left: auto !important;
    right: 18px;
    cursor: pointer;
    transform: translate(0, -50%);
  }
</style>
