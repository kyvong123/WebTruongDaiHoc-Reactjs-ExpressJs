//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtHopDongLaoDong from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { qtHopDongLaoDong }
    },
    routes: [
        {
            path: '/user/tccb/qua-trinh/hop-dong-lao-dong/group/:shcc',
            component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        },
        {
            path: '/user/tccb/qua-trinh/hop-dong-lao-dong/:ma',
            component: Loadable({ loading: Loading, loader: () => import('./adminDetails') })
        },
        {
            path: '/user/tccb/qua-trinh/hop-dong-lao-dong',
            component: Loadable({ loading: Loading, loader: () => import('./adminLDPage') })
        }
    ],
};