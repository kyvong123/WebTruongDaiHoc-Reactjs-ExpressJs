//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmChiBo from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmChiBo }
    },
    routes: [
        {
            path: '/user/category/chi-bo',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};