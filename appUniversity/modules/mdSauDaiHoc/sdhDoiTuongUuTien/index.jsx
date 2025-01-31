//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhDoiTuongUuTien from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhDoiTuongUuTien }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/doi-tuong-uu-tien',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};