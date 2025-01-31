//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmPhuCap from './reduxPhuCap';
import dmHuongPhuCap from './reduxHuongPhuCap';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmHuongPhuCap, dmPhuCap, }

    },
    routes: [
        {
            path: '/user/category/huong-phu-cap',
            component: Loadable({ loading: Loading, loader: () => import('./adminHuongPhuCapPage') })
        },
        {
            path: '/user/category/phu-cap',
            component: Loadable({ loading: Loading, loader: () => import('./adminPhuCapPage') })
        },
    ],
};