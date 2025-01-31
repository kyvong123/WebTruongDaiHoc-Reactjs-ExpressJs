//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import hoSoNhapHoc from './redux';

export default {
    redux: {
        parent: 'ctsv',
        reducers: { hoSoNhapHoc }
    },
    routes: [
        {
            path: '/user/ctsv/danh-muc-ho-so',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
    ]
};