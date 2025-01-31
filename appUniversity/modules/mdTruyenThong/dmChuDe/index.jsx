//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmChuDe from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmChuDe }
    },
    routes: [
        {
            path: '/user/category/chu-de-chat/qa',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};