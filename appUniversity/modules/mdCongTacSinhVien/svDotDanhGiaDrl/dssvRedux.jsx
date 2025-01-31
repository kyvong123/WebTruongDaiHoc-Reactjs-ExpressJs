import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const SvDssvDotDanhGiaDrlGetAll = 'svDssvDotDanhGiaDrl:GetAll';
const SvDssvDotDanhGiaDrlGetPage = 'svDssvDotDanhGiaDrl:GetPage';
const SvDssvDotDanhGiaDrlUpdate = 'svDssvDotDanhGiaDrl:Update';



export default function SvDssvDotDanhGiaDrlReducer(state = null, data) {
    switch (data.type) {
        case SvDssvDotDanhGiaDrlGetAll:
            return Object.assign({}, state, { items: data.items });
        case SvDssvDotDanhGiaDrlGetPage:
            return Object.assign({}, state, { page: data.page });
        case SvDssvDotDanhGiaDrlUpdate:
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

T.initPage('pageSvDssvDotDanhGiaDrl');
export function getSvDssvDotDanhGiaDrlPage(pageNumber, pageSize, pageCondition, filter, idDot, done) {
    const page = T.updatePage('pageSvDssvDotDanhGiaDrl', pageNumber, pageSize, pageCondition, filter, idDot);
    return dispatch => {
        const url = `/api/ctsv/dssv-dot-danh-gia-drl/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter, idDot }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sinh viên bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: SvDssvDotDanhGiaDrlGetPage, page: data.page });
                done && done(data.page);
            }
        });
    };
}

export function createListSV(data, done) {
    return () => {
        const url = '/api/ctsv/dssv-dot-danh-gia-drl/list';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Thêm danh sách sinh viên bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                T.notify('Thêm danh sách sinh viên thành công!', 'success');
                done && done(data);
            }
        });
    };
}

export function updateSvDssvDotDanhGiaDrl({ mssv, namHoc, hocKy }, changes, done) {
    return dispatch => {
        const url = '/api/ctsv/dssv-dot-danh-gia-drl';
        T.put(url, { mssv, namHoc, hocKy, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật danh sách sinh viên bị lỗi!', 'danger');
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật danh sách sinh viên thành công!', 'success');
                dispatch({ type: SvDssvDotDanhGiaDrlUpdate, item: data.item });
                done && done();
            }
        }, () => T.notify('Cập nhật danh sách sinh viên bị lỗi!', 'danger'));
    };
}

//Redux_Sinh_Vien_Dao_Tao----------------------------------------------------------------------------------------------------------------------------------
export function getStudentInfo(maSoSV, namHoc, hocKy, done) {
    return () => {
        const url = '/api/ctsv/dssv-dot-danh-gia-drl/checkDuplicated';
        T.get(url, { maSoSV, namHoc, hocKy }, data => {
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
