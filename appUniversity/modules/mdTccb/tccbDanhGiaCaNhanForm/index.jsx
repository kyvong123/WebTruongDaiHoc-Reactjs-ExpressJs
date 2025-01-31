//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tccbDanhGiaCaNhanForm from './redux/redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { tccbDanhGiaCaNhanForm }
    },
    routes: [
        {
            path: '/user/tccb/danh-gia-ca-nhan-form',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/tccb/danh-gia-ca-nhan-form/:nam',
            component: Loadable({ loading: Loading, loader: () => import('./adminDetails') })
        },
        {
            path: '/user/tccb/hoi-dong-danh-gia-don-vi',
            component: Loadable({ loading: Loading, loader: () => import('./adminHoiDongDonViPage') })
        },
        {
            path: '/user/tccb/hoi-dong-danh-gia-don-vi/:nam',
            component: Loadable({ loading: Loading, loader: () => import('./adminHoiDongDonViDSCanBo') })
        },
        {
            path: '/user/tccb/hoi-dong-danh-gia-don-vi/:nam/:shcc',
            component: Loadable({ loading: Loading, loader: () => import('./adminHoiDongDonViDanhGiaCanBo') })
        },
        {
            path: '/user/tccb/hoi-dong-danh-gia-giang-day/:nam/:shcc',
            component: Loadable({ loading: Loading, loader: () => import('./adminHoiDongDonViDanhGiaGiangDay') })
        },
        {
            path: '/user/tccb/hoi-dong-danh-gia-khong-giang-day/:nam/:shcc',
            component: Loadable({ loading: Loading, loader: () => import('./adminHoiDongDonViDanhGiaKhongGiangDay') })
        },
        {
            path: '/user/tccb/danh-gia-chuyen-vien/:nam/:shcc',
            component: Loadable({ loading: Loading, loader: () => import('./chuyenVienDetails') })
        },
        {
            path: '/user/tccb/danh-gia-giang-day/:nam/:shcc',
            component: Loadable({ loading: Loading, loader: () => import('./gvVaNcvGiangDayDetails') })
        },
        {
            path: '/user/tccb/danh-gia-khong-giang-day/:nam/:shcc',
            component: Loadable({ loading: Loading, loader: () => import('./ncvKhongGiangDayDetails') })
        },
        {
            path: '/user/info/danh-gia-ca-nhan',
            component: Loadable({ loading: Loading, loader: () => import('./userPage') })
        },
        {
            path: '/user/info/danh-gia-chuyen-vien/:nam',
            component: Loadable({ loading: Loading, loader: () => import('./userChuyenVienDetails') })
        },
        {
            path: '/user/info/danh-gia-giang-day/:nam',
            component: Loadable({ loading: Loading, loader: () => import('./userGiangDayDetails') })
        },
        {
            path: '/user/info/danh-gia-khong-giang-day/:nam',
            component: Loadable({ loading: Loading, loader: () => import('./userKhongGiangDayDetails') })
        },
    ],
};