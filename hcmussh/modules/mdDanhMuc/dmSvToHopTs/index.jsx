//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmSvToHopTs from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmSvToHopTs }
    },
    routes: [
        {
            path: '/user/category/to-hop-thi',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};