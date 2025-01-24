import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const HcthPhanCapQuySoGetPage = 'HcthPhanCapQuySo:GetPage';

export default function hcthPhanCapQuySoGetPageReducer(state = null, data) {
    switch (data.type) {
        case HcthPhanCapQuySoGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
// T.initPage('hcthPhanCapQuySoGetPage', true);
const pageName = 'pageHcthPhanCapQuySo';
T.initPage(pageName);

export function getHcthPhanCapQuySoPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage(pageName, pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/hcth/phan-cap-quy-so/page/${page.pageNumber}/${page.pageSize}`;
        dispatch({ type: HcthPhanCapQuySoGetPage, page: null });
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách phân cấp quỹ số lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {      
                done && done(data.page);            
                dispatch({ type: HcthPhanCapQuySoGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách phân cấp quỹ số lỗi', 'danger'));
    };
}

export function createHcthPhanCapQuySo(data, done, onFinish) {
    return dispatch => {
        const url = '/api/hcth/phan-cap-quy-so';
        T.post(url, { data }, data => {
            onFinish && onFinish();
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo phân cấp quỹ số bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới phân cấp quỹ số thành công!', 'success');
                dispatch(getHcthPhanCapQuySoPage());
                done && done(data);
            }
        }, (error) => T.notify('Tạo phân cấp quỹ số bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateHcthPhanCapQuySo(ma, changes, done, onFinish) {
    return dispatch => {
        const url = `/api/hcth/phan-cap-quy-so/item/${ma}`;
        T.put(url, { changes }, data => {
            onFinish && onFinish();
            if (data.error) {
                T.notify('Cập nhật phân cấp quỹ số bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật phân cấp quỹ số thành công!', 'success');
                done && done(data.item);
                dispatch(getHcthPhanCapQuySoPage());
            }
        }, (error) => T.notify('Cập nhật phân cấp quỹ số bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteHcthPhanCapQuySo(maDonVi, done, onFinish) {
    return dispatch => {
        const url = `/api/hcth/phan-cap-quy-so/${maDonVi}`;
        T.delete(url, data => {
            onFinish && onFinish();
            if (data.error) {
                T.notify('Xóa phân cấp quỹ số bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa phân cấp quỹ số thành công!', 'success', false, 800);
                dispatch(getHcthPhanCapQuySoPage());
            }
            done && done();
        }, () => T.notify('Xóa phân cấp quỹ số bị lỗi!', 'danger'));
    };
}