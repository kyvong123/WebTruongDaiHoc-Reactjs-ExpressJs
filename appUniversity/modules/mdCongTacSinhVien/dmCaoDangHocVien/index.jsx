//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmCaoDang from './redux';

export default {
    redux: {
        parent: 'ctsv',
        reducers: { dmCaoDang }
    },
    routes: [
        {
            path: '/user/ctsv/dm-cao-dang',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};
