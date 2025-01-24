//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tmdtSellerSanPham from './redux/sanPhamRedux';
import tmdtSellerCauHinhSanPham from './redux/cauHinhSanPhamRedux';
import tmdtSellerMyDaiLy from './redux/myDaiLyRedux';
import tmdtSellerDonHang from './redux/donHangRedux';
import tmdtSellerVoucher from './redux/voucherRedux';
import tmdtSellerDiaChi from './redux/diaChiRedux';


export default {
    redux: {
        parent: 'tmdt',
        reducers: { tmdtSellerSanPham, tmdtSellerCauHinhSanPham, tmdtSellerMyDaiLy, tmdtSellerDonHang, tmdtSellerVoucher, tmdtSellerDiaChi }
    },
    routes: [
        { path: '/user/tmdt/y-shop/seller/my-dai-ly', component: Loadable({ loading: Loading, loader: () => import('./client/daiLyManage/myDaiLyListPage') }) },
        { path: '/user/tmdt/y-shop/seller/my-dai-ly/:id', component: Loadable({ loading: Loading, loader: () => import('./client/daiLyManage/myDaiLyMenuPage') }) },
        { path: '/user/tmdt/y-shop/seller/my-dai-ly/:id/info', component: Loadable({ loading: Loading, loader: () => import('./client/daiLyManage/myDaiLyInfoPage') }) },
        { path: '/user/tmdt/y-shop/seller/my-dai-ly/:id/san-pham', component: Loadable({ loading: Loading, loader: () => import('./client/daiLyManage/myDaiLySanPhamPage') }) },
        { path: '/user/tmdt/y-shop/seller/my-dai-ly/:id/don-hang', component: Loadable({ loading: Loading, loader: () => import('./client/daiLyManage/myDaiLyDonHangPage') }) },
        { path: '/user/tmdt/y-shop/seller/voucher/:maDaiLy', component: Loadable({ loading: Loading, loader: () => import('./client/daiLyManage/myDaiLyVoucherPage') }) },
        { path: '/user/tmdt/y-shop/seller/dia-chi/:maDaiLy', component: Loadable({ loading: Loading, loader: () => import('./client/daiLyManage/myDaiLyDiaChiPage') }) },
        { path: '/user/tmdt/y-shop/seller/san-pham/:id', component: Loadable({ loading: Loading, loader: () => import('./client/sanPhamManage/sanPhamDetailPage') }) },
        { path: '/user/tmdt/y-shop/seller/san-pham-draft/:id', component: Loadable({ loading: Loading, loader: () => import('./client/sanPhamManage/draftDetailPage') }) },
        { path: '/user/tmdt/y-shop/seller/san-pham/cau-hinh/:maSanPham', component: Loadable({ loading: Loading, loader: () => import('./client/sanPhamManage/cauHinhSanPhamSellerPage') }) },
    ],
};
