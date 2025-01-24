import T from 'view/js/common.js';

export const HcthCongTacGet = 'hcthCongTac:Get';
export const HcthCongTacGetCanBo = 'hcthCongTac:GetCanBo';
export const HcthCongTacGetBienBan = 'hcthCongTac:GetBienBan';
export const HcthCongTacGetFiles = 'hcthCongTac:GetFiles';
export const HcthCongTacGetChuongTrinh = 'hcthCongTac:GetChuongTrinh';
export const HcthCongTacGetPhanHoi = 'hcthCongTac:GetPhanHoi';
export const HcthCongTacGetPage = 'hcthCongTac:GetPage';
export const HcthPhongHopTicketGetPage = 'HcthPhongHopTicket:GetPage';
export const HcthCongTacTicketItem = 'HcthCongTac:GetTicketItem';
export const HcthCongTacTicketGetCongTacItems = 'HcthCongTacTicket:GetItems';
export const HcthCongTacTicketGetPage = 'HcthCongTacTicket:GetPage';
export const HcthLichCongTacGet = 'HcthLichCongTac:Get';
export const HcthLichCongTacGetPage = 'HcthLichCongTac:GetPage';
export const HcthLichCongTacGetNote = 'HcthLichCongTac:GetNote';
export const HcthLichCongTacGetUyQuyen = 'HcthLichCongTac:GetUyQuyen';

export default function reducers(state = null, data) {
    const item = state?.item || {};
    const ticketItem = state?.ticket || {};
    const lichItem = state?.lichItem || {};
    switch (data.type) {
        case HcthCongTacGetPage:
            return Object.assign({}, state, { page: data.page });
        case HcthLichCongTacGetPage:
            return Object.assign({}, state, { lichPage: data.page });
        case HcthCongTacGet:
            return Object.assign({}, state, { item: { ...item, ...data.item } });
        case HcthPhongHopTicketGetPage:
            return Object.assign({}, state, { phongHopTicketPage: data.page });
        case HcthCongTacTicketGetPage:
            return Object.assign({}, state, { ticketPage: data.page });
        case HcthCongTacGetCanBo:
            return Object.assign({}, state, { item: { ...item, thanhPhan: data.thanhPhan } });
        case HcthCongTacGetBienBan:
            return Object.assign({}, state, { item: { ...item, bienBan: data.bienBan } });
        case HcthCongTacGetChuongTrinh:
            return Object.assign({}, state, { item: { ...item, chuongTrinh: data.chuongTrinh } });
        case HcthCongTacGetPhanHoi:
            return Object.assign({}, state, { item: { ...item, phanHoi: data.phanHoi } });
        case HcthCongTacGetFiles:
            return Object.assign({}, state, { item: { ...item, files: data.files } });
        case HcthCongTacTicketItem:
            return Object.assign({}, state, { ticket: data.ticket });
        case HcthCongTacTicketGetCongTacItems:
            return Object.assign({}, state, { ticket: { ...ticketItem, congTacItems: data.congTacItems } });
        case HcthLichCongTacGet:
            return Object.assign({}, state, { lichItem: data.lichItem });
        case HcthLichCongTacGetNote:
            return Object.assign({}, state, { lichItem: { ...lichItem, luuY: data.luuY } });
        case HcthLichCongTacGetUyQuyen:
            return Object.assign({}, state, { listUyQuyen: data.items });
        default:
            return state;
    }
}

T.initPage('pageHcthCongTacItem');

export function getUserCongTacPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageHcthCongTacItem', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        dispatch({ type: HcthCongTacGetPage, page: null });
        const url = `/api/hcth/cong-tac/user/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách công tác lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (page.filter) data.page.filter = page.filter;
                dispatch({ type: HcthCongTacGetPage, page: data.page });
                done && done(data.page);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}
T.initPage('pageHcthCongTacTicket');

export function getCongTacTicketPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageHcthCongTacTicket', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        dispatch({ type: HcthCongTacTicketGetPage, page: null });
        const url = `/api/hcth/cong-tac/ticket/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách phiếu đăng ký công tác lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (page.filter) data.page.filter = page.filter;
                dispatch({ type: HcthCongTacTicketGetPage, page: data.page });
                done && done(data.page);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

