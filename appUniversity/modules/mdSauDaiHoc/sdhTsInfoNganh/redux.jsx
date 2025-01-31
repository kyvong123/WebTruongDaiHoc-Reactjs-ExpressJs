import T from 'view/js/common';
const SdhTsNganhAll = 'SdhTsNganh:GetAll';

export default function SdhTsNganhReducer(state = null, data) {
    switch (data.type) {
        case SdhTsNganhAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}
export function getSdhTsInfoNganhAll(done) {
    return () => {
        const url = '/api/sdh/ts-info/nganh/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin các ngành không thành công!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        });
    };
}
export function getSdhTsInfoNganhData(done) {
    return dispatch => {
        const url = '/api/sdh/ts-info/nganh';
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy thông tin các ngành không thành công!', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                dispatch({ type: SdhTsNganhAll, items: result.items });
                done && done(result.items);
            }
        });
    };
}
export function deleteSdhTsInfoNganh(data, done) {
    return () => {
        const url = '/api/sdh/ts-info/nganh';
        T.delete(url, { data }, data => {
            if (data.error) {
                T.notify('Hủy kích hoạt ngành không thành công!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.notify('Hủy kích hoạt ngành thành công!', 'success');
                done && done();
            }
        });
    };
}
export function createSdhTsInfoNganh(data, done) {
    return () => {
        const url = '/api/sdh/ts-info/nganh';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Kích hoạt ngành không thành công!', 'danger');
                console.error(`POST: ${url}.`, result.error);
            } else {
                T.notify('Kích hoạt ngành thành công!', 'success');
                done && done(result.items);
            }
        });
    };
}
export function createSdhTsInfoNganhAll(data, done) {
    return dispatch => {
        const url = '/api/sdh/ts-info/nganh/all';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Kích hoạt ngành không thành công!', 'danger');
                console.error(`POST: ${url}.`, result.error);
            } else {
                T.notify('Kích hoạt ngành thành công!', 'success');
                dispatch(getSdhTsInfoNganhData());
                done && done();
            }
        });

    };
}
export function getDmNganhSdh(ma, done) {
    return () => {
        const url = `/api/sdh/danh-sach-nganh/item/${ma}`;
        T.get(url, { ma }, data => {
            if (data.error) {
                T.notify('Lấy ngành sau đại học bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}
export function getSdhTsInfoNganhByPhanHe(idPhanHe, done) {
    return () => {
        const url = '/api/sdh/ts-info/nganh/items';
        T.get(url, { idPhanHe }, result => {
            if (result.error) {
                T.notify('Lấy thông tin các ngành không thành công!', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                done && done(result.items);
            }
        });
    };
}
export function getSdhTsInfoNganhById(id, done) {
    return () => {
        const url = `/api/sdh/ts-info/nganh/item/${id}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy thông tin các ngành không thành công!', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                done && done(result.items);
            }
        });
    };
}
export const SelectAdapter_NganhTs = (idPhanHe) => {
    return {
        ajax: true,
        url: '/api/sdh/ts-info/nganh/items',
        data: params => ({ searchTerm: params.term, idPhanHe }),
        processResults: response => {
            let results = response.items || [];
            if (response.searchTerm) {
                let st = response.searchTerm;
                results = results.filter(i => i.ten.toLowerCase().includes(st.toLowerCase()));
            }
            return { results: results.map(item => ({ id: item.ma, text: `${item.ma}: ${item.ten}`, idNganh: item.id })) };
        },

        fetchOne: (id, done) => (getDmNganhSdh(id, item => done && done({ id: item.maNganh, text: `${item.maNganh}: ${item.ten}` })))(),
    };
};

export const SelectAdapter_NganhTsAll = (idPhanHe) => {
    return {
        ajax: true,
        url: '/api/sdh/ts-info/nganh/items',
        data: params => ({ searchTerm: params.term, idPhanHe }),
        processResults: response => ({ results: response && response.items && response.items.length ? [{ id: '-1', text: 'Tất cả ngành', idNganh: '-1' }].concat(response.items.map(item => ({ id: item.ma, text: `${item.ma}: ${item.ten}`, idNganh: item.id }))) : [] }),
        fetchOne: (id, done) => (getDmNganhSdh(id, item => done && done({ id: item.maNganh, text: `${item.maNganh}: ${item.ten}` })))(),
    };
};
export function deleteSdhTsInfoNganhAll(data, done) {
    return () => {
        const url = '/api/sdh/ts-info/nganh/all';
        T.delete(url, { data }, data => {
            if (data.error) {
                T.notify('Hủy kích hoạt ngành không thành công!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                done && done();
            }
        });
    };
}
export function updateSdhTsInfoNganh(key, data, done) {
    return () => {
        const url = '/api/sdh/ts-info/nganh';
        T.put(url, { key, data }, data => {
            if (data.error) {
                T.alert(`${data.error.message}`, 'error', false, 2000);
                console.error(`UPDATE: ${url}.`, data.error);
                done && done();
            } else {
                T.alert('Cập nhật thành công!', 'success', false, 1000);
                done && done();
            }
        });
    };
}
export function getSdhTsInfoNganhItem(idNganh, done) {
    return () => {
        const url = `/api/sdh/ts-info/nganh-by-dot/item/${idNganh}`;
        T.get(url, result => {
            if (result.error) {
                T.notify('Lấy thông tin ngành không thành công!', 'danger');
                console.error(`GET: ${url}.`, result.error);
            } else {
                done && done(result.item);
            }
        });
    };
}
export const SelectAdapter_NganhByDot = (idDot) => {
    return {
        ajax: true,
        url: '/api/sdh/ts-info/nganh-by-dot/items',
        data: params => ({ searchTerm: params.term, idDot }),
        processResults: response => ({ results: response && response.items && response.items.length ? response.items.map(item => ({ id: item.id, text: `${item.maTsNganh}: ${item.ten}  ${response.items.filter(i => i.maTsNganh == item.maTsNganh).length >= 2 ? `(${item.phanHe})` : ''}` })) : [] }),
        fetchOne: (id, done) => (getSdhTsInfoNganhItem(id, item => done && done({ id: item.id, text: `${item.maTsNganh}: ${item.ten}` })))()
    };
};
export const PageName = 'pageSdhDanhSachNganh';
T.initPage(PageName);
export function getSdhDanhSachNganhPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition, filter);
    return () => {
        const url = `/api/sdh/ts-info/nganh/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách ngành tuyển sinh không thành công' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                done && done(data.page);
            }
        });
    };
}