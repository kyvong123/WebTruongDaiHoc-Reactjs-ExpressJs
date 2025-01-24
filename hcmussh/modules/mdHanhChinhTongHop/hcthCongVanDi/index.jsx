//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import hcthCongVanDi from './redux/vanBanDi';

export default {
    redux: {
        parent: 'hcth',
        reducers: { hcthCongVanDi }
    },
    routes: [
        {
            path: '/user/hcth/van-ban-di',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/hcth/van-ban-di/import',
            component: Loadable({ loading: Loading, loader: () => import('./importPage') })
        },
        {
            path: '/user/van-ban-di/bulk',
            component: Loadable({ loading: Loading, loader: () => import('./adminBulkPage') })
        },
        {
            path: '/user/hcth/van-ban-di/files/signing',
            component: Loadable({ loading: Loading, loader: () => import('./signFilePage') })
        },
        {
            path: '/user/hcth/van-ban-di/:id',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        },
        {
            path: '/user/van-ban-di',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/van-ban-di/:id',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        },
        {
            path: '/user/hcth/van-ban-di/convert/:id',
            component: Loadable({ loading: Loading, loader: () => import('./userConvertPage') })
        },
        {
            path: '/user/van-ban-di/convert/:id',
            component: Loadable({ loading: Loading, loader: () => import('./userConvertPage') })
        }
    ]
};
