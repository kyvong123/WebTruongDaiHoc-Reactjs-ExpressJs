//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmHinhThucKyLuat from './reduxHinhThucKyLuat';
import dmKhenThuong from './reduxKhenThuong';
import dmKyLuat from './reduxKyLuat';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmHinhThucKyLuat, dmKhenThuong, dmKyLuat, }
    },
    routes: [
        {
            path: '/user/category/hinh-thuc-ky-luat',
            component: Loadable({ loading: Loading, loader: () => import('./adminDmHinhThucKyLuat') })
        },
        {
            path: '/user/category/khen-thuong',
            component: Loadable({ loading: Loading, loader: () => import('./adminDmKhenThuong') })
        },
        {
            path: '/user/category/ky-luat',
            component: Loadable({ loading: Loading, loader: () => import('./adminDmKyLuat') })
        },
    ],
};