//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmLoaiDoanhNghiep from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmLoaiDoanhNghiep }
    },
    routes: [
        {
            path: '/user/category/loai-doanh-nghiep',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};