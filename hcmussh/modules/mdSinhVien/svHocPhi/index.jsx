//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import svHocPhi from './redux';

export default {
    redux: {
        parent: 'student',
        reducers: { svHocPhi }
    },
    routes: [
        {
            path: '/user/hoc-phi',
            component: Loadable({ loading: Loading, loader: () => import('./hocPhiPage') })
        },
        {
            path: '/user/hoc-phi/invoice',
            component: Loadable({ loading: Loading, loader: () => import('./invoicePage') })
        }
    ],
};