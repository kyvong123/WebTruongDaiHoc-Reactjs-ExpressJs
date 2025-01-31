import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const SvDmNoiNhanFormGetPage = 'SvDmNoiNhanForm:GetPage';

export default function dmNoiNhanFormReducer(state = null, data) {
    switch (data.type) {
        case SvDmNoiNhanFormGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('dmNoiNhanFormPage', true);
export function getSvDmNoiNhanFormPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('dmNoiNhanFormPage', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/ctsv/dm-noi-nhan-form/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách danh mục nơi nhận bị lỗi ' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: SvDmNoiNhanFormGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách danh mục nơi nhận bị lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function createSvDmNoiNhanForm(dmNoiNhanForm, done) {
    return dispatch => {
        const url = '/api/ctsv/dm-noi-nhan-form';
        T.post(url, { dmNoiNhanForm }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo mới một danh mục nơi nhận bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới một danh mục nơi nhận thành công!', 'success');
                dispatch(getSvDmNoiNhanFormPage());
                done && done(data);
            }
        }, (error) => T.notify('Tạo mới một danh mục nơi nhận bị lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateSvDmNoiNhanForm(id, changes, done) {
    return dispatch => {
        const url = '/api/ctsv/dm-noi-nhan-form';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu danh mục nơi nhận bị lỗi ' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật dữ liệu danh mục nơi nhận thành công!', 'success');
                done && done(data.item);
                dispatch(getSvDmNoiNhanFormPage());
            }
        }, (error) => T.notify('Cập nhật dữ liệu danh mục nơi nhận bị lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteSvDmNoiNhanForm(id, done) {
    return dispatch => {
        const url = '/api/ctsv/dm-noi-nhan-form/delete';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa danh mục nơi nhận bị lỗi ' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa danh mục nơi nhận thành công!', 'success', false, 800);
                dispatch(getSvDmNoiNhanFormPage());
            }
            done && done();
        }, () => T.notify('Xóa danh mục nơi nhận bị lỗi!', 'danger'));
    };
}

//  USER ---------------------------------------------------------

export const SelectAdapter_DmNoiNhanForm = {
    ajax: true,
    url: '/api/ctsv/dm-noi-nhan-form/page/1/25',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.id, text: `${item.ghiChu}` })) : [] }),
};