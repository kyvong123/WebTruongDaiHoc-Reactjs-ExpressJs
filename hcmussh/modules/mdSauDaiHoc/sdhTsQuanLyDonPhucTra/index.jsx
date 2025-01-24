//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhTsDonPhucTra from './redux';
export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhTsDonPhucTra }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/tuyen-sinh/quan-ly-phuc-tra',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};