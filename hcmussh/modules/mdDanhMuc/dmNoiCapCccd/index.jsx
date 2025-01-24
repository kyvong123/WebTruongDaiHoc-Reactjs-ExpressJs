//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmNoiCapCccd from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmNoiCapCccd, }
    },
    routes: [
        {
            path: '/user/category/noi-cap-cccd',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};