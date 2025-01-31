//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtDmHeSoChatLuong from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtDmHeSoChatLuong }
    },
    routes: [
        {
            path: '/user/dao-tao/he-so-chat-luong',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};