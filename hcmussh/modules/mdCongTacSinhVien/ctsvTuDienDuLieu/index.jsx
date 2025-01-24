//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';

export default {
    redux: {
    },
    routes: [
        {
            path: '/user/ctsv/he-dao-tao',
            component: Loadable({ loading: Loading, loader: () => import('modules/mdDanhMuc/dmSvLoaiHinhDaoTao/adminPage') })
        },
    ],
};