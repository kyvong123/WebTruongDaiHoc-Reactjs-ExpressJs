import moment from 'moment';
import { HcthLichCongTacGet, HcthLichCongTacGetNote, HcthLichCongTacGetPage } from './congTac';

export function createLich(data, done, onFinish, onError) {
    return () => {
        const url = '/api/hcth/cong-tac/lich';
        T.post(url, { data }, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                T.notify('Tạo lịch tổng hợp lỗi ' + (res.error.message ? res.error.message : res.error), 'danger');
                console.error('POST: ' + url + '. ' + res.error);
                onError && onError();
            } else {
                done && done(res.item);
            }
        }, () => T.notify('Tạo lịch họp lỗi', 'danger') || (onError && onError()));
    };
}

export function updateLich(id, changes, done, onFinish, onError) {
    return () => {
        const url = '/api/hcth/cong-tac/lich';
        T.put(url, { id, changes }, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                T.notify('cập nhật lịch tổng hợp lỗi ' + (res.error.message ? res.error.message : res.error), 'danger');
                console.error('PUT: ' + url + '. ' + res.error);
                onError && onError();
            } else {
                done && done(res.item);
            }
        }, () => T.notify('cập nhật lịch họp lỗi', 'danger') || (onError && onError()));
    };
}


export function getLich(id, done, onFinish, onError) {
    return (dispatch) => {
        const url = '/api/hcth/cong-tac/lich/' + id;
        T.get(url, (res) => {
            onFinish && onFinish();
            if (res.error) {
                console.error('GET:', url, res.error);
                T.notify('Lấy thông tin lịch tổng hợp lỗi. ' + (res.error.message ? res.error.message : res.error), 'danger');
                onError && onError();
            } else {
                dispatch({ type: HcthLichCongTacGet, lichItem: res.item });
                done && done(res.item, res.tasks, res.tickets);
            }
        }, () => {
            onFinish && onFinish();
            onError && onError();
            T.notify('Lấy thông tin phiếu đăng ký lỗi. ', 'danger');
        });
    };
}

export function requestLich(id, canBoKiemDuyet, done, onFinish, onError) {
    return () => {
        const url = '/api/hcth/cong-tac/lich/request';
        T.put(url, { id, canBoKiemDuyet }, (res) => {
            onFinish && onFinish();
            if (res.error) {
                console.error('PUT:', url, res.error);
                T.notify('Cập nhật thông tin lịch tổng hợp lỗi. ' + (res.error.message ? res.error.message : res.error), 'danger');
                onError && onError();
            } else {
                done && done(res.item);
            }
        }, () => {
            onFinish && onFinish();
            onError && onError();
            T.notify('Cập nhật thông tin lịch tổng hợp lỗi. ', 'danger');
        });
    };
}

export function revokeLich(id, done, onFinish, onError) {
    return () => {
        const url = '/api/hcth/cong-tac/lich/revoke';
        T.put(url, { id }, (res) => {
            onFinish && onFinish();
            if (res.error) {
                console.error('PUT:', url, res.error);
                T.notify('Cập nhật thông tin lịch tổng hợp lỗi. ' + (res.error.message ? res.error.message : res.error), 'danger');
                onError && onError();
            } else {
                done && done();
            }
        }, () => {
            onFinish && onFinish();
            onError && onError();
            T.notify('Cập nhật thông tin lịch tổng hợp lỗi. ', 'danger');
        });
    };
}


T.initPage('pageHcthLichCongTacPage');

