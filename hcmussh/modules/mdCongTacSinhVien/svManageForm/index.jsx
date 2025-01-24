//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import ctsvManageForm from './redux';

export default {
    redux: {
        parent: 'ctsv',
        reducers: { ctsvManageForm }
    },
    routes: [
        {
            path: '/user/ctsv/quan-ly-forms',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        }
    ],
};
