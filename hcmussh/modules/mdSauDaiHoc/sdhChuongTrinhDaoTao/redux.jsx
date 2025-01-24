import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const SdhChuongTrinhDaoTaoGetAll = 'SdhChuongTrinhDaoTao:GetAll';
const SdhChuongTrinhDaoTaoGetPage = 'SdhChuongTrinhDaoTao:GetPage';
const SdhChuongTrinhDaoTaoGet = 'SdhChuongTrinhDaoTao:GetByKhoa';
const SdhChuongTrinhDaoTaoUpdate = 'SdhChuongTrinhDaoTao:Update';

export default function dtChuongTrinhDaoTaoReducer(state = null, data) {
    switch (data.type) {
        case SdhChuongTrinhDaoTaoGetAll:
        case SdhChuongTrinhDaoTaoGet:
            return Object.assign({}, state, { items: data.items });
        case SdhChuongTrinhDaoTaoGetPage:
            return Object.assign({}, state, { page: data.page });
        case SdhChuongTrinhDaoTaoUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].id == updatedItem.id) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].id == updatedItem.id) {
                            updatedPage.list.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                return Object.assign({}, state, { items: updatedItems, page: updatedPage });
            } else {
                return null;
            }
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getSdhChuongTrinhDaoTaoAll(condition, done) {
    if (typeof condition === 'function') {
        done = condition;
        condition = {};
    }
    return dispatch => {
        const url = '/api/sdh/chuong-trinh-dao-tao/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách chương trình đào tạo bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.items);
                dispatch({ type: SdhChuongTrinhDaoTaoGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

T.initPage('pageSdhChuongTrinhDaoTao');
export function getSdhChuongTrinhDaoTaoPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageSdhChuongTrinhDaoTao', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/sdh/chuong-trinh-dao-tao/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { searchTerm: pageCondition?.searchTerm, donViFilter: pageCondition?.donViFilter, namDaoTao: pageCondition?.namDaoTao, heDaoTaoFilter: pageCondition?.heDaoTaoFilter, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách chương trình đào tạo bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.page);
                dispatch({ type: SdhChuongTrinhDaoTaoGetPage, page: data.page });
            }
        });
    };
}

export function getSdhChuongTrinhDaoTao(maKhungDaoTao, done) {
    return dispatch => {
        const url = '/api/sdh/chuong-trinh-dao-tao';
        T.get(url, { maKhungDaoTao }, data => {
            if (data.error) {
                T.notify('Lấy danh sách chương trình đào tạo bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data.items);
                dispatch({ type: SdhChuongTrinhDaoTaoGet, items: data.items ? data.items : [] });
            }
        });
    };
}

export function getSdhKhungDaoTao(id, done) {
    return () => {
        const url = `/api/sdh/khung-dao-tao/item/${id}`;
        T.get(url, { condition: { id } }, data => {
            if (data.error) {
                T.notify('Lấy danh sách khung đào tạo bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                done && done(data);
            }
        });
    };
}

export function createSdhChuongTrinhDaoTao(item, done) {
    return dispatch => {
        const url = '/api/sdh/chuong-trinh-dao-tao';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify(`Tạo mới bị lỗi: ${data.error.message}`, 'danger');
                console.error(`POST ${url}. ${data.error.message}`);
            } else {
                T.notify('Tạo chương trình đào tạo thành công!', 'success');
                data.warning && T.notify(data.warning.message, 'warning');
                dispatch(getSdhChuongTrinhDaoTaoPage());
                done && done(data.item);
            }
        });
    };
}

export function deleteSdhChuongTrinhDaoTao(id, done) {
    return () => {
        const url = '/api/sdh/chuong-trinh-dao-tao';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa chương trình đào tạo bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.alert('Chương trình đào tạo đã xóa thành công!', 'success', false, 800);
                done && done();
            }
        }, () => T.notify('Xóa chương trình đào tạo bị lỗi!', 'danger'));
    };
}

