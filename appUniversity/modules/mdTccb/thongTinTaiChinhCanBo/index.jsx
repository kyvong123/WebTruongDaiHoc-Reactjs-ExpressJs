//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tccbThongTinTaiChinhCanBo from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { tccbThongTinTaiChinhCanBo }
    },
    routes: [
        {
            path: '/user/tccb/thong-tin-tai-chinh',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};
