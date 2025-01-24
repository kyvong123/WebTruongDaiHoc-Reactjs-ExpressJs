//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhKyThiTs from 'modules/mdSauDaiHoc/sdhTsInfo/redux';
export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhKyThiTs }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/tuyen-sinh/ky-tuyen-sinh',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],

};