<template>
  <div class="add-question">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      size="small"
      label-width="110px"
      class="add-question"
    >
      <el-row>
        <el-col :span="23">
          <el-form-item prop="category1" label="一级分类：">
            <el-select v-model="formData.category1" filterable placeholder="请选择一级分类" @change="changeCategory1">
              <el-option v-for="item in category1Data" :key="item.id" :value="item.id" :label="item.name">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="23">
          <el-form-item prop="category2" label="二级分类：">
            <el-select v-model="formData.category2" filterable placeholder="请选择二级分类">
              <el-option v-for="item in category2Data" :key="item.id" :value="item.id" :label="item.name">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="难度：" prop="level">
            <el-radio-group v-model="formData.level">
              <el-radio :label="0">简单</el-radio>
              <el-radio :label="1">中等</el-radio>
              <el-radio :label="2">困难</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="23">
          <el-form-item label="题干：" required>
            <UE :config="config" :default-msg="formData.title"></UE>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-for="(items, index) in questionItems" :key="items.code">
        <el-col :span="23">
          <el-form-item :label="'选项' + letters[index] + '：'" required>
            <UE :id="'item' + letters[index]" :ref="'item' + letters[index]" :default-msg="items.value" :config="config"></UE>
          </el-form-item>
          <el-form-item>
            <el-radio-group v-model="formData.answer">
              <el-radio :label="letters[index]">正确答案</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="1">
          <el-button type="text" icon="el-icon-delete" @click.stop="deleteItem(index)"></el-button>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="23">
          <el-form-item label="完整解析：" required>
            <UE :config="config" :default-msg="formData.resolve"></UE>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="23">
          <el-form-item label="备注：">
            <el-input v-model="formData.remark" type="textarea" :rows="3" :maxlength="512" auto-complete="off" placeholder="请输入备注"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="是否置顶：" prop="topFlag">
            <el-radio-group v-model="formData.topFlag">
              <el-radio :label="0">否</el-radio>
              <el-radio :label="1">是</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
  import { LOADING_SET, LOADING_CHANGE } from '../../../store/modules/loading-server';
  import UE from '../../../components/ue/index.vue';
  export default {
    name: 'AddQuestion',
    components: { UE },
    data() {
      return {
        loading: false, // 加载状态
        category1Data: [], // 一级分类
        category2Data: [], // 二级分类
        formData: {
          id: '',
          name: '',
          category1: '',
          category2: '',
          level: '',
          title: '',
          answer: '',
          resolve: '',
          remark: '',
          topFlag: ''
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
          category2: [{ required: true, message: '请选择二级分类', trigger: 'change' }],
          level: [{ required: true, message: '请选择难度', trigger: 'change' }],
          topFlag: [{ required: true, message: '请选择是否置顶', trigger: 'change' }]
        }, // 回复验证对象
        config: {
          initialFrameWidth: null,
          initialFrameHeight: 80,
          elementPathEnabled: false,
          toolbars: [[
              'fullscreen', 'source', '|',
              'bold', 'italic', 'underline', 'forecolor', '|', 'formatmatch', 'fontsize', '|', 'insertimage', 'kityformula', 'preview'
          ]]
        },
        letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
        questionItems: [
          { code: 'A', correct: 0, title: '' },
          { code: 'B', correct: 0, title: '' },
          { code: 'C', correct: 0, title: '' },
          { code: 'D', correct: 0, title: '' }
        ]
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
      this.getCategory1Data();
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
      // 删除题目选项
      deleteItem(index) {
        if (this.questionItems.length < 3) {
          this.$message({
            message: '不能少于两个选项',
            type: 'warning'
          });
          return;
        } else {
          this.questionItems.splice(index, 1);
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
.add-question {
  width: 1000px;
  margin: 0 auto;
}
</style>
