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
  },
  // 题目标签管理
  {
    path: 'question-tag',
    meta: {
      title: '题目标签管理',
      whiteList: [admins],
      roles: ['question-tag']
    },
    component: layout,
    children: [
      {
        path: '',
        name: 'question-tag',
        meta: {
          title: '题目分类管理',
          whiteList: [admins],
          roles: ['question-tag']
        },
        component: () => import('@/views/admin/questionTag/index.vue')
      }
    ]
  },
  // 题目管理
  // 题目信息
  {
    path: 'question-manage',
    meta: {
      title: '题目信息',
      whiteList: [admins],
      roles: ['question-manage']
    },
    component: layout,
    children: [
      {
        path: '',
        name: 'question-manage',
        meta: {
          title: '题目信息',
          whiteList: [admins],
          roles: ['question-manage']
        },
        component: () => import('@/views/admin/questionManage/index.vue')
      },
      {
        path: 'add-question',
        name: 'addQuestion',
        meta: {
          title: '新增题目',
          whiteList: [admins],
          roles: ['add-question']
        },
        component: () => import('@/views/admin/questionManage/add-question.vue')
      },
      {
        path: 'edit-question/:id',
        name: 'editQuestion',
        meta: {
          title: '修改题目',
          whiteList: [admins],
          roles: ['edit-question']
        },
        component: () => import('@/views/admin/questionManage/add-question.vue')
      }
    ]
  },
  // 题目归类
  {
    path: 'question-classify',
    meta: {
      title: '题目归类',
      whiteList: [admins],
      roles: ['question-classify']
    },
    component: layout,
    children: [
      {
        path: '',
        name: 'question-classify',
        meta: {
          title: '题目归类',
          whiteList: [admins],
          roles: ['question-classify']
        },
        component: () => import('@/views/admin/questionManage/question-classify.vue')
      },
      {
        path: 'add-classify',
        name: 'add-classify',
        meta: {
          title: '新增归类',
          whiteList: [admins],
          roles: ['add-classify']
        },
        component: () => import('@/views/admin/questionManage/add-classify.vue')
      },
      {
        path: 'edit-classify/:id',
        name: 'edit-classify',
        meta: {
          title: '编辑归类',
          whiteList: [admins],
          roles: ['edit-classify']
        },
        component: () => import('@/views/admin/questionManage/add-classify.vue')
      }
    ]
  }
];
