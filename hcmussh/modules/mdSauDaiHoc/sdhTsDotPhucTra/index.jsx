//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhTsDotPhucTra from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhTsDotPhucTra }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/tuyen-sinh/dot-phuc-tra',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],

};