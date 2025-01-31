//TEMPLATES: admin|home|unit
// eslint-disable-next-line no-unused-vars
import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import doanhNghiep from './reduxDoanhNghiep';
import SectionHexagonCompany from './SectionHexagonCompany';

export default {
    redux: {
        parent: 'doiNgoai',
        reducers: { doanhNghiep },
    },
    routes: [
        { path: '/user/truyen-thong/doanh-nghiep', component: Loadable({ loading: Loading, loader: () => import('./adminDoanhNghiep') }) },
        { path: '/user/truyen-thong/doanh-nghiep/edit/:doanhNghiepId', component: Loadable({ loading: Loading, loader: () => import('./adminDoanhNghiepEditPage') }) },
        { path: '/doanh-nghiep/:hiddenShortName', component: Loadable({ loading: Loading, loader: () => import('./PageCompany') }) },
    ], Section: {
        SectionHexagonCompany
    }
};