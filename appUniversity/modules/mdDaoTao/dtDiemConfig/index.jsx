//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtDiemConfig from './redux';
import diemThanhPhan from 'modules/mdDaoTao/dtDiemConfigThanhPhan/redux';
import diemQuyChe from 'modules/mdDaoTao/dtDiemConfigQuyChe/redux';
import diemDat from 'modules/mdDaoTao/dtDiemConfigDiemDat/redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtDiemConfig, diemThanhPhan, diemQuyChe, diemDat }
    },
    routes: [
        {
            path: '/user/dao-tao/grade-manage/setting',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/dao-tao/grade-manage/setting/:idSemester',
            component: Loadable({ loading: Loading, loader: () => import('./editPage') })
        },
    ],
};