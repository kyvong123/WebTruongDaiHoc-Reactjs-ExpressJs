//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
// import tcThongKe from './redux';

export default {
    redux: {
        // parent: 'finance',
        // reducers: { tcThongKe }
    },
    routes: [
        {
            path: '/user/finance/statistic/khac',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};