//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmDaiHoc from './redux';

export default {
    redux: {
        parent: 'ctsv',
        reducers: { dmDaiHoc }
    },
    routes: [
        {
            path: '/user/ctsv/dm-dai-hoc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};
