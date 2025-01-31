import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmLoaiHoSoGetPage = 'DmLoaiHoSo:GetPage';
export default function dmLoaiHoSoReducer(state = null, data) {
    switch (data.type) {
        case DmLoaiHoSoGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
const pageName = 'pageDmLoaiHoSo';
T.initPage(pageName);

export function getDmLoaiHoSoPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage(pageName, pageNumber, pageSize, pageCondition, done);
    return dispatch => {
        const url = `/api/danh-muc/loai-ho-so/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại hồ sơ bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                dispatch({ type: DmLoaiHoSoGetPage, page: data.page });
                done && done(data.page);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function updateDmLoaiHoSo(id, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/loai-ho-so';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông tin loại hồ sơ bị lỗi', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin loại hồ sơ thành công!', 'success');
                dispatch(getDmLoaiHoSoPage());
                done && done();
            }
        }, error => console.error(`PUT: ${url}.`, error));
    };
}

export function createDmLoaiHoSo(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/loai-ho-so';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo mới loại hồ sơ thất bại', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới loại hồ sơ thành công', 'success');
                dispatch(getDmLoaiHoSoPage());
                done && done();
            }
        }, error => console.error(`POST: ${url}.`, error));
    };
}

export function getDmLoaiHoSo(id, done) {
    return () => {
        const url = `/api/danh-muc/loai-ho-so/${id}`;
        T.get(url, { id }, data => {
            if (data.error) {
                T.notify('Lấy thông tin loại hồ sơ bị lỗi' + (data.error.message || ''), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function deleteDmLoaiHoSo(id, done) {
    return dispatch => {
        const url = '/api/danh-muc/loai-ho-so';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xoá loại hồ sơ bị lỗi', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.notify('Xoá loại hồ sơ thành công!', 'success');
                dispatch(getDmLoaiHoSoPage());
                done && done();
            }
        }, error => console.error(`DELETE: ${url}.`, error));
    };
}

export const SelectAdapter_LoaiHoSo = {
    ajax: true,
    url: '/api/danh-muc/loai-ho-so/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => {
        return (
            { results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.id, text: item.ten })) : [] }
        );
    },
    fetchOne: (id, done) => (getDmLoaiHoSo(id, item => item && done && done({ id: item.id, text: item.ten })))()
};