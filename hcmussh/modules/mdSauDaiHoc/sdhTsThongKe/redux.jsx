import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const SdhTsThongKeGetDetail = 'SdhTsThongKe:GetDetail';

export default function sdhTsThongKeReducer(state = null, data) {
    switch (data.type) {
        case SdhTsThongKeGetDetail:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}




export function getDataThongKeDetail(filter, done) {
    return (dispatch) => {
        const url = '/api/sdh/ts-thong-ke/detail';
        T.get(url, { filter }, results => {
            if (results.error) {
                T.notify('Lấy dữ liệu bị lỗi', 'danger');
                console.error(`GET: ${url}.`, results.error);
            } else {
                dispatch({ type: SdhTsThongKeGetDetail, items: results.items });
                done && done(results);
            }
        });
    };
}

export function exportPhieuBao(filter, done) {
    return () => {
        const url = '/api/sdh/ts-thong-ke/export-phieu-bao';
        T.get(url, { filter }, data => {
            if (data.error) {
                T.notify(`${data.error || 'Lỗi hệ thống. Vui lòng liên hệ để được hỗ trợ!'}`, 'danger');
            } else {
                T.notify('Tải thành công!', 'success');
                if (filter.sbd) {
                    T.FileSaver(new Blob([new Uint8Array(data.buffer.data)]), data.fileName);
                }
            }
            done && done(data);
        });
    };
}

export function exportPhieuBaoMultiple(filter, done) {
    return () => {
        const url = '/api/sdh/ts-thong-ke/export-phieu-bao';
        T.post(url, { filter }, data => {
            if (data.error) {
                T.notify(`${data.error || 'Lỗi hệ thống. Vui lòng liên hệ để được hỗ trợ!'}`, 'danger');
            } else {
                T.notify('Tải thành công!', 'success');
            }
            done && done(data.fileName);
        });
    };
}


export function exportScanDanhSachCcnn(filter, done) {
    return () => {
        T.get('/api/sdh/ts/thong-ke/cong-nhan-chung-chi-nn/export', { filter }, result => {
            if (result.error) {
                T.alert('Xử lý thất bại', 'danger', false, 2000);
            }
        });
        done && done();
    };
}

//-----------SELECT ADAPTER-----------//

export const findDistinct = (response, key) => {
    if (response && response.items && response.items.length) {
        let temp = response.items;
        let groupBy = Object.keys(temp.groupBy(key));
        let results = groupBy.map((item) => {
            let i = temp.find(i => i[key] == item);
            return { ...i, id: i[key] };
        }, []);
        return results;
    }
    else return [];

};

export const SelectAdapter_TkDot = (filter) => {
    return {
        ajax: true,
        url: '/api/sdh/ts-thong-ke/detail',
        data: params => ({ searchTerm: params.term || '', filter }),
        processResults: response => {
            let results = findDistinct(response, 'idDot');
            if (response.searchTerm) {
                let st = response.searchTerm;
                results = results.filter(item => item.maDot.includes(st) || item.id == st);
            }
            results = results.map(item => ({ id: Number(item.id), text: item.maDot }));
            return { results };
        },
    };
};
export const SelectAdapter_TkPhanHe = (filter) => {
    return {
        ajax: true,
        url: '/api/sdh/ts-thong-ke/detail',
        data: params => ({ searchTerm: params.term || '', filter }),
        processResults: response => {
            let results = findDistinct(response, 'maPhanHe');
            if (response.searchTerm) {
                let st = response.searchTerm;
                results = results.filter(item => item.maPhanHe.includes(st) || item.tenPhanHe.includes(st));
            }
            results = results.map(item => ({ id: item.id, text: item.tenPhanHe }));

            return { results };
        },
    };
};
export const SelectAdapter_TkHinhThuc = (filter) => {
    return {
        ajax: true,
        url: '/api/sdh/ts-thong-ke/detail',
        data: params => ({ searchTerm: params.term || '', filter }),
        processResults: response => {
            let results = findDistinct(response, 'maHinhThuc');
            if (response.searchTerm) {
                let st = response.searchTerm;
                results = results.filter(item => item.maHinhThuc.includes(st) || item.tenHinhThuc.includes(st));
            }
            results = results.map(item => ({ id: item.id, text: item.tenHinhThuc }));
            return { results };
        },
    };
};
export const SelectAdapter_TkNganh = (filter) => {
    return {
        ajax: true,
        url: '/api/sdh/ts-thong-ke/detail',
        data: params => ({ searchTerm: params.term || '', filter }),
        processResults: response => {
            let results = findDistinct(response, 'idNganh');
            if (response.searchTerm) {
                let st = response.searchTerm;
                results = results.filter(item => item.maNganh.includes(st) || item.tenNganh.includes(st));
            }
            results = results.map(item => ({ id: Number(item.id), text: `${item.maVietTatNganh}: ${item.tenNganh}` }));
            return { results };
        },
    };
};

export const SelectAdapter_ThongKe = (filter) => {
    return {
        ajax: true,
        url: '/api/sdh/ts-thong-ke/data-select-adapter',
        data: params => ({ searchTerm: params.term || '', filter }),
        processResults: response => {
            let results = response.items || [];
            if (response.searchTerm) {
                let st = response.searchTerm;
                results = results.filter(i => i.ten.toLowerCase().includes(st.toLowerCase()));
            }
            return { results: results.map(item => ({ id: item.id, text: `${item.ten}` })) };
        }
    };
};
