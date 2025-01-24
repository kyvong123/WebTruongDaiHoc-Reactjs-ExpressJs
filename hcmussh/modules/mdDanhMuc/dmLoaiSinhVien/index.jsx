//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmLoaiSinhVien from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmLoaiSinhVien, }
    },
    routes: [
        {
            path: '/user/category/loai-sinh-vien',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};