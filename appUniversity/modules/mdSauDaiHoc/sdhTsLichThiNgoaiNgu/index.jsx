//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhTsLichThiNgoaiNgu from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhTsLichThiNgoaiNgu }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/tuyen-sinh/lich-thi-nn',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],

};