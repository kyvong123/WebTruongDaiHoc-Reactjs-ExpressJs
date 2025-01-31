import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const HcthQuySoGetAll = 'HcthQuySo:GetAll';

export default function hcthQuySo(state = null, data) {
    switch (data.type) {
        case HcthQuySoGetAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
// T.initPage('hcthPhanCapQuySoGetPage', true);

export function getAllQuySo(done, onFinish, onError) {
    return (dispatch) => {
        const url = '/api/hcth/quy-so/all';
        T.get(url,
            (res) => {
                onFinish && onFinish();
                if (res.error) {
                    console.error('GET:', url, res.error);
                    T.notify('Lấy danh sách quỹ số lỗi. ' + (res.error.message ? res.error.message : res.error), 'danger');
                    onError && onError();
                } else {
                    dispatch({ type: HcthQuySoGetAll, items: res.items });
                    done && done(res.items);
                }
            },
            () => {
                onFinish && onFinish();
                onError && onError();
                T.notify('Lấy danh sách quỹ số lỗi. ', 'danger');
            });
    };
}

export function getQuySo(ma, done, onFinish, onError) {
    return () => {
        const url = '/api/hcth/quy-so/' + ma;
        T.get(url,
            (res) => {
                onFinish && onFinish();
                if (res.error) {
                    console.error('GET:', url, res.error);
                    T.notify('Lấy thông tin quỹ số lỗi. ' + (res.error.message ? res.error.message : res.error), 'danger');
                    onError && onError();
                } else {
                    done && done(res.item);
                }
            },
            () => {
                onFinish && onFinish();
                onError && onError();
                T.notify('Lấy thông tin quỹ số lỗi. ', 'danger');
            });
    };
}

export function applyQuySo(ma, done, onFinish, onError) {
    return (dispatch) => {
        const url = '/api/hcth/quy-so/apply';
        T.put(url, { ma },
            (res) => {
                onFinish && onFinish();
                if (res.error) {
                    console.error('PUT:', url, res.error);
                    T.notify('Áp dụng thông tin quỹ số lỗi. ' + (res.error.message ? res.error.message : res.error), 'danger');
                    onError && onError();
                } else {
                    dispatch(getAllQuySo());
                    T.notify('Áp dụng thông tin quỹ số thành công. ', 'success');
                    done && done();
                }
            },
            () => {
                onFinish && onFinish();
                onError && onError();
                T.notify('Áp dụng thông tin quỹ số lỗi. ', 'danger');
            });
    };
}

export function createQuySo(data, done, onFinish, onError) {
    return (dispatch) => {
        const url = '/api/hcth/quy-so';
        T.post(url, { data },
            (res) => {
                onFinish && onFinish();
                if (res.error) {
                    console.error('PUT:', url, res.error);
                    T.notify('Áp dụng thông tin quỹ số lỗi. ' + (res.error.message ? res.error.message : res.error), 'danger');
                    onError && onError();
                } else {
                    T.notify('Tạo thông tin quỹ số thành công. ', 'success');
                    dispatch(getAllQuySo());
                    done && done();
                }
            },
            () => {
                onFinish && onFinish();
                onError && onError();
                T.notify('Áp dụng thông tin quỹ số lỗi. ', 'danger');
            });
    };
}


export const SelectAdapter_HcthQuySo = {
    ajax: true,
    url: '/api/hcth/quy-so/all',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: `${item.ma} (năm ${item.namHanhChinh})` })) : [] }),
    fetchOne: (id, done) => (getQuySo(id, (item) => done && done({ id: item.ma, text: `${item.ma} (năm ${item.namHanhChinh})` })))(),
};



