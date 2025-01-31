//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
export default {
    routes: [
        {
            path: '/user/sau-dai-hoc/tuyen-sinh/ts-setting',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        }
    ],
};