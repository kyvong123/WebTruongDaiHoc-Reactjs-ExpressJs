//TEMPLATES: admin
import React from 'react';
import SubMenusPage from 'view/component/SubMenusPage';

export default {
    redux: {},
    routes: [
        {
            path: '/user/tccb',
            component: () => <SubMenusPage menuLink='/user/tccb' menuKey={3000} headerIcon='fa-pie-chart' />
        },
        {
            path: '/user/truyen-thong',
            component: () => <SubMenusPage menuLink='/user/truyen-thong' menuKey={6000} headerIcon='fa-list-alt' />
        },
        {
            path: '/user/settings',
            component: () => <SubMenusPage menuLink='/user/settings' menuKey={2000} headerIcon='fa-list-alt' />
        },
        {
            path: '/user/websites',
            component: () => <SubMenusPage menuLink='/user/websites' menuKey={1900} headerIcon='fa-list-alt' />
        },
        {
            path: '/user/library',
            component: () => <SubMenusPage menuLink='/user/library' menuKey={8000} headerIcon='fa-th-large' />
        },
        {
            path: '/user/khcn',
            component: () => <SubMenusPage menuLink='/user/khcn' menuKey={9500} headerIcon='fa-rocket' />
        },
        {
            path: '/user/hcth',
            component: () => <SubMenusPage menuLink='/user/hcth' menuKey={500} headerIcon='fa-book' />
        },
        {
            path: '/user/van-phong-dien-tu',
            component: () => <SubMenusPage menuLink='/user/van-phong-dien-tu' menuKey={400} headerIcon='fa-desktop' />
        },
        {
            path: '/user/sau-dai-hoc',
            component: () => <SubMenusPage menuLink='/user/sau-dai-hoc' menuKey={7500} headerIcon='fa-graduation-cap' />
        },
        {
            path: '/user/finance',
            component: () => <SubMenusPage menuLink='/user/finance' menuKey={5000} headerIcon='fa-credit-card' />
        },
        {
            path: '/user/affair',
            component: () => <SubMenusPage menuLink='/user/affair' menuKey={7600} headerIcon='fa-bookmark' />
        },
        {
            path: '/user/bao-hiem-y-te',
            component: () => <SubMenusPage menuLink='/user/bao-hiem-y-te' menuKey={7900} headerIcon='fa-medkit' />
        },
        {
            path: '/user/tt/lien-he',
            component: () => <SubMenusPage menuLink='/user/tt/lien-he' menuKey={4500} headerIcon='fa-dashboard' />
        },
        {
            path: '/user/tmdt/y-shop',
            component: () => <SubMenusPage menuLink='/user/tmdt/y-shop' menuKey={10000} headerIcon='fa-shopping-bag' />
        },
    ]
};