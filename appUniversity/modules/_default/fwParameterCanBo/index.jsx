//TEMPLATES: admin|home|unit
// eslint-disable-next-line no-unused-vars
import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import fwParameterCanBo from './redux';

export default {
    redux: {
        parent: 'framework',
        reducers: { fwParameterCanBo },
    },
    routes: [
        {
            path: '/user/settings/parameter-can-bo',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ]
};