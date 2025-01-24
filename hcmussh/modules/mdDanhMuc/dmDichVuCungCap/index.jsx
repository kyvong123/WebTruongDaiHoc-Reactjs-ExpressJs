//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmDichVuCungCap from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmDichVuCungCap }
    },
    routes: [
        {
            path: '/user/dao-tao/dich-vu-cung-cap',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};