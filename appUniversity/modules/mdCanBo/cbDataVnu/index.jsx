//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';

export default {
    routes: [
        {
            path: '/user/data-vnu/khai-bao',
            component: Loadable({ loading: Loading, loader: () => import('./userPage') })
        },
    ],
};
