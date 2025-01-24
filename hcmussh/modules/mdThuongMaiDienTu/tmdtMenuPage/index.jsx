//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';

export default {
    routes: [
        {
            path: '/user/tmdt/tu-dien-du-lieu',
            component: Loadable({ loading: Loading, loader: () => import('./TuDienDuLieu.jsx') })
        }
    ],
};