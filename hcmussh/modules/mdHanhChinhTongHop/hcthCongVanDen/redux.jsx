import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const
    HcthCongVanDenGetAll = 'HcthCongVanDen:GetAll',
    HcthCongVanDenGetPage = 'HcthCongVanDen:GetPage',
    HcthCongVanDenSearchPage = 'HcthCongVanDen:SearchPage',
    HcthCongVanDenGet = 'HcthCongVanDen:Get',
    HcthCongVanDenGetPhanHoi = 'HcthCongVanDen:GetPhanHoi',
    HcthCongVanDenGetHistory = 'HcthCongVanDen:GetHistory',
    HcthCongVanDenGetChiDao = 'HcthCongVanDen:GetChiDao',
    HcthCongVanDenGetError = 'HcthCongVanDen:GetError',
    HcthCongVanDenGetSignFiles = 'HcthCongVanDen:GetSignFiles',
    HcthCongVanDenGetFollowLog = 'HcthCongVanDen:GetFollowLog';

// const HcthCongVanDenUpdate = 'HcthCongVanDen:Update';

export default function HcthCongVanDenReducer(state = null, data) {
    switch (data.type) {
        case HcthCongVanDenGet:
            return Object.assign({}, state, { item: data.item });
        case HcthCongVanDenGetAll:
            return Object.assign({}, state, { items: data.items });
        case HcthCongVanDenGetSignFiles:
            return Object.assign({}, state, { files: data.page });
        case HcthCongVanDenGetPage:
        case HcthCongVanDenSearchPage:
            return Object.assign({}, state, { page: data.page });
        case HcthCongVanDenGetPhanHoi:
            return Object.assign({}, state, { item: { ...(state?.item || {}), phanHoi: data.phanHoi } });
        case HcthCongVanDenGetHistory:
            return Object.assign({}, state, { item: { ...(state?.item || {}), history: data.history } });
        case HcthCongVanDenGetFollowLog:
            return Object.assign({}, state, { item: { ...(state?.item || {}), followLog: data.items, userLog: data.userLog || [] } });
        case HcthCongVanDenGetChiDao:
            return Object.assign({}, state, { item: { ...(state?.item || {}), danhSachChiDao: data.chiDao } });
        case HcthCongVanDenGetError:
            return Object.assign({}, state, { item: { ...(state?.item || {}), error: data.error } });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('pageHcthCongVanDen');
export function getHcthCongVanDenPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageHcthCongVanDen', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/hcth/van-ban-den/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sách văn bản đến bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                dispatch({ type: HcthCongVanDenGetPage, page: data.page });
                done && done(data.page);
            }
        }, () => T.notify('Lấy danh sách sách văn bản đến bị lỗi!', 'danger'));
    };
}

export function createHcthCongVanDen(data, done) {
    return dispatch => {
        const url = '/api/hcth/van-ban-den';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm văn bản đến bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm văn bản đến thành công!', 'success');
                dispatch(getHcthCongVanDenSearchPage());
                done && done(data);
            }
        }, () => T.notify('Thêm văn bản đến bị lỗi', 'danger'));
    };
}

export function getHcthCongVanDenAll(done) {
    return dispatch => {
        const url = '/api/hcth/van-ban-den/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin văn bản đến bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: HcthCongVanDenGetAll, items: data.items ? data.items : [] });
                done && done(data.items);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function updateHcthCongVanDen(id, changes, done) {
    return dispatch => {
        const url = '/api/hcth/van-ban-den';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật văn bản đến bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật văn bản đến thành công!', 'success');
                dispatch(getHcthCongVanDenSearchPage());
                done && done();
            }
        }, () => T.notify('Cập nhật văn bản đến bị lỗi!', 'danger'));
    };
}

export function deleteHcthCongVanDen(id) {
    return dispatch => {
        const url = '/api/hcth/van-ban-den';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa văn bản đến bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.notify('Xóa văn bản đến thành công!', 'success');
                dispatch(getHcthCongVanDenSearchPage());
            }
        }, () => T.notify('Xóa văn bản đến bị lỗi!', 'danger'));
    };
}

export function getHcthCongVanDenSearchPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageHcthCongVanDen', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/hcth/van-ban-den/search/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách văn bản đến bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (page.filter) data.page.filter = page.filter;
                dispatch({ type: HcthCongVanDenSearchPage, page: data.page });
                done && done(data.page);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function deleteFile(id, fileId, file, done) {
    return () => {
        const url = '/api/hcth/van-ban-den/delete-file';
        T.put(url, { id, fileId, file }, data => {
            if (data.error) {
                console.error('PUT: ' + url + '.', data.error);
                T.notify('Xóa file đính kèm lỗi!', 'danger');
            } else {
                T.notify('Xóa file đính kèm thành công!', 'success');
                done && done();
            }
        }, () => T.notify('Xóa file đính kèm bị lỗi!', 'danger'));
    };
}


