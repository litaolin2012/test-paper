<template>
  <div class="question-classify">
    <div v-loading="loading" class="table-content">
      <div class="table-operate clearfix">
        <div class="right">
          <el-button v-if="useEdit" type="primary" size="small" @click.stop="addClassify()">
            新增分类
          </el-button>
        </div>
      </div>
      <el-table :data="tableData" :border="true">
        <el-table-column prop="name" fixed="left" align="center" label="名称" min-width="200" show-overflow-tooltip></el-table-column>
        <el-table-column prop="categoryName1" align="center" label="一级分类" min-width="100"></el-table-column>
        <el-table-column prop="categoryName2" align="center" label="二级分类" min-width="100"></el-table-column>
        <el-table-column prop="createTime" align="center" label="创建时间" min-width="200"></el-table-column>
        <el-table-column v-if="useEdit" fixed="right" align="center" label="操作" min-width="80">
          <template slot-scope="scope">
            <a href="javascript:void(0);" @click.stop="editClassify(scope.row)">修改</a>
            <a href="javascript:void(0);" @click.stop="del(scope.row)">删除</a>
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
  </div>
</template>
<script>
import Paging from '../../../components/paging/index.vue';
export default {
  name: 'QuestionClassify',
  components: {
    Paging
  },
  data() {
    return {
      loading: false,
      searchData: {
        offset: 1,
        limit: 10
      },
      total: 0, // 字典总条数
      tableData: []
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
    this.getData();
  },
  methods: {
    addClassify() {
      this.$router.push({
        name: 'add-classify'
      });
    },

    // 编辑分类
    editClassify(row) {
      this.$router.push({
        name: 'edit-classify',
        params: {
          id: row.id
        },
        query: {
          name: row.name,
          category1: row.category1,
          category2: row.category2,
          detailList: JSON.stringify(row.detailList),
          isEdit: 1
        }
      });
    },

    // 删除
    del(row) {
      this.$confirm('您确定删除该分类吗？', '提示', { type: 'warning' }).then(() => {
        this.loading = true;
        this.$axios.delete(`admin/questionClassifys/${row.id}`).then((response) => {
          if (response.status === 200) {
            const { offset, limit } = this.searchData;
            const isLast = (this.total - 1) - (offset * limit) > -limit;
            this.searchData.offset = isLast ? offset : offset - 1;
            this.getData();
            this.$message({ message: '删除成功' });
          } else {
            this.loading = false;
            this.$message({ message: '删除失败，请重试', type: 'error' });
          }
        });
      });
    },

    getData() {
      this.loading = true;
      this.$axios.get('admin/questionClassifys', Object.assign({}, this.searchData, { offset: this.searchData.offset - 1 })).then((response) => {
        ({ data: this.tableData, recordsTotal: this.total } = response.data);
        this.loading = false;
      });
    } // 查询字典列表
  }
};
</script>
<style lang="less" scoped>

</style>
