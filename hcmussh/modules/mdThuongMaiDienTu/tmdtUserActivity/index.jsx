//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tmdtUserSanPham from './redux.jsx';

export default {
    redux: {
        parent: 'tmdt',
        reducers: { tmdtUserSanPham }
    },
    routes: [
        {
            path: '/user/tmdt/y-shop/user/san-pham/home-page',
            component: Loadable({ loading: Loading, loader: () => import('./userHomePage.jsx') })
        }
    ],
};