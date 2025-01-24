import T from 'view/js/common';
import { getUser } from 'modules/_default/fwUser/reduxUser.jsx';

const TmdtAdminDaiLyGetPage = 'TmdtAdminDaiLy:GetPage';

export default function TmdtAdminDaiLyReducer(state = null, data) {
    switch (data.type) {
        case TmdtAdminDaiLyGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

T.initPage('pageTmdtAdminDaiLy');

export function getTmdtAdminDaiLyPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageTmdtAdminDaiLy', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tmdt/y-shop/admin/dai-ly/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy sản phẩm bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: TmdtAdminDaiLyGetPage, page: data.page });
            }
        }, () => T.notify('Lấy sản phẩm bị lỗi!', 'danger'));
    };
}

export function getTmdtAdminDaiLyItem(id, done) {
    return () => {
        const url = `/api/tmdt/y-shop/admin/dai-ly/${id}`;
        T.get(url, {}, data => {
            if (data.error) {
                T.notify('Lấy sản phẩm bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, () => T.notify('Lấy sản phẩm bị lỗi!', 'danger'));
    };
}


export function createTmdtAdminDaiLy(item, done) {
    return dispatch => {
        const url = '/api/tmdt/y-shop/admin/dai-ly';
        T.post(url, { data: item }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo đại lý bị lỗi', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới đại lý thành công!', 'success');
                dispatch(getTmdtAdminDaiLyPage());
                done && done(data);
            }
        }, () => T.notify('Tạo đại lý bị lỗi!', 'danger'));
    };
}

export function updateTmdtAdminDaiLy(id, changes, done) {
    return dispatch => {
        const url = '/api/tmdt/y-shop/admin/dai-ly';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify(data.error.message || 'Cập nhật thông tin đại lý bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin đại lý thành công!', 'success');
                dispatch(getTmdtAdminDaiLyPage());
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin đại lý bị lỗi!', 'danger'));
    };
}

export function deleteTmdtAdminDaiLy(id) {
    return dispatch => {
        const url = '/api/tmdt/y-shop/admin/dai-ly';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa đại lý bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa đại lý thành công!', 'success', false, 800);
                dispatch(getTmdtAdminDaiLyPage());
            }
        }, () => T.notify('Xóa đại lý bị lỗi!', 'danger'));
    };
}


// Search User Adapter ------------------------------------------------------------------------------------------------------------
export const SelectAdapter_TmdtDaiLy_SearchUser = {
    ajax: true,
    url: '/api/tmdt/y-shop/admin/get-university-member-list/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({
        results: response && response.page && response.page.list ? response.page.list.map(item => ({
            id: item.email, text: `${item.email}: ${item.lastName} ${item.firstName}`
        })) : []
    }),
    fetchOne: (email, done) => {
        (getUser(email, (item) => {
            done && done({ id: item.email, text: `${(item.lastName + ' ' + item.firstName).normalizedName()} (${item.email})` });
        }))();
    },
};


// Select Dai Ly
export const SelectAdapter_TmdtDaiLy = {
    ajax: true,
    url: '/api/tmdt/y-shop/admin/dai-ly/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({
        results: response && response.page && response.page.list ? response.page.list.map(item => ({
            id: item.id, text: item.ten
        })) : []
    }),
    fetchOne: (id, done) => {
        (getTmdtAdminDaiLyItem(id, (item) => {
            const { id, ten } = item;
            done && done({ id, text: ten });
        }))();
    },
};