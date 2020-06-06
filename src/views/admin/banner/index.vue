<template>
  <div class="banner">
    <div v-loading="loading.table" class="table-content">
      <div class="table-operate clearfix">
        <div class="right">
          <ElButton v-if="useEdit" type="primary" size="small" @click.stop="open()">
            新增Banner
          </ElButton>
        </div>
      </div>
      <ElTable :data="tableData" :border="true">
        <ElTableColumn fixed="left" align="center" label="Banner" width="150">
          <template slot-scope="scope">
            <a
              href="javascript:void(0);"
              @click.stop="rootLayout.artwork = { src: [scope.row.img], show: true}"
            >
              <img :src="scope.row.img">
            </a>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="jumpUrl" fixed="left" align="center" label="跳转地址" min-width="300">
        </ElTableColumn>
        <ElTableColumn align="center" label="状态" min-width="90">
          <template slot-scope="scope">
            <ElSwitch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              :disabled="!useEdit"
              @change="changeType(`admin/banners/${scope.row.id}/${scope.row.status}`,
                                  scope.row)"
            >
            </ElSwitch>
          </template>
        </ElTableColumn>
        <ElTableColumn align="center" label="类型" min-width="90">
          <template slot-scope="scope">
            <ElTag>{{ ['首页banner', '首页广告'][scope.row.place] }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn v-if="useEdit" fixed="right" align="center" label="操作" min-width="80">
          <template slot-scope="scope">
            <a href="javascript:void(0);" @click.stop="open(scope.row)">修改</a>
          </template>
        </ElTableColumn>
      </ElTable>
      <Paging
        :page-no.sync="searchData.offset"
        :page-size.sync="searchData.limit"
        :total="total"
        @change="getData"
      ></Paging>
    </div>
    <ElDialog
      v-if="useEdit"
      :visible.sync="dialog"
      :title="`${formData.id ? '修改' : '新增'}Banner`"
      top="20vh"
      width="500px"
      @closed="$refs.upload.clearFiles()"
    >
      <ElForm
        ref="formRef"
        :model="formData"
        :rules="formRules"
        size="small"
        label-width="95px"
        @keydown.enter.stop.native="!loadingServer.save && save()"
      >
        <ElFormItem label="Banner：" class="form-upload is-required">
          <Upload ref="upload" v-model="imgList" :status.sync="uploadStatus"></Upload>
        </ElFormItem>
        <ElFormItem prop="place" label="显示位置：">
          <el-select v-model="formData.place" placeholder="请选择显示位置">
            <el-option :value="0" label="首页banner"></el-option>
            <el-option :value="1" label="首页广告"></el-option>
          </el-select>
        </ElFormItem>
        <ElFormItem prop="jumpUrl" label="跳转地址：">
          <el-input
            v-model="formData.jumpUrl"
            :maxlength="32"
            autocomplete="off"
            placeholder="请输入跳转地址"
          ></el-input>
        </ElFormItem>
      </ElForm>
      <div slot="footer" class="dialog-footer">
        <ElButton type="primary" size="small" :loading="loadingServer.save" @click.stop="save()">
          保 存
        </ElButton>
        <ElButton type="danger" size="small" @click.stop="dialog = false">取 消</ElButton>
      </div>
    </ElDialog>
  </div>
</template>

<script>
  import Paging from '../../../components/paging/index.vue';
  import Upload from '../../../components/upload/index.vue';
  import layoutMixin from '../../../components/layout/layout-mixin';
  import changeTypeMixin from '../../../utils/change-type';
  import { LOADING_SET, LOADING_CHANGE } from '../../../store/modules/loading-server';

  export default {
    name: 'Banner',
    components: {
      Paging,
      Upload
    },
    mixins: [layoutMixin, changeTypeMixin],
    data() {
      return {
        loading: {
          table: false
        }, // 加载状态对象
        searchData: {
          offset: 1,
          limit: 10
        }, // 查询对象
        total: 0, // banner总条数
        tableData: [], // banner列表
        dialog: false, // 弹窗显示状态
        uploadStatus: false, // 上传状态
        imgList: [], // 上传图片
        formData: {
          id: '',
          img: '',
          place: '',
          jumpUrl: ''
        }, // banner对象
        formRules: {
          place: [{ required: true, message: '请选择显示位置', trigger: 'change' }],
          jumpUrl: [
            {
              validator: this.$verify({ required: false, text: '跳转地址', type: 'Http' }),
              trigger: 'blur'
            }
          ]
        } // banner验证对象
      };
    },
    computed: {
      useEdit() {
        return this.$store.state.user.permissions.includes('admin:banner:edit');
      }, // 是否有编辑权限
      loadingServer() {
        return this.$store.state.loadingServer;
      } // 按钮级loading对象
    },
    created() {
      this.$store.dispatch(LOADING_SET, { names: 'save' });
      this.getData();
    },
    methods: {
      search() {
        this.searchData.offset = 1;
        this.getData();
      }, // 搜索
      getData() {
        this.loading.table = true;
        this.$axios.get('admin/banners', Object.assign({}, this.searchData, { offset: this.searchData.offset - 1 })).then((response) => {
          ({ data: this.tableData, recordsTotal: this.total } = response.data);
          this.loading.table = false;
        });
      }, // 查询banner列表
      open({
        id, img, place, jumpUrl
      } = {}) {
        this.dialog = true;
        this.$formClear().then(() => {
          if (id) {
            this.imgList.splice(0, this.imgList.length, img);
            Object.assign(this.formData, { id, place, jumpUrl });
          } else {
            Object.assign(this.formData, { id: '', place: 0 });
          }
        });
      }, // 打开banner弹窗
      save() {
        this.$refs.formRef.validate((valid) => {
          if (valid) {
            if (this.uploadStatus) {
              this.$message({ message: '图片上传中', type: 'warning' });
              return false;
            }
            if (!this.imgList[0]) {
              this.$message({ message: '请上传Banner', type: 'warning' });
              return false;
            }
            this.$store.dispatch(LOADING_CHANGE, { save: true });
            const { id } = this.formData;
            this.formData.img = this.imgList.join(',');
            this.$axios[id ? 'putJson' : 'postJson']('admin/banners', this.formData).then(() => {
              this.$message({
                message: `${id ? '修改' : '新增'}成功`,
                onClose: () => {
                  if (!id) {
                    this.searchData.offset = 1;
                  }
                  this.getData();
                  this.dialog = false;
                  this.$store.dispatch(LOADING_CHANGE, { save: false });
                }
              });
            });
          }
          return false;
        });
      } // banner新增和修改
    }
  };
</script>

<style lang="scss" scoped>
  .banner {
  }
</style>
