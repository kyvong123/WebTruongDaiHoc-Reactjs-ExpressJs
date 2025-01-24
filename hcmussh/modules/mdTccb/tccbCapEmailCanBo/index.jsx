//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tccbCapEmailCanBo from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { tccbCapEmailCanBo }
    },
    routes: [
        {
            path: '/user/tccb/cap-email-can-bo',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};