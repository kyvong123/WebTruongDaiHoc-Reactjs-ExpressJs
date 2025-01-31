//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhDmTinhTrangDiem from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhDmTinhTrangDiem }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/tinh-trang-diem',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};