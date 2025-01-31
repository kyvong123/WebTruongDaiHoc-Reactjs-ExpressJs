//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmMucDichNuocNgoai from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmMucDichNuocNgoai }
    },
    routes: [
        {
            path: '/user/category/muc-dich-nuoc-ngoai',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};