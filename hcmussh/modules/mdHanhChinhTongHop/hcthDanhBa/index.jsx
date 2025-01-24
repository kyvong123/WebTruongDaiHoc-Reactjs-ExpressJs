//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from '../../../view/component/Loading';
import hcthDanhBa from './redux';

export default {
    redux: {
        parent: 'hcth',
        reducers: { hcthDanhBa }
    },
    routes: [
        {
            path: '/user/vpdt/danh-ba',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/vpdt/danh-ba/:ma',
            component: Loadable({ loading: Loading, loader: () => import('./adminPageDetail') })
        }
    ]
};