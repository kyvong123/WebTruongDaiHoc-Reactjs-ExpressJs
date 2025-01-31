import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmDienDongBhytGetPage = 'DmDienDongBhyt:GetPage';
const DmDienDongBhytGetAll = 'DmDienDongBhyt:GetAll';

export default function dmDienDongBhytReducer(state = null, data) {
    switch (data.type) {
        case DmDienDongBhytGetPage:
            return Object.assign({}, state, { page: data.page });
        case DmDienDongBhytGetAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('dmDienDongBhytPage', true);
export function getDmDienDongBhytPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('dmDienDongBhytPage', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/ctsv/dm-dien-dong-bhyt/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách diện đóng BHYT bị lỗi ' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                done && done(data.page);
                dispatch({ type: DmDienDongBhytGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách diện đóng BHYT bị lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function geAlltDmDienDongBhyt(condition, done) {
    return dispatch => {
        const url = '/api/ctsv/dm-dien-dong-bhyt/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách diện đóng BHYT bị lỗi ' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
                dispatch({ type: DmDienDongBhytGetAll, items: data.items });
            }
        }, (error) => T.notify('Lấy danh sách diện đóng BHYT bị lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function createDmDienDongBhyt(dmDienDongBhyt, done) {
    return dispatch => {
        const url = '/api/ctsv/dm-dien-dong-bhyt';
        T.post(url, { dmDienDongBhyt }, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tạo mới một diện đóng BHYT bị lỗi!', 'danger');
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo mới một diện đóng thành công!', 'success');
                dispatch(getDmDienDongBhytPage());
                done && done(data);
            }
        }, (error) => T.notify('Tạo mới một diện đóng bị lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDmDienDongBhyt(ma, changes, done) {
    return dispatch => {
        const url = '/api/ctsv/dm-dien-dong-bhyt';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật dữ liệu diện đóng BHYT bị lỗi ' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Cập nhật dữ liệu diện đóng thành công!', 'success');
                done && done(data.item);
                dispatch(getDmDienDongBhytPage());
            }
        }, (error) => T.notify('Cập nhật dữ liệu diện đóng BHYT bị lỗi ' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDmDienDongBhyt(ma, done) {
    return dispatch => {
        const url = '/api/ctsv/dm-dien-dong-bhyt/delete';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa diện đóng BHYT bị lỗi ' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xóa diện đóng BHYT thành công!', 'success', false, 800);
                dispatch(getDmDienDongBhytPage());
            }
            done && done();
        }, () => T.notify('Xóa diện đóng BHYT bị lỗi!', 'danger'));
    };
}

export function getDmDienDongBhytItem(ma, done) {
    return () => {
        const url = `/api/ctsv/dm-dien-dong-bhyt/item/${ma}`;
        T.get(url, { ma }, data => {
            if (data.error) {
                T.notify('Lấy diện đóng BHYT bị lỗi ' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, () => T.notify('Lấy diện đóng BHYT bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_DmDienDongBhyt = {
    ajax: true,
    url: '/api/ctsv/dm-dien-dong-bhyt/all',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: `${item.ten} (${item.soTien.toString().numberDisplay()} đồng)` })) : [] }),
    fetchOne: (id, done) => (getDmDienDongBhytItem(id, item => done && done({ id: item.ma, text: `${item.ten} (${item.soTien.toString().numberDisplay()} đồng)` })))()
};