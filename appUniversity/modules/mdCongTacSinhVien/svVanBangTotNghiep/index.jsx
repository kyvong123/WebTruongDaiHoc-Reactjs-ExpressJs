//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import svVanBangTotNghiep from './redux';

export default {
    redux: {
        parent: 'ctsv',
        reducers: { svVanBangTotNghiep }
    },
    routes: [
        {
            path: '/user/ctsv/van-bang-tot-nghiep',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};
