//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';

export default {
    routes: [
        {
            path: '/user/tncn',
            component: Loadable({ loading: Loading, loader: () => import('./pages/tncnPage') })
        },
        {
            path: '/user/tncn/ke-khai',
            component: Loadable({ loading: Loading, loader: () => import('./pages/keKhaiTncnPage') })
        },
        {
            path: '/user/tncn/phu-thuoc',
            component: Loadable({ loading: Loading, loader: () => import('./pages/phuThuocTncnPage') })
        },
        {
            path: '/user/tncn/phu-thuoc/:id',
            component: Loadable({ loading: Loading, loader: () => import('./pages/phuThuocTncnEditPage') })
        },
        {
            path: '/user/tncn/uy-quyen',
            component: Loadable({ loading: Loading, loader: () => import('./pages/uyQuyenTncnPage') })
        },
    ],
};
