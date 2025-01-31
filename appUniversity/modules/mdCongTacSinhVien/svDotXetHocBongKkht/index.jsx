//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import svDotXetHocBongKkht from './redux/redux';
import svDssvHocBongKkht from './redux/dssvHocBongRedux';
import svLichSuHocBongKkht from './redux/lichSuHocBong';

// import svDssvDotDanhGiaDrl from './dssvRedux';

export default {
    redux: {
        parent: 'ctsv',
        reducers: { svDotXetHocBongKkht, svDssvHocBongKkht, svLichSuHocBongKkht }
    },
    routes: [
        {
            path: '/user/ctsv/hoc-bong-khuyen-khich',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/ctsv/hoc-bong-khuyen-khich/edit/:id',
            component: Loadable({ loading: Loading, loader: () => import('./editPage') })
        },
    ],
};