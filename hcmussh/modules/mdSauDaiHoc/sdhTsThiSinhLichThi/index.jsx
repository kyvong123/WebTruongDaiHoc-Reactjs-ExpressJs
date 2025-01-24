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
            path: '/user/sdh/ts/thi-sinh/lich-thi',
            component: Loadable({ loading: Loading, loader: () => import('./homePage') })
        },
    ],

};