//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhSemester from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhSemester }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/cau-hinh-nam-hoc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],

};