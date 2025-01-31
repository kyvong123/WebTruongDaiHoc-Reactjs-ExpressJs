//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhTsDashboard from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhTsDashboard }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/tuyen-sinh/dashboard',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};
