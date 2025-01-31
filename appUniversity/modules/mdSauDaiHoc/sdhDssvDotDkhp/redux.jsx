import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const SdhDssvTrongDotDkhpGetAll = 'SdhDssvTrongDotDkhp:GetAll';
const SdhDssvTrongDotDkhpGetPage = 'SdhDssvTrongDotDkhp:GetPage';
const SdhDssvTrongDotDkhpUpdate = 'SdhDssvTrongDotDkhp:Update';

export default function SdhDssvTrongDotDkhpReducer(state = null, data) {
    switch (data.type) {
        case SdhDssvTrongDotDkhpGetAll:
            return Object.assign({}, state, { items: data.items });
        case SdhDssvTrongDotDkhpGetPage:
            return Object.assign({}, state, { page: data.page });
        case SdhDssvTrongDotDkhpUpdate:
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
export function getSdhDssvTrongDotDkhpAll(condition, done) {
    if (typeof condition === 'function') {
        done = condition;
        condition = {};
    }
    return dispatch => {
        const url = '/api/sdh/dssv-trong-dot-dkhp/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách cấu hình đợt đăng ký học phần bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.data);
                dispatch({ type: SdhDssvTrongDotDkhpGetAll, items: data.data ? data.data : [] });
            }
        });
    };
}

T.initPage('pageSdhDssvTrongDotDkhp');
export function getSdhDssvTrongDotDkhpPage(pageNumber, pageSize, pageCondition, filter, iddot, done) {
    const page = T.updatePage('pageSdhDssvTrongDotDkhp', pageNumber, pageSize, pageCondition, filter, iddot);
    return dispatch => {
        const url = `/api/sdh/dssv-trong-dot-dkhp/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter, iddot }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sinh viên bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: SdhDssvTrongDotDkhpGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function getSdhDssvTrongDotDkhpAllSv(list, done) {
    return () => {
        const url = '/api/sdh/dssv-trong-dot-dkhp/dssv';
        T.get(url, { list }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sinh viên bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.items);
            }
        });
    };
}

export function getStudent(list, done) {
    return () => {
        const url = '/api/sdh/dssv-trong-dot-dkhp/sinh-vien';
        T.get(url, { list }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sinh viên bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.listSV);
            }
        });
    };
}


export function createSdhDssvTrongDotDkhp(item, done) {
    return dispatch => {
        const url = '/api/sdh/dssv-trong-dot-dkhp';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo danh sách sinh viên bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                T.notify('Tạo tạo danh sách sinh viên thành công!', 'success');
                dispatch(getSdhDssvTrongDotDkhpAll());
            }
            done && done(data);
        });
    };
}

export function createListSVSdh(data, done) {
    return dispatch => {
        const url = '/api/sdh/dssv-trong-dot-dkhp/list';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Thêm danh sách sinh viên bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                T.notify('Thêm danh sách sinh viên thành công!', 'success');
                dispatch(getSdhDssvTrongDotDkhpAll());
                done && done(data);
            }
        });
    };
}

export function deleteSdhDssvTrongDotDkhp(id, done) {
    return dispatch => {
        const url = '/api/sdh/dssv-trong-dot-dkhp';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa danh sách sinh viên bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh sách sinh viên đã xóa thành công!', 'success', false, 800);
                dispatch({ type: SdhDssvTrongDotDkhpUpdate, item: { id } });
            }
            done && done();
        }, () => T.notify('Xóa danh sách sinh viên bị lỗi!', 'danger'));
    };
}

export function updateSdhDssvTrongDotDkhp(changes, item, done) {
    return dispatch => {
        const url = '/api/sdh/dssv-trong-dot-dkhp';
        T.put(url, { changes, item }, data => {
            if (data.error) {
                T.notify('Cập nhật danh sách sinh viên bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật danh sách sinh viên thành công!', 'success');
                dispatch({ type: SdhDssvTrongDotDkhpUpdate, item: data.item });
                done && done();
            }
        }, () => T.notify('Cập nhật danh sách sinh viên bị lỗi!', 'danger'));
    };
}


export function getSdhDssvTrongDotDkhp(id, done) {
    return () => {
        const url = `/api/sdh/dssv-trong-dot-dkhp/item/${id}`;
        T.get(url, { id }, data => {
            if (data.error) {
                T.notify('Lấy anh sách sinh viên bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}


//Redux_Sinh_Vien_----------------------------------------------------------------------------------------------------------------------------------
export function getStudentSdhInfo(maSoSV, ngayBatDau, ngayKetThuc, done) {
    return () => {
        const url = '/api/sdh/dssv-trong-dot-dkhp/checkDuplicated';
        T.get(url, { maSoSV, ngayBatDau, ngayKetThuc }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Kiểm tra sinh viên bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
                // dispatch({ type: sinhVienGetEditPage, items: data.items });
            }
        });
    };
}

export const SelectAdapter_DanhSachSinhVienSdh = {
    ajax: true,
    url: '/api/sdh/dssv-trong-dot-dkhp/student/1/20',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.mssv, text: `${item.mssv}: ${item.ho} ${item.ten}` })) : [] }),
    // fetchOne: (mssv, done) => (getStudentAdmin(mssv, item => done && done({ id: item.mssv, text: `${item.mssv}: ${item.ho} ${item.ten}` })))(),
};