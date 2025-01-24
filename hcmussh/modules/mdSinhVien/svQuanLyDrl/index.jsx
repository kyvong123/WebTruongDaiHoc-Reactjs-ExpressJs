//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import ltDanhGiaDrl from './redux';

export default {
    redux: {
        parent: 'student',
        reducers: { ltDanhGiaDrl }
    },
    routes: [
        {
            path: '/user/lop-truong/quan-ly-drl',
            component: Loadable({ loading: Loading, loader: () => import('./quanLyDrlPage.jsx') })
        },
        {
            path: '/user/lop-truong/danh-gia-drl/:mssv',
            component: Loadable({ loading: Loading, loader: () => import('./danhGiaDrlPage') })
        }
    ],
};
