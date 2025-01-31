//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmLoaiHopDong from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmLoaiHopDong }
    },
    routes: [
        {
            path: '/user/category/loai-hop-dong',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};