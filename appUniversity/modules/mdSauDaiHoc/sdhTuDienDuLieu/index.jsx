//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';


export default {
    routes: [
        {
            path: '/user/sau-dai-hoc/phong',
            component: Loadable({ loading: Loading, loader: () => import('./sdhDmPhongHocAdminPage') })
        },
        {
            path: '/user/sau-dai-hoc/co-so',
            component: Loadable({ loading: Loading, loader: () => import('./sdhDmCoSo') })
        },
        {
            path: '/user/sau-dai-hoc/toa-nha',
            component: Loadable({ loading: Loading, loader: () => import('./sdhDmToaNha') })
        },
        {
            path: '/user/sau-dai-hoc/ngay-le',
            component: Loadable({ loading: Loading, loader: () => import('./sdhDmNgayLe') })
        },
        {
            path: '/user/sau-dai-hoc/ca-hoc',
            component: Loadable({ loading: Loading, loader: () => import('./sdhCaHocAdminPage') })
        },
        {
            path: '/user/sau-dai-hoc/thoi-gian-dao-tao',
            component: Loadable({ loading: Loading, loader: () => import('./sdhThoiGianDaoTao') })
        },
        {
            path: '/user/sau-dai-hoc/buoi-hoc',
            component: Loadable({ loading: Loading, loader: () => import('./sdhDmBuoiHoc') })
        },
        {
            path: '/user/sau-dai-hoc/thu',
            component: Loadable({ loading: Loading, loader: () => import('./sdhDmThuAdminPage') })
        },
    ],
};