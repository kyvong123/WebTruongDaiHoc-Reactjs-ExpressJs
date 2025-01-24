//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tcHoanTra from './redux';

export default {
    redux: {
        parent: 'finance',
        reducers: { tcHoanTra }
    },
    routes: [

        {
            path: '/user/finance/hoan-tra',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};