//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import hocPhan from 'modules/mdDangKyMonHoc/dkHocPhan/redux';

export default {
    redux: {
        parent: 'student',
        reducers: { hocPhan }
    },
    routes: [
        {
            path: '/user/dang-ky-hoc-phan',
            component: Loadable({ loading: Loading, loader: () => import('./userPage') })
        }
    ],
};