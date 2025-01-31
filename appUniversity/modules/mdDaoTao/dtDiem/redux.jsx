import T from 'view/js/common';
// Reducer ------------------------------------------------------------------------------------------------------------
const DtDiemGetAll = 'DtDiem:GetAll';
const DtDiemGetPage = 'DtDiem:GetPage';
const DtDiemNull = 'DtDiem:Null';
const DtDiemFolder = 'DtDiem:GetFolderList';
const DtDiemFolderScan = 'DtDiemFolderScan:GetAllById';
const DtDiemScanPage = 'DtDiemScan:GetPage';
const DtDiemScanGradeResult = 'DtDiemScan:GetGradeResult';
const UpdateGradeScanResult = 'DtDiemScan:UpdateGradeResult';
export default function dtDiemReducer(state = null, data) {
    switch (data.type) {
        case DtDiemScanGradeResult:
            return Object.assign({}, state, { gradeResult: data.items, scanResult: data.scanResult });
        case DtDiemNull:
            return Object.assign({});
        case DtDiemGetAll:
            return Object.assign({}, state, { items: data.items });
        case DtDiemGetPage:
            return Object.assign({}, state, { page: data.page });
        case DtDiemFolder:
            return Object.assign({}, { folderList: data.folderList, accessGradeData: data.accessGradeData, timeNow: data.timeNow });
        case DtDiemFolderScan:
            return Object.assign({}, state, { folderScanList: { ...state?.folderScanList, [data.idSemester]: data.listFolderScan } });
        case DtDiemScanPage:
            return Object.assign({}, state, { pageScan: data.items });
        case UpdateGradeScanResult: {
            return Object.assign({}, state, { gradeResult: data.items, scanResult: data.scanResult });
        }
        default:
            return state;
    }
}

//ACTIONS-------------------------------------------------------------------------------------------------------------
T.initPage('pageDtDiem');
export function getDtDiemPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageDtDiem', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/dt/diem/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách điểm bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: DtDiemGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}
export function getDtDiem(done) {
    return dispatch => {
        const url = '/api/dt/diem';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách điểm bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
                dispatch({ type: DtDiemGetAll, items: data.items ? data.items : [] });
            }
        }, () => T.notify('Lấy danh sách điểm bị lỗi!', 'danger'));
    };
}

export function createDtDiem(data, done) {
    return () => {
        const url = '/api/dt/diem';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Cập nhật điểm bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                done && done();
            }
        }, () => T.notify('Cập nhật điểm bị lỗi!', 'danger'));
    };
}

export function createDtDiemMultiple(data, done) {
    return () => {
        T.post('/api/dt/diem/multiple', { data }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message}`, 'danger');
            } else {
                T.notify('Tạo thành công', 'success');
                done && done(result);
            }
        });
    };
}

export function createDtDiemImportExcel(data, done) {
    return () => {
        T.post('/api/dt/diem/import-excel', { data }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message}`, 'danger');
            } else {
                T.notify('Tạo thành công', 'success');
                done && done(result);
            }
        });
    };
}

export function getAllDtDiemSemester(done) {
    return dispatch => {
        const url = '/api/dt/diem-semester';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi lấy dữ liệu năm học - học kỳ', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: DtDiemFolder, folderList: result.data, accessGradeData: result.accessGradeData, timeNow: result.now });
                done && done(result);
            }
        });
    };
}

export function getDtDiemSemesterActive(done) {
    return () => {
        const url = '/api/dt/diem-semester/get-active';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lỗi lấy dữ liệu năm học - học kỳ', 'danger');
                console.error(result.error);
            } else {
                done && done(result.dataSem);
            }
        });
    };
}

export function deleteDtDiemScanGradeResult(idResult, done) {
    return () => {
        const url = '/api/dt/diem-scan-grade-result/delete-data';
        T.delete(url, { idResult }, result => {
            if (result.error) {
                T.notify('Lỗi xóa dữ liệu scan', 'danger');
                console.error(result.error);
            } else {
                done && done(result);
            }
        });
    };
}

export function checkValidPassword(data, done) {
    const url = '/api/dt/diem-semester/check-valid-pass';
    T.get(url, { data }, result => {
        if (result.error) {
            T.alert('Sai mật khẩu', 'error', false, 2000);
            console.error(result.error);
        } else {
            done && done(result);
        }
    });
}

export function getAllDtDiemFolderScan(idSemester, done) {
    return dispatch => {
        const url = '/api/dt/diem/folder-scan';
        T.get(url, { idSemester }, ({ error, items }) => {
            if (error) {
                console.error(error);
                T.notify(error.message || 'Lỗi lấy dữ liệu gói scan', 'danger');
            } else {
                dispatch({ type: DtDiemFolderScan, listFolderScan: items, idSemester });
                done && done(items);
            }
        }, (error) => console.error(error));
    };
}

