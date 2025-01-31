//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtBaiVietKhoaHoc from './redux';

export default {
    redux: {
        parent: 'khcn',
        reducers: { qtBaiVietKhoaHoc }
    },
    routes: [
        {
            path: '/user/:khcn/qua-trinh/bai-viet-khoa-hoc/group/:shcc',
            component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        },
        {
            path: '/user/khcn/qua-trinh/bai-viet-khoa-hoc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        //
        {
            path: '/user/tccb/qua-trinh/bai-viet-khoa-hoc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/bai-viet-khoa-hoc',
            component: Loadable({ loading: Loading, loader: () => import('./staffPage') })
        }
    ],
};
