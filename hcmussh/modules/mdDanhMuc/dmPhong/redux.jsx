import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmPhongGetAll = 'DmPhong:GetAll';
const DmPhongGetPage = 'DmPhong:GetPage';
const DmPhongUpdate = 'DmPhong:Update';

export default function dmPhongReducer(state = null, data) {
    switch (data.type) {
        case DmPhongGetAll:
            return Object.assign({}, state, { items: data.items });
        case DmPhongGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmPhongUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].ten == updatedItem.ten) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].ten == updatedItem.ten) {
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
export function getDmPhongAll(condition, done) {
    if (typeof condition === 'function') {
        done = condition;
        condition = {};
    }

    return dispatch => {
        const url = '/api/danh-muc/phong/all-data';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách phòng học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
                dispatch({ type: DmPhongGetAll, items: data.items ? data.items : [] });
            }
        }, () => T.notify('Lấy danh sách phòng học bị lỗi!', 'danger'));
    };
}

export function getDmPhongData(maCoSo, done) {
    return () => {
        const url = '/api/danh-muc/phong/data';
        T.get(url, { maCoSo }, data => {
            if (data.error) {
                T.notify('Lấy danh sách phòng học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
            }
        });
    };
}

T.initPage('dmPhong');
export function getDmPhongPage(pageNumber, pageSize, done) {
    const page = T.updatePage('dmPhong', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/danh-muc/phong/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách phòng học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DmPhongGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách phòng học bị lỗi!', 'danger'));
    };
}

export function getDmPhong(ten, done) {
    return () => {
        const url = `/api/danh-muc/phong/item/${ten}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin phòng học bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function createDmPhong(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/phong';
        T.post(url, { item }, data => {
            if (data.error) {
                T.alert(data.error.message || 'Tạo phòng học bị lỗi!', 'error', false, 2000);
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo phòng thành công', 'success');
                dispatch(getDmPhongAll());
                done && done(data);
            }
        }, () => T.notify('Tạo phòng học bị lỗi!', 'danger'));
    };
}

export function deleteDmPhong(ten) {
    return dispatch => {
        const url = '/api/danh-muc/phong';
        T.delete(url, { ten }, data => {
            if (data.error) {
                T.notify('Xóa phòng học bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xoá thành công!', 'success', false, 800);
                dispatch(getDmPhongAll());
            }
        }, () => T.notify('Xóa phòng học bị lỗi!', 'danger'));
    };
}

export function updateDmPhong(ten, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/phong';
        T.put(url, { ten, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông phòng học bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin phòng học thành công!', 'success');
                dispatch(getDmPhongAll());
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin phòng học bị lỗi!', 'danger'));
    };
}

export function updateMultipleDmPhong(listPhong, changes, done) {
    return dispatch => {
        const url = '/api/danh-muc/phong/multiple';
        T.put(url, { listPhong, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông phòng học bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật thông tin phòng học thành công!', 'success');
                dispatch(getDmPhongAll());
                done && done();
            }
        });
    };
}

export function createDmPhongByUpload(item, done) {
    return dispatch => {
        const url = '/api/danh-muc/phong/createFromFile';
        T.post(url, { item }, data => {
            if (data.error) {
                console.error(`POST: ${url}.`, data.error);
            } else {
                dispatch(getDmPhongAll());
                done && done(data);
                T.notify('Import dữ liệu thành công!', 'success');
            }
        }, () => T.notify('Tạo phòng học bị lỗi!', 'danger'));
    };
}

export function changeDmPhong(item) {
    return { type: DmPhongUpdate, item };
}

export const SelectAdapter_DmPhong = {
    ajax: true,
    url: '/api/danh-muc/phong/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ten, text: `${item.ten}: ${item.sucChua}`, sucChua: item.sucChua })) : [] }),
    fetchOne: (ten, done) => (getDmPhong(ten, item => done && done({ id: item.ten, text: `${item.ten}` })))(),
};

export const SelectAdapter_DmPhongThi = (filter) => ({
    ajax: true,
    url: '/api/danh-muc/phong-thi/filter',
    data: params => ({ condition: params.term, filter }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ten, text: `${item.ten}: ${item.sucChuaThi || item.sucChua / 2 || 0}`, sucChuaThi: item.sucChuaThi })) : [] }),
    fetchOne: (ten, done) => (getDmPhong(ten, item => done && done({ id: item.ten, text: `${item.ten}: ${item.sucChuaThi || 0}`, sucChuaThi: item.sucChuaThi })))(),
});

export const SelectAdapter_DmPhongAll = (maCoSo) => ({
    ajax: true,
    url: '/api/danh-muc/phong/all',
    data: params => ({ condition: params.term, maCoSo }),
    processResults: response => {
        if (!maCoSo) {
            T.notify('Vui lòng chọn cơ sở!', 'danger');
            return { results: [] };
        }
        return { results: response && response.items ? response.items.map(item => ({ id: item.ten, text: `${item.ten} ${item.sucChua ? ': ' + item.sucChua : ''}`, sucChua: item.sucChua })) : [] };
    },
    fetchOne: (ten, done) => (getDmPhong(ten, item => done && done({ id: item.ten, text: `${item.ten}` })))(),
});
export const SelectAdapter_DmPhongByCoSo = (maCoSo) => ({
    ajax: true,
    url: '/api/danh-muc/phong/all',
    data: params => ({ condition: params.term, maCoSo }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ten, text: `${item.ten}, ` + `sức chứa: ${item.sucChua}`, sucChua: item.sucChua })) : [] }),
    fetchOne: (ten, done) => (getDmPhong(ten, item => done && done({ id: item.ten, text: `${item.ten}` + `${item.sucChua}` })))(),
});

export function GetAllDmPhongInCoSo(maCoSo, done) {
    return () => {
        const url = `/api/danh-muc/phong/condition/${maCoSo}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy danh sách phòng lỗi', 'danger');
                console.error(result.error);
            } else {
                if (!result.items.length) T.notify('Cơ sở này chưa có phòng học', 'warning');
                done && done(result.items);
            }
        });
    };
}

