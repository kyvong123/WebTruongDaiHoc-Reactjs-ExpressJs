//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import gvLichGiangDay from './redux';

export default {
    redux: {
        parent: 'giangVien',
        reducers: { gvLichGiangDay }
    },
    routes: [
        {
            path: '/user/affair/lich-giang-day',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/affair/lich-giang-day/detail/:maHocPhan',
            component: Loadable({ loading: Loading, loader: () => import('./adjustPage') })
        }
    ],
};