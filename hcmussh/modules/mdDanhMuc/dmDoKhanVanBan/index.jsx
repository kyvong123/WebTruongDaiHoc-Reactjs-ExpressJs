//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmDoKhanVanBan from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmDoKhanVanBan }
    },
    routes: [
        {
            path: '/user/category/do-khan-van-ban',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};