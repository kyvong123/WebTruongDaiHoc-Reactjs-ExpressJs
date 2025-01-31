//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import fwQuestionAnswer from './redux/qa/redux';
import fwBlackboxCanBo from './redux/blackbox/blackboxCanBoRedux';
import fwBlackboxUser from './redux/blackbox/blackboxUserRedux';
import fwBlackboxAdmin from './redux/blackbox/blackboxAdminRedux';
import fwChatboxDetail from './redux/chatbox/chatDetailRedux';
import fwQaUser from './redux/qa/qaUserRedux';
import fwQaCanBo from './redux/qa/qaCanBoRedux';
import fwPersonalChatbox from './redux/chatbox/personal_Chat_Box_Redux';

export default {
  redux: {
    parent: 'lienHe',
    reducers: { fwQuestionAnswer, fwBlackboxCanBo, fwBlackboxUser, fwChatboxDetail, fwQaUser, fwQaCanBo, fwBlackboxAdmin, fwPersonalChatbox }
  },
  routes: [
    /**
     * Chatbox cá nhân
     */
    {
      path: '/user/tt/chatbox',
      component: Loadable({ loading: Loading, loader: () => import('./client/chatbox/personalChatboxPage') })
    },
    /**
     * QA, Blackbox
     */
    {
      path: '/user/tt/lien-he/quan-ly',
      component: Loadable({ loading: Loading, loader: () => import('./client/qa/qaCanBoPage') })
    },
    {
      path: '/user/tt/lien-he/home',
      component: Loadable({ loading: Loading, loader: () => import('./client/qa/qaUserPage') })
    },
    {
      path: '/user/tt/lien-he/box-detail/:id',
      component: Loadable({ loading: Loading, loader: () => import('./client/common/chatDetailPage') })
    },
    {
      path: '/user/tt/lien-he/assign-chu-de',
      component: Loadable({ loading: Loading, loader: () => import('./client/qa/lienHeAssignChuDeAdminPage') })
    },
    {
      path: '/user/tt/lien-he/blackbox/home',
      component: Loadable({ loading: Loading, loader: () => import('./client/blackbox/blackboxUserPage') })
    },
    {
      path: '/user/tt/lien-he/blackbox/quan-ly',
      component: Loadable({ loading: Loading, loader: () => import('./client/blackbox/blackboxCanBoPage') })
    },
    {
      path: '/user/tt/lien-he/blackbox/admin',
      component: Loadable({ loading: Loading, loader: () => import('./client/blackbox/blackboxAdminPage') })
    },
  ],
};