//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
// import dataSinhVien from './redux';

export default {
    redux: {
        parent: 'student',
        reducers: {}
    },
    routes: [
        {
            path: '/user/student-enroll',
            component: Loadable({ loading: Loading, loader: () => import('./userPage') })
        },
    ],
};
