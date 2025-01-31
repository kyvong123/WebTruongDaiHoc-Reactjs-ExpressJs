//TEMPLATES: admin
import smsManage from './redux';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';

export default {
    redux: {
        parent: 'framework',
        reducers: { smsManage }
    },
    routes: [
        {
            path: '/user/sms-manage',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ]
};