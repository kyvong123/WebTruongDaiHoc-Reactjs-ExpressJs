//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dataSinhVien from './redux';

export default {
    redux: {
        parent: 'ctsv',
        reducers: { dataSinhVien }
    },
    routes: [
        {
            path: '/user/ctsv/list',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/ctsv/import',
            component: Loadable({ loading: Loading, loader: () => import('./importPage') })
        },
        {
            path: '/user/ctsv/profile/:mssv',
            component: Loadable({ loading: Loading, loader: () => import('./editPage') })
        }
    ],
};
