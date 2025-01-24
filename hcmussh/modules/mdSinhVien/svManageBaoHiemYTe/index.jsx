//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import svManageBhyt from './redux';

export default {
    redux: {
        parent: 'student',
        reducers: { svManageBhyt }
    },
    routes: [
        {
            path: '/user/quan-ly-bhyt',
            component: Loadable({ loading: Loading, loader: () => import('./userPage') })
        }
    ],
};
