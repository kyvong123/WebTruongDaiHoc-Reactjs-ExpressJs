//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmCaHoc from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmCaHoc, }
    },
    routes: [
        {
            path: '/user/category/ca-hoc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};