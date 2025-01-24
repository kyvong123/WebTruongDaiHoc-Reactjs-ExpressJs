import T from 'view/js/common';

const SvBoTieuChiGetAll = 'SvBoTieuChi:GetAll';

export default function SvBoTieuChiReducer(state = null, data) {
    switch (data.type) {
        case SvBoTieuChiGetAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}
export function updateSvBoTieuChiDaXoa(ma, changes, done) {
    return () => {
        const url = '/api/ctsv/bo-tieu-chi-da-xoa';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Cập nhật tiêu chí bị lỗi', 'danger');
                console.error('GET: ', data.error);
            } else {
                T.notify('Cập nhật tiêu chí thành công', 'success');
                done && done(data.item);
                // dispatch(getAllSvBoTieuChi());
            }
        });
    };
}

export function deleteBoTieuChi(ma, changes, done) {
    return () => {
        const url = '/api/ctsv/bo-tieu-chi-da-xoa';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Cập nhật tiêu chí bị lỗi', 'danger');
                console.error('GET: ', data.error);
            } else {
                T.notify('Cập nhật tiêu chí thành công', 'success');
                done && done(data.item);
                // dispatch(getAllSvBoTieuChi());
            }
        });
    };
}
export function getAllSvBoTieuChi(idBo, isDeleted, done) {
    return () => {
        const url = '/api/ctsv/bo-tieu-chi';
        T.get(url, { idBo, isDeleted }, data => {
            if (data.error) {
                T.notify('Lấy bộ tiêu chí bị lỗi', 'danger');
                console.error('GET: ', data.error);
            } else {
                done && done(data);
            }
        });
    };
}

export function getSvBoTieuChi(ma, done) {
    return () => {
        const url = '/api/ctsv/bo-tieu-chi/item';
        T.get(url, { ma }, data => {
            if (data.error) {
                T.notify('Lấy tiêu chí bị lỗi', 'danger');
                console.error('GET: ', data.error);
            } else {
                done && done(data.item);
            }
        });
    };
}

export function updateSvBoTieuChi(ma, changes, done) {
    return () => {
        const url = '/api/ctsv/bo-tieu-chi';
        T.put(url, { ma, changes }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Cập nhật tiêu chí bị lỗi', 'danger');
                console.error('GET: ', data.error);
            } else {
                T.notify('Cập nhật tiêu chí thành công', 'success');
                done && done(data.item);
                // dispatch(getAllSvBoTieuChi());
            }
        });
    };
}

export function createSvBoTieuChi(data, done) {
    return () => {
        const url = '/api/ctsv/bo-tieu-chi';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Tạo tiêu chí bị lỗi', 'danger');
                console.error('GET: ', data.error);
            } else {
                T.notify('Tạo tiêu chí thành công', 'success');
                done && done(data.item);
                // dispatch(getAllSvBoTieuChi());
            }
        });
    };
}

export function updateSvBoTieuChiSort(ma, maCha, oldIndex, newIndex, done) {
    return () => {
        const url = '/api/ctsv/bo-tieu-chi/sort';
        T.put(url, { ma, oldIndex, newIndex, maCha }, data => {
            if (data.error) {
                T.notify('Cập nhật thứ tự tiêu chí bị lỗi', 'danger');
                console.error('PUT: ', data.error);
            } else {
                T.notify('Cập nhật thứ tự tiêu chí thành công', 'success');
                done && done();
                // dispatch(getAllSvBoTieuChi());
            }
        });
    };
}
export function deleteSvBoTieuChi(ma, done) {
    return () => {
        const url = '/api/ctsv/bo-tieu-chi';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Xóa tiêu chí bị lỗi', 'danger');
                console.error('DELETE: ', data.error);
            } else {
                T.notify('Xóa tiêu chí thành công', 'success');
                done && done();
                // dispatch(getAllSvBoTieuChi());
            }
        });
    };
}

