//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import quanHeNhapHoc from './redux';

export default {
    redux: {
        parent: 'ctsv',
        reducers: { quanHeNhapHoc }
    },
    routes: [
        {
            path: '/user/ctsv/ho-so-nhap-hoc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
    ],
};