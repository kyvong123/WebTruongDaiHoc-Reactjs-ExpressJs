import T from 'view/js/common';

const svDmFormTypeGetAll = 'svDmFormType:GetAll';
export default function ctsvDmFormTypeReducers(state = null, data) {
    switch (data.type) {
        case svDmFormTypeGetAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return null;
    }
}

export function getAllSvDmFormType(year, done) {
    return dispatch => {
        const url = '/api/ctsv/form-type/all';
        T.get(url, { year }, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu biểu mẫu lỗi', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: svDmFormTypeGetAll, items: result.items });
                done && done(result.items);
            }
        });
    };
}

export function getSvDmFormType(ma, done) {
    return () => {
        const url = '/api/ctsv/form-type/item';
        T.get(url, { ma }, result => {
            if (result.error) {
                T.notify('Lấy biểu mẫu bị lỗi', 'danger');
            } else {
                done && done(result.item);
            }
        });
    };
}

export function createSvDmFormType(data, done) {
    return dispatch => {
        const url = '/api/ctsv/form-type';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Tạo biểu mẫu lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Tạo biểu mẫu thành công', 'success');
                dispatch(getAllSvDmFormType(data.namHoc));
                done && done(result.items);
            }
        });
    };
}

export function updateSvDmFormType(ma, changes, done) {
    return dispatch => {
        const url = '/api/ctsv/form-type';
        T.put(url, { ma, changes }, result => {
            if (result.error) {
                T.notify('Cập nhật biểu mẫu lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật biểu mẫu thành công', 'success');
                dispatch(getAllSvDmFormType(changes.namHoc));
                done && done(result.item);
            }
        });
    };
}

export function createFormTypeMultiple(data, done) {
    return () => {
        const url = '/api/ctsv/form-type/multiple';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Lỗi sao chép form tự động!', 'danger');
                console.error(result.error);
            } else {
                T.notify('Sao chép form tự động thành công!', 'success');
                done && done(result.dataCreate);
            }
        });
    };
}

export const SelectAdapter_CtsvDmFormType = (namHoc, kieuForm) => ({
    ajax: true,
    url: '/api/ctsv/form-type/adapter',
    data: params => ({ condition: params.term, kieuForm, namHoc }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: `${item.ten} (${item.namHoc})`, ten: item.ten, customParam: item.customParam, nProcessDay: item.nProcessDay })) : [] }),
    fetchOne: (ma, done) => (getSvDmFormType(ma, item => done && done({ id: item.ma, text: `${item.ten} (${item.namHoc})`, nProcessDay: item.nProcessDay })))(),
});

export const SelectAdapter_CtsvDmFormTypeQuyetDinh = (namHoc, kieuForm) => ({
    ajax: true,
    url: '/api/ctsv/form-type/quyet-dinh',
    data: params => ({ condition: params.term, kieuForm, namHoc }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: `${item.ten} (${item.namHoc})` })) : [] }),
    fetchOne: (ma, done) => (getSvDmFormType(ma, item => done && done({ id: item.ma, text: `${item.ten} (${item.namHoc})`, })))(),
});

// Config redux
export function updateFormTypeConfig(changes, done) {
    const url = '/user/ctsv/category-forms/cau-hinh';
    T.put(url, { changes }, res => {
        if (res.error) {
            console.error('PUT: ', res.error);
            T.notify('Cập nhật cấu hình bị lỗi!', 'danger');
        } else {
            T.notify('Cập nhật cấu hình thành công!', 'success');
            done && done(res.items);
        }
    });
}

export const SelectAdapter_CtsvDmFormTypeParamType = [
    { id: 1, text: 'Chữ' },
    { id: 2, text: 'Lựa chọn' },
    { id: 3, text: 'Mảng' },
    { id: 4, text: 'Bảng' },
    { id: 5, text: 'Danh sách SV' },
    { id: 6, text: 'Ngày' },
    { id: 8, text: 'Bảng điểm rèn luyện' },
];