export function getLichCongTacPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageHcthLichCongTacPage', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        dispatch({ type: HcthLichCongTacGetPage, page: null });
        const url = `/api/hcth/cong-tac/lich/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách lịch công tác lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (page.filter) data.page.filter = page.filter;
                dispatch({ type: HcthLichCongTacGetPage, page: data.page });
                done && done(data.page);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function addTicketToLich(id, ticketId, done, onFinish, onError) {
    return () => {
        const url = '/api/hcth/cong-tac/lich/add';
        T.put(url, { data: { id, ticketId } }, (res) => {
            onFinish && onFinish();
            if (res.error) {
                console.error('PUT:', url, res.error);
                T.notify('Thêm phiếu lỗi. ' + (res.error.message ? res.error.message : res.error), 'danger');
                onError && onError();
            } else {
                done && done(res.item);
            }
        }, () => {
            onFinish && onFinish();
            onError && onError();
            T.notify('Thêm phiếu lỗi. ', 'danger');
        });
    };
}

export function createNote(lichId, noiDung, done, onFinish, onError) {
    return (dispatch) => {
        const url = '/api/hcth/cong-tac/lich/luu-y';
        T.post(url, { data: { lichId, noiDung } }, (res) => {
            onFinish && onFinish();
            if (res.error) {
                console.error('POST:', url, res.error);
                T.notify('Tạo lưu ý lỗi. ' + (res.error.message ? res.error.message : res.error), 'danger');
                onError && onError();
            } else {
                dispatch(getNote(lichId));
                done && done(res.item);
            }
        }, () => {
            onFinish && onFinish();
            onError && onError();
            T.notify('Tạo lưu ý lỗi. ', 'danger');
        });
    };
}

export function updateNote(noteId, noiDung, done, onFinish, onError) {
    return (dispatch) => {
        const url = '/api/hcth/cong-tac/lich/luu-y';
        T.put(url, { data: { noteId, noiDung } }, (res) => {
            onFinish && onFinish();
            if (res.error) {
                console.error('POST:', url, res.error);
                T.notify('Cập nhật lưu ý lỗi. ' + (res.error.message ? res.error.message : res.error), 'danger');
                onError && onError();
            } else {
                dispatch(getNote(res.item.lichId));
                done && done(res.item);
            }
        }, () => {
            onFinish && onFinish();
            onError && onError();
            T.notify('Tạo lưu ý lỗi. ', 'danger');
        });
    };
}

export function censorLich(id, approve, decline, lyDo, done, onFinish, onError) {
    return () => {
        const url = '/api/hcth/cong-tac/lich/censor';
        T.put(url, { id, approve, decline, lyDo }, (res) => {
            onFinish && onFinish();
            if (res.error) {
                console.error('POST:', url, res.error);
                T.notify('Cập nhật lịch lỗi. ' + (res.error.message ? res.error.message : res.error), 'danger');
                onError && onError();
            } else {
                done && done(res.item);
            }
        }, () => {
            onFinish && onFinish();
            onError && onError();
            T.notify('Cập nhật lịch lỗi. ', 'danger');
        });
    };
}

export function publishLich(id, done, onFinish, onError) {
    return () => {
        const url = '/api/hcth/cong-tac/lich/publish';
        T.put(url, { id, }, (res) => {
            onFinish && onFinish();
            if (res.error) {
                console.error('POST:', url, res.error);
                T.notify('Cập nhật lịch lỗi. ' + (res.error.message ? res.error.message : res.error), 'danger');
                onError && onError();
            } else {
                done && done(res.item);
            }
        }, () => {
            onFinish && onFinish();
            onError && onError();
            T.notify('Cập nhật lịch lỗi. ', 'danger');
        });
    };
}

export function getNote(lichId, done, onFinish, onError) {
    return (dispatch) => {
        dispatch({ type: HcthLichCongTacGetNote, luuY: null });
        const url = '/api/hcth/cong-tac/lich/luu-y/' + lichId;
        T.get(url, (res) => {
            onFinish && onFinish();
            if (res.error) {
                console.error('GET:', url, res.error);
                T.notify('Lấy lưu ý lỗi. ' + (res.error.message ? res.error.message : res.error), 'danger');
                onError && onError();
            } else {
                dispatch({ type: HcthLichCongTacGetNote, luuY: res.items });
                done && done(res.items);
            }
        }, () => {
            onFinish && onFinish();
            onError && onError();
            T.notify('Lấy lưu ý lỗi.', 'danger');
        });
    };
}

export function notifyUsers(lichId, done, onFinish, onError) {
    return () => {
        const url = '/api/hcth/cong-tac/lich/notify/' + lichId;
        T.get(url, (res) => {
            onFinish && onFinish();
            if (res.error) {
                console.error('GET:', url, res.error);
                T.notify('Gửi thông báo lỗi. ' + (res.error.message ? res.error.message : res.error), 'danger');
                onError && onError();
            } else {
                done && done();
            }
        }, () => {
            onFinish && onFinish();
            onError && onError();
            T.notify('Gửi thông báo lỗi.', 'danger');
        });
    };
}

export function deleteNote(noteId, lichId, done, onFinish, onError) {
    return (dispatch) => {
        dispatch({ type: HcthLichCongTacGetNote, luuY: null });
        const url = '/api/hcth/cong-tac/lich/luu-y';
        T.delete(url, { noteId }, (res) => {
            onFinish && onFinish();
            if (res.error) {
                console.error('DELETE:', url, res.error);
                T.notify('Xóa lưu ý lỗi. ' + (res.error.message ? res.error.message : res.error), 'danger');
                onError && onError();
            } else {
                dispatch(getNote(lichId));
                done && done(res.items);
            }
        }, () => {
            onFinish && onFinish();
            onError && onError();
            T.notify('Xóa lưu ý lỗi.', 'danger');
        });
    };
}

export const SelectAdapter_HcthAdminCongTacTicket = (trangThai) => ({
    ajax: true,
    data: params => ({ condition: params.term, filter: { isAdmin: 1, trangThai } }),
    url: '/api/hcth/cong-tac/ticket/page/1/20',
    processResults: response => ({ results: response && response.page ? response.page.list.map(item => ({ id: item.id, text: `${item.tenDonVi}, ${moment(new Date(item.batDau)).format('DD/MM/YYYY')} - ${moment(new Date(item.ketThuc)).format('DD/MM/YYYY')} (${item.tenNguoiTao})` })) : [] }),
    fetchOne: () => { },
});
