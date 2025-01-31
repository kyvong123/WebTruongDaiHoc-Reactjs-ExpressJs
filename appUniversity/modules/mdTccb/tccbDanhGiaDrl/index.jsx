//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tccbDanhGiaDrl from './redux/danhGiaDrlRedux';
import tccbDrlRole from './redux/drlRoleRedux';
import tccbDanhGiaDrlPhucKhao from './redux/reduxPhucKhao';
import tccbDrlGiaHan from './redux/drlGiaHanRedux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { tccbDanhGiaDrl, tccbDanhGiaDrlPhucKhao, tccbDrlRole, tccbDrlGiaHan }
    },
    routes: [
        {
            path: '/user/khoa/quan-ly-drl',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/khoa/danh-gia-drl/:mssv',
            component: Loadable({ loading: Loading, loader: () => import('./danhGiaDrlPage') })
        },
        {
            path: '/user/khoa/diem-ren-luyen/roles',
            component: Loadable({ loading: Loading, loader: () => import('./rolePage') })
        },
    ],
};
