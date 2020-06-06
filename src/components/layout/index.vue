<template>
  <div class="layout">
    <aside>
      <ElScrollbar wrap-class="scrollbar-custom">
        <el-menu
          :router="true"
          :default-active="active"
          :unique-opened="true"
          background-color="#304156"
          text-color="rgb(191, 203, 217)"
        >
          <template v-for="(first, fIndex) in menu">
            <el-submenu v-if="first.child[0]" :key="fIndex" :index="first.href">
              <template slot="title">
                <i class="fa" :class="[`fa-${first.icon}`]"></i>
                <span v-text="first.name"></span>
              </template>
              <template v-for="(second, sIndex) in first.child">
                <el-submenu v-if="second.child[0]" :key="sIndex" :index="second.href">
                  <template slot="title">
                    <i class="fa" :class="[`fa-${second.icon}`]"></i>
                    <span v-text="second.name"></span>
                  </template>
                  <el-menu-item
                    v-for="thirdly in second.child"
                    :key="thirdly.id"
                    :index="thirdly.href"
                    :route="{ name: thirdly.href }"
                  >
                    <i class="fa" :class="[`fa-${thirdly.icon}`]"></i>
                    <span slot="title" v-text="thirdly.name"></span>
                  </el-menu-item>
                </el-submenu>
                <el-menu-item
                  v-else
                  :key="sIndex"
                  :index="second.href"
                  :route="{ name: second.href }"
                >
                  <!-- <i class="fa" :class="[`fa-${second.icon}`]"></i> -->
                  <span slot="title" v-text="second.name"></span>
                </el-menu-item>
              </template>
            </el-submenu>
            <el-menu-item v-else :key="fIndex" :index="first.href" :route="{ name: first.href }">
              <i class="fa" :class="[`fa-${first.icon}`]"></i>
              <span slot="title" v-text="first.name"></span>
            </el-menu-item>
          </template>
        </el-menu>
      </ElScrollbar>
    </aside>
    <section>
      <div ref="breadcrumb" class="breadcrumb">
        <ElBreadcrumb separator-class="el-icon-arrow-right">
          <span><i class="fa fa-map-marker"></i>您的位置：</span>
          <el-breadcrumb-item
            v-for="item in breadcrumb"
            :key="item.id"
            :to="{ name: item.href, params: item.params || {} }"
          >
            <span v-text="item.name"></span>
          </el-breadcrumb-item>
        </ElBreadcrumb>
        <div class="user-list">
          <a href="javascript:void(0);" class="user-name disabled">您好，{{ user.name }}</a>
          <a href="javascript:void(0);" @click.stop="logout()">
            <i class="fa fa-power-off"></i>安全退出
          </a>
        </div>
      </div>
      <div ref="section" class="section">
        <router-view></router-view>
      </div>
    </section>
    <Artwork :img-array="artwork.src" :show.sync="artwork.show"></Artwork>
  </div>
</template>

