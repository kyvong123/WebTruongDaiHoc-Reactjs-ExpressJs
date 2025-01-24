//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhLoaiMonThi from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhLoaiMonThi }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/tuyen-sinh/loai-mon-thi',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};