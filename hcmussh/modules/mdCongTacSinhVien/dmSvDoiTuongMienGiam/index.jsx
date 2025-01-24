//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmDoiTuongMienGiam from './redux';

export default {
    redux: {
        parent: 'ctsv',
        reducers: { dmDoiTuongMienGiam }
    },
    routes: [
        {
            path: '/user/ctsv/doi-tuong-mien-giam',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};