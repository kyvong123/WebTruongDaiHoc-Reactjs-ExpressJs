import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------

// ACTIONS -------------------------------------------------
export function getThoiKhoaBieu(filter, done) {
    return () => {
        const url = '/api/sv/thoi-khoa-bieu';
        T.get(url, { filter }, result => {
            if (result.error) {
                T.notify(result.error.message, 'danger');
                console.error(`GET: ${url}.`, result.error.message);
            } else {
                done && done(result);
            }
        }, () => () => T.notify('Lấy thời khóa biểu bị lỗi!', 'danger'));
    };
}

export function getStudentInfo(done) {
    return () => {
        const url = '/api/sv/student-info';
        T.get(url, result => {
            if (result.error) {
                T.notify(result.error.message, 'danger');
                console.error(`GET: ${url}.`, result.error.message);
            } else {
                done && done(result.items);
            }
        }, () => () => T.notify('Lấy thông tin sinh viên bị lỗi!', 'danger'));
    };
}

export function getHocKyAll(done) {
    return () => {
        const url = '/api/sv/hoc-ky/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách học kỳ bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.items);
            }
        });
    };
}

export function getDtDmHocKy(ma, done) {
    return () => {
        const url = `/api/sv/hoc-ky/item/${ma}`;
        T.get(url, { ma }, data => {
            if (data.error) {
                T.notify('Lấy thông tin học kỳ bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.items);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export const SelectAdapter_HocKy = {
    ajax: true,
    url: '/api/sv/hoc-ky/all',
    data: params => ({ condition: params.term, kichHoat: 1 }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: item.ten })) : [] }),
    fetchOne: (ma, done) => (getDtDmHocKy(ma, item => item && done && done({ id: item.ma, text: item.ten })))(),
};