//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import hocPhan from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { hocPhan }
    },
    routes: [
        {
            path: '/user/dao-tao/edu-schedule/mo-phong-sinh-vien',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        }
    ],
};