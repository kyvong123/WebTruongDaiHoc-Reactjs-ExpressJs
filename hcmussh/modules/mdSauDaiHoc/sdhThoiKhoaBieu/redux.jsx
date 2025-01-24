import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const SdhThoiKhoaBieuGetAll = 'SdhThoiKhoaBieu:GetAll';
const SdhThoiKhoaBieuGetPage = 'SdhThoiKhoaBieu:GetPage';


export default function SdhThoiKhoaBieuReducer(state = null, data) {
    switch (data.type) {

        case SdhThoiKhoaBieuGetAll:
            return Object.assign({}, state, { items: data.items });
        case SdhThoiKhoaBieuGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getSdhThoiKhoaBieuAll(condition, done) {

    return dispatch => {
        const url = '/api/sdh/thoi-khoa-bieu/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách thời khoá biểu bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.items);
                dispatch({ type: SdhThoiKhoaBieuGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

export function getSdhTkbAdmin(id, done) {
    return () => {
        const url = `/api/sdh/thoi-khoa-bieu/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thời khoá biểu bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.data);
            }
        }, () => T.notify('Lấy thời khoá biểu sau đại học bị lỗi!', 'danger'));
    };
}

T.initPage('pageSdhThoiKhoaBieu');
export function getSdhThoiKhoaBieuPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageSdhThoiKhoaBieu', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/sdh/thoi-khoa-bieu/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { searchTearm: pageCondition?.searchTearm, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách thời khoá biểu bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: SdhThoiKhoaBieuGetPage, page: data.page });
                if (done) done(data.page);
            }
        });
    };
}

export function createSdhThoiKhoaBieu(item, settings, done) {
    return dispatch => {
        const cookie = T.updatePage('pageSdhThoiKhoaBieu');
        const { pageNumber, pageSize, pageCondition, filter } = cookie;
        const url = '/api/sdh/thoi-khoa-bieu/multiple';
        T.post(url, { item, settings }, data => {
            if (data.error) {
                T.notify('Tạo thời khoá biểu bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error.message}`);
            } else {
                T.notify('Tạo thời khoá biểu thành công!', 'success');
                dispatch(getSdhThoiKhoaBieuPage(pageNumber, pageSize, pageCondition, filter));
                if (done) done();
            }
        });
    };
}



export function createSdhThoiKhoaBieuMultiple(data, infoKDT, done) {
    return dispatch => {
        const cookie = T.updatePage('pageSdhThoiKhoaBieu');
        const { pageNumber, pageSize, pageCondition, filter } = cookie;
        const url = '/api/sdh/thoi-khoa-bieu/create-multiple';
        T.post(url, { data, infoKDT }, result => {
            if (result.error) {
                T.notify('Tạo lớp bị lỗi!', 'danger');
                console.error(`POST ${url}. ${result.error.message}`);
                done && done();
            }
            else {
                T.notify('Tạo học phần thành công!', 'success');
                dispatch(getSdhThoiKhoaBieuPage(pageNumber, pageSize, pageCondition, filter));
                if (done) done(result);
            }
        });
    };
}


export function updateSdhThoiKhoaBieuMulti(idList, changes, done) {
    return dispatch => {
        const cookie = T.updatePage('pageSdhThoiKhoaBieu');
        const { pageNumber, pageSize, pageCondition, filter } = cookie;
        const url = '/api/sdh/thoi-khoa-bieu/update/multi';
        T.put(url, { idList, changes }, data => {
            if (data.error) {
                T.alert(`Lỗi: ${data.error.message}`, 'error', false, 2000);
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data);
            } else {
                T.notify('Cập nhật thời khóa biểu thành công!', 'success');
                dispatch(getSdhThoiKhoaBieuPage(pageNumber, pageSize, pageCondition, filter));
                done && done(data);
            }
        }, () => T.notify('Cập nhật thông tin thời khoá biểu bị lỗi!', 'danger'));
    };
}


export function updateSdhThoiKhoaBieuCondition(ma, changes, done) {
    return dispatch => {
        const cookie = T.updatePage('pageSdhThoiKhoaBieu');
        const { pageNumber, pageSize, pageCondition, filter } = cookie;
        const url = '/api/sdh/thoi-khoa-bieu/condition/tinh-trang';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.alert(`Lỗi: ${data.error.message}`, 'error', false, 2000);
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data);
            } else {
                T.notify('Cập nhật thời khóa biểu thành công!', 'success');
                dispatch(getSdhThoiKhoaBieuPage(pageNumber, pageSize, pageCondition, filter));
                done && done(data);
            }

        }, () => T.notify('Cập nhật thông tin thời khoá biểu bị lỗi!', 'danger'));
    };
}
export function updateSdhThoiKhoaBieuItem(id, changes, done) {
    return dispatch => {
        const cookie = T.updatePage('pageSdhThoiKhoaBieu');
        const { pageNumber, pageSize, pageCondition, filter } = cookie;
        const url = '/api/sdh/thoi-khoa-bieu/item';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.alert(`Lỗi: ${data.error.message}`, 'error', false, 2000);
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data);
            } else {
                T.notify('Cập nhật thời khóa biểu thành công!', 'success');
                dispatch(getSdhThoiKhoaBieuPage(pageNumber, pageSize, pageCondition, filter));
                done && done(data);
            }

        }, () => T.notify('Cập nhật thông tin thời khoá biểu bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_TkbSdh = {
    ajax: true,
    url: '/api/sdh/thoi-khoa-bieu/get/1/20',
    data: params => ({ condition: params.term, kichHoat: 1 }),
    processResults: response => ({ results: response && response.page && response.page.rows && response.page.rows ? response.page.rows.map(item => ({ id: item.maHocPhan, text: `${'Mã học phần: ' + item.maMonHoc + '- Tên học phần ' + item.tenMonHoc}` })) : [] }),
    fetchOne: (id, done) => (getSdhTkbAdmin(id, item => done && done({ id: item.maHocPhan, text: `${'Mã học phần: ' + item.maMonHoc + '- Tên học phần ' + item.tenMonHoc}` })))()
};
