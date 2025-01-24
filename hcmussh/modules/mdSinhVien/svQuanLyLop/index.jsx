//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import svLtQuanLyLop from './redux';

export default {
    redux: {
        parent: 'student',
        reducers: { svLtQuanLyLop }
    },
    routes: [
        {
            path: '/user/lop-truong/quan-ly-lop',
            component: Loadable({ loading: Loading, loader: () => import('./quanLyLopPage') })
        },
    ],
};
