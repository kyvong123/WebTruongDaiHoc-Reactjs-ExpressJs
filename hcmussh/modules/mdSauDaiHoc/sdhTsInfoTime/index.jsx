//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhDotTs from 'modules/mdSauDaiHoc/sdhTsInfoTime/redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhDotTs }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/tuyen-sinh/dot-tuyen-sinh',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/sau-dai-hoc/tuyen-sinh/dot-tuyen-sinh/setting/:maKyThi/:maDotTs',
            component: Loadable({ loading: Loading, loader: () => import('./settingPage') })
        }
    ],
};