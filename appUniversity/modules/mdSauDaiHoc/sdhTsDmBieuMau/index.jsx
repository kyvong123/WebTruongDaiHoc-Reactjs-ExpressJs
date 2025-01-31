//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';

export default {
    redux: {
        parent: 'sdh',
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/tuyen-sinh/dm-bieu-mau',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        }
    ],
};