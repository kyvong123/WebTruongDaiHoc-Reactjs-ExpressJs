const tcRegexGetAll = 'tcRegex:GetAll';
const tcRegexGetItem = 'tcRegex:GetItem';

export default function reducer(state = null, data) {
    switch (data.type) {
        case tcRegexGetAll:
            return Object.assign({}, state, { items: data.items });
        case tcRegexGetItem:
            return Object.assign({}, state, { item: data.item });
        default:
            return state;
    }
}

export function getAll(done, onError) {
    return dispatch => {
        const url = '/api/khtc/regular-expression/all';
        T.get(url, (res) => {
            if (res.error) {
                onError && onError();
                console.error('GET: ', url, res.error);
                T.notify('Lấy danh sách biểu thức chính quy lỗi', 'danger');
            } else {
                dispatch({ type: tcRegexGetAll, items: res.items });
                done && done(res.items);
            }
        }, () => T.notify('Lấy danh sách biểu thức chính quy lỗi', 'danger') || (onError && onError()));
    };
}

export function getItem(id, done, onError) {
    return dispatch => {
        const url = '/api/khtc/regular-expression/' + id;
        T.get(url, (res) => {
            if (res.error) {
                onError && onError();
                console.error('GET: ', url, res.error);
                T.notify('Lấy biểu thức chính quy lỗi', 'danger');
            } else {
                dispatch && dispatch({ type: tcRegexGetItem, item: res.item });
                done && done(res.item);
            }
        }, () => T.notify('Lấy biểu thức chính quy lỗi', 'danger') || (onError && onError()));
    };
}

export function createItem(data, done, onError) {
    return () => {
        const url = '/api/khtc/regular-expression/';
        T.post(url, data, (res) => {
            if (res.error) {
                onError && onError();
                console.error('POST: ', url, res.error);
                T.notify('Tạo biểu thức chính quy lỗi', 'danger');
            } else {
                done && done(res.item);
            }
        }, () => T.notify('Tạo biểu thức chính quy lỗi', 'danger') || (onError && onError()));
    };
}

export function updateItem(id, data, done, onError) {
    return () => {
        const url = '/api/khtc/regular-expression/' + id;
        T.put(url, data, (res) => {
            if (res.error) {
                onError && onError();
                console.error('PUT: ', url, res.error);
                T.notify('Cập nhật biểu thức chính quy lỗi', 'danger');
            } else {
                done && done(res.item);
            }
        }, () => T.notify('Cập nhật biểu thức chính quy lỗi', 'danger') || (onError && onError()));
    };
}

export const SelectAdapter_tcRegularExpressionSet = ({
    ajax: true,
    url: '/api/khtc/regular-expression/all',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ text: item.ten, id: item.id })) : [] }),
    fetchOne: (id, done) => (getItem(id, item => done && done({ id: item.id, text: item.ten })))()
});