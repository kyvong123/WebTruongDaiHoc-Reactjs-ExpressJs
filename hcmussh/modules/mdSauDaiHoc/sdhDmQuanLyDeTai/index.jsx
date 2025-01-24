//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhDmQuanLyDeTai from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhDmQuanLyDeTai, }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/quan-ly-de-tai',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/sau-dai-hoc/quan-ly-de-tai/item/:ma',
            component: Loadable({ loading: Loading, loader: () => import('./detailPage') })
        },
        {
            path: '/user/sau-dai-hoc/quan-ly-de-tai/upload',
            component: Loadable({ loading: Loading, loader: () => import('./adminUploadPage') })
        }
        
    ],
};