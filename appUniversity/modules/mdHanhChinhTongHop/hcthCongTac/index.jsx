//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import hcthCongTac from './redux/congTac';


export default {
    redux: {
        parent: 'hcth',
        reducers: { hcthCongTac }
    },
    routes: [
        {
            path: '/user/vpdt/cong-tac/dang-ky',
            component: Loadable({ loading: Loading, loader: () => import('./registerPage') })
        },
        {
            path: '/user/vpdt/cong-tac/dang-ky/:id',
            component: Loadable({ loading: Loading, loader: () => import('./ticketEditPage') })
        },
        {
            path: '/user/vpdt/cong-tac/:id',
            component: Loadable({ loading: Loading, loader: () => import('./itemEditPage') })
        },
        {
            path: '/user/hcth/phong-hop-ticket',
            component: Loadable({ loading: Loading, loader: () => import('./adminPhongHopTicketPage') })
        },
        {
            path: '/user/vpdt/phong-hop/tra-cuu',
            component: Loadable({ loading: Loading, loader: () => import('./traCuuPage') })
        },
        {
            path: '/user/hcth/cong-tac/dang-ky',
            component: Loadable({ loading: Loading, loader: () => import('./adminTicketPage') })
        },
        {
            path: '/user/hcth/cong-tac/tong-hop/:id',
            component: Loadable({ loading: Loading, loader: () => import('./compilePage') })
        },
        {
            path: '/user/vpdt/lich-cong-tac',
            component: Loadable({ loading: Loading, loader: () => import('./staffLichPage') })
        },
        {
            path: '/user/vpdt/lich-cong-tac/:id',
            component: Loadable({ loading: Loading, loader: () => import('./compilePage') })
        },
        {
            path: '/user/vpdt/uy-quyen/lich-cong-tac',
            component: Loadable({ loading: Loading, loader: () => import('./adminLichUyQuyen') })
        },
        {
            path: '/user/vpdt/uy-quyen/lich-cong-tac/:shcc',
            component: Loadable({ loading: Loading, loader: () => import('./userLichUyQuyen') })
        },
    ]
};
