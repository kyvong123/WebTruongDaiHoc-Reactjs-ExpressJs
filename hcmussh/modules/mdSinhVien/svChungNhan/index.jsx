//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import svManageForm from './redux';

export default {
    redux: {
        parent: 'student',
        reducers: { svManageForm }
    },
    routes: [
        {
            path: '/user/chung-nhan-truc-tuyen',
            component: Loadable({ loading: Loading, loader: () => import('./userPage') })
        }
    ],
};
