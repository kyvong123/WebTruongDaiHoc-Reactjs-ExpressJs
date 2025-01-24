//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmCanBoLop from './redux';

export default {
    redux: {
        parent: 'ctsv',
        reducers: { dmCanBoLop }
    },
    routes: [
        {
            path: '/user/ctsv/dm-can-bo-lop',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};