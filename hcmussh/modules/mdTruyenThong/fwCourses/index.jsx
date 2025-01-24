//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import course from './redux';

export default {
    redux: {
        course
    },
    routes: [
        {
            path: '/user/courses',
            component: Loadable({ loading: Loading, loader: () => import('./adminCourses') })
        },
        {
            path: '/user/courses/item/:id',
            component: Loadable({ loading: Loading, loader: () => import('./adminClass') })
        },
    ],
};
