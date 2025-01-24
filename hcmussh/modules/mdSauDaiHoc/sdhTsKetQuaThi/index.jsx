//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhTsDiemThi from './redux';
import sdhTsDiemHistory from 'modules/mdSauDaiHoc/sdhTsQuanLyDiem/redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhTsDiemThi, sdhTsDiemHistory }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/tuyen-sinh/ket-qua-thi',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],

};