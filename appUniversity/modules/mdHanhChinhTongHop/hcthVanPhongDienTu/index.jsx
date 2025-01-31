//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';

export default {
    redux: {
        parent: 'hcth',
        reducers: {}
    },
    routes: [
        {
            path: '/user/van-phong-dien-tu/van-ban/cho-xu-ly',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};
