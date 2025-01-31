//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import SdhTsThongTinBieuMau from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { SdhTsThongTinBieuMau }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/tuyen-sinh/thong-tin-bieu-mau',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};