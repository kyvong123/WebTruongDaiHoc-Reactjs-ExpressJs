//TEMPLATES: home|admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import svTsSdh from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { svTsSdh }
    },
    routes: [
        {
            path: '/sdh/bieu-mau-dang-ky',
            component: Loadable({ loading: Loading, loader: () => import('./bieuMauDangKy') })
        },
        {
            path: '/sdh/bieu-mau-dang-ky/detail',
            component: Loadable({ loading: Loading, loader: () => import('./ketQuaDangKy') })
        },
        {
            path: '/sdh/dkts',
            component: Loadable({ loading: Loading, loader: () => import('./dangKyTS') })
        },
        {
            path: '/sdh/ts',
            component: Loadable({ loading: Loading, loader: () => import('./Login') })
        },
        {
            path: '/user/sau-dai-hoc/tuyen-sinh/danh-sach-tuyen-sinh',
            component: Loadable({ loading: Loading, loader: () => import('./danhSachTSPage') })
        },
        {
            path: '/user/sau-dai-hoc/thi-sinh/item/:id',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        },
        {
            path: '/user/sau-dai-hoc/tuyen-sinh/danh-sach-tuyen-sinh/upload',
            component: Loadable({ loading: Loading, loader: () => import('./adminUploadPage') })
        },
    ],
};
