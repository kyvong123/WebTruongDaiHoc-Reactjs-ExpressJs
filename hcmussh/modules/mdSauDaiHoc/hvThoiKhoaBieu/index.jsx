//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';

export default {
    redux: {
        parent: 'sdh',
        reducers: {}
    },
    routes: [
        {
            path: '/user/hoc-vien/thoi-khoa-bieu',
            component: Loadable({ loading: Loading, loader: () => import('./userPage') })
        }
    ],
};