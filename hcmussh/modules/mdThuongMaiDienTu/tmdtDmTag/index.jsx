//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tmdtDmTag from './redux';

export default {
    redux: {
        parent: 'tmdt',
        reducers: { tmdtDmTag }
    },
    routes: [
        {
            path: '/user/tmdt/y-shop/tu-dien-du-lieu/tag',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};