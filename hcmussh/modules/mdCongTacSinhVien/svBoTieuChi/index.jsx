//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import ctsvBoTieuChi from './redux';

export default {
    redux: {
        parent: 'ctsv',
        reducers: { ctsvBoTieuChi }
    },
    routes: [
        {
            path: '/user/ctsv/bo-tieu-chi',
            component: Loadable({ loading: Loading, loader: () => import('./commonPage') })
        },
        {
            path: '/user/ctsv/bo-tieu-chi/:ma',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};
