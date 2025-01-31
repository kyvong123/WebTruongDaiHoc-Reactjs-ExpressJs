//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtDmHocKy from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dtDmHocKy }
    },
    routes: [
        {
            path: '/user/dao-tao/hoc-ky',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};