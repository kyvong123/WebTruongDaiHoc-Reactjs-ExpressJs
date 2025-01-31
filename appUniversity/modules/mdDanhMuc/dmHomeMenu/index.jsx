//TEMPLATES: admin
import React from 'react';
import SubMenusCategory from 'view/component/SubMenusCategory';

export default {
    redux: {},
    routes: [
        {
            path: '/user/category',
            component: () => <SubMenusCategory menuLink='/user/category' menuKey={4000} headerIcon='fa-list-alt' />
        },
    ]
};