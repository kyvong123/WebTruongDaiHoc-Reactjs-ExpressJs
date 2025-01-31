//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtDmNgoaiNgu from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtDmNgoaiNgu }
    },
    routes: [
        {
            path: '/user/dao-tao/ngoai-ngu',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};