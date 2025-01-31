//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmHoiNghi from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmHoiNghi, }
    },
    routes: [
        {
            path: '/user/category/hoi-nghi',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};