//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import xepLoai from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { xepLoai }
    },
    routes: [
        {
            path: '/user/dao-tao/diem/xep-loai',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};