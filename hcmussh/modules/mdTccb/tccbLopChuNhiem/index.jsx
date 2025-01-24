//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tccbLopChuNhiem from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { tccbLopChuNhiem }
    },
    routes: [
        {
            path: '/user/lop-chu-nhiem',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};
