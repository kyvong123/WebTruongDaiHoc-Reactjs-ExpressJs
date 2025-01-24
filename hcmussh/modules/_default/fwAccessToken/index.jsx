//TEMPLATES: admin
// eslint-disable-next-line no-unused-vars
import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import accessToken from './redux';

export default {
    redux: {
        parent: 'framework',
        reducers: { accessToken },
    },
    routes: [
        {
            path: '/user/access-token',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
    ],
};