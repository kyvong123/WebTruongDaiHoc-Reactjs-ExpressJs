//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
// import hcthSoDangKy from './redux';
// import hcthSoVanBanRequest from './redux/request';

export default {
    redux: {
        parent: 'hcth',
        reducers: {}
    },
    routes: [
        {
            path: '/user/van-phong-dien-tu/setting',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};
