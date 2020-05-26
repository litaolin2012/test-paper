<template>
  <div class="img-loading">
    <i
v-show="!loading"
class="el-icon-loading"
       :style="{ fontSize: `${size}px`, margin: `-${size / 2}px 0 0 -${size / 2}px` }"
></i>
    <img v-show="loading" ref="img" src="" alt="loading"/>
  </div>
</template>

<script>
  export default {
    name: 'ImgLoading',
    props: {
      src: {
        type: [String, Number],
        required: true
      }, // 图片地址
      size: {
        type: Number,
        default: 50
      } // loading大小
    },
    data() {
      return {
        loading: false // 图片加载状态
      };
    },
    mounted() {
      this.changeImg();
    },
    methods: {
      changeImg() {
        this.loading = false;
        this.$refs.img.src = this.src;
        this.$refs.img.onload = () => {
          this.loading = true;
        };
      } // 切换图片地址
    }
  };
</script>

<style lang="scss" scoped>
  .img-loading {
    position: relative;
    height: 100%;
    background-color: #edecec;

    .el-icon-loading {
      position: absolute;
      top: 50%;
      left: 50%;
      color: #fff;
      font-size: 60px;
      margin: -30px 0 0 -30px;
    }

    img {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100%;
      transform: translate(-50%, -50%);
    }
  }
</style>
