//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tcSubDetailLog from './redux';

export default {
    redux: {
        parent: 'finance',
        reducers: { tcSubDetailLog }
    },
    routes: [
        {
            path: '/user/finance/sub-detail/log',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};