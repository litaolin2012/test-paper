<template>
  <ElUpload
    ref="upload"
    :action="uploadFileURL"
    list-type="picture-card"
    :before-upload="beforeUpload"
    :on-preview="onPreview"
    :on-remove="onRemove"
    :on-success="onSuccess"
    :on-error="onError"
    accept=".bmp,.jpg,.jpeg,.gif,.png"
    :file-list="fileList"
    :disabled="disabled"
    :class="[className]"
    :set-disabled="setDisabled"
    class="upload"
  >
    <i class="el-icon-plus"></i>
  </ElUpload>
</template>

<script>
  import layoutMixin from '../layout/layout-mixin';
  import { USER_LOGOUT } from '../../store/modules/user';

  export default {
    name: 'Upload',
    mixins: [layoutMixin],
    props: {
      value: {
        type: Array,
        required: true
      }, // 图片地址数组
      status: {
        type: Boolean,
        default: false
      }, // 上传状态，（true：上传中，false：上传完成）
      length: {
        type: Number,
        default: 1
      }, // 最大上传数，默认为1
      disabled: {
        type: Boolean,
        default: false
      } // 是否禁用，默认false
    },
    data() {
      return {
        change: false,
        list: [], // 图片列表
        fileList: [], // 文件列表
        button: null, // 上传按钮
        className: `upload${new Date().getTime()}` // 随机class名
      };
    },
    computed: {
      config() {
        return this.$store.state.config;
      }, // 初始化配置对象
      uploadFileURL() {
        return this.$store.getters.uploadFileURL;
      }, // 上传地址
      imageUrl() {
        return `${this.config.IMAGE_URL}148`;
      }, // 上传按钮图片后缀
      setDisabled() {
        this.setButton();
        return this.disabled;
      } // 切换按钮显示状态
    },
    watch: {
      value() {
        this.setFileList();
        this.setButton();
      } // 更新图片列表
    },
    mounted() {
      this.setFileList();
      [this.button] = document.querySelectorAll(`.${this.className} .el-upload`);
      this.setButton();
    },
    methods: {
      setFileList() {
        if (this.change) {
          this.change = !this.change;
        } else {
          this.list.splice(0, this.list.length, ...this.value);
          const array = [];
          this.list.map(item => array.push({
            url: item + this.imageUrl,
            response: { url: item }
          }));
          this.fileList = array;
        }
      }, // 设置图片列表
      setButton() {
        if (this.button) {
          if (this.disabled) {
            this.button.setAttribute('style', 'display: none;');
          } else {
            this.button.setAttribute('style', `opacity: ${this.list.length === this.length ? 0 : 1};`);
          }
        }
      }, // 设置按钮显示状态
      beforeUpload(file) {
        const { name, size, uid } = file;
        const suffix = name.toLowerCase()
          .split('.')
          .pop();
        if (suffix !== 'bmp' && suffix !== 'jpg' && suffix !== 'jpeg' && suffix !== 'gif' && suffix !== 'png') {
          this.$message({
            message: '请选择图片',
            type: 'warning'
          });
          return false;
        }
        if (size > (10 * 1024 * 1024)) {
          this.$message({
            message: '图片大小不能超过10M',
            type: 'warning'
          });
          return false;
        }
        this.list.push(uid);
        this.setButton();
        this.$emit('update:status', true);
        return true;
      }, // 上传之前
      onPreview(file) {
        const { response } = file;
        if (response) {
          this.rootLayout.artwork = {
            src: this.list,
            show: true,
            active: this.list.indexOf(response.url)
          };
        } else {
          this.$message({
            message: '图片还未上传完成',
            type: 'warning'
          });
        }
      }, // 点击事件
      onRemove(file) {
        const { response, uid } = file;
        this.list.splice(this.list.indexOf(response ? response.url : uid), 1);
        this.change = true;
        this.$emit('input', [...this.list]);
        this.setButton();
        const index = this.list.findIndex((item) => {
          const url = String(item);
          return !(url.includes('http://') || url.includes('https://'));
        });
        if (index > -1) {
          return false;
        }
        return this.$emit('update:status', false);
      }, // 上传删除
      onSuccess(response, file) {
        const { url } = response;
        let status = false;
        this.list.map((item, index) => {
          let _item = String(item);
          if (item === file.uid) {
            _item = url;
            this.list.splice(index, 1, url);
            this.change = true;
            this.$emit('input', [...this.list]);
          }
          if (!status) {
            status = !(_item.includes('http://') || _item.includes('https://'));
          }
          return true;
        });
        if (!status) {
          this.$emit('update:status', false);
        }
      }, // 上传成功
      onError(error) {
        const { status, message } = JSON.parse(String(error)
          .substring(6));
        if (status === 401) {
          this.$store.commit(USER_LOGOUT);
        }
        this.$message({
          message,
          type: 'error'
        });
      }, // 上传失败
      clearFiles() {
        this.$refs.upload.clearFiles();
        this.list = [];
        this.$emit('input', []);
        this.button.setAttribute('style', 'opacity: 1;');
      } // 清空上传列表
    }
  };
</script>

<style lang="scss" scoped>
  .upload {
  }
</style>

<style lang="scss">
  .upload {
    .el-upload {
      transition: all .3s;

      &[style*='opacity: 0'] {
        pointer-events: none;
      }

      &.el-upload--picture-card {
        width: 100px !important;
        height: 100px !important;
        line-height: 100px !important;
      }
    }

    .el-upload-list--picture-card {
      .el-upload-list__item {
        width: 100px !important;
        height: 100px !important;
      }
    }
  }
</style>
