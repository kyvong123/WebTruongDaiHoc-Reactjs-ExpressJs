//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import svSuKien from './redux';

export default {
    redux: {
        parent: 'student',
        reducers: { svSuKien }
    },
    routes: [
        {
            path: '/user/student/su-kien',
            component: Loadable({ loading: Loading, loader: () => import('./userPage') })
        },
        {
            path: '/user/student/su-kien/:id',
            component: Loadable({ loading: Loading, loader: () => import('./suKienPage') })
        },
    ],
};
