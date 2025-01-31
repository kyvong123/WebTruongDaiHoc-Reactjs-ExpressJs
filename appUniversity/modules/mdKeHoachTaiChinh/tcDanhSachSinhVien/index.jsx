//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tcDanhSachSinhVien from './redux';

export default {
    redux: {
        parent: 'finance',
        reducers: { tcDanhSachSinhVien }
    },
    routes: [
        {
            path: '/user/finance/danh-sach-sinh-vien',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/finance/danh-sach-sinh-vien/:mssv',
            component: Loadable({ loading: Loading, loader: () => import('./editPage') })
        },
        {
            path: '/user/finance/invoice/:mssv',
            component: Loadable({ loading: Loading, loader: () => import('./invoicePage') })
        }
    ],
};