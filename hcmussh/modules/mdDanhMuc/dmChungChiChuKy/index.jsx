//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmChungChiChuKy from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmChungChiChuKy }
    },
    routes: [
        {
            path: '/user/category/chung-chi-chu-ky',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};