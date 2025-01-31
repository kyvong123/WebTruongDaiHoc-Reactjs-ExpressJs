//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';

export default {
    redux: {
        parent: 'daoTao',
        reducers: {},
    },
    routes: [
        {
            path: '/user/dao-tao/instruction',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
        {
            path: '/user/dao-tao/instruction/:id',
            component: Loadable({ loading: Loading, loader: () => import('./editPage') }),
        },
    ]
};