export function getCongVanDen(id, context, done) {

    if (typeof context === 'function') {
        done = context;
        context = {};
    }
    return dispatch => {
        const url = `/api/hcth/van-ban-den/${id}`;
        T.get(url, context || {}, data => {
            if (data.error) {
                if (data.error.status == 401) {
                    dispatch({ type: HcthCongVanDenGetError, error: 401 });
                    console.error('GET: ' + url + '.', data.error.message);
                }
                else
                    console.error('GET: ' + url + '.', data.error);
                T.notify('Lấy văn bản đến bị lỗi!', 'danger');
            } else {
                dispatch({ type: HcthCongVanDenGet, item: data.item });
                done && done(data.item);
            }
        }, () => T.notify('Lấy văn bản đến bị lỗi!', 'danger'));
    };
}


export function createChiDao(data, done) {
    return () => {
        const url = '/api/hcth/van-ban-den/chi-dao';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm chỉ đạo bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm chỉ đạo thành công!', 'success');
                done && done(data);
            }
        }, () => T.notify('Thêm chỉ đạo bị lỗi', 'danger'));
    };
}

export function createPhanHoiChiDao(data, done) {
    return () => {
        const url = '/api/hcth/van-ban-den/phan-hoi-chi-dao';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm phản hồi chỉ đạo bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm phản hồi chỉ đạo thành công!', 'success');
                done && done(data);
            }
        });
    };
}

export function createPhanHoi(data, done) {
    return () => {
        const url = '/api/hcth/van-ban-den/phan-hoi';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm phản hồi bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Thêm phản hồi thành công!', 'success');
                done && done(data);
            }
        }, () => T.notify('Thêm phản hồi bị lỗi', 'danger'));
    };
}

export function updateStatus(data, done) {
    return () => {
        const url = '/api/hcth/van-ban-den/status';
        T.put(url, { data }, res => {
            if (res.error) {
                T.notify('Cập nhật văn bản đến bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Cập nhật văn bản đến thành công!', 'success');
                done && done(data);
            }
        }, () => T.notify('Cập nhật văn bản đến bị lỗi', 'danger'));
    };
}

