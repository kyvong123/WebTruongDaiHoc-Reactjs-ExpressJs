//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtDmCefr from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtDmCefr }
    },
    routes: [
        {
            path: '/user/dao-tao/cefr',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};