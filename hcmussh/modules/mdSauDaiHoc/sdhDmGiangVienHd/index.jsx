//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhDmGiangVienHd from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhDmGiangVienHd, }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/giang-vien-huong-dan',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
        {
            path: '/user/sau-dai-hoc/giang-vien-huong-dan/:shcc',
            component: Loadable({ loading: Loading, loader: () => import('./adminDetailPage') }),
        },
    ],
};