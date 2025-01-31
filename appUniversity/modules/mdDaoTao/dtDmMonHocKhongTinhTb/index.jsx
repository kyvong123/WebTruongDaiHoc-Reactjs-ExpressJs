//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import monHocKTB from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { monHocKTB }
    },
    routes: [
        {
            path: '/user/dao-tao/mon-hoc-khong-tinh-trung-binh',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};