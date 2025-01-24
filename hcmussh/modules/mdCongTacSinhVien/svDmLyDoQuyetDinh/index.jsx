//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmLyDoQuyetDinh from './redux';

export default {
    redux: {
        parent: 'ctsv',
        reducers: { dmLyDoQuyetDinh }
    },
    routes: [
        {
            path: '/user/ctsv/ly-do-quyet-dinh',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};