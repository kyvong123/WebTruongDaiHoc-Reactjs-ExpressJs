//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import svDotDanhGiaDrl from './redux';
import svDssvDotDanhGiaDrl from './dssvRedux';

export default {
    redux: {
        parent: 'ctsv',
        reducers: { svDotDanhGiaDrl, svDssvDotDanhGiaDrl }
    },
    routes: [
        {
            path: '/user/ctsv/dot-danh-gia-drl',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/ctsv/dot-danh-gia-drl/edit/:id',
            component: Loadable({ loading: Loading, loader: () => import('./adjustPage') })
        }
    ],
};