<script>
  import { USER_LOGOUT } from '../../store/modules/user';
  import Artwork from '../artwork/index.vue';

  export default {
    name: 'Layout',
    components: {
      Artwork
    },
    data() {
      return {
        active: '', // 菜单选中状态
        breadcrumb: [], // 面包屑导航
        artwork: {
          src: [],
          show: false
        } // 图片预览对象
      };
    },
    computed: {
      config() {
        return this.$store.state.config;
      }, // 初始化配置对象
      user() {
        return this.$store.state.user;
      }, // 用户对象
      menu() {
        return this.$store.state.menu.menu;
      } // 菜单数组
    },
    watch: {
      $route() {
        this.setSectionHeight();
        this.initBreadcrumb(this.menu);
      } // 监听路由，更新主体高度，更新面包屑导航
    },
    created() {
      this.initBreadcrumb(this.menu);
    },
    mounted() {
      this.setSectionHeight();
    },
    methods: {
      logout() {
        this.$confirm('您确定要退出吗？', '提示', { type: 'warning' })
          .then(() => {
            // this.$loading({
            //   text: '加载中...',
            //   background: 'rgba(255,255,255,.4)'
            // });
            this.$store.dispatch(USER_LOGOUT);
          });
      }, // 退出
      setSectionHeight() {
        const { section, breadcrumb: { offsetHeight: breadcrumbHeight }} = this.$refs;
        const scroll = document.body.scrollWidth > window.innerWidth ? 17 : 0;
        section.setAttribute('style', `min-height:${window.innerHeight - breadcrumbHeight - scroll}px`);
      }, // 设置主体内容最小高度
      initBreadcrumb(menu, breadcrumb = []) {
        const { name, meta: { parent }} = this.$route;
        menu.filter((item) => {
          const { href } = item;
          if (href === name || href === parent) {
            this.breadcrumb = [...breadcrumb, item];
            if (item.child[0]) {
              item.child.filter((_item) => {
                const { href: _href } = _item;
                if (_href === name || _href === parent) {
                  this.active = _href;
                  this.breadcrumb.push(_item);
                  return true;
                }
                return false;
              });
            }
            this.active = this.active || item.href;
            return true;
          }
          if (item.child[0]) {
            this.initBreadcrumb(item.child, [...breadcrumb, item]);
          }
          return false;
        });
      }, // 设置面包屑导航
      setBreadcrumb(data) {
        let _data = data;
        const { name, meta: { title, parent }} = this.$route;
        if (!_data) {
          _data = { href: name, name: title };
        }
        this.$nextTick(() => {
          const { length } = this.breadcrumb;
          this.breadcrumb.filter((item, index) => {
            const { href } = item;
            if ((href === name || href === parent) && index !== length - 1) {
              this.breadcrumb.splice(index + 1, this.breadcrumb.length);
              return true;
            }
            return false;
          });
          if (_data instanceof Array) {
            this.breadcrumb = this.breadcrumb.concat(_data);
          } else {
            this.breadcrumb.push(_data);
          }
        });
      } // 追加面包屑导航，接收值为对象或数组，href为路由名，name为显示文字
    }
  };
</script>

<style lang="scss" scoped>
  @import "../../styles/config";

  .layout {
    position: relative;

    aside {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: $asideWidth;
      background-color: $asideBackgroundColor;

      .el-menu {
        border: 0;

        .fa {
          color: #fff !important;
          margin-right: 15px;
        }
      }
    }

    section {
      padding-left: $asideWidth;

      .breadcrumb {
        position: relative;
        padding: 0 10px;
        border-bottom: 1px solid #e6e6e6;

        .el-breadcrumb {
          height: $breadcrumbHeight;
          font-size: 14px;

          > span {
            float: left;
            height: $breadcrumbHeight;
            line-height: $breadcrumbHeight;

            &:first-child {
              margin-right: 10px;

              .fa {
                margin-right: 5px;
              }
            }
          }
        }

        .user-list {
          position: absolute;
          top: 50%;
          right: 10px;
          transform: translate(0, -50%);

          a {
            & + a {
              margin-left: 10px;
            }

            .fa {
              margin-right: 5px;
            }
          }
        }
      }

      .section {
        padding: 30px;
      }
    }
  }
</style>

<style lang="scss">
  @import "../../styles/config";

  .layout aside {
    .el-scrollbar {
      position: relative;
      width: $asideWidth;
      overflow: hidden;

      .el-scrollbar__wrap {
        height: 100%;
        overflow: scroll;

        .el-scrollbar__view > .el-menu {
          > .el-submenu {
            > .el-submenu__title {
              font-size: 14px;
            }

            > .el-menu {
              .el-menu-item {
                font-size: 14px;

                .fa {
                  width: 14px;
                  font-size: 14px;
                }
              }

              .el-submenu__title {
                .fa {
                  width: 14px;
                  font-size: 14px;
                }
              }
            }
          }

          > .el-submenu, > .el-menu-item {
            font-size: 14px;

            .el-submenu__title {
              height: 50px;
              line-height: 50px;

              &:hover {
                color: $asideActiveColor !important;
                background-color: $asideActiveBackgroundColor !important;

              }

              i {
                color: #fff;
              }
            }
          }

          .el-menu-item {
            &.is-active {
              cursor: auto;
            }

            &:hover, &.is-active {
              color: $asideActiveColor !important;
              background-color: $asideActiveBackgroundColor !important;
            }
          }

          .fa {
            display: inline-block;
            width: 20px;
            font-size: 14px;
            text-align: center;
          }
        }
      }
    }
  }
</style>
