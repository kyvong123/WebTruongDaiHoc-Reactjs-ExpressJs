//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import ctsvThongKeQuyetDinh from './redux';

export default {
    redux: {
        parent: 'ctsv',
        reducers: { ctsvThongKeQuyetDinh }
    },
    routes: [
        {
            path: '/user/ctsv/thong-ke-quan-ly-quyet-dinh',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        }
    ],
};
