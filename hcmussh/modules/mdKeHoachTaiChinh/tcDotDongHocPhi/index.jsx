//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tcDotDongHocPhi from './redux';

export default {
    redux: {
        parent: 'finance',
        reducers: { tcDotDongHocPhi }
    },
    routes: [
        {
            path: '/user/finance/dot-dong-hoc-phi',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        // {
        //     path: '/user/finance/dinh-muc/:namHoc/:hocKy',
        //     component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        // },
    ],
};