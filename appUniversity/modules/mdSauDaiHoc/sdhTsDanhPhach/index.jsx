//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhTsDanhPhach from './redux';
import sdhTsLichThi from 'modules/mdSauDaiHoc/sdhTsInfoLichThi/redux';
export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhTsDanhPhach, sdhTsLichThi }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/tuyen-sinh/danh-phach',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};