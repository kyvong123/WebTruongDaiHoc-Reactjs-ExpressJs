//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import TmdtSetting from './redux';

export default {
    redux: {
        parent: 'tmdt',
        reducers: { TmdtSetting }
    },
    routes: [
        {
            path: '/user/tmdt/y-shop/setting',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};