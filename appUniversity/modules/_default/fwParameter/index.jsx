//TEMPLATES: admin|home|unit
// eslint-disable-next-line no-unused-vars
import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import fwParameter from './redux';

export default {
    redux: {
        parent: 'framework',
        reducers: { fwParameter },
    },
    routes: [
        {
            path: '/user/settings/parameter',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ]
};