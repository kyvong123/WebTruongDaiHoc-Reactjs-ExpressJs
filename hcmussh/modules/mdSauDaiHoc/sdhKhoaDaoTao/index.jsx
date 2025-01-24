//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhKhoaDaoTao from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhKhoaDaoTao }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/khoa-dao-tao',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};