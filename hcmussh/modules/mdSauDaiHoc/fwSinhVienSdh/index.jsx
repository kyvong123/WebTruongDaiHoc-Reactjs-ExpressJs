//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import svSdh from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { svSdh }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/upload',
            component: Loadable({ loading: Loading, loader: () => import('./adminUploadPage') })
        },
        {
            path: '/user/sau-dai-hoc/sinh-vien',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/sau-dai-hoc/sinh-vien/item/:mssv',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        },
        {
            path: '/user/sinh-vien-sau-dai-hoc/info',
            component: Loadable({ loading: Loading, loader: () => import('./userPage') })
        }
    ],
};
