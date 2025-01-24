//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhTsLichThi from './redux';
import sdhTsPhongThi from 'modules/mdSauDaiHoc/sdhTsDmPhongThi/redux';
import sdhDsTsCaThi from 'modules/mdSauDaiHoc/sdhTsInfoCaThiThiSinh/redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhTsLichThi, sdhTsPhongThi, sdhDsTsCaThi }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/tuyen-sinh/lich-thi',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],

};