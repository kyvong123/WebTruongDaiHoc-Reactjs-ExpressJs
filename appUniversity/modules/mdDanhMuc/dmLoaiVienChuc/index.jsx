//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmLoaiVienChuc from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmLoaiVienChuc }
    },
    routes: [
        {
            path: '/user/category/loai-vien-chuc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};