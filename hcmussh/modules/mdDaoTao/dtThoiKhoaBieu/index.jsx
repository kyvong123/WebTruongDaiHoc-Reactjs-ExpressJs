//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtThoiKhoaBieu from './redux';
import dtTkbConfig from 'modules/mdDaoTao/dtSettings/redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtThoiKhoaBieu, dtTkbConfig }
    },
    routes: [
        {
            path: '/user/dao-tao/danh-muc/thoi-khoa-bieu',
            component: Loadable({ loading: Loading, loader: () => import('./danhMucPage') })
        },
        {
            path: '/user/dao-tao/thoi-khoa-bieu/tra-cuu-in',
            component: Loadable({ loading: Loading, loader: () => import('./traCuuPage') })
        },
        {
            path: '/user/dao-tao/thoi-khoa-bieu',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/dao-tao/thoi-khoa-bieu/thong-ke-tuan-hoc',
            component: Loadable({ loading: Loading, loader: () => import('./ThongKeTuanHocPage') })
        },
        {
            path: '/user/dao-tao/import-thoi-khoa-bieu',
            component: Loadable({ loading: Loading, loader: () => import('./adminImportPage') })
        },
        {
            path: '/user/dao-tao/thoi-khoa-bieu/import-diem/:maHocPhan',
            component: Loadable({ loading: Loading, loader: () => import('./section/ImportDiem') })
        },
        {
            path: '/user/dao-tao/thoi-khoa-bieu/auto-generate',
            component: Loadable({ loading: Loading, loader: () => import('./AutoGenPage') })
        },
        {
            path: '/user/dao-tao/thoi-khoa-bieu/auto-generate-schedule',
            component: Loadable({ loading: Loading, loader: () => import('./autoGenerateSchedulePage') })
        },
        {
            path: '/user/dao-tao/thoi-khoa-bieu/edit/:id',
            component: Loadable({ loading: Loading, loader: () => import('./hocPhanDetailPage') })
        },
        {
            path: '/user/dao-tao/thoi-khoa-bieu/view/:id',
            component: Loadable({ loading: Loading, loader: () => import('./hocPhanDetailPage') })
        },
        {
            path: '/user/dao-tao/thoi-khoa-bieu/new',
            component: Loadable({ loading: Loading, loader: () => import('./AddHocPhanPage') })
        },
        {
            path: '/user/dao-tao/thoi-khoa-bieu/tra-cuu-phong-trong',
            component: Loadable({ loading: Loading, loader: () => import('./searchFreeRoomPage') })
        },
        {
            path: '/user/dao-tao/thoi-khoa-bieu/tra-cuu-thoi-khoa-bieu',
            component: Loadable({ loading: Loading, loader: () => import('./searchSchedulePage') })
        },
        {
            path: '/user/dao-tao/thoi-khoa-bieu/import-thoi-khoa-bieu',
            component: Loadable({ loading: Loading, loader: () => import('./importTKBPage') })
        },
        {
            path: '/user/dao-tao/thoi-khoa-bieu/gen-schedule',
            component: Loadable({ loading: Loading, loader: () => import('./genSchedulePage') })
        },
        {
            path: '/user/dao-tao/thoi-khoa-bieu/export',
            component: Loadable({ loading: Loading, loader: () => import('./exportPage') })
        },
        {
            path: '/user/dao-tao/thoi-khoa-bieu/thong-ke',
            component: Loadable({ loading: Loading, loader: () => import('./thongKeVangPage') })
        },
        {
            path: '/user/dao-tao/thoi-khoa-bieu/phong-scheduler',
            component: Loadable({ loading: Loading, loader: () => import('./schedulerPage') })
        },
    ],

};