//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import formVanBan from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { formVanBan }
    },
    routes: [
        {
            path: '/user/tccb/form-van-ban',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};
