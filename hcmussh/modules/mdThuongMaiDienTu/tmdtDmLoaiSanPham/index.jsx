//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tmdtDmLoaiSanPham from './redux';

export default {
    redux: {
        parent: 'tmdt',
        reducers: { tmdtDmLoaiSanPham }
    },
    routes: [
        {
            path: '/user/tmdt/y-shop/tu-dien-du-lieu/loai-san-pham',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};