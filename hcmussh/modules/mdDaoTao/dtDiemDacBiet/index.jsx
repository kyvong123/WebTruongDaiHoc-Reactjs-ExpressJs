//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import diemDacBiet from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { diemDacBiet }
    },
    routes: [
        {
            path: '/user/dao-tao/diem-dac-biet',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};