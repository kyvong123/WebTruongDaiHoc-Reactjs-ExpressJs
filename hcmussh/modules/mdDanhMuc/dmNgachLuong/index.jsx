//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmNgachLuong from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmNgachLuong }
    },
    routes: [
        {
            path: '/user/category/ngach-luong',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};