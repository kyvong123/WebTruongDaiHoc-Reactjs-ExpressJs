//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tccbHopDongLaoDong from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { tccbHopDongLaoDong }
    },
    routes: [
        {
            path: '/user/tccb/hop-dong-lao-dong/:ma',
            component: Loadable({ loading: Loading, loader: () => import('./detailPage') })
        },
        {
            path: '/user/tccb/hop-dong-lao-dong',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        }
    ],
};