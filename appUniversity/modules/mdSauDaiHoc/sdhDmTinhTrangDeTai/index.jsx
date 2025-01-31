//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhDmTinhTrangDeTai from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhDmTinhTrangDeTai, }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/tinh-trang-de-tai',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};