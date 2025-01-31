//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';


export default {
    redux: {
    },
    routes: [
        {
            path: '/user/dao-tao/ca-hoc',
            component: Loadable({ loading: Loading, loader: () => import('./caHocAdminPage.jsx') })
        },
        {
            path: '/user/dao-tao/co-so',
            component: Loadable({ loading: Loading, loader: () => import('./coSoAdminPage.jsx') })
        },
        {
            path: '/user/dao-tao/ngay-le',
            component: Loadable({ loading: Loading, loader: () => import('./ngayLeAdminPage.jsx') })
        },
        {
            path: '/user/dao-tao/phong',
            component: Loadable({ loading: Loading, loader: () => import('./phongAdminPage.jsx') })
        },
        {
            path: '/user/dao-tao/bac-dao-tao',
            component: Loadable({ loading: Loading, loader: () => import('./svBacDaoTaoAdminPage.jsx') })
        },
        {
            path: '/user/dao-tao/doi-tuong-tuyen-sinh',
            component: Loadable({ loading: Loading, loader: () => import('./svDoiTuongTsAdminPage.jsx') })
        },
        {
            path: '/user/dao-tao/khu-vuc-tuyen-sinh',
            component: Loadable({ loading: Loading, loader: () => import('./svKhuVucTuyenSinhAdminPage.jsx') })
        },
        {
            path: '/user/dao-tao/he-dao-tao',
            component: Loadable({ loading: Loading, loader: () => import('./svLoaiHinhDaoTaoAdminPage.jsx') })
        },
        {
            path: '/user/dao-tao/mon-thi',
            component: Loadable({ loading: Loading, loader: () => import('./svMonThiAdminPage.jsx') })
        },
        {
            path: '/user/dao-tao/to-hop-thi',
            component: Loadable({ loading: Loading, loader: () => import('./svToHopTsAdminPage.jsx') })
        },
        {
            path: '/user/dao-tao/toa-nha',
            component: Loadable({ loading: Loading, loader: () => import('modules/mdDanhMuc/dmToaNha/adminPage') })
        },
    ],
};