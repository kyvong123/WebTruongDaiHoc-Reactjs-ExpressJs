//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtLichSuDkhp from './redux';

export default {
    redux: {
        parent: 'student',
        reducers: { dtLichSuDkhp }
    },
    routes: [
        {
            path: '/user/lich-su-dang-ky',
            component: Loadable({ loading: Loading, loader: () => import('./userPage') })
        }
    ],
};