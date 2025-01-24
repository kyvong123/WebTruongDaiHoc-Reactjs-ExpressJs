//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import ctsvKhenThuong from './redux';

export default {
    redux: {
        parent: 'ctsv',
        reducers: { ctsvKhenThuong }
    },
    routes: [
        {
            path: '/user/ctsv/khen-thuong',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};