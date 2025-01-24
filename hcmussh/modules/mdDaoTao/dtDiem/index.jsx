//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtDiem from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtDiem }
    },
    routes: [
        {
            path: '/user/dao-tao/grade-manage/all',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/dao-tao/grade-manage/import',
            component: Loadable({ loading: Loading, loader: () => import('./adminDetailPage') })
        },
        {
            path: '/user/dao-tao/grade-manage/import/scan',
            component: Loadable({ loading: Loading, loader: () => import('./adminScanPage') })
        },
        {
            path: '/user/dao-tao/diem/import',
            component: Loadable({ loading: Loading, loader: () => import('./adminImportPage') })
        }
    ],
};