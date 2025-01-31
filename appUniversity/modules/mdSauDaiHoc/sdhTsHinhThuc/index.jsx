//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhHinhThucTuyenSinh from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhHinhThucTuyenSinh }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/tuyen-sinh/hinh-thuc-tuyen-sinh',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};