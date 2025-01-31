//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import svManageQuyetDinh from './redux';

export default {
    redux: {
        parent: 'ctsv',
        reducers: { svManageQuyetDinh }
    },
    routes: [
        {
            path: '/user/ctsv/quan-ly-quyet-dinh',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        }
    ],
};
