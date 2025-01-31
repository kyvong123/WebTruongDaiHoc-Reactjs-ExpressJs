//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtLuong from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { qtLuong }
    },
    routes: [
        // {
        //     path: '/user/tccb/qua-trinh/luong/group/:shcc',
        //     component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        // },
        {
            path: '/user/tccb/qua-trinh/luong',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        // {
        //     path: '/user/luong',
        //     component: Loadable({ loading: Loading, loader: () => import('./staffPage') })
        // },
        {
            path: '/user/tccb/qua-trinh/luong/import',
            component: Loadable({ loading: Loading, loader: () => import('./adminImportPage')})
        }
    ],
};