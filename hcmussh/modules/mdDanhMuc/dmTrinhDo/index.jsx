//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmTrinhDo from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmTrinhDo }
    },
    routes: [
        {
            path: '/user/category/trinh-do',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};