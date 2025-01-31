//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import svQuyetDinh from './redux';

export default {
    redux: {
        parent: 'student',
        reducers: { svQuyetDinh }
    },
    routes: [
        {
            path: '/user/lich-su-quyet-dinh',
            component: Loadable({ loading: Loading, loader: () => import('./userPage') })
        }
    ],
};
