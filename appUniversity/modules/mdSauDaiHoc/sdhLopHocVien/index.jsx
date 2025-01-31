//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhLopHocVien from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhLopHocVien, }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/lop-hoc-vien',
            component: Loadable({ loading: Loading, loader: () => import('./commonPage') })
        },
        {
            path: '/user/sau-dai-hoc/lop/item',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/sau-dai-hoc/lop/detail/:maLop',
            component: Loadable({ loading: Loading, loader: () => import('./detailPage') })
        },
    ],
};