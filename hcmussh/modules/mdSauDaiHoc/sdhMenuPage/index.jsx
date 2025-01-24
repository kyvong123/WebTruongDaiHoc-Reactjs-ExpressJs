//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';

export default {
    routes: [
        {
            path: '/user/sau-dai-hoc/edu-program',
            component: Loadable({ loading: Loading, loader: () => import('./EduProgramPage') })
        },
        {
            path: '/user/sau-dai-hoc/faculty-program',
            component: Loadable({ loading: Loading, loader: () => import('./FacultyProgramPage') })
        },
        {
            path: '/user/sau-dai-hoc/subject-program',
            component: Loadable({ loading: Loading, loader: () => import('./SubjectProgramPage') })
        },
        {
            path: '/user/sau-dai-hoc/topic-program',
            component: Loadable({ loading: Loading, loader: () => import('./TopicProgramPage') })
        },
        {
            path: '/user/sau-dai-hoc/tuyen-sinh',
            component: Loadable({ loading: Loading, loader: () => import('./EnrollmentPage') })
        },
        {
            path: '/user/sau-dai-hoc/quan-ly-diem',
            component: Loadable({ loading: Loading, loader: () => import('./SdhDiemPage') })
        },
        {
            path: '/user/sau-dai-hoc/data-dictionary',
            component: Loadable({ loading: Loading, loader: () => import('./SdhTuDienDuLieuPage') })
        }

    ],
};