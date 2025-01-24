//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtCanBoNgoaiTruong from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtCanBoNgoaiTruong },
    },
    routes: [
        {
            path: '/user/dao-tao/can-bo',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};