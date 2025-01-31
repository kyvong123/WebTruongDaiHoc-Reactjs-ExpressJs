//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmChau from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmChau }
    },
    routes: [
        {
            path: '/user/category/chau',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};