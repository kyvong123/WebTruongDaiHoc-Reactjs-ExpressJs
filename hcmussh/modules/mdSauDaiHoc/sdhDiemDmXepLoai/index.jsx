//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhDiemXepLoai from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhDiemXepLoai, }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/diem-xep-loai',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};