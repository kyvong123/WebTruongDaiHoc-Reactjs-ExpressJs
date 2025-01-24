//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtLichSuDkhp from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtLichSuDkhp }
    },
    routes: [
        {
            path: '/user/dao-tao/edu-schedule/lich-su',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};