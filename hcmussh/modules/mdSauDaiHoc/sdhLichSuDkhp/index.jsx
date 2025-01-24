//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhLichSuDkhp from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhLichSuDkhp }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/lich-su',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};