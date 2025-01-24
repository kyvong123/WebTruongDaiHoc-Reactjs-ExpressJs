//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmTinhTrangHocPhi from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmTinhTrangHocPhi, }
    },
    routes: [
        {
            path: '/user/category/tinh-trang-hoc-phi',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};