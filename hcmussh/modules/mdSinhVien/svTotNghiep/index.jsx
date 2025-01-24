//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';

export default {
    redux: {
        parent: 'student',
        reducers: {}
    },
    routes: [
        {
            path: '/user/tra-cuu-tot-nghiep',
            component: Loadable({ loading: Loading, loader: () => import('./userPage') })
        }
    ],
};