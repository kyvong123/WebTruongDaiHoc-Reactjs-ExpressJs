//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhTsKyLuat from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhTsKyLuat }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/tuyen-sinh/ky-luat',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],

};