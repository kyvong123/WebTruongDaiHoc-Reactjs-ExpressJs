//TEMPLATES: home|admin|unit|utils
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import SectionCategory from './sectionCategory';
import system from './reduxSystem';
import category from './reduxCategory';
import mobileSystem from './reduxMobileSettings';

export default {
    redux: {
        system, category, mobileSystem
    },
    routes: [
        {
            path: '/user/truyen-thong/settings',
            component: Loadable({ loading: Loading, loader: () => import('./adminSettingsPage') })
        },
        {
            path: '/user/dashboard',
            component: Loadable({ loading: Loading, loader: () => import('./adminDashboardPage') })
        },
        {
            path: '/user/settings/mobile',
            component: Loadable({ loading: Loading, loader: () => import('./adminMobileMenuPage') })
        },
        {
            path: '/user/settings/mobile/features',
            component: Loadable({ loading: Loading, loader: () => import('./adminMobileFeaturesPage') })
        }
    ],
    Section: {
        SectionCategory,
    }
};