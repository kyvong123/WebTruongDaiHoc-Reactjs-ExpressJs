//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtDmLoaiChungChi from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtDmLoaiChungChi }
    },
    routes: [
        {
            path: '/user/dao-tao/loai-chung-chi',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};