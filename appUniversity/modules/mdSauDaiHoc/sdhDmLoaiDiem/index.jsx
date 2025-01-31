//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhDmLoaiDiem from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhDmLoaiDiem }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/loai-diem',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};