//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhDmDotDangKy from './redux';
import sdhDssvDotDkhp from 'modules/mdSauDaiHoc/sdhDssvDotDkhp/redux';


export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhDmDotDangKy, sdhDssvDotDkhp }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/dot-dang-ky',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/sau-dai-hoc/cau-hinh-dot-dkhp/edit/:id',
            component: Loadable({ loading: Loading, loader: () => import('./editPage') })
        },
    ],
};