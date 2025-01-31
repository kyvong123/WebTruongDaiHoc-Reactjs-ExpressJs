//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmGiamBhxh from './reduxGiamBhxh';
import dmTangBhxh from './reduxTangBhxh';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmGiamBhxh, dmTangBhxh },
    },
    routes: [
        {
            path: '/user/category/giam-bao-hiem-xa-hoi',
            component: Loadable({ loading: Loading, loader: () => import('./adminGiamBhxh') })
        },
        {
            path: '/user/category/tang-bao-hiem-xa-hoi',
            component: Loadable({ loading: Loading, loader: () => import('./adminTangBhxh') })
        },
    ],
};