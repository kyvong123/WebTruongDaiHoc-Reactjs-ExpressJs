//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import svBaoHiemYTe from './redux';

export default {
    redux: {
        parent: 'ctsv',
        reducers: { svBaoHiemYTe }
    },
    routes: [
        {
            path: '/user/bao-hiem-y-te/quan-ly',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/bao-hiem-y-te/quan-ly/:maDot',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        }
    ],
};
