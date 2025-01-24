import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const SvDssvHocBongKkhtConLaiSetNull = 'SvDssvHocBongKkhtConLai:SetNull';
const SvDssvHocBongKkhtGetAll = 'svDssvHocBongKkht:GetAll';
const SvDssvHocBongKkhtGetPageChinhThuc = 'svDssvHocBongKkht:GetPageChinhThuc';
const SvDssvHocBongKkhtGetPageDuKien = 'svDssvHocBongKkht:GetPageDuKien';
const SvDssvHocBongKkhtUpdate = 'svDssvHocBongKkht:Update';
const SvDssvHocBongKkhtGetPageConLai = 'SvDssvHocBongKkht:GetPageConLai';
const SvDssvHocBongKkhtGetPage = 'SvDssvHocBongKkht:GetPage';

export default function svDssvHocBongKkhtReducer(state = null, data) {
    switch (data.type) {
        case SvDssvHocBongKkhtConLaiSetNull:
            return Object.assign({}, state, { pageConLai: null });
        case SvDssvHocBongKkhtGetAll:
            return Object.assign({}, state, { items: data.items });
        case SvDssvHocBongKkhtGetPageDuKien:
            return Object.assign({}, state, { pageDuKien: data.page });
        case SvDssvHocBongKkhtGetPageChinhThuc:
            return Object.assign({}, state, { listChinhThuc: data.listChinhThuc });
        case SvDssvHocBongKkhtGetPageConLai:
            return Object.assign({}, state, { pageConLai: data.pageConLai });
        case SvDssvHocBongKkhtGetPage: {
            let { listChinhThuc, pageConLai } = data;
            listChinhThuc = listChinhThuc ?? state.listChinhThuc;
            pageConLai = pageConLai ?? state.pageConLai;
            return Object.assign({}, state, { listChinhThuc, pageConLai });
        }
        case SvDssvHocBongKkhtUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].ma == updatedItem.ma) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].ma == updatedItem.ma) {
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

T.initPage('pageSvDssvHocBongKkhtDuKien');
export function getSvDssvHocBongKkhtPageDuKien(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageSvDssvHocBongKkhtDuKien', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/ctsv/dssv-hoc-bong/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sinh viên bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: SvDssvHocBongKkhtGetPageDuKien, page: data.page });
                done && done(data.page);
            }
        });
    };
}

// T.initPage('pageSvDssvHocBongKkhtChinhThuc');
export function getSvDssvHocBongKkhtPageChinhThuc(idLichSu, filter, done) {
    // const page = T.updatePage('pageSvDssvHocBongKkhtDuKien', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = '/api/ctsv/lich-su-hbkk/danh-sach-hoc-bong';
        T.get(url, { idLichSu, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sinh viên bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: SvDssvHocBongKkhtGetPageChinhThuc, listChinhThuc: data.items });
                done && done(data.items);
            }
        });
    };
}


T.initPage('pageSvDssvHocBongKkhtConLai');
export function getSvDssvHocBongKkhtPageConLai(idLichSu, pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageSvDssvHocBongKkhtConLai', pageNumber, pageSize, pageCondition, filter);
    return (dispatch) => {
        dispatch({ type: SvDssvHocBongKkhtConLaiSetNull });
        const url = `/api/ctsv/lich-su-hbkk/danh-sach-con-lai/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { idLichSu, condition: page.pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sinh viên bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: SvDssvHocBongKkhtGetPageConLai, pageConLai: data.page });
                done && done(data.page);
            }
        });
    };
}

export function ctsvHocBongPhanBoConLai(idLichSu, done) {
    return () => {
        const url = '/api/ctsv/lich-su-hbkk/phan-bo-con-lai';
        T.put(url, { idLichSu }, res => {
            if (res.error) {
                T.alert(res.error.message || 'Phân bổ bị lỗi', 'error', null, 3000);
                // T.notify(res.error.message || 'Phân bổ bị lỗi', 'danger');
                console.error('PUT: ', res.error);
            } else {
                // T.notify(`Đã phân bổ học bổng cho ${res.soLuongSinhVien} sinh viên!`);
                T.alert('Phân bổ thành công!', 'success', null, 3000);
                done && done(res.page);
            }
        }, () => T.alert('Phân bổ bị lỗi', 'error', null, 3000));
    };
}
