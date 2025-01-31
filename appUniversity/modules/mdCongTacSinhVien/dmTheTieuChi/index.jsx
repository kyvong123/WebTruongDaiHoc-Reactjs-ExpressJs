//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmTheTieuChi from './redux';

export default {
    redux: {
        parent: 'ctsv',
        reducers: { dmTheTieuChi }
    },
    routes: [
        {
            path: '/user/ctsv/danh-muc-the-tieu-chi',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};