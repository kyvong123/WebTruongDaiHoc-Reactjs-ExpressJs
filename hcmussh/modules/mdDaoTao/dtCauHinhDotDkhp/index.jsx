//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtCauHinhDotDkhp from './redux';
import dtDssvTrongDotDkhp from 'modules/mdDaoTao/dtDssvTrongDotDkhp/redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtCauHinhDotDkhp, dtDssvTrongDotDkhp }
    },
    routes: [
        {
            path: '/user/dao-tao/edu-schedule/cau-hinh-dkhp',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/dao-tao/edu-schedule/cau-hinh-dkhp/edit/:id',
            component: Loadable({ loading: Loading, loader: () => import('./adjustPage') })
        }
    ],
};