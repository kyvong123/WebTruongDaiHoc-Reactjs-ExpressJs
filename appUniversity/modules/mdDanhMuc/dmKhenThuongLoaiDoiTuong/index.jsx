//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmKhenThuongLoaiDoiTuong from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmKhenThuongLoaiDoiTuong }
    },
    routes: [
        {
            path: '/user/category/khen-thuong-loai-doi-tuong',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};