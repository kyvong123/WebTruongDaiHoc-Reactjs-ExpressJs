//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmLoaiHoSo from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmLoaiHoSo }
    },
    routes: [
        {
            path: '/user/danh-muc/loai-ho-so',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
}; 