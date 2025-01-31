//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tcDashboard from './redux';

export default {
    redux: {
        parent: 'finance',
        reducers: { tcDashboard }
    },
    routes: [
        {
            path: '/user/finance/dashboard',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};