//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhTsHsdk from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhTsHsdk }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/tuyen-sinh/hsdk',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};