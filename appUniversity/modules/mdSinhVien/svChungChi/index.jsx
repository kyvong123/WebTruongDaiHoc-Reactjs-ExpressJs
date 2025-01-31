//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import svChungChi from './redux';

export default {
    redux: {
        parent: 'student',
        reducers: { svChungChi }
    },
    routes: [
        {
            path: '/user/dang-ky-chung-chi',
            component: Loadable({ loading: Loading, loader: () => import('./userPage') })
        }
    ],
};