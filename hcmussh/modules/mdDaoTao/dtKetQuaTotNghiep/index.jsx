//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import kqTotNghiep from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { kqTotNghiep },
    },
    routes: [
        {
            path: '/user/dao-tao/ket-qua-tot-nghiep',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
    ]
};