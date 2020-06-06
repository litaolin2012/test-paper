import layout from '@/components/layout/index.vue';
import { DEPLOY_TYPES } from '../../store/modules/config';
const { admins } = DEPLOY_TYPES;

export default [
  {
    path: '/system',
    meta: {
      title: '',
      whiteList: [admins],
      roles: ['system']
    },
    component: layout,
    children: [
      {
        path: 'user',
        name: 'user',
        meta: {
          title: '账户管理',
          whiteList: [admins],
          roles: ['user']
        },
        component: r => require.ensure([], () => r(require('@/views/common/system/user.vue')), 'system')
      }, // 账户管理
      {
        path: 'role',
        name: 'role',
        meta: {
          title: '角色管理',
          whiteList: [admins],
          roles: ['role']
        },
        component: r => require.ensure([], () => r(require('@/views/common/system/role.vue')), 'system')
      } // 角色管理
    ]
  },
  // Banner管理
  {
    path: 'banner',
    meta: {
      title: 'Banner管理',
      whiteList: [admins],
      roles: ['banner']
    },
    component: layout,
    children: [
      {
        path: '',
        name: 'banner',
        meta: {
          title: 'Banner管理',
          whiteList: [admins],
          roles: ['banner']
        },
        component: r => require.ensure([], () => r(require('@/views/admin/banner/index.vue')), 'banner')
      }
    ]
  },

  // 题目分类管理
  {
    path: 'dictionary',
    meta: {
      title: '题目分类管理',
      whiteList: [admins],
      roles: ['dictionary']
    },
    component: layout,
    children: [
      {
        path: '',
        name: 'dictionary',
        meta: {
          title: '题目分类管理',
          whiteList: [admins],
          roles: ['dictionary']
        },
        // component: r => require.ensure([], () => r(require('@/views/admin/dictionary/index.vue')), 'banner'),
        component: () => import('@/views/admin/dictionary/index.vue')
      }
    ]
  }
];
