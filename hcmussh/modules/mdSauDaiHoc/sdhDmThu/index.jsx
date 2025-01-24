//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhDmThu from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhDmThu }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/thu',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};