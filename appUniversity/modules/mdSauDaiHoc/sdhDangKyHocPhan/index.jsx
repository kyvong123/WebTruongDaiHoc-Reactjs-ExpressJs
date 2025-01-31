//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhDangKyHocPhan from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhDangKyHocPhan, }
    },
    routes: [
        {
            path: '/user/hoc-vien-sau-dai-hoc/dang-ky-hoc-phan',
            component: Loadable({ loading: Loading, loader: () => import('./userPage') })
        },
        {
            path: '/user/sau-dai-hoc/dang-ky-hoc-phan/chi-tiet',
            component: Loadable({ loading: Loading, loader: () => import('./adminDetail') })
        },
        {
            path: '/user/sau-dai-hoc/dang-ky-hoc-phan',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        }
    ],
};