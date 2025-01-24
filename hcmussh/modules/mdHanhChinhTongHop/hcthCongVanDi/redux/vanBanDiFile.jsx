
export function getSignFiles(pageNumber, pageSize, pageCondition, filter, done) {
    return dispatch => {
        const page = T.updatePage('pageHcthVanBanDiFile', pageNumber, pageSize, pageCondition, filter);
        const url = `/api/hcth/van-ban-di/file/sign/search/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh tập tin văn bản lỗi ' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (page.filter) data.page.filter = page.filter;
                dispatch({ type: 'hcthVanBanDi:GetSignFiles', page: data.page });
                done && done(data.page);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function createSession(data, done, onFinish, onError) {
    return () => {
        const url = '/api/hcth/ky-dien-tu/van-ban-di/ky-xac-thuc';
        T.post(url, data, (res) => {
            onFinish && onFinish(res);
            if (res.error) {
                T.notify('Taọ session lỗi', 'danger');
                console.error('GET: ' + url + '. ' + res.error);
                onError && onError();
            } else {
                T.notify('Taọ session thành công', 'success');
                done && done(res.session);
            }
        }, () => T.notify('Taọ session lỗi', 'danger') || (onFinish && onFinish()) || (onError && onError()));
    };
}
