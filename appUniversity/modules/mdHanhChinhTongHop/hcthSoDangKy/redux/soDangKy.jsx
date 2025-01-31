import T from 'view/js/common';

const HcthDangKySoSearchPage = 'HcthDangKySo:SearchPage';

export default function hcthSoDangKyReducer(state = null, data) {
    switch (data.type) {
        case HcthDangKySoSearchPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ----------------------------------------------------------------------------------------------------
const pageName = 'pageHcthDangKySo';
T.initPage(pageName);


export function createSoTuDong(data, done, onFinish, onError) {
    return dispatch => {
        const url = '/api/hcth/so-dang-ky/tu-dong';
        T.post(url, { data }, res => {
            onFinish && onFinish();
            if (res.error) {
                T.notify('Tạo số tự động bị lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error('POST: ', url, '.', res.error);
                onError && onError();
            } else {
                T.notify('Tạo số tự động thành công', 'success');
                if (!(data.inVanBanGiay || data.inVanBan))
                    dispatch && dispatch(getDangKySearchPage());
                done && done(res);
            }
        }, () => {
            onFinish && onFinish();
            onError && onError();
            T.notify('Tạo số tự động bị lỗi!', 'danger');
        });
    };
}

export function createSoNhapTay(data, done) {
    return dispatch => {
        const url = '/api/hcth/so-dang-ky/nhap-tay';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo số nhập tay bị lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error('POST: ' + url + '.', res.error);
            } else {
                T.notify('Tạo số nhập tay thành công', 'success');
                if (!(data.inVanBanGiay || data.inVanBan)) dispatch(getDangKySearchPage());
                done && done(res);
            }
        }, () => T.notify('Tạo số nhập tay bị lỗi!', 'danger'));
    };
}

export function getDangKySearchPage(pageNumber, pageSize, pageCondition, filter, done) {
    if (typeof filter === 'function') {
        done = filter;
        filter = {};
    }

    const page = T.updatePage(pageName, pageNumber, pageSize, pageCondition, filter);

    return dispatch => {
        dispatch({ type: HcthDangKySoSearchPage, page: null });
        const url = `/api/hcth/so-dang-ky/search/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: page.pageCondition, filter: page.filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách số văn bản bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (page.filter) data.page.filter = page.filter;
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                dispatch({ type: HcthDangKySoSearchPage, page: data.page });
                done && done(data.page);
            }
        }, error => console.error(`GET: ${url}.`, error));
    };
}

export function getSo(id, done) {
    return () => {
        const url = `/api/hcth/so-dang-ky/${id}`;
        T.get(url, { id }, data => {
            if (data.error) {
                T.notify('Lấy số bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export const SelectAdapter_SoDangKy = (donViGui, capVanBan, loaiVanBan, maCongVan, maLoaiVanBan) => {
    return {
        ajax: true,
        url: '/api/hcth/so-dang-ky/search/page/1/20',
        data: params => ({ condition: params.term, filter: { tab: 0, donViGui, capVanBan, loaiVanBan, maCongVan, maLoaiVanBan, isSelector: 1 } }),
        processResults: response => {
            return (
                { results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.id, text: `Số: ${item.soCongVan} ; Đơn vị: ${item.tenDonViGui} ; Loại văn bản: ${item.tenLoaiVanBan || 'Chưa có loại văn bản'} ; Cấp văn bản: ${item.capVanBan == 'TRUONG' ? 'Trường' : 'Đơn vị'}` })) : [] });
        },
        fetchOne: (id, done) => (getSo(id, item =>
            done && done({ id: item.id, text: item.soCongVan })
        ))()
    };
};

export function deleteSoVanBan(id, done) {
    return dispatch => {
        const url = '/api/hcth/so-dang-ky';
        T.delete(url, { id }, res => {
            if (res.error) {
                T.notify('Xóa số bị lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error('DELETE: ' + url + '.', res.error);
            } else {
                T.notify('Xóa số thành công', 'success');
                dispatch(getDangKySearchPage());
                done && done();
            }
        }, () => T.notify('Xóa số bị lỗi!', 'danger'));
    };
}

export function updateSoVanBan(id, soCongVan, loaiVanBan, done, onFinish, onError) {
    return dispatch => {
        const url = '/api/hcth/so-dang-ky';
        T.put(url, { id, soCongVan, loaiVanBan }, res => {
            onFinish && onFinish();
            if (res.error) {
                T.notify('Cập nhật số bị lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error('DELETE: ' + url + '.', res.error);
            } else {
                T.notify('Cập nhật số thành công', 'success');
                dispatch(getDangKySearchPage());
                done && done();
            }
        }, () => (onFinish && onFinish()) || (onError && onError()) || T.notify('Cập nhật số bị lỗi!', 'danger'));
    };
}



export const SelectAdapter_SoDangKyAlternative = (listDonVi = [], capVanBan = 'TRUONG', listLoaiVanBan = ['QĐ'], suDung = 1) => {
    /**!SECTION
     * listDonVi danh sach don vi kha dung (controller se check va chi cho phep can bo truy van don vi ban than co hop dong)
     * capVanBan['TRUONG','DON_VI']
     * listLoaiVanBan[ ma loai van ban luu o cot MA bang DM_LOAI_CONG_VAN]
     * suDung[0,1]
     */
    return {
        ajax: true,
        url: (params) => {
            return `/api/hcth/so-dang-ky/page/${params?.page || 1}/20`;
        },
        data: params => ({ condition: params.term, filter: { listDonVi, capVanBan, listLoaiVanBan, suDung } }),
        processResults: response => {
            let more = false;
            const page = response && response.page;
            if (page && page.pageTotal > page.pageNumber) {
                more = true;
            }
            return ({
                pagination: { more },
                results: response && response.page && response.page.list ? response.page.list.map(item => ({ idVanBan: item.idVanBan, trichYeu: item.trichYeu, id: item.id, text: `Số: ${item.soCongVan} ; Năm: ${item.namHanhChinh}; Đơn vị: ${item.tenDonViGui} ; Loại văn bản: ${item.tenLoaiVanBan || 'Chưa có loại văn bản'} ; Cấp văn bản: ${item.capVanBan == 'TRUONG' ? 'Trường' : 'Đơn vị'}` })) : []
            });
        },
        fetchOne: (id, done) => (getSo(id, item =>
            done && done({ id: item.id, text: item.soCongVan, idVanBan: item.ma })
        ))()
    };
};
