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
            path: '/user/affair/nhap-diem',
            component: Loadable({ loading: Loading, loader: () => import('./userPage') })
        },
        {
            path: '/user/affair/nhap-diem/edit/:id',
            component: Loadable({ loading: Loading, loader: () => import('./nhapDiemPage') })
        },
    ],
};