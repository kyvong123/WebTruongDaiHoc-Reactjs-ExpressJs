//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import svManageMienGiam from './redux/reduxManageMg';
import svDsMienGiam from './redux/reduxDsmg';

export default {
    redux: {
        parent: 'ctsv',
        reducers: { svManageMienGiam, svDsMienGiam }
    },
    routes: [
        {
            path: '/user/ctsv/quan-ly-mien-giam',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        }
    ],
};
