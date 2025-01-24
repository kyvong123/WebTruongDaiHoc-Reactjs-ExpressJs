//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tcMienGiam from './redux';

export default {
    redux: {
        parent: 'finance',
        reducers: { tcMienGiam }
    },
    routes: [
        {
            path: '/user/finance/mien-giam',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};