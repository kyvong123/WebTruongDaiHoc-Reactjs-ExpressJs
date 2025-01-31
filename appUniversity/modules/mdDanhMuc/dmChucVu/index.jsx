//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmChucVu from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmChucVu, }
    },
    routes: [
        {
            path: '/user/category/chuc-vu/upload',
            component: Loadable({ loading: Loading, loader: () => import('./adminImportPage') })
        },
        {
            path: '/user/category/chuc-vu',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};