//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmMucDichTrongNuoc from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmMucDichTrongNuoc }
    },
    routes: [
        {
            path: '/user/category/muc-dich-trong-nuoc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};