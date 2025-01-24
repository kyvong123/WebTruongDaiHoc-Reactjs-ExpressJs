//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';

export default {
    redux: {
        parent: 'ctsv',
        reducers: {}
    },
    routes: [
        {
            path: '/user/ctsv/tuyen-sinh',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        }
    ],
};
