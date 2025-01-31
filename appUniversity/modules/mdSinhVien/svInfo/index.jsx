//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dataSinhVien from './redux';

export default {
    redux: {
        parent: 'student',
        reducers: { dataSinhVien }
    },
    routes: [
        {
            path: '/user/profile-student',
            component: Loadable({ loading: Loading, loader: () => import('./userPage') })
        },
    ],
};
