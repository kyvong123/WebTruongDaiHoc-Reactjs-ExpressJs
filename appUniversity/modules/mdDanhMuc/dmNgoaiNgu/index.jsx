//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmNgoaiNgu from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmNgoaiNgu }
    },
    routes: [
        {
            path: '/user/category/ngoai-ngu',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};