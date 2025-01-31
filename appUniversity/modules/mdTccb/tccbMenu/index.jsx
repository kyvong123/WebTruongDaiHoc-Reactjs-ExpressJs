//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';

export default {
    routes: [
        {
            path: '/user/tccb/diem-ren-luyen',
            component: Loadable({ loading: Loading, loader: () => import('./DrlMenu.jsx') })
        },
    ],
};