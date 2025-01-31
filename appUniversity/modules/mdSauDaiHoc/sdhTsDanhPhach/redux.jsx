import T from 'view/js/common';

const sdhTsDanhPhachGetPage = 'SdhTsDanhPhach:GetPage',
    sdhTsDonTuiGetPage = 'SdhTsDonTui:GetPage';
export default function SdhTsDanhPhachReducer(state = null, data) {
    switch (data.type) {
        case sdhTsDanhPhachGetPage:
            return Object.assign({}, state, { phachPage: data.page });
        case sdhTsDonTuiGetPage:
            return Object.assign({}, state, { donTuiPage: data.page });
        default:
            return state;
    }
}

export const PagePhach = 'pageSdhTsPhach';
export const PageTui = 'pageSdhTsTui';
T.initPage(PagePhach);
T.initPage(PageTui);



export function getSdhTsDsPhachPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage(PagePhach, pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/sdh/ts/ds-phach/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách phách bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                done && done(data.page);
                dispatch({ type: sdhTsDanhPhachGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách phách bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };

}
export function getSdhTsDSBTPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage(PageTui, pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/sdh/ts/bai-thi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách bài thi bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                done && done(data.page);
                dispatch({ type: sdhTsDonTuiGetPage, page: data.page });
            }
        }, (error) => T.notify('Lấy danh sách bài thi bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };

}

export function genSdhTsPhach(changes, done) {
    return (dispatch) => {
        const cookieDsPhach = T.updatePage(PagePhach),
            { pageNumber: pageNumberP, pageSize: pageSizeP, pageCondition: pageConditionP, filter: filterP } = cookieDsPhach;
        const url = '/api/sdh/ts/danh-phach';
        T.post(url, { changes }, result => {
            if (result.error) {
                T.notify('Lỗi đánh phách', 'danger');
                console.error(result.error);
            } else {
                T.notify('Thao tác thành công', 'success');
                done && done();
                dispatch(getSdhTsDsPhachPage(pageNumberP, pageSizeP, pageConditionP, filterP));
            }
        });
    };
}



export function sdhTsDanhPhachExport(data, done) {
    return () => {
        T.get('/api/sdh/ts/danh-phach/export', { data }, result => {
            if (result.error) {
                T.alert('Xử lý thất bại', 'danger', false, 2000);
            }
            done && done();
        });
        done && done();
    };
}


export function getSdhTsMonThiDanhPhach(maMonThi, done) {
    return () => {
        const url = `/api/sdh/ts/danh-phach/mon-thi/item/${maMonThi}`;
        T.get(url, result => {
            if (result.error) {
                console.error(result.error);
            } else {
                done && done(result.item);
            }
        });
    };

}

export const SelectAdapter_MonThiDanhPhach = (idDot) => {
    return {
        ajax: true,
        url: '/api/sdh/ts/danh-phach/mon-thi',
        data: params => ({ condition: params.term, idDot }),
        processResults: response => ({
            results: response.items && response.items.length ? response.items.map(item => ({ id: item.ma, text: `${item.ma}: ${item.ten} ${item.tinhTrang || ''}`, isNgoaiNgu: item.isNgoaiNgu })) : []
        }),
        fetchOne: (id, done) => (getSdhTsMonThiDanhPhach(id, item => item && done && done({ id: item.ma, text: `${item.ma}: ${item.ten} ${item.tinhTrang || ''}` })))(),
    };
};