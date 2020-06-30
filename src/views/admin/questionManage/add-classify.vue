<template>
  <div class="add-classify">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      size="small"
      label-width="110px"
      class="add-classify-form"
    >
      <el-row>
        <el-col :span="24">
          <el-form-item label="名称：" prop="name">
            <el-input
              v-model="formData.name"
              :maxlength="32"
              autocomplete="off"
              placeholder="请输入名称"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item prop="category1" label="一级分类：">
            <el-select v-model="formData.category1" filterable placeholder="请选择一级分类" @change="changeCategory1">
              <el-option v-for="item in category1Data" :key="item.id" :value="item.id" :label="item.name">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item prop="category2" label="二级分类：">
            <el-select v-model="formData.category2" filterable placeholder="请选择二级分类" @change="changeCategory2">
              <el-option v-for="item in category2Data" :key="item.id" :value="item.id" :label="item.name">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="23">
          <el-form-item prop="category2" label="题目列表：">
            <div v-for="item in selectQuestionList" :key="item.id">
              <div class="html-div" v-html="item.title"></div>
            </div>
            <a href="javascript:;" class="el-button--text" @click="selectQuestion">选择题目</a>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col>
          <el-form-item>
            <el-button type="primary" @click="submitForm()">确定</el-button>
            <el-button @click="cancel()">取消</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-dialog :visible.sync="questionDialog" title="题目列表" :modal-append-to-body="false" width="55%" class="add-question-dialog">
      <div class="search-div">
        <div style="display: inline-block; width: 200px;">
          <el-input v-model="searchData.title" placeholder="请输入题干" @keyup.enter.native="getList">
            <i slot="suffix" class="el-icon-search el-input__icon" @click="getList"/>
          </el-input>
        </div>
      </div>
      <el-table ref="questionTable" v-loading="questionLoading" :data="tableData" :border="true" class="marginTop24" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"/>
        <el-table-column prop="title" label="题干" min-width="160" show-overflow-tooltip align="center">
          <template slot-scope="scope">
            <div class="html-div text-overflow-hidden" v-html="scope.row.title"></div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="难易程度" min-width="200">
          <template slot-scope="scope">
            {{ levelData[scope.row.level].label }}
          </template>
        </el-table-column>
        <el-table-column prop="price" align="center" label="解锁价格" min-width="200"></el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="questionDialog = false">取 消</el-button>
        <el-button type="primary" @click="addQuestionSure">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { LOADING_CHANGE } from '../../../store/modules/loading-server';
export default {
  name: 'AddClassify',
  data() {
    return {
      category1Data: [],
      category2Data: [],
      formData: {
        id: '',
        name: '',
        category1: '',
        category2: '',
        questionIds: []
      },
      formRules: {
        name: [
          {
            required: true,
            validator: this.$verify({ text: '名称', type: 'All' }),
            trigger: 'blur'
          }
        ]
      },
      questionDialog: false,
      questionLoading: false,
      searchData: {
        title: '',
        category1: '',
        category2: ''
      },
      tableData: [],
      selectData: [],
      selectQuestionList: [],
      isEdit: false
    };
  },
  computed: {
    levelData() {
      return this.$store.state.fixedData.levelData;
    }
  },
  created() {
    this.getCategory1Data();
    this.isEdit = !!this.$route.query.isEdit;
    if (this.isEdit) {
      this.formData.id = this.$route.params.id;
      this.formData.name = this.$route.query.name;
      this.formData.category1 = this.$route.query.category1;
      this.formData.category2 = this.$route.query.category2;
      this.selectQuestionList = JSON.parse(this.$route.query.detailList);
      this.selectQuestionList.forEach(e => {
        e.id = e.questionId;
        e.title = e.questionTitle;
      });
      this.formData.questionIds = this.selectQuestionList.map(e => e.id);
      this.changeCategory1();
    }
  },
  methods: {
    getCategory1Data() {
      this.$axios.get('admin/categorys/0/subList').then((response) => {
        ({ data: this.category1Data } = response);
      });
    }, // 查询字典列表

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

    // 二级分类change事件
    changeCategory2() {
      // this.getTags();
    },

    // 选择题目
    selectQuestion() {
      this.questionDialog = true;
      this.getList();
    },
    getList() {
      this.loading = true;
      this.searchData.category1 = this.formData.category1;
      this.searchData.category2 = this.formData.category2;
      this.$axios.get('admin/questions', this.searchData).then((response) => {
        ({ data: this.tableData } = response.data);
        this.loading = false;
        this.$nextTick(() => {
          this.tableData.forEach(e => {
            const index = this.selectQuestionList.findIndex(u => u.id === e.id);
            if (index > -1) {
              this.$refs.questionTable.toggleRowSelection(e, true);
            }
          });
        });
      });
    },
    handleSelectionChange(selectData) {
      this.selectData = selectData;
    },

    // 确认新增题目
    addQuestionSure() {
      this.selectQuestionList = [];
      this.selectData.forEach(e => {
        this.selectQuestionList.push({ ...e });
      });
      this.formData.questionIds = this.selectQuestionList.map(e => e.id);
      this.questionDialog = false;
    },

    // 确认新增分类
    submitForm() {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          const { id } = this.formData;
          this.$axios[id ? 'putJson' : 'postJson']('admin/questionClassifys', this.formData).then(() => {
            this.$message({
              message: `${id ? '修改' : '新增'}成功`,
              onClose: () => {
                this.$router.go(-1);
                this.$store.dispatch(LOADING_CHANGE, { save: false });
              }
            });
          });
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
.add-classify {
  width: 1000px;
  margin: 0 auto;
  .pull-right {
    margin-bottom: 24px;
  }
  .search-div {
    text-align: right;
  }
}
</style>
