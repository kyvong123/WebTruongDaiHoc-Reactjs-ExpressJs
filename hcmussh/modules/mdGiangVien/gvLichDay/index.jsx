//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';

export default {
    redux: {
        parent: 'giangVien',
        reducers: {}
    },
    routes: [
        {
            path: '/user/lich-day',
            component: Loadable({ loading: Loading, loader: () => import('./userPage') })
        }
    ],
};