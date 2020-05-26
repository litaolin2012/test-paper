<template>
  <transition name="el-fade-in-linear">
    <div v-show="getShow" class="artwork">
      <i class="el-icon-circle-close" @click.stop="close()"></i>
      <el-carousel type="card" :autoplay="false" :initial-index="active">
        <el-carousel-item v-for="item in imgArray" :key="item">
          <img-loading :src="item"></img-loading>
        </el-carousel-item>
      </el-carousel>
    </div>
  </transition>
</template>

<script>
  import imgLoading from '../img-loading/index.vue';

  export default {
    name: 'Artwork',
    components: {
      imgLoading
    },
    props: {
      imgArray: {
        type: Array,
        required: true
      }, // 图片数组
      show: {
        type: Boolean,
        required: true
      }, // 大图预览显示状态
      active: {
        type: [String, Number],
        default: 0
      } // 当前展示图片
    },
    computed: {
      getShow() {
        if (this.show) {
          document.onkeydown = (event) => {
            event.stopPropagation();
            if (event.keyCode === 27) {
              this.close();
            }
          };
        } else {
          this.close();
        }
        return this.show;
      } // 获取显示状态
    },
    methods: {
      close() {
        this.$emit('update:show', false);
        document.onkeydown = null;
      } // 关闭弹窗
    }
  };
</script>

<style lang="scss" scoped>
  .artwork {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 99999;
    background-color: #000;

    .el-icon-circle-close {
      position: absolute;
      top: 20px;
      right: 20px;
      z-index: 1000;
      color: #fff;
      font-size: 30px;
      cursor: pointer;
    }

    .el-carousel {
      height: 100%;
    }
  }
</style>

<style lang="scss">
  .artwork {
    .el-carousel__arrow {
      color: #000;
      background-color: #fff;
    }

    .el-carousel__container {
      height: 100%;

      .el-carousel__item {
        display: flex;
        text-align: center;
        align-items: center;

        .el-carousel__mask {
          background-color: #000;
        }

        .img-loading {
          position: static;
        }
      }
    }
  }
</style>
<style>
  .artwork .el-carousel .el-carousel__container {
    height: calc(100% - 26px);
  }
</style>
