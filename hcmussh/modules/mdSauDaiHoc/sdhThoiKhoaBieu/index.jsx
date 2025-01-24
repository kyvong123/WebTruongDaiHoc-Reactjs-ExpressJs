//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhThoiKhoaBieu from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhThoiKhoaBieu }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/thoi-khoa-bieu',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],

};