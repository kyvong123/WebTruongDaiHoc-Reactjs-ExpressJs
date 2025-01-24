//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import ctsvShcd from './redux/shcdRedux';

export default {
    redux: {
        parent: 'ctsv',
        reducers: { ctsvShcd }
    },
    routes: [
        {
            path: '/user/ctsv/shcd',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/ctsv/shcd/edit/:id',
            component: Loadable({ loading: Loading, loader: () => import('./editPage') })
        },
    ],
};