//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtDiemDmHeDiem from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dtDiemDmHeDiem }
    },
    routes: [
        {
            path: '/user/dao-tao/he-diem',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};