//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhChungChiNgoaiNgu from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhChungChiNgoaiNgu }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/chung-chi-ngoai-ngu',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};