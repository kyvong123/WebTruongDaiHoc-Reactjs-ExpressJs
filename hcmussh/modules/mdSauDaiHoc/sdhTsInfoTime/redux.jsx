import T from 'view/js/common';

const SdhDotTsAll = 'SdhDotTs:GetAll';
const SdhDotTsGetPage = 'SdhDotTs:GetPage';

//-----------REDUCER------------------
export default function SdhDotTsReducer(state = null, data) {
    switch (data.type) {
        case SdhDotTsAll:
            return Object.assign({}, state, { items: data.items });
        case SdhDotTsGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}
//----------------------------ACTIONS-------------------------
export const PageName = 'pageSdhDotTuyenSinh';
T.initPage(PageName);

export function getSdhDotTuyenSinhPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
    return (dispatch) => {
        const url = `/api/sdh/dot-tuyen-sinh/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter }, (data) => {
            if (data.error) {
                T.notify('Lấy danh sách đợt tuyển sinh bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: SdhDotTsGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách đợt tuyển sinh bị lỗi' + (error.error.message && ':<br>' + error.error.message), 'danger'));
    };
}
export function getSdhTsProcessingDot(done) {
    return () => {
        const url = '/api/sdh/dot-tuyen-sinh/processing';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy dữ liệu đợt xử lý không thành công!', 'danger');
                console.error(`GET: ${url}.`, data.error);
                done && done();
            } else {
                done && done(data.item);
            }
        });
    };
}
export function getSdhTsProcessingTs(done) {
    return () => {
        const url = '/api/sdh/dot-tuyen-sinh/processing-thi-sinh';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy dữ liệu đợt xử lý không thành công!', 'danger');
                console.error(`GET: ${url}.`, data.error);
                done && done();
            } else {
                done && done(data.item);
            }
        });
    };
}

export function getSdhTsInfoTimeData(maKyThi, done) {
    return dispatch => {
        const url = `/api/sdh/ts-info/time/${maKyThi}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin các đợt tuyển sinh không thành công!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: SdhDotTsAll, items: data.items });
                done && done(data.items);
            }
        }, () => T.notify('Lấy thông tin các đợt tuyển sinh bị lỗi!', 'danger'));
    };
}
export function getSdhTsDotCurrent(maKyThi, done) {
    return dispatch => {
        const url = `/api/sdh/ts-info/time/current/${maKyThi}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin các đợt tuyển sinh không thành công!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: SdhDotTsAll, items: data.items });
                done && done(data.items);
            }
        }, () => T.notify('Lấy thông tin các đợt tuyển sinh bị lỗi!', 'danger'));
    };
}
export function getSdhTsInfoTime(id, done) {
    return () => {
        const url = `/api/sdh/ts-info-time/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin đợt tuyển sinh không thành công!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, () => T.notify('Lấy thông tin đợt tuyển sinh bị lỗi!', 'danger'));
    };
}
export function getSdhTsDotByMa(ma, done) {
    return () => {
        const url = `/api/sdh/dot-tuyen-sinh/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin đợt tuyển sinh không thành công!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        });
    };
}
export function updateSdhTsInfoTime(id, changes, done) {
    return dispatch => {
        const url = '/api/sdh/ts-info/time';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin đợt tuyển sinh không thành công!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật thông tin đợt tuyển sinh thành công!', 'success');
                dispatch(getSdhTsInfoTimeData(changes.maInfoTs));
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin  đợt tuyển sinh bị lỗi!', 'danger'));
    };
}
export function createSdhTsInfoTime(data, done) {
    return dispatch => {
        const url = '/api/sdh/ts-info/time';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Tạo mới đợt tuyển sinh không thành công!', 'danger');
                console.error(`POST: ${url}.`, result.error);
            } else {
                T.notify('Tạo mới đợt tuyển sinh thành công!', 'success');
                dispatch(getSdhTsInfoTimeData(data.maInfoTs));
                done && done(result.items);
            }
        }, () => T.notify('Tạo mới đợt tuyển sinh bị lỗi!', 'danger'));
    };
}
export function deleteSdhTsInfoTime(id, maInfoTs, done) {
    return dispatch => {
        const url = '/api/sdh/ts-info/time';
        T.delete(url, { id }, result => {
            if (result.error) {
                T.notify('Xóa đợt tuyển sinh không thành công!', 'danger');
                console.error(`DELETE: ${url}.`, result.error);
            } else {
                T.notify('Xóa đợt tuyển sinh thành công!', 'success');
                dispatch(getSdhTsInfoTimeData(maInfoTs));
                done && done();
            }
        });
    };
}
export function copySdhTsInfoTime(idDot, data, done) {
    return dispatch => {
        const url = '/api/sdh/ts-info/copy/time';
        T.post(url, { idDot, data }, result => {
            if (data.error) {
                T.notify('Sao chép thông tin đợt tuyển sinh không thành công!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Sao chép thông tin đợt tuyển sinh thành công!', 'success');
                dispatch(getSdhTsInfoTimeData(result.id));
                done && done();
            }
        }, () => T.notify('Sao chép thông tin  đợt tuyển sinh bị lỗi!', 'danger'));
    };
}
export function updateSdhTsInfoTimeStatus(id, changes, done) {
    return () => {
        const url = '/api/sdh/ts-info/time/update-status';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin đợt tuyển sinh không thành công!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật thông tin đợt tuyển sinh thành công!', 'success');
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin  đợt tuyển sinh bị lỗi!', 'danger'));
    };
}
export const SelectAdapter_DotThiTS = {
    ajax: true,
    url: '/api/sdh/dot-tuyen-sinh/page/1/50',
    data: params => ({ condition: params.term || '' }),
    processResults: response => ({ results: response && response.page && response.page.list?.length ? response.page.list.map(item => ({ id: item.maDot, text: `${item.maDot}`, idDot: item.idDot })) : [] }),
    fetchOne: (id, done) => (getSdhTsInfoTime(id, item => done && done({ id: item.id, text: `${item.maDot}` })))(),
};

