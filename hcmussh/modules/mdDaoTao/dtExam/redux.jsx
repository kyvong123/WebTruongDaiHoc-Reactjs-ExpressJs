import T from 'view/js/common';
import { getDtCanBo } from '../dtCanBoNgoaiTruong/redux';

const DtExamGetPage = 'DtExam:GetPage';
const DtDinhChiThiGetPage = 'DtDinhChiThi:GetPage';
const DtExamGetAll = 'DtExam:GetAll';
export default function DtExamReducer(state = null, data) {
    switch (data.type) {
        case DtExamGetPage:
            return Object.assign({}, state, { page: data.page });
        case DtDinhChiThiGetPage:
            return Object.assign({}, state, { pageDinhChi: data.page });
        case DtExamGetAll:
            return Object.assign({}, state, { items: data.items });
        default:
            return state;
    }
}

T.initPage('pageDtExam');
export function getPageDtExam(pageNumber, pageSize, pageCondition, filter, done) {
    return dispatch => {
        const page = T.updatePage('pageDtExam', pageNumber, pageSize, pageCondition, filter);
        const url = `/api/dt/exam/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu lịch thi bị lỗi', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: DtExamGetPage, page: result.page });
                done && done(result.page);
            }
        });
    };
}

T.initPage('pageDinhChiThi');
export function getPageDinhChiThi(pageNumber, pageSize, pageCondition, filter, done) {
    return dispatch => {
        const page = T.updatePage('pageDinhChiThi', pageNumber, pageSize, pageCondition, filter);
        const url = `/api/dt/exam/dinh-chi-thi/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, result => {
            if (result.error) {
                T.notify('Lấy dữ liệu hoãn/cấm thi bị lỗi', 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: DtDinhChiThiGetPage, page: result.page });
                done && done(result.page);
            }
        });
    };
}

export function getDtExamHocPhan(maHocPhan, done) {
    return () => {
        const url = `/api/dt/exam/item/${maHocPhan}`;
        T.get(url, {}, result => {
            if (result.error) {
                T.notify('Lấy thông tin lịch thi bị lỗi', 'danger');
                console.error(result.error);
            } else {
                done && done(result.items);
            }
        });
    };
}

export function createDtExam({ items, dssv, filter }, done) {
    return () => {
        const url = '/api/dt/exam/multiple';
        T.post(url, { items, dssv, filter }, data => {
            if (data.error) {
                T.notify('Tạo lịch thi lỗi', 'danger');
                console.error(data.error);
            } else {
                done && done(data);
            }
        });
    };
}

export function updateDtExam(items, done) {
    return () => {
        const url = '/api/dt/exam/multiple';
        T.put(url, { items }, (result) => {
            if (result.error) {
                T.notify(typeof (result.error) == 'string' ? result.error : 'Điều chỉnh thông tin lỗi', 'danger');
                console.error(result.error);
            } else {
                done && done();
            }
        });
    };
}

export function deleteDtExam(maHocPhan, filter, done) {
    return () => {
        const url = '/api/dt/exam';
        T.delete(url, { maHocPhan, filter }, result => {
            if (result.error) {
                T.alert(result.error.message || 'Xoá lịch thi bị lỗi!', 'error', false, 2000);
                console.error(result.error);
            } else {
                done && done();
            }
        });
    };
}

export function getDtExamGetSinhVien(filter, done) {
    return () => {
        const url = '/api/dt/exam/sinh-vien';
        T.get(url, { filter }, result => {
            if (result.error) {
                T.notify('Lấy danh sách sinh viên bị lỗi', 'danger');
                console.error(result.error);
            } else {
                done && done(result);
            }
        });
    };
}

export function getDtExamGetSinhVienDangKy(filter, done) {
    return () => {
        const url = '/api/dt/exam/sinh-vien-dang-ky';
        T.get(url, { filter }, result => {
            if (result.error) {
                T.notify('Lấy danh sách sinh viên bị lỗi', 'danger');
                console.error(result.error);
            } else {
                done && done(result.items);
            }
        });
    };
}

export function updateDtExamGetSinhVien(sinhVien, change, done) {
    return () => {
        const url = '/api/dt/exam/sinh-vien';
        T.put(url, { sinhVien, change }, result => {
            if (result.error) {
                T.notify('Cập nhật sinh viên bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật sinh viên thành công', 'success');
                done && done();
            }
        });
    };
}

