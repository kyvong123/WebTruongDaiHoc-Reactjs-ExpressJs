//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmNoiNhanForm from './redux';

export default {
    redux: {
        parent: 'ctsv',
        reducers: { dmNoiNhanForm }
    },
    routes: [
        {
            path: '/user/ctsv/noi-nhan-form',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};