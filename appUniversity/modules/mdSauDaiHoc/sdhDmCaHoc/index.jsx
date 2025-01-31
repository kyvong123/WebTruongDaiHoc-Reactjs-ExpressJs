//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhDmCaHoc from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhDmCaHoc, }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/ca-hoc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};