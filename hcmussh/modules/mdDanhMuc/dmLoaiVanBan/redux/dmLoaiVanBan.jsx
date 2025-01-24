import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmLoaiVanBanGetAll = 'DmLoaiVanBan:GetAll';
const DmLoaiVanBanGetPage = 'DmLoaiVanBan:GetPage';

export default function dmLoaiVanBanReducer(state = null, data) {
    switch (data.type) {
        case DmLoaiVanBanGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmLoaiVanBanGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export const PageName = 'pageDmLoaiVanBan';
T.initPage(PageName);
export function getDmLoaiVanBanPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/danh-muc/loai-van-ban/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại văn bản bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: DmLoaiVanBanGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách loại văn bản bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmLoaiVanBanAll(done) {
    return dispatch => {
        const url = '/api/danh-muc/loai-van-ban/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại văn bản bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
                dispatch({ type: DmLoaiVanBanGetAll, items: data.items ? data.items : [] });
            }
        }, (error) => T.notify('Lấy danh sách loại văn bản bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function getDmLoaiVanBan(id, done) {
    return () => {
        const url = `/api/danh-muc/loai-van-ban/item/${id}`;
        T.get(url, { id }, data => {
            if (data.error) {
                T.notify('Lấy thông tin loại văn bản bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function createDmLoaiVanBan(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/loai-van-ban';
        T.post(url, { item }, data => {
            if (data.error) {
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo loại văn bản thành công!', 'success');
                dispatch(getDmLoaiVanBanPage());
                done && done(data);
            }
        }, (error) => T.notify('Tạo loại văn bản bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDmLoaiVanBan(id) {
    return dispatch => {
        const url = '/api/danh-muc/loai-van-ban';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa danh mục loại văn bản bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục loại văn bản đã xóa thành công!', 'success', false, 800);
                dispatch(getDmLoaiVanBanPage());
            }
        }, (error) => T.notify('Xóa loại văn bản bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDmLoaiVanBan(id, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/loai-van-ban';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông loại văn bản bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin loại văn bản thành công!', 'success');
                done && done();
                dispatch(getDmLoaiVanBanPage());
            }
        }, (error) => T.notify('Cập nhật thông tin loại văn bản bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export const SelectAdapter_DmLoaiVanBan = {
    ajax: true,
    url: '/api/danh-muc/loai-van-ban/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ ...item, id: item.id, text: item.ten })) : [] }),
    getOne: getDmLoaiVanBan,
    fetchOne: (id, done) => (getDmLoaiVanBan(id, (item) => done && done({ id: item.id, text: item.ten })))(),
    processResultOne: response => response && ({ value: response.id, text: response.ten }),
};

export const SelectAdapter_DmMaLoaiVanBan = {
    ajax: true,
    url: '/api/danh-muc/loai-van-ban/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ ...item, id: item.ma, text: item.ten })) : [] }),
    fetchOne: (id, done) => (getDmLoaiVanBan(id, (item) => done && done({ id: item.ma, text: item.ten })))(),
};
