//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tccbSupport from './reduxTccbSupport';
import tccbSupportReply from './reduxTccbSupportReply';

export default {
    redux: {
        parent: 'tccb',
        reducers: { tccbSupport, tccbSupportReply }
    },
    routes: [
        {
            path: '/user/tccb/support',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/support',
            component: Loadable({ loading: Loading, loader: () => import('./staffPage') })
        },
    ],
};
