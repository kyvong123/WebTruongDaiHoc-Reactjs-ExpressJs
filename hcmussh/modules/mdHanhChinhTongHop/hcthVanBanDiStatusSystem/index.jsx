//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import hcthVanBanDiStatusSystem from './redux/statusSystem';
import hcthDoiTuongKiemDuyet from './redux/hcthDoiTuongKiemDuyet';
import hcthCapVanBan from './redux/hcthCapVanBan';
import hcthSignType from './redux/hcthSignType';
import hcthVanBanDiStatus from './redux/hcthVanBanDiStatus';

export default {
    redux: {
        parent: 'hcth',
        reducers: { hcthVanBanDiStatusSystem, hcthDoiTuongKiemDuyet, hcthCapVanBan, hcthSignType, hcthVanBanDiStatus }
    },
    routes: [
        {
            path: '/user/hcth/trang-thai-van-ban-di',
            component: Loadable({ loading: Loading, loader: () => import('./statusSystemPage') })
        },
        {
            path: '/user/hcth/trang-thai-van-ban-di/:id',
            component: Loadable({ loading: Loading, loader: () => import('./statusSystemEditPage') })
        },
        {
            path: '/user/hcth/doi-tuong-kiem-duyet',
            component: Loadable({ loading: Loading, loader: () => import('./hcthDoiTuongKiemDuyet') })
        },
        {
            path: '/user/hcth/cap-van-ban',
            component: Loadable({ loading: Loading, loader: () => import('./hcthCapVanBan') })
        },
        {
            path: '/user/hcth/loai-chu-ky',
            component: Loadable({ loading: Loading, loader: () => import('./hcthSignType') })
        },
        {
            path: '/user/hcth/van-ban-di-status',
            component: Loadable({ loading: Loading, loader: () => import('./hcthVanBanDiStatus') })
        }
    ],
};