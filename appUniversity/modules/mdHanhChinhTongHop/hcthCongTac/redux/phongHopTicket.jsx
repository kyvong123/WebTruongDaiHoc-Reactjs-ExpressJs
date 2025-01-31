import { HcthPhongHopTicketGetPage } from './congTac';

export function updatePhongHopTicket(phongHopTicketId, changes, done, onFinish, onError) {
    return () => {
        const url = '/api/hcth/cong-tac/phong-hop-ticket';
        T.put(url, { phongHopTicketId, changes }, (res) => {
            onFinish && onFinish();
            if (res.error) {
                console.error('PUT:', url, res.error);
                T.notify('Cập nhật phiếu đăng ký phòng họp lỗi. ' + (res.error.message ? res.error.message : res.error), 'danger');
                onError && onError();
            } else {
                window.location.reload();
                // done && done(res.item);
            }
        }, () => {
            onFinish && onFinish();
            onError && onError();
            T.notify('Cập nhật phiếu đăng ký phòng họp lỗi. ', 'danger');
        });
    };
}

export function censorPhongHopTicket(phongHopTicketId, changes, done, onFinish, onError) {
    return () => {
        const url = '/api/hcth/cong-tac/phong-hop-ticket/censor';
        T.put(url, { phongHopTicketId, changes }, (res) => {
            onFinish && onFinish();
            if (res.error) {
                console.error('PUT:', url, res.error);
                T.notify('Cập nhật phiếu đăng ký phòng họp lỗi. ' + (res.error.message ? res.error.message : res.error), 'danger');
                onError && onError();
            } else {
                T.notify('Cập nhật trạng thái phiếu đăng ký thành công', 'success');
                done && done(res.item);
            }
        }, () => {
            onFinish && onFinish();
            onError && onError();
            T.notify('Cập nhật phiếu đăng ký phòng họp lỗi. ', 'danger');
        });
    };
}


T.initPage('pageHcthPhongHopTicket');

export function getPhongHopTicketPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage('pageHcthPhongHopTicket', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        dispatch({ type: HcthPhongHopTicketGetPage, page: null });
        const url = `/api/hcth/cong-tac/phong-hop-ticket/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách lịch họp lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (page.filter) data.page.filter = page.filter;
                dispatch({ type: HcthPhongHopTicketGetPage, page: data.page });
                done && done(data.page);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}