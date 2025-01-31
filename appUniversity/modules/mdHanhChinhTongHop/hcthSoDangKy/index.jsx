//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import hcthSoDangKy from './redux/soDangKy';
import hcthSoVanBanRequest from './redux/request';

export default {
    redux: {
        parent: 'hcth',
        reducers: { hcthSoDangKy, hcthSoVanBanRequest }
    },
    routes: [
        {
            path: '/user/so-dang-ky',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/hcth/so-dang-ky',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/so-van-ban/request',
            component: Loadable({ loading: Loading, loader: () => import('./userRequestPage') })
        },
        {
            path: '/user/hcth/so-van-ban/request',
            component: Loadable({ loading: Loading, loader: () => import('./adminRequestPage') })
        }
    ],
};
