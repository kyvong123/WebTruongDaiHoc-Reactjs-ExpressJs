//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhMonThiTuyenSinh from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhMonThiTuyenSinh }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/tuyen-sinh/mon-thi-tuyen-sinh',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/sau-dai-hoc/tuyen-sinh/mon-thi-tuyen-sinh/upload',
            component: Loadable({ loading: Loading, loader: () => import('./adminUploadPage') })
        },
    ],
};