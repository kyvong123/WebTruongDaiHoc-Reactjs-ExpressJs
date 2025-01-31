import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtDmChungChiNgoaiNguGetAll = 'DtDmChungChiNgoaiNgu:GetAll';
const DtDmChungChiNgoaiNguUpdate = 'DtDmChungChiNgoaiNgu:Update';

export default function dtDmChungChiNgoaiNguReducer(state = null, data) {
    switch (data.type) {
        case DtDmChungChiNgoaiNguGetAll:
            return Object.assign({}, state, { items: data.items });
        case DtDmChungChiNgoaiNguUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].id == updatedItem.id) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].id == updatedItem.id) {
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
export function getDtDmChungChiNgoaiNguAll(done) {
    return dispatch => {
        const url = '/api/dt/chung-chi-ngoai-ngu/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách chứng chỉ ngoại ngữ bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.items);
                dispatch({ type: DtDmChungChiNgoaiNguGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

T.initPage('pageDtDmChungChiNgoaiNgu');
export function createDtDmChungChiNgoaiNgu(item, done) {
    return dispatch => {
        const url = '/api/dt/chung-chi-ngoai-ngu';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo chứng chỉ ngoại ngữ bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                T.notify('Tạo thông tin chứng chỉ ngoại ngữ thành công!', 'success');
                dispatch(getDtDmChungChiNgoaiNguAll());
                done && done(data.items);
            }
        });
    };
}

export function deleteDtDmChungChiNgoaiNgu(id) {
    return dispatch => {
        const url = '/api/dt/chung-chi-ngoai-ngu/';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa chứng chỉ ngoại ngữ bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Chứng chỉ ngoại ngữ đã xóa thành công!', 'success', false, 800);
                dispatch(getDtDmChungChiNgoaiNguAll());
            }
        }, () => T.notify('Xóa chứng chỉ ngoại ngữ bị lỗi!', 'danger'));
    };
}

export function updateDtDmChungChiNgoaiNgu(id, changes, done) {
    return dispatch => {
        const url = '/api/dt/chung-chi-ngoai-ngu';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật chứng chỉ ngoại ngữ bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin chứng chỉ ngoại ngữ thành công!', 'success');
                dispatch(getDtDmChungChiNgoaiNguAll());
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin chứng chỉ ngoại ngữ bị lỗi!', 'danger'));
    };
}

export function changeDtDmChungChiNgoaiNgu(item) {
    return { type: DtDmChungChiNgoaiNguUpdate, item };
}
export function getDtDmChungChiNgoaiNgu(id, done) {
    return () => {
        const url = `/api/dt/chung-chi-ngoai-ngu/item/${id}`;
        T.get(url, { id }, data => {
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

export const SelectAdapter_DtDmChungChiNgoaiNgu = {
    ajax: true,
    url: '/api/dt/chung-chi-ngoai-ngu/all',
    data: params => ({ condition: params.term, kichHoat: 1 }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.id, text: item.ten })) : [] }),
    fetchOne: (id, done) => (getDtDmChungChiNgoaiNgu(id, item => item && done && done({ id: item.id, text: item.ten })))(),
};

export function getDtTrinhDoTuongDuongAll(id, done) {
    return dispatch => {
        const url = '/api/dt/trinh-do-tuong-duong/all';
        T.get(url, { id }, data => {
            if (data.error) {
                T.notify('Lấy danh sách trình độ tương đương bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.items);
                dispatch({ type: DtDmChungChiNgoaiNguGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

export function createDtTrinhDoTuongDuong(idChungChi, item, done) {
    return dispatch => {
        const url = '/api/dt/trinh-do-tuong-duong';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify('Tạo thông tin trình độ chứng chỉ ngoại ngữ bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                T.notify('Tạo thông tin trình độ chứng chỉ ngoại ngữ thành công!', 'success');
                dispatch(getDtTrinhDoTuongDuongAll(idChungChi));
                done && done(data.items);
            }
        });
    };
}

export function deleteDtTrinhDoTuongDuong(id, idChungChi) {
    return dispatch => {
        const url = '/api/dt/trinh-do-tuong-duong';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thông tin trình độ chứng chỉ ngoại ngữ bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Thông tin trình độ chứng chỉ ngoại ngữ đã xóa thành công!', 'success', false, 800);
                dispatch(getDtTrinhDoTuongDuongAll(idChungChi));
            }
        }, () => T.notify('Xóa thông tin trình độ chứng chỉ ngoại ngữ bị lỗi!', 'danger'));
    };
}

export function updateDtTrinhDoTuongDuong(id, idChungChi, changes, done) {
    return dispatch => {
        const url = '/api/dt/trinh-do-tuong-duong';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin trình độ chứng chỉ ngoại ngữ bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin trình độ chứng chỉ ngoại ngữ thành công!', 'success');
                dispatch(getDtTrinhDoTuongDuongAll(idChungChi));
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin trình độ chứng chỉ ngoại ngữ bị lỗi!', 'danger'));
    };
}