//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
// import sdhTsThiSinhHoSo from './redux';

export default {
    redux: {
        parent: 'sdh',
        // reducers: { sdhTsThiSinhHoSo }
    },
    routes: [
        {
            path: '/user/sdh/ts/thi-sinh/ho-so',
            component: Loadable({ loading: Loading, loader: () => import('./userPage') })
        },
        {
            path: '/user/sdh/ts/thi-sinh/change-password',
            component: Loadable({ loading: Loading, loader: () => import('./changePassword.jsx') })
        },
    ],

};