//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tcQuyetToanThue from './redux';

export default {
    redux: {
        parent: 'finance',
        reducers: { tcQuyetToanThue }
    },
    routes: [
        {
            path: '/user/finance/quyet-toan-thue',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};