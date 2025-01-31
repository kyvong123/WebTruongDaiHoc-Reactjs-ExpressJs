//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tcQuyetToanThueGiaoDich from './redux';

export default {
    redux: {
        parent: 'finance',
        reducers: { tcQuyetToanThueGiaoDich }
    },
    routes: [
        {
            path: '/user/finance/quyet-toan-thue/giao-dich',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};