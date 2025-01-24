//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';

export default {
    routes: [
        {
            path: '/user/dao-tao/data-dictionary',
            component: Loadable({ loading: Loading, loader: () => import('./DataDictionaryPage') })
        },
        {
            path: '/user/dao-tao/edu-program',
            component: Loadable({ loading: Loading, loader: () => import('./EduProgramPage') })
        },
        {
            path: '/user/dao-tao/edu-schedule',
            component: Loadable({ loading: Loading, loader: () => import('./SchedulePage') })
        },
        {
            path: '/user/dao-tao/tuyen-sinh',
            component: Loadable({ loading: Loading, loader: () => import('./TuyenSinh') })
        },
        {
            path: '/user/dao-tao/grade-manage',
            component: Loadable({ loading: Loading, loader: () => import('./DiemConfigPage') })
        },
        {
            path: '/user/dao-tao/luong-giang-day',
            component: Loadable({ loading: Loading, loader: () => import('./LuongGiangDay') })
        },
        {
            path: '/user/dao-tao/certificate-management',
            component: Loadable({ loading: Loading, loader: () => import('./ChungChiModule') })
        },
        {
            path: '/user/dao-tao/graduation',
            component: Loadable({ loading: Loading, loader: () => import('./GraduateModule') })
        }
    ],
};