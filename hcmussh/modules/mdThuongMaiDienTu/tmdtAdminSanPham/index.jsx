//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tmdtAdminDuyetTask from './redux/sanPhamDuyetTaskRedux';
import tmdtAdminCauHinhDuyetTask from './redux/cauHinhDuyetTaskRedux';
import tmdtAdminSanPham from './redux/sanPhamRedux';
import tmdtAdminCauHinhSanPham from './redux/cauHinhSanPhamRedux';

export default {
    redux: {
        parent: 'tmdt',
        reducers: { tmdtAdminDuyetTask, tmdtAdminCauHinhDuyetTask, tmdtAdminSanPham, tmdtAdminCauHinhSanPham }
    },
    routes: [
        { path: '/user/tmdt/y-shop/admin/san-pham-duyet/:id', component: Loadable({ loading: Loading, loader: () => import('./sanPhamNhapDetailPage') }) },
        { path: '/user/tmdt/y-shop/admin/san-pham/:id/cau-hinh', component: Loadable({ loading: Loading, loader: () => import('./cauHinhAdminPage') }) },
        { path: '/user/tmdt/y-shop/admin/san-pham/:id', component: Loadable({ loading: Loading, loader: () => import('./sanPhamDetailPage') }) },
        { path: '/user/tmdt/y-shop/admin/san-pham-manage', component: Loadable({ loading: Loading, loader: () => import('./sanPhamAdminPage') }) },
    ],
};