export function updateSvBoTieuChiSwap(srcMa, destMa, srcStt, destStt, done) {
    return () => {
        const url = '/api/ctsv/bo-tieu-chi/swap';
        T.put(url, { srcMa, destMa, srcStt, destStt }, data => {
            if (data.error) {
                T.notify(data.error.message || 'Cập nhật thứ tự tiêu chí bị lỗi', 'danger');
                console.error('PUT: ', data.error);
            } else {
                T.notify('Cập nhật thứ tự tiêu chí thành công', 'success');
                done && done();
                // dispatch(getAllSvBoTieuChi());
            }
        });
    };
}

// Common Page =======================================================================

export function getAllManageBoTieuChi(done) {
    return dispatch => {
        const url = '/api/ctsv/bo-tieu-chi/list/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy bộ tiêu chí bị lỗi', 'danger');
                console.error('GET: ', data.error);
            } else {
                done && done(data.item);
                dispatch({ type: SvBoTieuChiGetAll, items: data.items });
            }
        });
    };
}

export function getManageBoTieuChi(id, done) {
    return () => {
        const url = '/api/ctsv/bo-tieu-chi/list';
        T.get(url, { id }, data => {
            if (data.error) {
                T.notify('Lấy bộ tiêu chí bị lỗi', 'danger');
                console.error('GET: ', data.error);
            } else {
                done && done(data.item);
            }
        });
    };
}
export function createManageBoTieuChi(data, done) {
    return () => {
        const url = '/api/ctsv/bo-tieu-chi/list';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo bộ tiêu chí bị lỗi', 'danger');
                console.error('GET: ', data.error);
            } else {
                T.notify('Tạo bộ tiêu chí thành công', 'success');
                done && done(data.item);
                // dispatch(getAllManageBoTieuChi());
            }
        });
    };
}

export function updateManageBoTieuChi(id, changes, done) {
    return () => {
        const url = '/api/ctsv/bo-tieu-chi/list';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật bộ tiêu chí bị lỗi', 'danger');
                console.error('GET: ', data.error);
            } else {
                T.notify('Cập nhật bộ tiêu chí thành công', 'success');
                done && done(data.item);
                // dispatch(getAllManageBoTieuChi());
            }
        });
    };
}

export function deleteManageBoTieuChi(id, done) {
    return () => {
        const url = '/api/ctsv/bo-tieu-chi/list';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa bộ tiêu chí bị lỗi', 'danger');
                console.error('GET: ', data.error);
            } else {
                T.notify('Xóa bộ tiêu chí thành công', 'success');
                done && done(data.item);
                // dispatch(getAllManageBoTieuChi());
            }
        });
    };
}

export function cloneManageBoTieuChi(id, done) {
    return dispatch => {
        const url = '/api/ctsv/bo-tieu-chi/clone';
        T.post(url, { id }, data => {
            if (data.error) {
                T.notify('Sao chép bộ tiêu chí bị lỗi!', 'danger');
                console.error('POST: ', data.error);
            } else {
                T.notify('Sao chép bộ tiêu chí thành công!', 'success');
                dispatch(getAllManageBoTieuChi());
                done && done();
            }
        });
    };
}



export const SelectApdater_SvBoTieuChi = (idBo) => ({
    ajax: true,
    data: (params) => ({ searchTerm: params.term, idBo }),
    url: '/api/ctsv/bo-tieu-chi/tieu-chi-con',
    processResults: response => {
        return { results: response?.items?.map(item => ({ id: item.ma, text: `${item.index}. ${item.ten}${item.coMinhChung ? ' (yêu cầu minh chứng)' : ''}`, coMinhChung: item.coMinhChung, lienKetSuKien: item.theTieuChi != null? 1: 0 })) ?? [] };
    },
    fetchOne: (ma, done) => (getSvBoTieuChi(ma, item => done && done({ id: item.ma, text: `${item.index}. ${item.ten} ${item.coMinhChung ? ' (yêu cầu minh chứng)' : ''}`, coMinhChung: item.coMinhChung, lienKetSuKien: item.theTieuChi != null? 1: 0 })))()
});

export const SelectApdater_SvManageBoTieuChi = ({
    ajax: true,
    url: '/api/ctsv/bo-tieu-chi/list/all',
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.id, text: item.ten })) : [] }),
    fetchOne: (id, done) => (getManageBoTieuChi(id, item => done && done({ id: item.id, text: item.ten })))()
});