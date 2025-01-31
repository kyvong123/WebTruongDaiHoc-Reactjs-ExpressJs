//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';

export default {
    redux: {
        parent: '',
        reducers: {},
    },
    routes: [
        {
            path: '/user/affair/instruction',
            component: Loadable({ loading: Loading, loader: () => import('./userPage') }),
        },
        {
            path: '/user/affair/instruction/:id',
            component: Loadable({ loading: Loading, loader: () => import('./editPage') }),
        },
    ]
};