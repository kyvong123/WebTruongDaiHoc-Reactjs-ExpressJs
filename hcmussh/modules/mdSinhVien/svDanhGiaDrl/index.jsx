//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import svDrlPhucKhao from './redux';

export default {
    redux: {
        parent: 'student',
        reducers: { svDrlPhucKhao }
    },
    routes: [
        {
            path: '/user/danh-gia-drl',
            component: Loadable({ loading: Loading, loader: () => import('./userPage') })
        }
    ],
};