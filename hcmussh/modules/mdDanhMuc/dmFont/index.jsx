//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmFont from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmFont }
    },
    routes: [
        {
            path: '/user/category/font',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};