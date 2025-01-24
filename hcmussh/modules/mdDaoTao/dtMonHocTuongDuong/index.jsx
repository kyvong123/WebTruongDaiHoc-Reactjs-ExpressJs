//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tuongDuong from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { tuongDuong }
    },
    routes: [
        {
            path: '/user/dao-tao/mon-tuong-duong',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};