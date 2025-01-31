//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tccbGvcnDanhGiaDrl from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { tccbGvcnDanhGiaDrl }
    },
    routes: [
        {
            path: '/user/lop-chu-nhiem/quan-ly-drl',
            component: Loadable({ loading: Loading, loader: () => import('./quanLyDrlPage.jsx') })
        },
        {
            path: '/user/lop-chu-nhiem/danh-gia-drl/:mssv',
            component: Loadable({ loading: Loading, loader: () => import('./danhGiaDrlPage') })
        }
    ],
};
