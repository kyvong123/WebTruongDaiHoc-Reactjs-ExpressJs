//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmDonVi from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmDonVi, }
    },
    routes: [
        {
            path: '/user/category/don-vi/upload',
            component: Loadable({ loading: Loading, loader: () => import('./adminUploadPage') })
        },
        {
            path: '/user/category/don-vi',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};