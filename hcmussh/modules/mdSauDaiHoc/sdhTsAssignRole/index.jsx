//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhTsAssignRole from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhTsAssignRole }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/tuyen-sinh/assign-role',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};