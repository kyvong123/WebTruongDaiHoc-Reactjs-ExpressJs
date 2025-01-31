//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtDiemInBangDiem from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtDiemInBangDiem }
    },
    routes: [
        {
            path: '/user/dao-tao/in-phieu-diem',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};