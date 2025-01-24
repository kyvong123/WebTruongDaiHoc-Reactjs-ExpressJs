//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tccbCapMaCanBo from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { tccbCapMaCanBo }
    },
    routes: [
        {
            path: '/user/tccb/ma-so-can-bo',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};