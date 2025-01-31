//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmTinhThanhPho from './reduxTinhThanhPho';
import dmQuanHuyen from './reduxQuanHuyen';
import dmPhuongXa from './reduxPhuongXa';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmTinhThanhPho, dmQuanHuyen, dmPhuongXa }
    },
    routes: [
        {
            path: '/user/category/quan-huyen/upload',
            component: Loadable({ loading: Loading, loader: () => import('./adminQuanHuyenUpload') })
        },
        {
            path: '/user/category/tinh-thanh-pho/upload',
            component: Loadable({ loading: Loading, loader: () => import('./adminTinhThanhPhoUpload') })
        },
        {
            path: '/user/category/phuong-xa/upload',
            component: Loadable({ loading: Loading, loader: () => import('./adminPhuongXaUpload') })
        },
        {
            path: '/user/category/tinh-thanh-pho',
            component: Loadable({ loading: Loading, loader: () => import('./adminTinhThanhPho') })
        },
        {
            path: '/user/category/quan-huyen',
            component: Loadable({ loading: Loading, loader: () => import('./adminQuanHuyen') })
        },
        {
            path: '/user/category/phuong-xa',
            component: Loadable({ loading: Loading, loader: () => import('./adminPhuongXa') })
        }
    ],
};