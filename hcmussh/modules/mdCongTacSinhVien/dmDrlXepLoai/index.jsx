//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmDrlXepLoai from './redux';

export default {
    redux: {
        parent: 'ctsv',
        reducers: { dmDrlXepLoai }
    },
    routes: [
        {
            path: '/user/ctsv/drl-xep-loai',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};
