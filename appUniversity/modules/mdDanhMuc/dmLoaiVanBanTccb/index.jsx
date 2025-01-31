//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmLoaiVanBanTccb from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmLoaiVanBanTccb }
    },
    routes: [
        {
            path: '/user/category/loai-van-ban-tccb',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};