T.initPage('pageHcthUserCongTacTicket');

export function getUserCongTacTicketPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageHcthUserCongTacTicket', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        dispatch({ type: HcthCongTacTicketGetPage, page: null });
        const url = `/api/hcth/cong-tac/ticket/user/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách phiếu đăng ký công tác lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (page.filter) data.page.filter = page.filter;
                dispatch({ type: HcthCongTacTicketGetPage, page: data.page });
                done && done(data.page);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}


export function updateTicketTrangThai(id, trangThai, done, onFinish, onError) {
    return () => {
        const url = '/api/hcth/cong-tac/ticket/status';
        T.put(url, { id, trangThai }, (res) => {
            onFinish && onFinish();
            if (res.error) {
                console.error('PUT:', url, res.error);
                T.notify('Cập nhật phiếu đăng ký phòng họp lỗi. ' + (res.error.message ? res.error.message : res.error), 'danger');
                onError && onError();
            } else {
                T.notify('Cập nhật trạng thái phiếu đăng ký thành công', 'success');
                done && done(res.item);
            }
        }, () => {
            onFinish && onFinish();
            onError && onError();
            T.notify('Cập nhật phiếu đăng ký phòng họp lỗi. ', 'danger');
        });
    };
}

export function removeItem(id, done, onFinish, onError) {
    return () => {
        const url = '/api/hcth/cong-tac/remove';
        T.put(url, { id }, (res) => {
            onFinish && onFinish();
            if (res.error) {
                console.error('PUT:', url, res.error);
                T.notify('Cập nhật công tác lỗi. ' + (res.error.message ? res.error.message : res.error), 'danger');
                onError && onError();
            } else {
                T.notify('Cập nhật công tác thành công', 'success');
                done && done(res.item);
            }
        }, () => {
            onFinish && onFinish();
            onError && onError();
            T.notify('CCập nhật công tác lỗi. ', 'danger');
        });
    };
}

export function deleteCongTacItem(id, done, onFinish, onError) {
    return () => {
        const url = '/api/hcth/cong-tac';
        T.delete(url, { id }, (res) => {
            onFinish && onFinish();
            if (res.error) {
                console.error('DELETE:', url, res.error);
                T.notify('Xóa công tác lỗi. ' + (res.error.message ? res.error.message : res.error), 'danger');
                onError && onError();
            } else {
                // T.notify('Cập nhật trạng thái phiếu đăng ký thành công', 'success');
                done && done();
            }
        }, () => {
            onFinish && onFinish();
            onError && onError();
            T.notify('Xóa công tác lỗi. ', 'danger');
        });
    };
}


export function deleteCongTacTicket(id, done, onFinish, onError) {
    return () => {
        const url = '/api/hcth/cong-tac/ticket';
        T.delete(url, { id }, (res) => {
            onFinish && onFinish();
            if (res.error) {
                console.error('DELETE:', url, res.error);
                T.notify('Xóa công tác lỗi. ' + (res.error.message ? res.error.message : res.error), 'danger');
                onError && onError();
            } else {
                // T.notify('Cập nhật trạng thái phiếu đăng ký thành công', 'success');
                done && done();
            }
        }, () => {
            onFinish && onFinish();
            onError && onError();
            T.notify('Xóa công tác lỗi. ', 'danger');
        });
    };
}


export function getCongTacTicket(id, done, onFinish, onError) {
    return (dispatch) => {
        const url = '/api/hcth/cong-tac/ticket/' + id;
        T.get(url, (res) => {
            onFinish && onFinish();
            if (res.error) {
                console.error('GET:', url, res.error);
                T.notify('Lấy thông tin phiếu đăng ký lỗi. ' + (res.error.message ? res.error.message : res.error), 'danger');
                onError && onError();
            } else {
                dispatch({ type: HcthCongTacTicketItem, ticket: res.item });
                done && done(res.item);
            }
        }, () => {
            onFinish && onFinish();
            onError && onError();
            T.notify('Lấy thông tin phiếu đăng ký lỗi. ', 'danger');
        });
    };
}

export function getTicketItems(id, done, onFinish, onError) {
    return (dispatch) => {
        const url = '/api/hcth/cong-tac/ticket/items/' + id;
        T.get(url, (res) => {
            onFinish && onFinish();
            if (res.error) {
                console.error('GET:', url, res.error);
                T.notify('Lấy thông tin phiếu đăng ký lỗi. ' + (res.error.message ? res.error.message : res.error), 'danger');
                onError && onError();
            } else {
                dispatch({ type: HcthCongTacTicketGetCongTacItems, congTacItems: res.items });
                done && done(res.items);
            }
        }, () => {
            onFinish && onFinish();
            onError && onError();
            T.notify('Lấy thông tin phiếu đăng ký lỗi. ', 'danger');
        });
    };
}

export function getCongTacItem(id, done, onFinish, onError) {
    return (dispatch) => {
        const url = '/api/hcth/cong-tac/' + id;
        T.get(url, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                console.error('GET: ' + url + '. ', res.error);
                onError && onError();
            } else {
                dispatch({ type: HcthCongTacGet, item: res.item });
                done && done(res.item);
            }
        }, () => T.notify('Lấy thông tin lịch họp lỗi', 'danger') || (onError && onError()));
    };
}

export function getCongTacItemVersion(id, version, done, onFinish, onError) {
    return (dispatch) => {
        const url = '/api/hcth/cong-tac/' + id;
        T.get(url, { version }, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                console.error('GET: ' + url + '. ', res.error);
                onError && onError();
            } else {
                dispatch({ type: HcthCongTacGet, item: res.item });
                done && done(res.item);
            }
        }, () => T.notify('Lấy thông tin lịch họp lỗi', 'danger') || (onError && onError()));
    };
}

export function getCongTacItemLogs(id, done, onFinish, onError) {
    return () => {
        const url = `/api/hcth/cong-tac/${id}/logs`;
        T.get(url, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                console.error('GET: ' + url + '. ', res.error);
                onError && onError();
            } else {
                done && done(res.items);
            }
        }, () => T.notify('Lấy thông tin lịch họp lỗi', 'danger') || (onError && onError()));
    };
}

export function getLichHopRange(query, done, onFinish, onError) {
    return () => {
        const url = '/api/hcth/cong-tac/range';
        T.get(url, query, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                console.error('GET: ' + url + '. ', res.error);
                onError && onError();
            } else {
                done && done(res.data);
            }
        }, () => T.notify('Lấy thông tin lịch họp lỗi', 'danger') || (onError && onError()));
    };
}

export function getCanBoHop(id, done, onFinish, onError) {
    return (dispatch) => {
        dispatch({ type: HcthCongTacGetCanBo, canBoHop: null });
        const url = '/api/hcth/cong-tac/can-bo/' + id;
        T.get(url, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                console.error('GET: ' + url + '. ', res.error);
                onError && onError();
            } else {
                dispatch({ type: HcthCongTacGetCanBo, thanhPhan: res.items });
                done && done(res.items);
            }
        }, () => T.notify('Lấy thông tin cán bộ họp lỗi', 'danger') || (onError && onError()));
    };
}

export function getBienBan(congTacItemId, done, onFinish, onError) {
    return (dispatch) => {
        dispatch({ type: HcthCongTacGetBienBan, bienBan: null });
        const url = '/api/hcth/cong-tac/bien-ban/' + congTacItemId;
        T.get(url, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                console.error('GET: ' + url + '. ', res.error);
                onError && onError();
            } else {
                dispatch({ type: HcthCongTacGetBienBan, bienBan: res.items });
                done && done(res.items);
            }
        }, () => T.notify('Lấy thông tin biên bản họp lỗi', 'danger') || (onError && onError()));
    };
}

export function getChuongTrinh(congTacItemId, done, onFinish, onError) {
    return (dispatch) => {
        dispatch({ type: HcthCongTacGetChuongTrinh, chuongTrinh: null });
        const url = '/api/hcth/cong-tac/chuong-trinh/' + congTacItemId;
        T.get(url, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                console.error('GET: ' + url + '. ', res.error);
                onError && onError();
            } else {
                dispatch({ type: HcthCongTacGetChuongTrinh, chuongTrinh: res.items });
                done && done(res.items);
            }
        }, () => T.notify('Lấy thông tin chương trình lỗi', 'danger') || (onError && onError()));
    };
}

export function getFiles(congTacItemId, done, onFinish, onError) {
    return (dispatch) => {
        dispatch({ type: HcthCongTacGetFiles, chuongTrinh: null });
        const url = '/api/hcth/cong-tac/files/' + congTacItemId;
        T.get(url, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                console.error('GET: ' + url + '. ', res.error);
                onError && onError();
            } else {
                dispatch({ type: HcthCongTacGetFiles, files: res.items });
                done && done(res.items);
            }
        }, () => T.notify('Lấy thông tin tệp tin lỗi', 'danger') || (onError && onError()));
    };
}

export function getPhanHoi(congTacItemId, done, onFinish, onError) {
    return (dispatch) => {
        dispatch({ type: HcthCongTacGetPhanHoi, phanHoi: null });
        const url = '/api/hcth/cong-tac/phan-hoi/' + congTacItemId;
        T.get(url, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                console.error('GET: ' + url + '. ', res.error);
                onError && onError();
            } else {
                dispatch({ type: HcthCongTacGetPhanHoi, phanHoi: res.items });
                done && done(res.items);
            }
        }, () => T.notify('Lấy thông tin phản hồi lỗi', 'danger') || (onError && onError()));
    };
}

export function createTicket(data, done, onFinish, onError) {
    return () => {
        const url = '/api/hcth/cong-tac/ticket';
        T.post(url, { data }, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                console.error('POST: ' + url + '. ' + res.error);
                onError && onError();
            } else {
                done && done(res.item);
            }
        }, () => T.notify('Tạo lịch họp lỗi', 'danger') || (onError && onError()));
    };
}

export function create(data, done, onFinish, onError) {
    return (dispatch) => {
        const url = '/api/hcth/cong-tac/';
        T.post(url, { data }, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                console.error('POST: ' + url + '. ' + res.error);
                onError && onError();
            } else {
                dispatch(getTicketItems(data.congTacTicketId));
                done && done(res.item);

            }
        }, () => T.notify('Tạo lịch họp lỗi', 'danger') || (onError && onError()));
    };
}

export function updateTicket(id, changes, done, onFinish, onError) {
    return () => {
        const url = '/api/hcth/cong-tac/ticket';
        T.put(url, { id, changes }, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                console.error('PUT: ' + url + '. ' + res.error);
                onError && onError();
            } else {
                done && done(res.item);
            }
        }, () => T.notify('Cập nhật phiếu lỗi', 'danger') || (onError && onError()));
    };
}

export function update(id, changes, done, onFinish, onError) {
    return () => {
        const url = '/api/hcth/cong-tac/';
        T.put(url, { id, changes }, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                T.notify('Cập nhật công tác lỗi' + (res.error.message ? (':<br>' + res.error.message) : (':<br>' + res.error)), 'danger');
                console.error('PUT: ' + url + '. ' + res.error);
                onError && onError();
            } else {
                done && done(res.item);
            }
        }, () => T.notify('Cập nhật công tác lỗi', 'danger') || (onError && onError()));
    };
}

export function createChuongTrinh(data, done, onFinish, onError) {
    return (dispatch) => {
        const url = '/api/hcth/cong-tac/chuong-trinh';
        T.post(url, { data }, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                console.error('POST: ' + url + '. ', res.error);
                onError && onError();
            } else {
                dispatch(getChuongTrinh(data.congTacItemId));
                done && done(res.item);
            }
        }, () => T.notify('Tạo chương trình họp lỗi', 'danger') || (onError && onError()));
    };
}

export function createCanBo(data, done, onFinish, onError) {
    return (dispatch) => {
        const url = '/api/hcth/cong-tac/can-bo';
        T.post(url, { data }, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                T.notify(res.error.message || res.error, 'danger');
                console.error('POST: ' + url + '. ', res.error);
                onError && onError();
            } else {
                dispatch(getCanBoHop(data.congTacItemId));
                done && done(res.item);
            }
        }, () => T.notify('Tạo chương trình họp lỗi', 'danger') || (onError && onError()));
    };
}

export function createPhanPhoi(congTacItemId, noiDung, done, onFinish, onError) {
    return (dispatch) => {
        const url = '/api/hcth/cong-tac/phan-hoi';
        T.post(url, { data: { congTacItemId, noiDung } }, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                console.error('POST: ' + url + '. ', res.error);
                onError && onError();
            } else {
                dispatch(getPhanHoi(congTacItemId));
                done && done(res.item);
            }
        }, () => T.notify('Tạo chương trình họp lỗi', 'danger') || (onError && onError()));
    };
}

export function createBienBan(congTacItemId, data, done, onFinish, onError) {
    return (dispatch) => {
        const url = '/api/hcth/cong-tac/bien-ban';
        T.post(url, { congTacItemId, data }, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                console.error('POST: ' + url + '. ', res.error);
                onError && onError();
            } else {
                dispatch(getBienBan(congTacItemId));
                done && done(res.item);
            }
        }, () => T.notify('Tạo chương trình họp lỗi', 'danger') || (onError && onError()));
    };
}

export function invite(congTacItemId, shcc, done, onFinish, onError) {
    return (dispatch) => {
        const url = '/api/hcth/cong-tac/can-bo/invite';
        T.post(url, { congTacItemId, shcc }, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                console.error('POST: ' + url + '. ', res.error);
                onError && onError();
            } else {
                dispatch(getCanBoHop(congTacItemId));
                done && done(res.item);
            }
        }, () => T.notify('Tạo chương trình họp lỗi', 'danger') || (onError && onError()));
    };
}

export function updateBienBan(id, data, done, onFinish, onError) {
    return (dispatch) => {
        const url = '/api/hcth/cong-tac/bien-ban';
        T.put(url, { id, data }, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                console.error('PUT: ' + url + '. ', res.error);
                onError && onError();
            } else {
                dispatch(getBienBan(res.item.ma));
                done && done(res.item);
            }
        }, () => T.notify('Cập nhật biên bản lỗi', 'danger') || (onError && onError()));
    };
}

export function updateCanBo(congTacItemId, shcc, changes, done, onFinish, onError) {
    return (dispatch) => {
        const url = '/api/hcth/cong-tac/can-bo';
        T.put(url, { congTacItemId, shcc, changes }, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                T.notify('Cập nhật thông tin cán bộ lỗi. ' + (res.error.message || ''), 'danger');
                console.error('PUT: ' + url + '. ', res.error);
                onError && onError();
            } else {
                dispatch(getCanBoHop(congTacItemId));
                done && done(res);
            }
        }, () => T.notify('Cập nhật thông tin cán bộ lỗi', 'danger') || (onError && onError()));
    };
}

export function updateChuongTrinh(id, congTacItemId, changes, done, onFinish, onError) {
    return (dispatch) => {
        const url = '/api/hcth/cong-tac/chuong-trinh';
        T.put(url, { id, changes }, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                T.notify('Cập nhật thông tin chương trình lỗi. ' + (res.error.message || ''), 'danger');
                console.error('PUT: ' + url + '. ', res.error);
                onError && onError();
            } else {
                dispatch(getChuongTrinh(congTacItemId));
                done && done(res.item);
            }
        }, () => T.notify('Cập nhật thông tin chương trình lỗi', 'danger') || (onError && onError()));
    };
}

export function updateTrangThaiCanBo(congTacItemId, changes, done, onFinish, onError) {
    return () => {
        const url = '/api/hcth/cong-tac/can-bo/trang-thai';
        T.put(url, { congTacItemId, changes }, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                console.error('PUT: ' + url + '. ', res.error);
                onError && onError();
            } else {
                done && done(res);
            }
        }, () => T.notify('Tạo chương trình họp lỗi', 'danger') || (onError && onError()));
    };
}

export function updateOrdinalCanBo(congTacItemId, updateList, done, onFinish, onError) {
    return (dispatch) => {
        const url = '/api/hcth/cong-tac/can-bo/ordinal';
        T.put(url, { congTacItemId, updateList }, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                console.error('PUT: ' + url + '. ', res.error);
                onError && onError();
            } else {
                dispatch(getCanBoHop(congTacItemId));
                done && done(res);
            }
        }, () => {
            T.notify('Cập nhật thứ tự cán bộ lỗi', 'danger');
            onError && onError();
        });
    };
}

export function deleteCanBo(congTacItemId, canBoNhan, done, onFinish, onError) {
    return (dispatch) => {
        const url = '/api/hcth/cong-tac/can-bo';
        T.delete(url, { congTacItemId, canBoNhan }, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                console.error('DELETE: ' + url + '. ', res.error);
                onError && onError();
            } else {
                dispatch(getCanBoHop(congTacItemId));
                done && done(res);
            }
        }, () => T.notify('Xóa cán bộ lỗi', 'danger') || (onError && onError()));
    };
}

export function deleteChuongTrinh(id, congTacItemId, done, onFinish, onError) {
    return (dispatch) => {
        const url = '/api/hcth/cong-tac/chuong-trinh';
        T.delete(url, { congTacItemId, id }, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                console.error('DELETE: ' + url + '. ', res.error);
                onError && onError();
            } else {
                dispatch(getChuongTrinh(congTacItemId));
                done && done(res);
            }
        }, () => T.notify('Xóa chương trình lỗi', 'danger') || (onError && onError()));
    };
}

export function deleteFile(id, congTacItemId, done, onFinish, onError) {
    return (dispatch) => {
        const url = '/api/hcth/cong-tac/files';
        T.delete(url, { congTacItemId, id }, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                console.error('DELETE: ' + url + '. ', res.error);
                onError && onError();
            } else {
                dispatch(getFiles(congTacItemId));
                done && done(res);
            }
        }, () => T.notify('Xóa tệp tin lỗi', 'danger') || (onError && onError()));
    };
}

export function declineItem(id, done, onFinish, onError) {
    return () => {
        const url = '/api/hcth/cong-tac/decline';
        T.put(url, { id }, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                console.error('PUT: ' + url + '. ', res.error);
                onError && onError();
            } else {
                done && done(res);
            }
        }, () => T.notify('Cập nhật trạng thái công tác', 'danger') || (onError && onError()));
    };
}


export function censorTicket(id, approve, decline, lyDo, done, onFinish, onError) {
    return () => {
        const url = '/api/hcth/cong-tac/ticket/censor';
        T.put(url, { approve, decline, id, lyDo }, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                console.error('PUT: ' + url + '. ', res.error);
                onError && onError();
            } else {
                done && done(res);
            }
        }, () => T.notify('Cập nhật trạng thái lỗi', 'danger') || (onError && onError()));
    };
}

export function addSuKien(ticketId, list, done, onFinish, onError) {
    return () => {
        const url = '/api/hcth/cong-tac/ticket/add';
        T.put(url, { ticketId, list }, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                console.error('PUT: ' + url + '. ', res.error);
                onError && onError();
            } else {
                done && done(res);
            }
        }, () => T.notify('Cập nhật phiếu công tác lỗi', 'danger') || (onError && onError()));
    };
}
