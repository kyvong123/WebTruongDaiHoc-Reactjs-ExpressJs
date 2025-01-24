//TEMPLATES: home|admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhTsThongKe from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhTsThongKe }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/tuyen-sinh/thong-ke',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        }
    ],
};
