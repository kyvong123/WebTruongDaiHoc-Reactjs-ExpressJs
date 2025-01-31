//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmDienChinhSach from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmDienChinhSach, }
    },
    routes: [
        {
            path: '/user/category/dien-chinh-sach',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};