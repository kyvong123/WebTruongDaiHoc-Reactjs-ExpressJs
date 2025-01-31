//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmLoaiDonVi from './redux';
import SectionAllDivision from '../dmLoaiDonVi/sectionAllDivisions';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmLoaiDonVi }
    },
    routes: [
        {
            path: '/user/category/loai-don-vi',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
    Section: { SectionAllDivision }
};