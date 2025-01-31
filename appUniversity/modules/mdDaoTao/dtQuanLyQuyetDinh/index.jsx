//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtQuanLyQuyetDinh from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtQuanLyQuyetDinh }
    },
    routes: [
        {
            path: '/user/dao-tao/quan-ly-quyet-dinh',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};