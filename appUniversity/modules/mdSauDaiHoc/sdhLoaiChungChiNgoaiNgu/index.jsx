//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhLoaiChungChiNgoaiNgu from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhLoaiChungChiNgoaiNgu }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/loai-chung-chi-ngoai-ngu',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};