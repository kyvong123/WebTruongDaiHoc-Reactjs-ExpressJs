//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtDmHinhThucThi from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtDmHinhThucThi }
    },
    routes: [
        {
            path: '/user/dao-tao/hinh-thuc-thi',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        }
    ],
};