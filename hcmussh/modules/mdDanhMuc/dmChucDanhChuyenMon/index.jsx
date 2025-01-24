//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmChucDanhChuyenMon from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmChucDanhChuyenMon, }
    },
    routes: [
        {
            path: '/user/category/chuc-danh-chuyen-mon',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};