//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhDiemManage from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhDiemManage }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/diem-hoc-phan',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};