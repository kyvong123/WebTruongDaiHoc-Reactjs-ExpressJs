//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tcHocPhi from './redux';

export default {
    redux: {
        parent: 'finance',
        reducers: { tcHocPhi }
    },
    routes: [
        {
            path: '/user/finance/import-hoc-phi',
            component: Loadable({ loading: Loading, loader: () => import('./adminImportPage') })
        },
        {
            path: '/user/finance/hoc-phi/:mssv',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        },
        {
            path: '/user/finance/statistic',
            component: Loadable({ loading: Loading, loader: () => import('./statisticPage') })
        },
        {
            path: '/user/finance/hoc-phi',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        // {
        //     path: '/user/finance/statistic/khac',
        //     component: Loadable({ loading: Loading, loader: () => import('./otherStatisticPage') })
        // },
    ],
};