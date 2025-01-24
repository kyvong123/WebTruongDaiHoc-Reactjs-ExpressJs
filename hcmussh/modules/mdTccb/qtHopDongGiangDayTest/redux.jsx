import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const QTHopDongGiangDayTestGetPage = 'QTHopDongGiangDayTest:GetPage';
const HocPhanGiangDayGetPage = 'QTHopDongGiangDayTest:GetHocPhanPage';
const QTHopDongGiangDayTestGet = 'QTHopDongGiangDayTest:Get';
const QTHopDongGiangDayTestUpdate = 'QTHopDongGiangDayTest:Update';
const UserGetQTHopDongGiangDayTest = 'QTHopDongGiangDayTest:UserGet';

export default function qtHopDongGiangDayTestReducer(state = null, data) {
    switch (data.type) {
        case HocPhanGiangDayGetPage:
            return Object.assign({}, state, { page: data.hocPhanPage });
        case QTHopDongGiangDayTestGetPage:
            return Object.assign({}, state, { page: data.page });
        case QTHopDongGiangDayTestGet:
            return Object.assign({}, state, { dataQTHopDongGiangDayTest: data.item });
        case QTHopDongGiangDayTestUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].shcc == updatedItem.shcc) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].shcc == updatedItem.shcc) {
                            updatedPage.list.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                return Object.assign({}, state, { items: updatedItems, page: updatedPage });
            } else {
                return null;
            }
        case UserGetQTHopDongGiangDayTest:
            return Object.assign({}, state, { userItem: data.item });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export const PageName = 'qtHopDongGiangDayTestPage';
T.initPage(PageName);
export function getQTHopDongGiangDayTestPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/tccb/hop-dong-giang-day-test/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách hợp đồng bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: QTHopDongGiangDayTestGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách hợp đồng bị lỗi', 'danger'));
    };
}

export const HocPhanPageName = 'hocPhanGiangDayGetPage';
T.initPage(PageName);
export function getHocPhanGiangDayPage(pageNumber, pageSize, filter, done) {
    if (typeof filter === 'function') {
        filter = {};
    }
    const page = T.updatePage(HocPhanPageName, pageNumber, pageSize, filter);
    return dispatch => {
        const url = `/api/tccb/hop-dong-giang-day-test/thong-ke-hoc-phan/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách học phần bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                done && done(data.page);
                dispatch({ type: HocPhanGiangDayGetPage, hocPhanPage: data.page });
            }
        }, () => T.notify('Lấy danh sách học phần bị lỗi', 'danger'));
    };
}

export function getQTHopDongGiangDayTest(shcc, done) {
    return () => {
        const url = `/api/tccb/hop-dong-giang-day-test/item/${shcc}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin hợp đồng bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            }
            else if (done) {
                done(data);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getQTHopDongGiangDayTestAll(done) {
    return dispatch => {
        const url = '/api/tccb/hop-dong-giang-day-test/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách hợp đồng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
                dispatch({ type: QTHopDongGiangDayTestGetAll, items: data.items ? data.items : [] });
            }
        }, () => T.notify('Lấy danh sách hợp đồng bị lỗi!', 'danger'));
    };
}

export function getQTHopDongGiangDayTestEdit(ma, done) {
    return dispatch => {
        let condition = {};
        if (typeof ma == 'object') condition = ma;
        else condition = { ma };
        const url = `/api/tccb/hop-dong-giang-day-test/edit/item/${ma}`;
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy thông tin hợp đồng bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                dispatch({ type: QTHopDongGiangDayTestGet, item: data.item });
                done && done(data);
            }
        }, () => T.notify('Lấy thông tin hợp đồng bị lỗi', 'danger'));
    };
}

