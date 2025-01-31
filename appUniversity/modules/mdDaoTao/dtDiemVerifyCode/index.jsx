//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import verifyReducer from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { verifyReducer }
    },
    routes: [
        {
            path: '/user/dao-tao/verify-code',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/dao-tao/verify-code/item/:idGroup',
            component: Loadable({ loading: Loading, loader: () => import('./manageVerifyPage') })
        },
    ],
};
