<template>
  <div class="user">
    <ElForm
      :model="searchData"
      :inline="true"
      size="mini"
      label-width="75px"
      label-position="left"
      class="search-form"
      @keydown.enter.stop.native="!loading.table && search()"
    >
      <ElRow>
        <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
          <ElFormItem label="用户状态">
            <ElSelect v-model="searchData.status" placeholder="请选择用户状态" @change="search">
              <ElOption value="" label="全部"></ElOption>
              <ElOption value="1" label="已启用"></ElOption>
              <ElOption value="0" label="已停用"></ElOption>
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
          <ElFormItem label="名称">
            <ElInput v-model="searchData.name" :maxlength="64" placeholder="请输入名称"></ElInput>
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
          <ElFormItem label="登录账户">
            <ElInput v-model="searchData.username" :maxlength="64" placeholder="请输入登录账户">
              <ElButton
                slot="append"
                icon="el-icon-search"
                class="query-button"
                @click.stop="search()"
              ></ElButton>
            </ElInput>
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>
    <div v-loading="loading.table" class="table-content">
      <div class="table-operate clearfix">
        <div class="right">
          <ElButton v-if="useEdit" type="primary" size="small" @click.stop="open()">
            新增账户
          </ElButton>
        </div>
      </div>
      <ElTable :data="tableData" :border="true">
        <ElTableColumn prop="id" fixed="left" align="center" label="用户ID" min-width="100">
        </ElTableColumn>
        <ElTableColumn prop="name" fixed="left" align="center" label="名称" min-width="150">
        </ElTableColumn>
        <ElTableColumn prop="username" fixed="left" align="center" label="登录账户" min-width="150">
        </ElTableColumn>
        <ElTableColumn prop="mobile" align="center" label="手机号" min-width="130"></ElTableColumn>
        <ElTableColumn prop="roleNames" align="center" label="角色" min-width="150">
        </ElTableColumn>
        <ElTableColumn align="center" label="状态" min-width="90">
          <template slot-scope="scope">
            <ElSwitch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              :disabled="!useEdit || scope.row.mainAccountFlag === 1"
              @change="changeType(`common/users/${scope.row.id}/${scope.row.status}`,
                                  scope.row)"
            ></ElSwitch>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createTime" align="center" label="创建时间" min-width="160">
        </ElTableColumn>
        <ElTableColumn prop="updateTime" align="center" label="更新时间" min-width="160">
        </ElTableColumn>
        <ElTableColumn prop="createByName" align="center" label="操作人" min-width="100">
        </ElTableColumn>
        <ElTableColumn v-if="useEdit" fixed="right" align="center" label="操作" min-width="160">
          <template slot-scope="scope">
            <a href="javascript:void(0);" @click.stop="open(scope.row)">修改</a>
            <a href="javascript:void(0);" @click.stop="resetPassword(scope.row.id)">重置密码</a>
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
      :title="`${formData.id ? '修改' : '新增'}账户`"
      top="25vh"
      width="500px"
    >
      <ElForm
        ref="formRef"
        v-loading="loading.dialog"
        :model="formData"
        :rules="formRules"
        size="small"
        label-width="95px"
        @keydown.enter.stop.native="!loadingServer.save && save()"
      >
        <ElFormItem prop="mobile" label="手机号：">
          <ElInput
            v-model="formData.mobile"
            v-focus="dialog"
            :maxlength="11"
            autocomplete="off"
            placeholder="请输入手机号"
          ></ElInput>
        </ElFormItem>
        <ElFormItem prop="username" label="登录账户：">
          <ElInput
            v-model="formData.username"
            :maxlength="64"
            :disabled="Boolean(formData.id)"
            autocomplete="off"
            placeholder="请输入登录账户"
          ></ElInput>
        </ElFormItem>
        <ElFormItem prop="name" label="名称：">
          <ElInput v-model="formData.name" :maxlength="64" autocomplete="off" placeholder="请输入名称">
          </ElInput>
        </ElFormItem>
        <ElFormItem prop="roleIds" label="账户角色：">
          <ElCheckboxGroup v-model="formData.roleIds">
            <ElCheckbox v-for="item in roles" :key="item.id" :label="item.id">
              {{ item.name }}
            </ElCheckbox>
          </ElCheckboxGroup>
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
  import changeTypeMixin from '../../../utils/change-type';
  import { LOADING_SET, LOADING_CHANGE } from '../../../store/modules/loading-server';

  export default {
    name: 'User',
    components: {
      Paging
    },
    mixins: [changeTypeMixin],
    data() {
      return {
        loading: {
          table: false,
          dialog: false
        }, // 加载状态对象
        searchData: {
          status: '',
          name: '',
          username: '',
          offset: 1,
          limit: 10
        }, // 查询对象
        total: 0, // 账户总条数
        tableData: [], // 账户列表
        dialog: false, // 弹窗显示状态
        roles: [], // 角色列表
        formData: {
          id: '',
          mobile: '',
          username: '',
          name: '',
          roleIds: []
        }, // 账户对象
        formRules: {
          mobile: [
            {
              required: true,
              validator: this.$verify({ text: '手机号', type: 'Mobile' }),
              trigger: 'blur'
            }
          ],
          username: [
            { required: true, validator: this.$verify({ text: '登录账户' }), trigger: 'blur' }
          ],
          name: [
            {
              required: true,
              validator: this.$verify({ text: '名称', type: 'Chinese' }),
              trigger: 'blur'
            }
          ]
        } // 账户验证对象
      };
    },
    computed: {
      useEdit() {
        return this.$store.state.user.permissions.includes('common:user:edit');
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
        this.$axios.get('common/users', Object.assign({}, this.searchData, { offset: this.searchData.offset - 1 })).then((response) => {
          ({ data: this.tableData, recordsTotal: this.total } = response.data);
          this.loading.table = false;
        });
      }, // 查询账户列表
      open({
        id, mobile, username, name
      } = {}) {
        this.dialog = true;
        this.$formClear().then(() => {
          this.loading.dialog = true;
          const axios = [this.roles[0] ? Promise.resolve(true) : this.$axios.get('common/roles/all')];
          if (id) {
            axios.push(this.$axios.get('common/roles', { userId: id }));
          }
          Promise.all(axios).then((response) => {
            if (response[0] instanceof Object) {
              [{ data: this.roles }] = response;
            }
            if (id) {
              const roleIds = [];
              response[1].data.map(item => roleIds.push(item.id));
              Object.assign(this.formData, {
                id, mobile, username, name, roleIds
              });
            } else {
              this.formData.id = '';
            }
            this.loading.dialog = false;
          });
        });
      }, // 打开账户弹窗
      save() {
        this.$refs.formRef.validate((valid) => {
          if (valid) {
            this.$store.dispatch(LOADING_CHANGE, { save: true });
            const { id, roleIds } = this.formData;
            const _rolesIds = [];
            this.roles.map((item) => {
              const { id: _id } = item;
              if (roleIds.includes(_id)) {
                _rolesIds.push(_id);
              }
              return true;
            });
            this.$axios[id ? 'putJson' : 'postJson']('common/users', Object.assign({}, this.formData, { roleIds: _rolesIds })).then(() => {
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
      }, // 账户新增和修改
      resetPassword(id) {
        this.$confirm('您确定重置密码吗？', '提示', { type: 'warning' }).then(() => {
          this.loading.table = true;
          this.$axios.put(`common/users/resetPassword/${id}`).then((response) => {
            if (response.status === 200) {
              this.$message({ message: '重置密码成功' });
            } else {
              this.$message({ message: '重置密码失败，请重试', type: 'error' });
            }
            this.loading.table = false;
          });
        });
      } // 重置密码
    }
  };
</script>

<style lang="scss" scoped>
  .user {
  }
</style>
