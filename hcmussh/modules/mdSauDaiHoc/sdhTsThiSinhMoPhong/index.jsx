//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
export default {
    redux: {
        parent: 'sdh',
        reducers: {}
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/tuyen-sinh/mo-phong',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};