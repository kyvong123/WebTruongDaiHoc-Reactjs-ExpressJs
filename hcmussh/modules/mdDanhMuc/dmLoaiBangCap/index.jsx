//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmLoaiBangCap from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmLoaiBangCap }
    },
    routes: [
        {
            path: '/user/category/loai-bang-cap',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};