//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmBenhVien from './reduxBenhVien';
import dmTuyenBenhVien from './reduxTuyenBenhVien';
import dmNhomMau from './reduxNhomMau';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: {
            dmBenhVien,
            dmTuyenBenhVien,
            dmNhomMau,
        },
    },
    routes: [
        {
            path: '/user/category/benh-vien/upload',
            component: Loadable({ loading: Loading, loader: () => import('./adminUploadPage') })
        },
        {
            path: '/user/category/benh-vien',
            component: Loadable({ loading: Loading, loader: () => import('./adminBenhVienPage') })
        },
        {
            path: '/user/category/tuyen-benh-vien',
            component: Loadable({ loading: Loading, loader: () => import('./adminTuyenBenhVienPage') })
        },
        {
            path: '/user/category/nhom-mau',
            component: Loadable({ loading: Loading, loader: () => import('./adminNhomMauPage') })
        },
    ],
};