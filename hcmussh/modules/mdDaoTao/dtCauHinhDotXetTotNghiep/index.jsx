//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtCauHinhDotXetTotNghiep from './redux';
import dtDanhSachXetTotNghiep from 'modules/mdDaoTao/dtDanhSachXetTotNghiep/redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtCauHinhDotXetTotNghiep, dtDanhSachXetTotNghiep }
    },
    routes: [
        {
            path: '/user/dao-tao/graduation/setting',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/dao-tao/graduation/setting/edit/:id',
            component: Loadable({ loading: Loading, loader: () => import('./adjustPage') })
        },
        {
            path: '/user/dao-tao/graduation/setting/detail',
            component: Loadable({ loading: Loading, loader: () => import('./detailPage') })
        },
    ],
};