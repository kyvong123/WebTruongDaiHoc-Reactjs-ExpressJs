//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhDiemThangDiem from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhDiemThangDiem }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/diem/thang-diem',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};