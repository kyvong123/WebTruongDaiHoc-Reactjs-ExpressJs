//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhDiemDacBiet from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhDiemDacBiet }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/diem-dac-biet',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};