export function removeFromHocKy(list, done) {
    return dispatch => {
        const url = '/api/sdh/chuong-trinh-dao-tao/remove';
        T.put(url, { list }, data => {
            if (data.error) {
                T.notify(`Lưu lỗi: ${data.error.message}`, 'danger');
                console.error(`PUT ${url}. ${data.error.message}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thành công!', 'success');
                dispatch(getSdhChuongTrinhDaoTaoPage());
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật bị lỗi!', 'danger'));
    };
}

//modify monHoc when setup keHoach
export function updateSdhChuongTrinhDaoTaoMultiple(id, updateDatas, deleteList, hocKy, duKien, done) {
    return dispatch => {
        const url = '/api/sdh/chuong-trinh-dao-tao/multiple';
        T.put(url, { id, updateDatas, deleteList, hocKy, duKien }, data => {
            if (data.error) {
                T.notify(`Lưu lỗi: ${data.error.message}`, 'danger');
                console.error(`PUT ${url}. ${data.error.message}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thành công!', 'success');
                dispatch(getSdhChuongTrinhDaoTaoPage());
                done && done(data.page);
            }
        }, () => T.notify('Cập nhật bị lỗi!', 'danger'));
    };
}

//Update keHoach for 1 subject when 
export function updateSdhHocPhanMulti(data, rawData, preLength, done) {
    return () => {
        const url = '/api/sdh/chuong-trinh-dao-tao/hoc-phan/multiple';
        T.post(url, { data, rawData, preLength }, data => {
            if (data.error) {
                T.notify(`Lưu lỗi: ${data.error}`, 'danger');
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật kế hoạch thành công!', 'success');
                done && done();
            }
        }, () => T.notify('Cập nhật kế hoạch thành công!', 'danger'));
    };
}

export const SelectAdapter_ChuongTrinhDaoTaoFilter = (maNganh = null) => {
    return {
        ajax: true,
        url: '/api/sdh/chuong-trinh-dao-tao/all-mon-hoc',
        data: params => ({ searchText: params.term, maNganh }),
        processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.id, text: item.namDaoTao, data: { mucCha: item.mucCha, mucCon: item.mucCon } })) : [] }),
        fetchOne: (ma, done) => (getSdhChuongTrinhDaoTao(ma, item => done && done({ id: item.id, text: item.namDaoTao, data: { mucCha: item.mucCha, mucCon: item.mucCon } })))()
    };
};

export const SelectAdapter_CtDtFilterByKhungDt = (maKhungDaoTao) => {
    return {
        ajax: true,
        url: '/api/sdh/chuong-trinh-dao-tao',
        data: params => ({ searchText: params.term, maKhungDaoTao }),
        processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.id, text: item.maMonHoc + ':' + item.tenMonHoc })) : [] }),
        // fetchOne: (ma, done) => (getSdhChuongTrinhDaoTao(ma, item => done && done({ id: item.id, text: item.tenMonHoc })))()
    };
};



export function changeSdhChuongTrinhDaoTao(item) {
    return { type: SdhChuongTrinhDaoTaoUpdate, item };
}


export function getDanhSachMonChuongTrinhDaoTao(condition, done) {
    return () => {
        T.get('/api/sdh/chuong-trinh-dao-tao/all-mon-hoc', { condition }, result => {
            if (result.error) {
                T.notify(result.error?.message || 'Lấy danh sách môn CTDT lỗi', 'danger');
                console.error(result.error);
            } done(result);
        });
    };
}

export function downloadWord(id, done) {
    return () => {
        const url = `/api/sdh/chuong-trinh-dao-tao/download-word/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Tải file word bị lỗi', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else if (done) {
                done(data.data);
            }
        }, () => T.notify('Tải file word bị lỗi', 'danger'));
    };
}

export function updateKhungDaoTao(id, changes, done) {
    return () => {
        const url = '/api/sdh/khung-dao-tao';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify(`Lưu lỗi: ${data.error.message}`, 'danger');
                console.error(`PUT ${url}. ${data.error.message}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật khung đào tạo thành công', 'success');
                done && done();
            }
        }, () => T.notify('Cập nhật bị lỗi!', 'danger'));
    };
}

export function checkExistHocPhan(chuongTrinhDaoTao, khungDaoTao, done) {
    return () => {
        const url = '/api/sdh/check-exist-hoc-phan';
        T.post(url, { chuongTrinhDaoTao, khungDaoTao }, data => {
            if (data.error) {
                T.notify('Lấy danh sách học phần cần kiểm tra bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                done && done(data);
            }
        });
    };
}


export function sdhDuyetKeHoach(chuongTrinhDaoTao, dsHocPhan, compoundList, dataKhung, done) {
    return () => {
        const url = '/api/sdh/duyet-ke-hoach-dao-tao';
        T.post(url, { chuongTrinhDaoTao, dsHocPhan, compoundList, dataKhung }, data => {
            if (data.error) {
                T.notify('Duyệt kế hoạch đào tạo bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error}`);
            } else {
                T.notify('Duyệt kế hoạch đào tạo thành công!', 'success');
                done && done();
            }
        });
    };
}

export const SelectAdapter_NamDaoTaoFilter = {
    ajax: true,
    url: '/api/sdh/chuong-trinh-dao-tao/all-nam-dao-tao',
    data: params => ({ searchText: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.id, text: item.namDaoTao })) : [] }),
};

export const SelectAdapter_SdhKhungDaoTao = {
    ajax: true,
    data: () => ({ condition: { kichHoat: 1 } }),
    url: '/api/sdh/khung-dao-tao/all',
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.id, text: JSON.parse(item.tenNganh).vi })) : [] }),
    fetchOne: (ma, done) => (getSdhKhungDaoTao(ma, result => done && done({ id: result.item.id, text: JSON.parse(result.item.tenNganh).vi })))(),

};