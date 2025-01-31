//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhTsDmKyLuat from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhTsDmKyLuat }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/tuyen-sinh/dm-ky-luat',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};