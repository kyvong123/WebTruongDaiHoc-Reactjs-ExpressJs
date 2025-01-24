//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dataSinhVien from './redux';
import dtLichSuDkhp from 'modules/mdSinhVien/svLichSuDangKy/redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtLichSuDkhp, dataSinhVien }
    },
    routes: [
        {
            path: '/user/dao-tao/students',
            component: Loadable({ loading: Loading, loader: () => import('./listStudentPage') })
        },
        {
            path: '/user/dao-tao/students/edit/:mssv',
            component: Loadable({ loading: Loading, loader: () => import('./editStudentPage') })
        },
        {
            path: '/user/dao-tao/ket-qua-dkhp',
            component: Loadable({ loading: Loading, loader: () => import('./adjustPage') })
        }
    ],
};
