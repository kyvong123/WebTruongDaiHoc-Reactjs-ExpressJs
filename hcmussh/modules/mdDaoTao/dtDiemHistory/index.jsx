//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtDiemHistory from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtDiemHistory }
    },
    routes: [
        {
            path: '/user/dao-tao/grade-manage/lich-su',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        }
    ],
};