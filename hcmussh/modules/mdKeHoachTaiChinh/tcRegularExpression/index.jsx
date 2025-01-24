//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tcRegularExpression from './redux/regularExpressionSet';

export default {
    redux: {
        parent: 'finance',
        reducers: { tcRegularExpression }
    },
    routes: [
        {
            path: '/user/finance/regular-expression',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/finance/regular-expression/:id',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        }
    ],
};