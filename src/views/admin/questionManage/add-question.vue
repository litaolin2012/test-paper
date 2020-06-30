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
            <el-select v-model="formData.category2" filterable placeholder="请选择二级分类" @change="changeCategory2">
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
            <UE id="title" ref="title" :config="config" :default-msg="formData.title"></UE>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-for="(items, index) in questionItems" :key="items.code">
        <el-col :span="23">
          <el-form-item :label="'选项' + letters[index] + '：'" required>
            <UE :id="'item' + letters[index]" :ref="'item' + letters[index]" :default-msg="items.title" :config="config"></UE>
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
          <div class="fr">
            <el-button class="pull-right" type="primary" @click="addItems()">新增选项</el-button>
          </div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="23">
          <el-form-item label="部分解析：">
            <UE id="partResolve" ref="partResolve" :config="config" :default-msg="formData.resolve"></UE>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="23">
          <el-form-item label="完整解析：">
            <UE id="resolve" ref="resolve" :config="config" :default-msg="formData.resolve"></UE>
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
      <el-row>
        <el-col :span="12">
          <el-form-item label="解锁价格：" prop="price">
            <el-input v-model="formData.price" type="number" :max="10000000" :min="0" placeholder="请输入解锁价格"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :xs="24 ">
          <el-form-item label="标签：" prop="label">
            <el-tag
              v-for="(tag,index) in tags"
              :key="index"
              :closable="true"
              :close-transition="false"
              style="margin:0 10px;"
              @close="handleClose(tag)"
            >
              {{ tag }}
            </el-tag>
            <div style="display:inline-block;width:200px;">
              <el-select
                ref="saveTagInput"
                v-model="tags"
                multiple
                class="input-new-tag"
                size="small"
                placeholder="请选择标签"
                @change="handleInputConfirm"
                @blur="handleInputConfirm"
              >
                <el-option v-for="item in tagArray" :key="item.id" :value="item.name" :label="item.name">
                </el-option>
              </el-select>
            </div>
            <el-button v-show="!inputVisible" class="button-new-tag" size="small" @click="showInput"><i class="el-icon-plus"></i></el-button>
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
        tagArray: [], // 标签数组
        tags: [], // 选择标签
        formData: {
          id: '',
          category1: '',
          category2: '',
          level: '',
          title: '',
          answer: '',
          partResolve: '',
          resolve: '',
          remark: '',
          price: 0,
          topFlag: '',
          label: ''
        }, // 回复对象
        inputVisible: false,
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
          topFlag: [{ required: true, message: '请选择是否置顶', trigger: 'change' }],
          price: [
            {
              required: true,
              validator: this.$verify({ text: '解锁价格', type: 'All' }),
              trigger: 'blur'
            }
          ]
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
      if (this.$route.params.id) {
        this.formData.id = this.$route.params.id;
        this.getDetail();
      }
    },
    methods: {
      getCategory1Data() {
        this.$axios.get('admin/categorys/0/subList').then((response) => {
          ({ data: this.category1Data } = response);
        });
      }, // 查询字典列表

      // 获取详情
      getDetail() {
        this.$axios.get(`admin/questions/${this.formData.id}`).then((response) => {
          console.log(response, 333);
          if (response.data && typeof response.data === 'object') {
            this.formData.title = response.data.title;
            this.formData.category1 = response.data.category1;
            this.formData.category2 = response.data.category2;
            this.formData.level = response.data.level;
            this.formData.partResolve = response.data.partResolve;
            this.formData.resolve = response.data.resolve;
            this.formData.remark = response.data.remark;
            this.formData.topFlag = response.data.topFlag;
            this.formData.label = response.data.label;
            this.formData.price = response.data.price;
            this.questionItems = response.data.answerList;
            this.questionItems.forEach(e => {
              if (e.correct) {
                this.formData.answer = e.code;
              }
            });
            this.tags = this.formData.label.split(',');
            this.changeCategory1();
            this.changeCategory2();
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

      // 二级分类change事件
      changeCategory2() {
        this.getTags();
      },

      // 根据分类查询标签
      getTags() {
        if (this.formData.category1 && this.formData.category2) {
          const data = {
            category1: this.formData.category1,
            category2: this.formData.category2
          };
          this.$axios.get(`admin/questionLabels/listByCategory`, data).then(response => {
            this.tagArray = response.data;
          });
        } else {
          this.tagArray = [];
        }
      },
      // 关闭标签
      handleClose(tag) { // 标签
        this.tags.splice(this.tags.indexOf(tag), 1);
      },

      getUEContent() {
        var reg = new RegExp('<p><br/></p>', 'g');
        this.formData.title = this.$refs.title.getUEContent().replace(reg, '');
        this.formData.partResolve = this.$refs.partResolve.getUEContent().replace(reg, '');
        this.formData.resolve = this.$refs.resolve.getUEContent().replace(reg, '');
        for (let i = 0; i < this.questionItems.length; i++) {
          const val = 'item' + this.letters[i];
          var trims = this.$refs[val][0].getUEContentTxt();
          if (!trims.trim()) {
            return true;
          }
          this.questionItems[i].code = this.letters[i];
          this.questionItems[i].title = this.$refs[val][0].getUEContent().replace(reg, '');
        }
        return false;
      },

      // 选择标签事件
      handleInputConfirm() {
        if (Array.isArray(this.tags) && this.tags.length > 9) {
          this.$message({
            message: '最多只能添加10个标签',
            type: 'warning'
          });
          this.inputVisible = false;
          this.tags = [];
          return;
        }
        this.inputVisible = false;
      },

      showInput() {
        this.inputVisible = true;
        this.$nextTick(_ => {
          this.$refs.saveTagInput.focus();
        });
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

      // 新增选项
      addItems() {
        if (this.questionItems.length > 7) {
          this.$message({
            message: '不能多于八个选项',
            type: 'warning'
          });
          return;
        } else {
          this.questionItems.push({
            code: '',
            correct: 0,
            title: ''
          });
        }
      },
      submitForm() {
        this.getUEContent();
        this.questionItems.forEach(e => {
          e.correct = e.code === this.formData.answer ? 1 : 0;
        });
        this.$refs.formRef.validate((valid) => {
          if (valid) {
            this.$store.dispatch(LOADING_CHANGE, { save: true });
            const { id } = this.formData;
            const data = {
              id: id,
              answerList: this.questionItems,
              category1: this.formData.category1,
              category2: this.formData.category2,
              label: this.tags.join(','),
              level: this.formData.level,
              partResolve: this.formData.partResolve,
              price: this.formData.price,
              remark: this.formData.remark,
              resolve: this.formData.resolve,
              title: this.formData.title,
              topFlag: this.formData.topFlag
            };
            this.$axios[id ? 'putJson' : 'postJson']('admin/questions', data).then(() => {
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
      }, // 字典新增和修改

      // 取消
      cancel() {
        this.$router.go(-1);
      }
    }
  };
</script>

<style lang="scss" scoped>
.add-question {
  width: 1000px;
  margin: 0 auto;
  .pull-right {
    margin-bottom: 24px;
  }
}
</style>
