//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import svShcd from './redux';

export default {
    redux: {
        parent: 'student',
        reducers: { svShcd }
    },
    routes: [
        {
            path: '/user/student-shcd',
            component: Loadable({ loading: Loading, loader: () => import('./userPage') })
        },
        {
            path: '/user/student/quan-ly-shcd',
            component: Loadable({ loading: Loading, loader: () => import('./shcdPage') })
        },
        {
            path: '/user/student/quan-ly-shcd/:id',
            component: Loadable({ loading: Loading, loader: () => import('./quanLyPage') })
        }
    ],
};
