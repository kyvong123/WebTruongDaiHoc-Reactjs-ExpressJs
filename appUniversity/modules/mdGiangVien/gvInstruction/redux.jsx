import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------

export default function hcthInstructionReducer(state = null, data) {
    switch (data.type) {
        default:
            return state;
    }
}

// Actions ----------------------------------------------------------------------------------------------------
T.initPage('gvInstructionPage');
export function getInstructionPage(pageNumber, pageSize, done) {
    const page = T.updatePage('gvInstructionPage', pageNumber, pageSize);
    return () => {
        const url = `/api/dt/gv/instruction/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách hướng dẫn bị lỗi', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data.page);
            }
        }, () => T.notify('Lấy danh sách hướng dẫn bị lỗi!', 'danger'));
    };
}

export function getInstruction(id, done) {
    return () => {
        const url = `/api/dt/gv/instruction/${id}`;
        T.get(url, res => {
            if (res.error) {
                T.notify('Lấy hướng dẫn bị lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error('GET: ' + url + '.', res.error);
            } else {
                T.notify('Lấy hướng dẫn thành công', 'success');
                done && done(res.item);
            }
        });
    };
}

export function updateInstruction(id, changes, done) {
    return () => {
        const url = '/api/dt/gv/instruction';
        T.put(url, { id, changes }, res => {
            if (res.error) {
                T.notify('Cập nhật hướng dẫn sử dụng bị lỗi', 'danger');
                console.error(`PUT ${url}. ${res.error}`);
            } else {
                T.notify('Cập nhật hướng dẫn sử dụng thành công', 'success');
                done && done(res.item);
            }
        });
    };
}

export function createInstruction(data, done) {
    return () => {
        const url = '/api/dt/gv/instruction';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm hướng dẫn sử dụng bị lỗi', 'danger');
                console.error('POST: ' + url + '.', res.error);
            } else {
                T.notify('Thêm hướng dẫn sử dụng thành công', 'success');
                done && done(data);
            }
        }, () => T.notify('Thêm hướng dẫn sử dụng bị lỗi!', 'danger'));
    };
}
