//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tcTncn from './redux';

export default {
    redux: {
        parent: 'finance',
        reducers: { tcTncn }
    },
    routes: [

        {
            path: '/user/finance/tncn',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};