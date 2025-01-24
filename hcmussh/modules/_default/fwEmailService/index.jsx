//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import emailTask from './redux';

export default {
    redux: {
        parent: 'framework',
        reducers: { emailTask }
    },
    routes: [
        {
            path: '/user/email-task',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ]
};