//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtDmChungChiNgoaiNgu from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtDmChungChiNgoaiNgu }
    },
    routes: [
        {
            path: '/user/dao-tao/chung-chi-ngoai-ngu',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        // {
        //     path: '/user/dao-tao/chung-chi-ngoai-ngu/detail/:id',
        //     component: Loadable({ loading: Loading, loader: () => import('./detailPage') })
        // }
    ],
};