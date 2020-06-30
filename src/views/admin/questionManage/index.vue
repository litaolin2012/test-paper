<template>
  <div class="question-manage">
    <div v-loading="loading" class="table-content">
      <div class="table-operate clearfix">
        <div class="right">
          <el-button v-if="useEdit" type="primary" size="small" @click.stop="addQuestion()">
            新增题目
          </el-button>
        </div>
      </div>
      <el-table :data="tableData" :border="true">
        <el-table-column prop="title" fixed="left" align="center" label="题干" min-width="200" show-overflow-tooltip>
          <template slot-scope="scope">
            <div class="html-div" v-html="scope.row.title"></div>
          </template>
        </el-table-column>
        <el-table-column prop="categoryName1" align="center" label="难易程度" min-width="200">
          <template slot-scope="scope">
            {{ levelData[scope.row.level].label }}
          </template>
        </el-table-column>
        <el-table-column prop="price" align="center" label="解锁价格" min-width="200"></el-table-column>
        <el-table-column prop="categoryName1" align="center" label="一级分类" min-width="100"></el-table-column>
        <el-table-column prop="categoryName2" align="center" label="二级分类" min-width="100"></el-table-column>
        <el-table-column prop="franchiseeId" align="center" label="加盟商ID" min-width="100"></el-table-column>
        <el-table-column prop="categoryName2" align="center" label="审核状态" min-width="100">
          <template slot-scope="scope">
            {{ verifyData[scope.row.auditStatus].label }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" align="center" label="创建时间" min-width="200"></el-table-column>
        <el-table-column prop="updateTime" align="center" label="更新时间" min-width="200"></el-table-column>
        <el-table-column v-if="useEdit" fixed="right" align="center" label="操作" min-width="80">
          <template slot-scope="scope">
            <a v-if="!scope.row.auditStatus" href="javascript:void(0);" @click.stop="openAudit(scope.row.id)">审核</a>
            <a href="javascript:void(0);" @click.stop="editQuestion(scope.row)">修改</a>
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
    <el-dialog v-if="useEdit" :visible.sync="dialog" title="题目审核" top="25vh" width="500px">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        size="small"
        label-width="90px"
        @keydown.enter.stop.native="!loadingServer.audit && audit()"
      >
        <el-form-item prop="auditStatus" label="审核结果：">
          <el-radio-group v-model="formData.auditStatus">
            <el-radio :label="1">审核通过</el-radio>
            <el-radio :label="2">审核拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" :loading="loadingServer.audit" @click.stop="audit()">
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
    name: 'QuestionManage',
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
          auditStatus: 1
        }, // 产品审核对象
        formRules: {
        } // 产品审核验证对象
      };
    },
    computed: {
      useEdit() {
        return this.$store.state.user.permissions.includes('admin:category:query');
      }, // 是否有编辑权限
      loadingServer() {
        return this.$store.state.loadingServer;
      }, // 按钮级loading对象
      levelData() {
        return this.$store.state.fixedData.levelData;
      },
      verifyData() {
        return this.$store.state.fixedData.verifyData;
      }
    },
    created() {
      this.$store.dispatch(LOADING_SET, { names: 'audit' });
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
        this.$axios.get('admin/questions', Object.assign({}, this.searchData, { offset: this.searchData.offset - 1 })).then((response) => {
          ({ data: this.tableData, recordsTotal: this.total } = response.data);
          this.loading = false;
        });
      }, // 查询字典列表

      // 新增题目
      addQuestion() {
        this.$router.push({
          name: 'addQuestion'
        });
      },

      // 修改题目
      editQuestion(row) {
        this.$router.push({
          name: 'editQuestion',
          params: {
            id: row.id
          }
        });
      },

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

      // 打开审核窗口
      openAudit(id) {
        this.dialog = true;
        this.$formClear().then(() => {
          Object.assign(this.formData, { id, auditStatus: 1 });
        });
      },

      // 审核
      audit() {
        this.$refs.formRef.validate((valid) => {
          if (valid) {
            this.$store.dispatch(LOADING_CHANGE, { audit: true });
            this.$axios.putJson('admin/questions/audit', this.formData).then(() => {
              this.$message({
                message: '审核成功',
                onClose: () => {
                  this.getData();
                  this.dialog = false;
                  this.$store.dispatch(LOADING_CHANGE, { audit: false });
                }
              });
            });
          }
        });
      }
    }
  };
</script>

<style lang="scss" scoped>
</style>
