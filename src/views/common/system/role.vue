<template>
  <div class="role">
    <div v-loading="loading.table" class="table-content">
      <div class="table-operate clearfix">
        <div class="right">
          <ElButton v-if="useEdit" type="primary" size="small" @click.stop="open()">
            新增角色
          </ElButton>
        </div>
      </div>
      <ElTable :data="tableData" :border="true">
        <ElTableColumn prop="id" align="center" label="角色ID" min-width="100"></ElTableColumn>
        <ElTableColumn prop="name" align="center" label="角色名称" min-width="200"></ElTableColumn>
        <ElTableColumn align="center" label="状态" min-width="90">
          <template slot-scope="scope">
            <ElSwitch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              :disabled="!useEdit || scope.row.delaultFlag === 1"
              @change="changeType(`common/roles/${scope.row.id}/${scope.row.status}`,
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
        <ElTableColumn v-if="useEdit" align="center" label="操作" min-width="80">
          <template slot-scope="scope">
            <a
              v-if="scope.row.delaultFlag !== 1"
              href="javascript:void(0);"
              @click.stop="open(scope.row)"
            >修改</a>
            <span v-else>-</span>
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
      :title="`${formData.id ? '修改' : '新增'}角色`"
      top="20vh"
      width="500px"
    >
      <ElForm
        ref="formRef"
        v-loading="loading.dialog"
        :model="formData"
        :rules="formRules"
        size="small"
        label-width="100px"
        @keydown.enter.native.prevent="!loadingServer.save && save()"
      >
        <ElFormItem prop="name" label="角色名称：">
          <ElInput
            v-model="formData.name"
            v-focus="dialog"
            :maxlength="64"
            autocomplete="off"
            placeholder="请输入角色名称"
          ></ElInput>
        </ElFormItem>
        <div class="role-tree">
          <ElScrollbar wrap-class="scrollbar-custom">
            <ElTree
              ref="tree"
              :data="tree"
              show-checkbox
              node-key="id"
              :props="{ children: 'child', label: 'name' }"
            ></ElTree>
          </ElScrollbar>
        </div>
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
    name: 'Role',
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
          offset: 1,
          limit: 10
        }, // 查询对象
        total: 0, // 角色总条数
        tableData: [], // 角色列表
        dialog: false, // 弹窗显示状态
        tree: [], // 权限树
        leafList: [], // 叶子节点列表
        formData: {
          id: '',
          name: '',
          permissionIds: []
        }, // 角色对象
        formRules: {
          name: [
            {
              required: true,
              validator: this.$verify({ text: '角色名称', type: 'Chinese' }),
              trigger: 'blur'
            }
          ]
        } // 角色验证对象
      };
    },
    computed: {
      useEdit() {
        return this.$store.state.user.permissions.includes('common:role:edit');
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
      getData() {
        this.loading.table = true;
        const { offset, limit } = this.searchData;
        this.$axios.get('common/roles', { offset: offset - 1, limit }).then((response) => {
          ({ data: this.tableData, recordsTotal: this.total } = response.data);
          this.loading.table = false;
        });
      }, // 查询角色列表
      open({ id, name } = {}) {
        this.dialog = true;
        this.$formClear().then(() => {
          this.loading.dialog = true;
          this.$nextTick(() => {
            this.$refs.tree.setCheckedKeys([]);
          });
          const axios = [this.tree[0] ? Promise.resolve(true) : this.$axios.get('common/permissions/tree')];
          if (id) {
            axios.push(this.$axios.get('common/permissions', { roleId: id }));
          }
          Promise.all(axios).then((response) => {
            if (response[0] instanceof Object) {
              [{ data: this.tree }] = response;
              this.leafList = this.setLeafList(this.tree);
            }
            if (id) {
              const permissionIds = [];
              const checkedIds = [];
              response[1].data.map((item) => {
                const { id: _id } = item;
                this.leafList.map((leaf) => {
                  if (_id === leaf.id) {
                    checkedIds.push(_id);
                  }
                  return true;
                });
                permissionIds.push(_id);
                return true;
              });
              Object.assign(this.formData, { id, name, permissionIds });
              this.$nextTick(() => {
                this.$refs.tree.setCheckedKeys(checkedIds);
              });
            } else {
              this.formData.id = '';
            }
            this.loading.dialog = false;
          });
        });
      }, // 打开角色弹窗
      setLeafList(tree) {
        let leafList = [];
        tree.map((item) => {
          if (item.child[0]) {
            leafList = leafList.concat(this.setLeafList(item.child));
          } else {
            leafList.push(item);
          }
          return true;
        });
        return leafList;
      },
      save() {
        this.$refs.formRef.validate((valid) => {
          if (valid) {
            const permissionIds = this.$refs.tree.getHalfCheckedKeys()
              .concat(this.$refs.tree.getCheckedKeys());
            if (!permissionIds[0]) {
              this.$message({ message: '请选择角色', type: 'error' });
              return false;
            }
            this.$store.dispatch(LOADING_CHANGE, { save: true });
            const { id } = this.formData;
            this.$axios[id ? 'putJson' : 'postJson']('common/roles', Object.assign({}, this.formData, { permissionIds })).then(() => {
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
          return true;
        });
      } // 角色新增和修改
    }
  };
</script>

<style lang="scss" scoped>
  .role {
    .role-tree {
      height: 310px;
      margin-top: 30px;
    }
  }
</style>
