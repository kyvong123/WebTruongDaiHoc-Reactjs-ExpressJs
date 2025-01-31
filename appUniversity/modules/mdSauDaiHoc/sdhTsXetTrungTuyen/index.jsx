//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhTsXetTrungTuyen from './redux';
export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhTsXetTrungTuyen }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/tuyen-sinh/xet-trung-tuyen',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],

};