export function updateUrgent(id, done) {
    return () => {
        const url = '/api/hcth/van-ban-den/urgent';
        T.put(url, { id }, res => {
            if (res.error) {
                T.notify('Cập nhật văn bản đến bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                T.notify('Cập nhật văn bản đến thành công!', 'success');
                // dispatch(getHcthCongVanDenPage());
                done && done(res.item);
            }
        }, () => T.notify('Cập nhật văn bản đến bị lỗi', 'danger'));
    };
}

export function getPhanHoi(id, done) {
    return dispatch => {
        const url = `/api/hcth/van-ban-den/phan-hoi/${id}`;
        T.get(url, res => {
            if (res.error) {
                T.notify('Lấy danh sách phản hồi lỗi', 'danger');
                console.error('GET: ' + url + '. ', res.error);
            } else {
                dispatch({ type: HcthCongVanDenGetPhanHoi, phanHoi: res.items });
                done && done(res.items);
            }
        }, () => T.notify('Lấy danh sách phản hồi lỗi', 'danger'));
    };
}

export function getHistory(id, context, done) {
    if (!context || typeof context == 'function') {
        done = context;
        context = {};
    }

    return dispatch => {
        const url = `/api/hcth/van-ban-den/lich-su/${id}`;
        T.get(url, context, res => {
            if (res.error) {
                T.notify('Lấy lịch sử văn bản lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                dispatch({ type: HcthCongVanDenGetHistory, history: res.items });
                done && done(res.items);
            }
        }, () => T.notify('Lấy lịch sử văn bản lỗi', 'danger'));
    };
}

export function getFollowLog(id, done) {
    return dispatch => {
        const url = `/api/hcth/van-ban-den/follow/${id}`;
        T.get(url, res => {
            if (res.error) {
                T.notify('Lấy lịch sử theo dõi văn bản lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                dispatch({ type: HcthCongVanDenGetFollowLog, items: res.items, userLog: res.userLog });
                done && done(res.items);
            }
        }, () => T.notify('Lấy lịch sử theo dõi văn bản lỗi', 'danger'));
    };
}

export function getChiDao(id, done) {
    return dispatch => {
        const url = `/api/hcth/van-ban-den/chi-dao/${id}`;
        T.get(url, res => {
            if (res.error) {
                T.notify('Lấy văn bản chỉ đạo lỗi', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                dispatch({ type: HcthCongVanDenGetChiDao, chiDao: res.items });
                done && done(res.items);
            }
        }, () => T.notify('Lấy văn bản chỉ đạo lỗi', 'danger'));
    };
}

export function updateQuyenChiDao(id, shcc, status, done) {
    return () => {
        const url = '/api/hcth/van-ban-den/quyen-chi-dao';
        T.post(url, { id, shcc, status }, res => {
            done && done(res);
        }, () => T.notify('Thêm cán bộ chỉ đạo lỗi', 'danger'));
    };
}


export function duyetCongVan(id, noiDung, done) {
    return () => {
        const url = '/api/hcth/van-ban-den/duyet';
        T.put(url, { id, noiDung }, res => {
            if (res.error) {
                T.notify('Duyệt văn bản lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + res.error);
            } else {
                done && done();
            }
        }, () => T.notify('Duyệt văn bản lỗi', 'danger'));
    };
}

export function xacThucCongVan(id, tenFile, done) {
    return () => {
        const url = '/api/hcth/van-ban-den/xac-thuc';
        T.post(url, { id, tenFile }, (res) => {
            if (res.error) {
                T.notify('Xác thực văn bản lỗi', 'danger');
                console.error('GET: ' + url + '. ' + res.error);
            } else {
                done && done(res.items);
            }
        }, () => T.notify('Xác thực văn bản lỗi', 'danger'));
    };
}


export function rectorUpdate(id, data, done, onFinish, onError) {
    return () => {
        const url = '/api/hcth/van-ban-den/rectors/' + id;
        T.put(url, data, (res) => {
            onFinish && onFinish();
            if (res.error) {
                T.notify('Cập nhật thông tin văn bản lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + res.error);
                onError && onError();
            } else {
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin văn bản lỗi', 'danger') || (onError && onError()));
    };
}

export function getFileHistory(id, done, onFinish, onError) {
    return () => {
        const url = '/api/hcth/van-ban-den/file/history/' + id;
        T.get(url, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                T.notify('Lấy thông tin văn bản lỗi', 'danger');
                console.error('GET: ' + url + '. ' + res.error);
                onError && onError();
            } else {
                done && done(res.items);
            }
        }, () => T.notify('Lấy thông tin văn bản lỗi', 'danger') || (onError && onError()));
    };
}

export function getFileList(ma, done, onFinish, onError) {
    return () => {
        const url = '/api/hcth/van-ban-den/file/list/' + ma;
        T.get(url, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                T.notify('Lấy danh sách tập tin văn bản lỗi', 'danger');
                console.error('GET: ' + url + '. ' + res.error);
                onError && onError();
            } else {
                done && done(res.items);
            }
        }, () => T.notify('Lấy danh sách tập tin văn bản lỗi', 'danger') || (onError && onError()));
    };
}


export function readNotification(id, done, onFinish, onError) {
    return () => {
        const url = '/api/hcth/van-ban-den/notification/read/' + id;
        T.get(url, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                console.error('GET: ' + url + '. ' + res.error);
                onError && onError();
            } else {
                T.getNotification && T.getNotification();
                done && done(res.items);
            }
        }, () => T.notify('Cập nhật thông báo lõi', 'danger') || (onError && onError()));
    };

}


export function updateVanBanDenStatus(id, trangThai, done, onFinish, onError) {
    return () => {
        const url = '/api/hcth/van-ban-den/trang-thai/' + id;
        T.put(url, { trangThai }, (res) => {
            onFinish && onFinish();
            if (res.error) {
                T.notify('Cập nhật thông tin văn bản lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + res.error);
                onError && onError();
            } else {
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin văn bản lỗi', 'danger') || (onFinish && onFinish()) || (onError && onError()));
    };
}

export function getSignFiles(pageNumber, pageSize, pageCondition, filter, done) {
    return dispatch => {
        const page = T.updatePage('pageHcthVanBanDenFile', pageNumber, pageSize, pageCondition, filter);
        const url = `/api/hcth/ky-dien-tu/van-ban-den/file/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh tập tin văn bản lỗi ' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (page.filter) data.page.filter = page.filter;
                dispatch({ type: HcthCongVanDenGetSignFiles, page: data.page });
                done && done(data.page);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createSession(data, done, onFinish, onError) {
    return () => {
        const url = '/api/hcth/ky-dien-tu/van-ban-den/session';
        T.post(url, { data }, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                T.notify('Taọ session lỗi', 'danger');
                console.error('GET: ' + url + '. ' + res.error);
                onError && onError();
            } else {
                T.notify('Taọ session thành công', 'success');
                done && done(res.session);
            }
        }, () => T.notify('Taọ session lỗi', 'danger') || (onFinish && onFinish()) || (onError && onError()));
    };
}