export function createDtDiemFolderScan(idSemester, data, done) {
    return dispatch => {
        const url = '/api/dt/diem/folder-scan';
        T.post(url, { idSemester, data }, ({ error }) => {
            if (error) {
                console.error(error);
                T.notify(error.message || 'Tạo các gói scan lỗi', 'danger');
            } else {
                T.notify('Tạo gói thành công', 'success');
                dispatch(getAllDtDiemFolderScan(idSemester, done));
            }
        }, (error) => console.error(error));
    };
}

export function checkStatusDtDiemScanFile(listMaHocPhan, done) {
    return () => {
        const url = '/api/dt/diem-scan/check-status';
        T.post(url, { listMaHocPhan }, ({ error, items }) => {
            if (error) {
                console.error(error);
                T.notify('Lỗi kiểm tra tình trạng file scan', 'danger');
            } else {
                done && done({ items });
            }
        }, (error) => console.error(error));
    };
}

export function exportScanFileDtThoiKhoaBieu(data, done) {
    return () => {
        T.get('/api/dt/diem/export-scan', { data }, result => {
            if (result.error) {
                T.alert('Xử lý thất bại', 'danger', false, 2000);
            }
        });
        done && done();
    };
}

export function getListScanResult(filter, done) {
    return dispatch => {
        const url = '/api/dt/diem/folder-scan/page-file';
        T.get(url, { filter }, ({ error, items }) => {
            if (error) {
                T.notify('Lấy dữ liệu lỗi', 'danger');
            } else {
                dispatch({ type: DtDiemScanPage, items });
                done && done(items);
            }
        }, (error) => console.error(error));
    };
}

export function getScanGradeResult(filter, done) {
    return dispatch => {
        const url = '/api/dt/diem/folder-scan/grade-result';
        T.get(url, { filter }, ({ error, items, scanResult }) => {
            if (error) {
                T.notify('Lấy dữ liệu điểm đã scan bị lỗi', 'danger');
                console.error(error);
            } else {
                dispatch({ type: DtDiemScanGradeResult, items, scanResult });
                done && done({ items, scanResult });
            }
        });
    };
}

export function saveScanResults(data, done) {
    return () => {
        const url = '/api/dt/diem/folder-scan/scan-save';
        T.post(url, { data }, (result) => {
            if (result.error) {
                T.notify('Lấy dữ liệu điểm đã scan bị lỗi', 'danger');
                console.error(result.error);
            } else {
                done && done(result);
            }
        });
    };
}

export function getDtSemesterDiem(id, done) {
    return () => {
        const url = `/api/dt/diem-semester/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function updateMultiHinhThuc(dataHT, dataHP, done) {
    return () => {
        const url = '/api/dt/diem/multi/hinh-thuc-thi';
        T.post(url, { dataHT, dataHP }, (result) => {
            if (result.error) {
                T.notify('Cập nhật hình thức bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật hình thức thành công', 'success');
                done && done(result);
            }
        });
    };
}

export function updateTinhTrangDiem(listHP, changes, done) {
    return dispatch => {
        const cookie = T.updatePage('pageDtDiem');
        const { pageNumber, pageSize, pageCondition, filter } = cookie;
        const url = '/api/dt/diem/tinh-trang';
        T.put(url, { listHP, changes }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message}`, 'danger');
                done && done(result);
            } else {
                dispatch(getDtDiemPage(pageNumber, pageSize, pageCondition, filter));
                done && done(result);
            }
        }, () => T.notify('Cập nhật tình trạng bị lỗi'));
    };
}

export function updateThanhPhanDiemMulti(listHP, listDiem, done) {
    return dispatch => {
        const cookie = T.updatePage('pageDtDiem');
        const { pageNumber, pageSize, pageCondition, filter } = cookie;
        const url = '/api/dt/diem/thanh-phan-multi';
        T.put(url, { listHP, listDiem }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message}`, 'danger');
                done && done(result);
            } else {
                done && done(result);
                dispatch(getDtDiemPage(pageNumber, pageSize, pageCondition, filter));
            }
        }, () => T.notify('Cập nhật thành phần điểm bị lỗi'));
    };
}

export const SelectAdapter_SemesterDiem = {
    ajax: true,
    url: '/api/dt/diem-semester/semester',
    data: params => ({ searchTerm: params.term || '' }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.id, text: `${item.namHoc}: HK${item.hocKy}`, data: item })) : [] }),
    fetchOne: (id, done) => (getDtSemesterDiem(id, item => done && done({ id: item.id, text: `${item.namHoc}: HK${item.hocKy}`, item })))(),
};