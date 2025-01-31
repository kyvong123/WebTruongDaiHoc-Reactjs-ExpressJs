//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import fwENews from './redux';
import fwENewsDmLoaiNguoiNhan from './reduxDmLoaiNguoiNhan';
import fwENewsNguoiNhan from './reduxNguoiNhan';

export default {
    redux: {
        parent: 'truyenThong',
        reducers: {
            fwENews, fwENewsDmLoaiNguoiNhan, fwENewsNguoiNhan
        }
    },
    routes: [
        {
            path: '/user/truyen-thong/e-news',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
        {
            path: '/user/truyen-thong/e-news/edit/:eNewsId',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        },
        {
            path: '/user/truyen-thong/e-news/dm-nguoi-nhan',
            component: Loadable({ loading: Loading, loader: () => import('./dmLoaiNguoiNhanPage') })
        },
        {
            path: '/user/truyen-thong/e-news/nguoi-nhan',
            component: Loadable({ loading: Loading, loader: () => import('./nguoiNhanPage') })
        },
        {
            path: '/user/truyen-thong/e-news/nguoi-nhan/import',
            component: Loadable({ loading: Loading, loader: () => import('./nguoiNhanPageImport') })
        }
    ]
};