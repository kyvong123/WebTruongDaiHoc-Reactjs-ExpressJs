//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhTinhTrangHocPhan from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhTinhTrangHocPhan }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/tinh-trang-hoc-phan',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};