//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';

export default {
    routes: [
        {
            path: '/user/sau-dai-hoc/enrollment-period',
            component: Loadable({ loading: Loading, loader: () => import('./EnrollmentPeriod') })
        }
    ],
};