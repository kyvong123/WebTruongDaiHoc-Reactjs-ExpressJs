//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import hcthPhanCapQuySo from './redux/phanCapQuySo';
import hcthQuySo from './redux/quySo';
import hcthFormatSoVanBan from './redux/formatSoVanBan';

export default {
    redux: {
        parent: 'hcth',
        reducers: { hcthPhanCapQuySo, hcthQuySo, hcthFormatSoVanBan }
    },
    routes: [
        {
            path: '/user/hcth/cau-hinh-quy-so',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/hcth/quy-so',
            component: Loadable({ loading: Loading, loader: () => import('./quySoPage') })
        },
        {
            path: '/user/hcth/format',
            component: Loadable({ loading: Loading, loader: () => import('./formatSoPage') })
        },

    ],
}; 
