//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';

export default {
    routes: [
        { path: '/user/news/author', component: Loadable({ loading: Loading, loader: () => import('./adminPage') }) }
        // { path: '/news/list/:category', component: Loadable({ loading: Loading, loader: () => import('./homeNewsList') }) }
    ]
};