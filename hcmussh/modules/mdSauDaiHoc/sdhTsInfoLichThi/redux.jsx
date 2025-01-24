import T from 'view/js/common';
const SdhTsLichThiGetPage = 'SdhTsLichThi:GetPage';
const SdhTsLichThiThiSinh = 'SdhTsLichThi:ThiSinh';

export default function SdhTsLichThiReducer(state = null, data) {
    switch (data.type) {
        case SdhTsLichThiGetPage:
            return Object.assign({}, state, { page: data.page });
        case SdhTsLichThiThiSinh:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

// // Actions ------------------------------
export function createSdhTsInfoLichThi(data, idDot, done) {
    return dispatch => {
        const url = '/api/sdh/ts-info/lich-thi';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Tạo mới lịch thi bị lỗi', 'danger');
                console.error('POST: ' + url + '.', result.error);
            } else {
                T.notify('Tạo mới lịch thi thành công', 'success');
                const filter = { idDot, sort: 'ten_ASC' };
                dispatch(getSdhDanhSachLichThiPage(undefined, undefined, '', filter));
                done && done(result.item);
            }
        });
    };
}
export function updateSdhTsInfoLichThi(id, data, idDot, done) {
    return dispatch => {
        const url = '/api/sdh/ts-info/lich-thi';
        T.put(url, { id, data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Chỉnh sửa lịch thi bị lỗi', 'danger');
                console.error('PUT: ' + url + '.', result.error);
            } else {
                T.notify('Chỉnh sửa lịch thi thành công', 'success');
                const filter = { idDot, sort: 'ten_ASC' };
                dispatch(getSdhDanhSachLichThiPage(undefined, undefined, '', filter));
                done && done();
            }
        });
    };
}
export function deleteSdhTsInfoLichThi(id, idDot, done) {
    return dispatch => {
        const url = '/api/sdh/ts-info/lich-thi';
        T.delete(url, { id }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Xóa lịch thi bị lỗi', 'danger');
                console.error('PUT: ' + url + '.', result.error);
            } else {
                T.notify('Xóa lịch thi thành công', 'success');
                const filter = { idDot, sort: 'ten_ASC' };
                dispatch(getSdhDanhSachLichThiPage(undefined, undefined, '', filter));
                done && done();
            }
        });
    };
}
export function deleteSdhTsInfoLichThiMultiple(listId, idDot, done) {
    return dispatch => {
        const url = '/api/sdh/ts-info/lich-thi/multiple';
        T.delete(url, { listId }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Xóa lịch thi bị lỗi', 'danger');
                console.error('PUT: ' + url + '.', result.error);
            } else {
                T.notify('Xóa các lịch thi thành công', 'success');
                const filter = { idDot, sort: 'ten_ASC' };
                dispatch(getSdhDanhSachLichThiPage(undefined, undefined, '', filter));
                done && done();
            }
        });
    };
}
export function getSdhTsInfoLichThiById(idLichThi, done) {
    return () => {
        const url = `/api/sdh/ts-info/lich-thi/item/:${idLichThi}`;
        T.get(url, result => {
            if (result.error) {
                T.notify(result.error.message || 'Lấy thông tin phòng thi bị lỗi', 'danger');
                console.error('GET: ' + url + '.', result.error);
            } else {
                done && done(result.item);
            }
        });
    };
}
export const PageName = 'pageSdhDanhSachLichThi';
T.initPage(PageName);
export function getSdhDanhSachLichThiPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/sdh/ts-info/lich-thi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách lịch thi tuyển sinh không thành công' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                dispatch({ type: SdhTsLichThiGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}
export function getDanhSachThiSinh(filter, done) {
    return () => {
        const url = '/api/sdh/ts-info/lich-thi/danh-sach-thi-sinh';
        T.get(url, { filter }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Lấy thông tin phòng thi bị lỗi', 'danger');
                console.error('GET: ' + url + '.', result.error);
            } else {
                done && done(result.items);
            }
        });
    };
}
export function getDanhSachMonThi(dataPhong, dataNganh, done) {
    return () => {
        const url = '/api/sdh/ts-info/lich-thi/danh-sach-mon-thi';
        T.get(url, { dataPhong, dataNganh }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Lấy thông tin môn thi bị lỗi', 'danger');
                console.error('GET: ' + url + '.', result.error);
            } else {
                done && done(result);
            }
        });
    };
}
export const UnScheduledPageName = 'PageUnScheduledList';
T.initPage(UnScheduledPageName);
export function getUnScheduledList(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage(UnScheduledPageName, pageNumber, pageSize, pageCondition, filter);
    return () => {
        const url = `/api/sdh/ts-info/lich-thi/chua-xep/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách lịch thi tuyển sinh không thành công' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                done && done(data.page);
            }
        });
    };
}
export function createSdhTsInfoLichThiMultiple(data, idDot, done) {
    return dispatch => {
        const url = '/api/sdh/ts-info/lich-thi/multiple';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Tạo mới lịch thi bị lỗi', 'danger');
                console.error('POST: ' + url + '.', result.error);
            } else {
                T.notify('Tạo mới lịch thi thành công', 'success');
                const filter = { idDot, sort: 'ten_ASC' };
                dispatch(getSdhDanhSachLichThiPage(undefined, undefined, '', filter));
                done && done(result.item);
            }
        });
    };
}
export function getDataMonThi(data, done) {
    return () => {
        const url = '/api/sdh/ts-info/lich-thi/transferData';
        T.get(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Lấy thông tin danh sách thí sinh bị lỗi', 'danger');
                console.error('GET: ' + url + '.', result.error);
            } else {
                done && done(result.items);
            }
        });
    };
}
export function getRoomForSingleCandidate(data, done) {
    return () => {
        const url = '/api/sdh/ts-info/lich-thi/single';
        T.get(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Lấy thông tin danh sách phòng thi phù hợp bị lỗi', 'danger');
                console.error('GET: ' + url + '.', result.error);
            } else {
                done && done(result.items);
            }
        });
    };
}
export function createSdhTsInfoLichThiMultipleNew(data, done) {
    return () => {
        const url = '/api/sdh/ts-info/lich-thi/multiple/new';
        T.post(url, { duLieu: data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Tạo mới lịch thi bị lỗi', 'danger');
                console.error('POST: ' + url + '.', result.error);
            } else {
                T.notify('Tạo mới lịch thi thành công', 'success');
                done && done();
            }
        });
    };
}
export function exportScanDanhSachDanPhong(data, done) {
    return () => {
        T.get('/api/sdh/ts/lich-thi/danh-sach-thi-sinh/export', { data }, result => {
            if (result.error) {
                T.alert('Xử lý thất bại', 'danger', false, 2000);
            }
        });
        done && done();
    };
}

export function createSingleCandidateIntoRoom(data, done) {
    return () => {
        const url = '/api/sdh/ts-info/thi-sinh/single';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(result.error.message || 'Thêm thí sinh vào phòng thi bị lỗi', 'danger');
                console.error('POST: ' + url + '.', result.error);
            } else {
                done && done();
            }
        });
    };
}

export const SelectAdapter_MaTui = (filter) => {
    return {
        ajax: true,
        url: '/api/sdh/ts/lich-thi/ma-tui/all',
        data: params => ({ searchTerm: params.term || '', filter }),
        processResults: response => {
            let results = response.items || [];
            if (response.searchTerm) {
                let st = response.searchTerm;
                results = results.filter(i => i.ten.toLowerCase().includes(st.toLowerCase()));
            }
            return { results: results.map(item => ({ id: item.maTui, text: `${item.maTui}: ${item.tenMon} ${item.kyNang || ''}`, maMon: item.maMon })) };
        }
    };
};