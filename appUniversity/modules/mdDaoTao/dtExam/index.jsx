//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtExam from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtExam }
    },
    routes: [
        {
            path: '/user/dao-tao/lich-thi',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/dao-tao/lich-thi/edit/:maHocPhan',
            component: Loadable({ loading: Loading, loader: () => import('./adjustPage') })
        },
        {
            path: '/user/dao-tao/lich-thi/import',
            component: Loadable({ loading: Loading, loader: () => import('./adminImportPage') })
        },
        {
            path: '/user/dao-tao/lich-thi/hoan-cam-import',
            component: Loadable({ loading: Loading, loader: () => import('./HoanCamThiImport') })
        },
    ],
};