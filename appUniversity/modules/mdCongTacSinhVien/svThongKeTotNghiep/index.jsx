//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import svThongKeTotNghiep from './redux';

export default {
    redux: {
        parent: 'ctsv',
        reducers: { svThongKeTotNghiep }
    },
    routes: [
        {
            path: '/user/ctsv/thong-ke-tot-nghiep',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};
