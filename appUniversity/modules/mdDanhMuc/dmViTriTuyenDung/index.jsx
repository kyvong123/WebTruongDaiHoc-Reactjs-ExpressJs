//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmViTriTuyenDung from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmViTriTuyenDung }
    },
    routes: [
        {
            path: '/user/category/vi-tri-tuyen-dung',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};