export function downloadWord(ma, maMauHopDong, done) {
    return () => {
        const url = `/api/tccb/hop-dong-giang-day-test/download-word/${ma}/${maMauHopDong}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Tải file world bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else if (done) {
                done && done(data);
            }
        }, error => T.notify('Tải file world bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteHopDongGiangDayTest(ma, done) {
    return dispatch => {
        const url = '/api/tccb/hop-dong-giang-day-test';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa hợp đồng bị lỗi', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa hợp đồng thành công!', 'success', false, 800);
                dispatch(getQTHopDongGiangDayTestPage());
            }
            done && done();
        }, () => T.notify('Xóa hợp đồng bị lỗi', 'danger'));
    };
}

export function createHopDongGiangDayTest(data, dataCanBo, done) {
    return () => {
        const url = '/api/tccb/hop-dong-giang-day-test';
        T.post(url, { data, dataCanBo }, res => {
            if (res.error) {
                T.notify('Tạo hợp đồng bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, res.error);
            } else {
                T.notify('Tạo hợp đồng thành công!', 'success');
                done && done();
            }
        }, () => T.notify('Tạo hợp đồng bị lỗi!', 'danger'));
    };
}

export function updateHopDongGiangDayTest(ma, changes, done) {
    return dispatch => {
        const url = '/api/tccb/hop-dong-giang-day-test';
        T.put(url, { ma, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật hợp đồng bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật hợp đồng thành công!', 'success');
                done && done(data.item);
                dispatch(getQTHopDongGiangDayTest(ma));
            }
        }, () => T.notify('Cập nhật hợp đồng bị lỗi!', 'danger'));
    };
}

export function exportExcelHocPhan(filter) {
    return () => {
        const url = ('/api/tccb/hop-dong-giang-day-test/hoc-phan-giang-day/download-excel');
        T.get(url, { filter }, (res) => {
            if (res.error) {
                T.notify('Tải học phần giảng dạy bị lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error(`GET: ${url}.`, res.error);
            } else {
                T.FileSaver(new Blob([new Uint8Array(res.buffer.data)]), res.filename);
            }
        }, (error) => T.notify('Tải học phần giảng dạy bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function exportExcel(filter, searchTerm) {
    return () => {
        const url = ('/api/tccb/hop-dong-giang-day-test/download-excel');
        T.get(url, { filter, searchTerm }, (res) => {
            if (res.error) {
                T.notify('Tải học phần giảng dạy bị lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error(`GET: ${url}.`, res.error);
            } else {
                T.FileSaver(new Blob([new Uint8Array(res.buffer.data)]), res.filename);
            }
        }, (error) => T.notify('Tải học phần giảng dạy bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateHocPhanGiangDay(maHocPhan, giangVien, changes, loaiHinhDaoTao, done) {
    return () => {
        const url = '/api/tccb/hoc-phan-giang-day-test';
        T.put(url, { maHocPhan, giangVien, changes, loaiHinhDaoTao }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật học phần bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật học phần giảng dạy thành công!', 'success');
                done && done();
            }
        }, () => T.notify('Cập nhật học phần bị lỗi!', 'danger'));
    };
}

export function updateChiaTiet(data, done) {
    return () => {
        const url = `/api/tccb/hoc-phan-giang-day-test/chia-tiet/change`;
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Chia tiết học phần bị lỗi !' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error(`POST: ${url}.`, res.error);
                done && done(res.error);
            } else {
                T.notify('Chia tiết học phần thành công!', 'success');
                done && done();
            }
        }, (error) => T.notify('Chia tiết học phần bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export const SelectAdapter_LoaiCanBo = {
    ajax: true,
    url: '/api/tccb/staff/loai-can-bo/all',
    data: params => ({ condition: params.term }),
    processResults: response => ({
        results: response ? response.map(item => ({
            id: item.ma, text: item.ten
        })) : []
    }),
    fetchOne: (ma, done) => (getLoaiCanBo(ma, ({ item }) => done && done({ id: item.ma, text: item.ten })))(),
};

export function getLoaiCanBo(ma, done) {
    return () => {
        const url = `/api/tccb/loai-can-bo/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin loại cán bộ bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            }
            else if (done) {
                done(data);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getHocPhanTheoCanBo(shcc, maMonHoc, done) {
    return () => {
        const url = `/api/tccb/hoc-phan-giang-day/${shcc}`;
        T.get(url, { maMonHoc }, data => {
            if (data.error) {
                T.notify('Lấy thông tin hoc phần giảng dạy bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            }
            else if (done) {
                done && done(data);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}
