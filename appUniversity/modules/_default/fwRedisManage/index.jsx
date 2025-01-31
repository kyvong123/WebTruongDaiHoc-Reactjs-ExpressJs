//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';

export default {
    redux: {
        parent: 'framework',
        reducers: {}
    },
    routes: [
        {
            path: '/user/redis-manage',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ]
};