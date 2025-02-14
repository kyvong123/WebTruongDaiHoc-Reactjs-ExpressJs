//TEMPLATES: home|admin|unit

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import SectionContact from './sectionContact';
import contact from './redux';

export default {
    redux: {
        contact
    },
    routes: [
        {
            path: '/user/contact',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        }
    ],
    Section: {
        SectionContact
    }
};