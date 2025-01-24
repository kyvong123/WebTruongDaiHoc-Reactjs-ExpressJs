import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const ExecuteTaskGet = 'ExecuteTask:Get';

export default function execTaskReducer(state = null, data) {
    switch (data.type) {
        case ExecuteTaskGet: {
            return Object.assign({}, state, { items: data.items });
        }
        default:
            return state;
    }
}

T.initPage('executeTaskPage');
export function getExecuteTaskPage(pageNumber, pageSize, done) {
    const page = T.updatePage('executeTaskPage', pageNumber, pageSize);
    return () => {
        const url = `/api/execute-task/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách task bị lỗi', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data.page);
            }
        }, () => T.notify('Lấy danh sách task bị lỗi!', 'danger'));
    };
}

export function getLatestExecuteTask(done) {
    return dispatch => {
        const url = '/api/execute-task/latest';
        T.get(url, res => {
            if (res.error) {
                T.notify('Lấy danh sách tiến trình bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${res.error}`);
            } else {
                done && done(res.items);
                dispatch({ type: ExecuteTaskGet, items: res.items });
            }
        }, () => T.notify('Lấy danh sách thông báo bị lỗi!', 'danger'));
    };
}

export function executeTaskGetItem(id, done) {
    return () => {
        const url = '/api/execute-task/item';
        T.get(url, { id }, res => {
            if (res.error) {
                T.notify('Lỗi lấy dữ liệu tiến trình', 'danger');
                console.error(res.error);
            } else {
                done && done(res);
            }
        });
    };
}

export function executeTaskGetTool(done) {
    return () => {
        const url = '/api/execute-task/tool';
        T.get(url, res => {
            if (res.error) {
                T.notify('Lỗi lấy danh sách tool', 'danger');
                console.error(res.error);
            } else {
                done && done(res.fileNames);
            }
        });
    };
}

export function executeTaskRunTool(toolName, done) {
    return () => {
        const url = '/api/execute-task/tool';
        T.post(url, { toolName }, res => {
            if (res.error) {
                T.notify('Lỗi lấy danh sách tool', 'danger');
                console.error(res.error);
            } else {
                done && done();
            }
        });
    };
}