export const SelectAdapter_DmPhongFilter = (filter) => ({
    ajax: true,
    url: '/api/danh-muc/phong/filter',
    data: params => ({ searchTerm: params.term, filter }),
    processResults: response => ({ results: response && response.dataPhong ? response.dataPhong.map(item => ({ id: item.ten, text: `${item.ten}`, sucChua: item.sucChua })) : [] }),
    fetchOne: (ten, done) => (getDmPhong(ten, item => done && done({ id: item?.ten, text: `${item?.ten}` })))(),
});

export const SelectAdapter_DmPhongCustomFilter = (filter) => ({
    ajax: true,
    url: '/api/danh-muc/phong/custom/filter',
    data: params => ({ searchTerm: params.term, filter }),
    processResults: response => {
        if (response.error) {
            T.notify(response.error, 'danger');
            return { results: [] };
        } else return { results: response && response.dataPhong ? response.dataPhong.map(item => ({ id: item.ten, text: `${item.ten}`, sucChua: item.sucChua })) : [] };
    },
    fetchValid: (data, done) => T.get('/api/dt/thoi-khoa-bieu-custom/check-free-phong', { data }, response => {
        done && done(response.item);
    }),
    fetchOne: (ten, done) => (getDmPhong(ten, item => done && done({ id: item?.ten, text: `${item?.ten}` })))(),
});

export const SelectAdapter_DmPhongGetPhongEvent = (filter) => ({
    ajax: true,
    url: '/api/danh-muc/phong-thi/get-phong-event',
    data: params => ({ condition: params.term, filter }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ten, text: `${item.ten}: ${item.sucChua || 0}` })) : [] }),
    fetchOne: (ten, done) => (getDmPhong(ten, item => done && done({ id: item.ten, text: `${item.ten}: ${item.sucChua || 0}` })))(),
});

export const SelectAdapter_DmPhongBaoBuFilter = (filter) => ({
    ajax: true,
    url: '/api/danh-muc/phong/bao-bu/filter',
    data: params => ({ searchTerm: params.term, filter }),
    processResults: response => {
        if (response.error) {
            T.notify(response.error, 'danger');
            return { results: [] };
        } else return { results: response && response.dataPhong ? response.dataPhong.map(item => ({ id: item.ten, text: `${item.ten} (SC: ${item.sucChua})`, sucChua: item.sucChua })) : [] };
    },
    fetchOne: (ten, done) => (getDmPhong(ten, item => done && done({ id: item?.ten, text: `${item?.ten}` })))(),
});