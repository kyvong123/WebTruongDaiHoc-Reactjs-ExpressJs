//TEMPLATES: admin
import execTask from './redux';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';

export default {
    redux: {
        parent: 'framework',
        reducers: { execTask }
    },
    routes: [
        {
            path: '/user/execute-task',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ]
};