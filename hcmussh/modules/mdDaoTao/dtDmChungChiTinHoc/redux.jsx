import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtDmChungChiTinHocGetAll = 'DtDmChungChiTinHoc:GetAll';
const DtDmChungChiTinHocUpdate = 'DtDmChungChiTinHoc:Update';

export default function dtDmChungChiTinHocReducer(state = null, data) {
    switch (data.type) {
        case DtDmChungChiTinHocGetAll:
            return Object.assign({}, state, { items: data.items });
        case DtDmChungChiTinHocUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].ma == updatedItem.ma) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].ma == updatedItem.ma) {
                            updatedPage.list.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                return Object.assign({}, state, { items: updatedItems, page: updatedPage });
            } else {
                return null;
            }
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getDtDmChungChiTinHocAll(done) {
    return dispatch => {
        const url = '/api/dt/chung-chi-tin-hoc/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách chứng chỉ tin học bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.items);
                dispatch({ type: DtDmChungChiTinHocGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

T.initPage('pageDtDmChungChiTinHoc');
export function createDtDmChungChiTinHoc(item, done) {
    return dispatch => {
        const url = '/api/dt/chung-chi-tin-hoc';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo thông tin chứng chỉ tin học bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                T.notify('Tạo thông tin chứng chỉ tin học thành công!', 'success');
                dispatch(getDtDmChungChiTinHocAll());
                done && done(data.items);
            }
        });
    };
}

export function deleteDtDmChungChiTinHoc(ma) {
    return dispatch => {
        const url = '/api/dt/chung-chi-tin-hoc';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa chứng chỉ tin học bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Chứng chỉ tin học đã xóa thành công!', 'success', false, 800);
                dispatch(getDtDmChungChiTinHocAll());
            }
        }, () => T.notify('Xóa chứng chỉ tin học bị lỗi!', 'danger'));
    };
}

export function updateDtDmChungChiTinHoc(ma, changes, done) {
    return dispatch => {
        const url = '/api/dt/chung-chi-tin-hoc';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật chứng chỉ tin học bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin chứng chỉ tin học thành công!', 'success');
                dispatch(getDtDmChungChiTinHocAll());
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin chứng chỉ tin học bị lỗi!', 'danger'));
    };
}

export function changeDtDmChungChiTinHoc(item) {
    return { type: DtDmChungChiTinHocUpdate, item };
}

export function getDtDmChungChiTinHoc(ma, done) {
    return () => {
        const url = `/api/dt/chung-chi-tin-hoc/item/${ma}`;
        T.get(url, { ma }, data => {
            if (data.error) {
                T.notify('Lấy thông tin chứng chỉ ngoại ngữ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export const SelectAdapter_DtDmChungChiTinHoc = (loaiChungChi) => ({
    ajax: true,
    url: '/api/dt/chung-chi-tin-hoc',
    data: params => ({ condition: params.term, loaiChungChi, kichHoat: 1 }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: `${item.ma}: ${item.ten}` })) : [] }),
    fetchOne: (id, done) => (getDtDmChungChiTinHoc(id, item => item && done && done({ id: item.ma, text: item.ten })))(),
});