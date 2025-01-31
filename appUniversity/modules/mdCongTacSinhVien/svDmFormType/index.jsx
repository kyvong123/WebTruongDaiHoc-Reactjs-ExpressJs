//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import svDmFormType from './redux';

export default {
    redux: {
        parent: 'ctsv',
        reducers: { svDmFormType }
    },
    routes: [
        {
            path: '/user/ctsv/category-forms',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage.jsx') })
        },
        {
            path: '/user/ctsv/category-forms/cau-hinh',
            component: Loadable({ loading: Loading, loader: () => import('./configPage.jsx') })
        },
    ],
};
