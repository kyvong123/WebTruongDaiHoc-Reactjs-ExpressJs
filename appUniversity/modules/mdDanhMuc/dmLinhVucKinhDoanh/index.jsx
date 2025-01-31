//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmLinhVucKinhDoanh from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmLinhVucKinhDoanh }
    },
    routes: [
        {
            path: '/user/category/linh-vuc-kinh-doanh',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};