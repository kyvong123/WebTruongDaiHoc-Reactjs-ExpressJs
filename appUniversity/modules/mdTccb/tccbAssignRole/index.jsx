//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tccbPhanQuyen from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { tccbPhanQuyen }
    },
    routes: [

        {
            path: '/user/tccb/phan-quyen',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};