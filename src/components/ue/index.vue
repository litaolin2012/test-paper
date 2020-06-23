<template>
  <div>
    <div :id="id"></div>
  </div>
</template>
<script>
/* global UE */
// UE编辑器
import '../../../public/UE/ueditor.config.js';
import '../../../public/UE/ueditor.all.js';
import '../../../public/UE/lang/zh-cn/zh-cn.js';
import '../../../public/UE/ueditor.parse.min.js';
import '../../../public/UE/kityformula-plugin/addKityFormulaDialog.js';
import '../../../public/UE/kityformula-plugin/getKfContent.js';
import '../../../public/UE/kityformula-plugin/defaultFilterFix.js';
export default {
  name: 'UE',
  props: {
    defaultMsg: {
      type: String,
      default: ''
    },
    config: {
      type: Object,
      default: () => {
        return {};
      }
    },
    id: {
      type: String,
      default: 'editor'
    }
  },
  data() {
    return {
      editor: null
    };
  },
  watch: {
    defaultMsg() {
      if (this.defaultMsg) {
        this.editor.setContent(this.defaultMsg);
      } else {
        this.editor.setContent(' ');
      }
    }
  },
  mounted() {
    const _this = this;
    this.editor = UE.getEditor(this.id, this.config); // 初始化UE
    this.editor.addListener('ready', function() {
      _this.editor.setContent(_this.defaultMsg); // 确保UE加载完成后，放入内容。
    });
  },
  destroyed() {
    this.editor.destroy();
  },
  methods: {
    getUEContent() { // 获取内容方法
      return this.editor.getContent();
    },
    getUEContentTxt() { // 获取内容方法
      return this.editor.getContentTxt();
    }
  }
};
</script>
<style lang="less" scoped>
    #ue{
       height: 300px;
    }
</style>
