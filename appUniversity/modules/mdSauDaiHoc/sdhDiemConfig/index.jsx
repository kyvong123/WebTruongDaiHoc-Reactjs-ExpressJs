//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhDiemConfig from './redux';
import sdhDiemConfigThanhPhan from '../sdhDiemConfigThanhPhan/redux';
import sdhDiemConfigQuyChe from '../sdhDiemConfigQuyChe/redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhDiemConfig, sdhDiemConfigThanhPhan, sdhDiemConfigQuyChe }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/grade-manage/setting',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/sau-dai-hoc/grade-manage/semester/:ma',
            component: Loadable({ loading: Loading, loader: () => import('./editPage') })
        },

    ],
};