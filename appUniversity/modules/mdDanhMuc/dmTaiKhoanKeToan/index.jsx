//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmTaiKhoanKeToan from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmTaiKhoanKeToan }
    },
    routes: [
        {
            path: '/user/category/tai-khoan-ke-toan',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/category/tai-khoan-ke-toan/upload',
            component: Loadable({ loading: Loading, loader: () => import('./adminUploadPage') })
        }
    ],
};