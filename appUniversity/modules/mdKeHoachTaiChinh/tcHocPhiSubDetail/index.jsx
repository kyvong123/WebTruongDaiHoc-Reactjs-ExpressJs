//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tcHocPhiTheoMon from './redux';

export default {
    redux: {
        parent: 'finance',
        reducers: { tcHocPhiTheoMon }
    },
    routes: [
        {
            path: '/user/finance/hoc-phi-theo-mon',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};