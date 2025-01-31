//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmLoaiVanBan from './redux/dmLoaiVanBan';
import dmNhomLoaiVanBan from './redux/dmNhomLoaiVanBan';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmLoaiVanBan, dmNhomLoaiVanBan }
    },
    routes: [
        {
            path: '/user/category/loai-van-ban',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/category/loai-van-ban/nhom',
            component: Loadable({ loading: Loading, loader: () => import('./groupPage') })
        },
        {
            path: '/user/category/loai-van-ban/nhom/:ma',
            component: Loadable({ loading: Loading, loader: () => import('./groupItemPage.jsx') })
        },
    ],
};
