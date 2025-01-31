//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmDonViTinh from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmDonViTinh, }
    },
    routes: [
        {
            path: '/user/category/don-vi-tinh',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};