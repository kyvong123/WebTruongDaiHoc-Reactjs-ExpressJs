//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmSvLoaiHinhDaoTao from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmSvLoaiHinhDaoTao }
    },
    routes: [
        {
            path: '/user/category/he-dao-tao',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};