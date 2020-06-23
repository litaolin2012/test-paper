<template>
  <div class="question-tag">
    <div v-loading="loading" class="table-content">
      <div class="table-operate clearfix">
        <div class="right">
          <el-button v-if="useEdit" type="primary" size="small" @click.stop="open()">
            新增标签
          </el-button>
        </div>
      </div>
      <el-table :data="tableData" :border="true">
        <el-table-column prop="name" fixed="left" align="center" label="名称" min-width="200">
        </el-table-column>
        <el-table-column prop="categoryName1" align="center" label="一级分类" min-width="200"></el-table-column>
        <el-table-column prop="categoryName2" align="center" label="二级分类" min-width="200"></el-table-column>
        <el-table-column v-if="useEdit" fixed="right" align="center" label="操作" min-width="80">
          <template slot-scope="scope">
            <a href="javascript:void(0);" @click.stop="open(scope.row)">修改</a>
          </template>
        </el-table-column>
      </el-table>
      <Paging
        :page-no.sync="searchData.offset"
        :page-size.sync="searchData.limit"
        :total="total"
        @change="getData"
      ></Paging>
    </div>
    <el-dialog
      v-if="useEdit"
      :visible.sync="dialog"
      :title="`${formData.id ? '修改' : '新增'}标签`"
      top="25vh"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        size="small"
        label-width="95px"
        @keydown.enter.stop.native="!loadingServer.save && save()"
      >
        <el-form-item prop="name" label="名称：">
          <el-input
            v-model="formData.name"
            v-focus="dialog"
            :maxlength="64"
            autocomplete="off"
            placeholder="请输入名称"
          ></el-input>
        </el-form-item>
        <el-form-item prop="category1" label="一级分类：">
          <el-select v-model="formData.category1" filterable placeholder="请选择一级分类" @change="changeCategory1">
            <el-option v-for="item in category1Data" :key="item.id" :value="item.id" :label="item.name">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="category2" label="二级分类：">
          <el-select v-model="formData.category2" filterable placeholder="请选择二级分类">
            <el-option v-for="item in category2Data" :key="item.id" :value="item.id" :label="item.name">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" :loading="loadingServer.save" @click.stop="save()">
          保 存
        </el-button>
        <el-button type="danger" size="small" @click.stop="dialog = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import Paging from '../../../components/paging/index.vue';
  import { LOADING_SET, LOADING_CHANGE } from '../../../store/modules/loading-server';

  export default {
    name: 'QuestionTag',
    components: {
      Paging
    },
    data() {
      return {
        loading: false, // 加载状态
        category1Data: [], // 一级分类
        category2Data: [], // 二级分类
        searchData: {
          offset: 1,
          limit: 10
        }, // 查询对象
        total: 0, // 字典总条数
        tableData: [], // 字典列表
        dialog: false, // 弹窗显示状态
        formData: {
          id: '',
          name: '',
          category1: '',
          category2: ''
        }, // 回复对象
        formRules: {
          name: [
            {
              required: true,
              validator: this.$verify({ text: '名称', type: 'All' }),
              trigger: 'blur'
            }
          ],
          category1: [{ required: true, message: '请选择一级分类', trigger: 'change' }],
          category2: [{ required: true, message: '请选择二级分类', trigger: 'change' }]
        } // 回复验证对象
      };
    },
    computed: {
      useEdit() {
        return this.$store.state.user.permissions.includes('admin:category:query');
      }, // 是否有编辑权限
      loadingServer() {
        return this.$store.state.loadingServer;
      } // 按钮级loading对象
    },
    created() {
      this.$store.dispatch(LOADING_SET, { names: 'save' });
      this.getData();
      this.getCategory1Data();
    },
    methods: {
      getCategory1Data() {
        this.$axios.get('admin/categorys/0/subList').then((response) => {
          ({ data: this.category1Data } = response);
        });
      }, // 查询字典列表
      search() {
        this.searchData.offset = 1;
        this.getData();
      }, // 搜索
      getData() {
        this.loading = true;
        this.$axios.get('admin/questionLabels', Object.assign({}, this.searchData, { offset: this.searchData.offset - 1 })).then((response) => {
          ({ data: this.tableData, recordsTotal: this.total } = response.data);
          this.loading = false;
        });
      }, // 查询字典列表
      open({
        id, category1, category2, name
      } = {}) {
        this.dialog = true;
        this.$formClear().then(() => {
          if (id) {
            Object.assign(this.formData, {
              id, category1, name, category2
            });
            this.changeCategory1();
          } else {
            Object.assign(this.formData, { id: '' });
          }
        });
      }, // 打开字典弹窗

      // 一级分类change事件
      changeCategory1() {
        if (!this.formData.category1) {
          this.formData.category2 = '';
          this.category2Data = [];
        } else {
          this.$axios.get(`admin/categorys/${this.formData.category1}/subList`).then((response) => {
            ({ data: this.category2Data } = response);
          });
        }
      },
      save() {
        this.$refs.formRef.validate((valid) => {
          if (valid) {
            this.$store.dispatch(LOADING_CHANGE, { save: true });
            const { id } = this.formData;
            this.$axios[id ? 'putJson' : 'postJson']('admin/questionLabels', this.formData).then(() => {
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
        });
      } // 字典新增和修改
    }
  };
</script>

<style lang="scss" scoped>
</style>
