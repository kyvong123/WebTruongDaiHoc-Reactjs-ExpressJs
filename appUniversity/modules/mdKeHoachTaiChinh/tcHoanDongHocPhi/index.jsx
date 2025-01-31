//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tcHoanDongHocPhi from './redux';

export default {
    redux: {
        parent: 'finance',
        reducers: { tcHoanDongHocPhi }
    },
    routes: [

        {
            path: '/user/finance/hoan-dong-hoc-phi',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};