export function dinhChiThiSinhVien(listSV, done) {
    return () => {
        const url = '/api/dt/exam/dinh-chi-thi-sinh-vien';
        T.post(url, { listSV }, result => {
            if (result.error) {
                T.notify('Cập nhật sinh viên bị lỗi', 'danger');
                console.error(result.error);
            } else {
                done && done();
            }
        });
    };
}

export function hoanTacdinhChiThi(id, done) {
    return () => {
        const url = '/api/dt/exam/dinh-chi-thi-sinh-vien';
        T.put(url, { id }, result => {
            if (result.error) {
                T.notify('Cập nhật sinh viên bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật sinh viên thành công', 'success');
                done && done();
            }
        });
    };
}

export function updateSinhVienPhongThi(listSV, listPhong, done) {
    return () => {
        const url = '/api/dt/exam/sinh-vien-phong-thi';
        T.put(url, { listSV, listPhong }, result => {
            if (result.error) {
                T.notify('Chuyển sinh viên bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Chuyển sinh viên thành công', 'success');
                done && done(result.items);
            }
        });
    };
}

export function updateSinhVienBoSung(listSV, phongGan, done) {
    return () => {
        const url = '/api/dt/exam/sinh-vien-bo-sung';
        T.put(url, { listSV, phongGan }, result => {
            if (result.error) {
                T.notify('Gán sinh viên bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Gán sinh viên thành công', 'success');
                done && done(result.items);
            }
        });
    };
}

export function getDtExamSinhVienHoanThi(filter, done) {
    return () => {
        const url = '/api/dt/exam/sinh-vien-hoan-thi';
        T.get(url, { filter }, result => {
            if (result.error) {
                T.notify('Lấy danh sách sinh viên bị lỗi', 'danger');
                console.error(result.error);
            } else {
                done && done(result.items);
            }
        });
    };
}

export function createDtExamSinhVienHoanThi({ listSv, phongThi }, done) {
    return () => {
        const url = '/api/dt/exam/sinh-vien-hoan-thi';
        T.post(url, { listSv, phongThi }, data => {
            if (data.error) {
                T.notify('Thêm sinh viên hoãn thi bị lỗi!', 'danger');
                console.error(data.error);
            } else {
                done && done(data);
            }
        });
    };
}


export function checkIfTrungLich(dssv, filter, done) {
    return () => {
        const url = '/api/dt/exam/check-if-trung-lich';
        T.post(url, { dssv, filter }, result => {
            if (result.error) {
                T.notify('Kiểm tra các ràng buộc lỗi', 'danger');
                console.error(result.error);
            } else if (result.warning) {
                T.notify(result.warning, 'warning');
            }
            done(result.isTrung);
        });
    };
}

export function updateThoiGianCongBo(listHP, filter, change, done) {
    return () => {
        const url = '/api/dt/exam/thoi-gian-cong-bo';
        T.put(url, { listHP, filter, change }, result => {
            if (result.error) {
                T.notify('Thiết lập thời gian công bố bị lỗi', 'danger');
                console.error(result.error);
            } else {
                T.notify('Thiết lập thời gian công bố thành công', 'success');
                done && done();
            }
        });
    };
}

export const SelectAdapter_DtExamPhongThi = (filter) => ({
    ajax: true,
    url: '/api/dt/exam/phong-thi',
    data: params => ({ searchTerm: params.term, filter }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.id, text: `${item.maHocPhan}: Ca ${item.caThi}_${item.phong}: ${item.soLuong}`, item })) : [] }),
    fetchOne: (id, done) => (getDtExamHocPhan(id, item => item && done && done({ id: item, text: item })))(),
});

export const SelectAdapter_CanBoGiamThi = (filter) => ({
    ajax: true,
    url: '/api/dt/exam/giam-thi',
    data: params => ({ searchTerm: params.term, filter }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.shcc, text: `${item.shcc}: ${item.ho} ${item.ten}` })) : [] }),
    fetchOne: (shcc, done) => (getDtCanBo(shcc, item => item && done && done({ id: item.shcc, text: `${item.shcc}: ${item.ho} ${item.ten}` })))()
});
