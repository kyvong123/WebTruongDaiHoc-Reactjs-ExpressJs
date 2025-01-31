// import { getScheduleSettings } from '../svDtSetting/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, TableCell, renderTable, getValue, FormSelect, FormTextBox, AdminModal, FormTabs } from 'view/component/AdminPage';
import { getBoTieuChi, submitBangDanhGiaKhoa } from './redux/danhGiaDrlRedux';
import { getStudentsPhucKhaoAll, submitBangDanhGiaPhucKhao } from './redux/reduxPhucKhao';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { getScheduleSettings } from 'modules/mdTccb/tccbDtSetting/redux';
import UploadModal from 'modules/mdSinhVien/svDanhGiaDrl/minhChungModal';
// import { Img } from 'view/component/HomePage';
import { Popper, Tooltip } from '@mui/material';

import DrlTable from 'modules/mdCongTacSinhVien/svDrlDanhGia/component/drlTable';
// import { SelectAdapter_HocKy } from './redux';
const TcTitle = 0, TcSelect = 1, TcRange = 2, TcScalar = 3;
export const STATUS_MAPPER = {
    'D': <span className='text-success'><i className='fa fa-check' /> Đã Xử Lý</span>,
    'N': <span className='text-danger'><i className='fa fa-plus-square' /> Đăng ký mới</span>,
};

const loaiTcLabel = (loaiTc, diemMax) => {
    if (loaiTc == TcTitle || loaiTc == TcScalar) {
        return <span className='font-weight-bold' style={{ whiteSpace: 'nowrap' }}>{diemMax}</span>;
    } else if (loaiTc == TcSelect) {
        const data = JSON.parse(diemMax);
        return <span className='font-weight-bold' style={{ whiteSpace: 'nowrap' }}>{data.map((item) => item.diem).join(' / ')}</span>;
    } else if (loaiTc == TcRange) {
        const data = JSON.parse(diemMax);
        return <span className='font-weight-bold' style={{ whiteSpace: 'nowrap' }}>{data[0]} - {data[1]}</span>;
    } else return '';
};
class CheckLyDoModal extends AdminModal {
    state = { filePath: null }
    lyDoDanhGiaKhoa = {}

    onShow = () => {
        let { lsDiemDiff } = this.props;
        lsDiemDiff.forEach(item => this.lyDoDanhGiaKhoa[item.maTieuChi].value(''));
    }

    onSubmit = () => {
        let { lsDiemDiff } = this.props;
        lsDiemDiff = lsDiemDiff.map(item => ({ ...item, lyDoF: getValue(this.lyDoDanhGiaKhoa[item.maTieuChi]) }));
        this.props.setLyDo(lsDiemDiff);
        this.hide();
    }

    render = () => {
        const { lsDiemDiff } = this.props;
        let table = renderTable({
            getDataSource: () => lsDiemDiff,
            emptyTable: 'Không có dữ liệu',
            header: 'thead-light',
            stickyHead: false,
            renderHead: () => (<tr>
                <th style={{ widht: 'auto', whiteSpace: 'nowrap' }}>#</th>
                <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tiêu chí</th>
                <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Lớp</th>
                <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Khoa</th>
                <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Lý do đánh giá</th>
            </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={index + 1} />
                    <TableCell type='text' content={item.tenTieuChi || ''} />
                    <TableCell type='number' content={item.diemLt || ''} />
                    <TableCell type='number' content={item.diemF} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={
                        <FormTextBox ref={e => this.lyDoDanhGiaKhoa[item.maTieuChi] = e} required />
                    } />

                </tr>
            )
        });
        return this.renderModal({
            title: 'Thêm lý do',
            size: 'elarge',
            body: (
                table
            ),
        });
    };
}

class SubmitDrlPhucKhaoModal extends AdminModal {
    state = { dataSubmit: [] }

    onShow = (data) => {
        this.setState({ dataSubmit: data });
    }

    onSubmit = () => {
        const { dataSubmit } = this.state;
        this.props.submitBangDanhGiaPhucKhao(dataSubmit, dataSubmit.mssv, () => this.hide() || this.props.loadPage());
    }

    render = () => {
        const { lsPhucKhao } = this.state.dataSubmit;
        let table = renderTable({
            getDataSource: () => lsPhucKhao,
            emptyTable: 'Không có dữ liệu',
            header: 'thead-light',
            stickyHead: false,
            renderHead: () => (<tr>
                <th style={{ widht: 'auto', whiteSpace: 'nowrap' }}>#</th>
                <th style={{ width: '60%', whiteSpace: 'nowrap' }}>Tiêu chí</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Điểm</th>
                <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Thông tin điểm</th>
                <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Phúc khảo</th>
            </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={index + 1} />
                    <TableCell type='text' content={item.tenTieuChi || ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={loaiTcLabel(item.loaiTc, item.diemMax)} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={<>
                        Sinh viên: {JSON.parse(item.dataTruoc).diemSv}<br />
                        Lớp: {JSON.parse(item.dataTruoc).diemLt}<br />
                        Khoa: {JSON.parse(item.dataTruoc).diemF}<br />
                    </>} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.dataSau ? <>
                        Sinh viên: {JSON.parse(item.dataSau).diemSv}<br />
                        Lớp: {JSON.parse(item.dataSau).diemLt}<br />
                        Khoa: {JSON.parse(item.dataSau).diemF}<br />
                    </> : ''} />
                </tr>)
        });
        return this.renderModal({
            title: 'Dữ liệu phúc khảo',
            submitText: 'Xác nhận',
            size: 'elarge',
            body: (
                table
            ),
        });
    };
}

class UserPage extends AdminPage {
    state = {
        isLoading: false, lsBoTieuChi: [], tongKetInfo: null, lsDiemDanhGia: [], lsFileMinhChung: [], lsDiemDiff: [], isSearch: false, namHocHienTai: '', hocKyHienTai: '', namHoc: '', hocKy: '', mssv: '', maLyDoEdit: null,
        lyDoDanhGiaKhoa: {}
    }
    timeoutId = {}
    diemTieuChiSv = {}
    diemTieuChiLt = {}
    diemTieuChiKhoa = {}
    lyDoDanhGia = {}

    componentDidMount() {
        T.ready('/user/ctsv', () => {
            let route = T.routeMatcher('/user/khoa/danh-gia-drl/:mssv'),
                mssv = route.parse(window.location.pathname).mssv;
            this.mssv = mssv;
            this.props.getScheduleSettings(data => {
                let namHoc = T.storage('tccbDrl:namHoc')?.namHoc ?? data.currentSemester.namHoc,
                    hocKy = T.storage('tccbDrl:hocKy')?.hocKy ?? data.currentSemester.hocKy;
                T.storage('tccbDrl:namHoc', { namHoc });
                T.storage('tccbDrl:hocKy', { hocKy });
                this.setState({ namHocHienTai: data.currentSemester.namHoc, hocKyHienTai: data.currentSemester.hocKy, namHoc, hocKy, mssv }, () => {
                    this.loadPage();
                });
                this.hocKy.value(hocKy);
                this.namHoc.value(namHoc);
            });
        });
    }

    loadPage = (needLoading = true) => {
        this.setState({ isLoading: needLoading }, () => {
            const { namHoc, hocKy, mssv } = this.state,
                lyDoDanhGiaKhoa = { ...this.state.lyDoDanhGiaKhoa };

            getBoTieuChi(namHoc, hocKy, mssv, data => this.setState({
                data,
                isLoading: false,
                svInfo: data.svInfo,
                canEdit: data.canEdit,
                timeStart: data.timeStart,
                timeEnd: data.timeEnd,
                tongKetInfo: data.tongKetInfo, diemTrungBinh: data.diemTrungBinh,
                lsBoTieuChi: data.lsBoTieuChi, lsDiemDanhGia: data.lsDiemDanhGia,
                lsFileMinhChung: data.lsDiemDanhGia.filter(diem => diem.minhChung != null).map(diem => ({
                    maTieuChi: diem.maTieuChi, filePath: diem.minhChung
                }))
            }, () => {
                // const { lsDiemDanhGia } = this.state;
                // lsDiemDanhGia.forEach(diem => {
                //     this.diemTieuChiSv[diem.maTieuChi]?.value(diem.diemSv || diem.diemSv == 0 ? diem.diemSv.toString() : '');
                //     this.diemTieuChiLt[diem.maTieuChi]?.value(diem.diemLt || diem.diemLt == 0 ? diem.diemLt.toString() : '');
                //     this.diemTieuChiKhoa[diem.maTieuChi]?.value(diem.diemF || diem.diemF == 0 ? diem.diemF.toString() : '');
                //     this.lyDoDanhGia[diem.maTieuChi]?.value(diem.lyDoLt || '');
                //     // this.lyDoDanhGiaKhoa[diem.maTieuChi]?.value(diem.lyDoF || '');
                //     lyDoDanhGiaKhoa[diem.maTieuChi] = diem.lyDoF || '';
                // });
                // let tongDiem = this.state.lsBoTieuChi.reduce((init, item) => init + Number(lsDiemDanhGia.find(diem => diem.maTieuChi == item.ma)?.diemSv || 0), 0),
                //     tongDiemLt = this.state.lsBoTieuChi.reduce((init, item) => init + Number(lsDiemDanhGia.find(diem => diem.maTieuChi == item.ma)?.diemLt || 0), 0),
                //     tongDiemKhoa = this.state.lsBoTieuChi.reduce((init, item) => init + Number(lsDiemDanhGia.find(diem => diem.maTieuChi == item.ma)?.diemF || 0), 0);
                // tongDiemKhoaFinal = data.tongKetInfo?.fSubmit ? data.tongKetInfo?.fSubmit : tongDiemKhoa;
                // tongDiem = tongDiem > 90 ? 90 : tongDiem;
                // tongDiemLt = tongDiemLt > 90 ? 90 : tongDiemLt;
                // tongDiemKhoa = tongDiemKhoa > 90 ? 90 : tongDiemKhoa;
                // const diemFinal = data.tongKetInfo?.tkSubmit || data.tongKetInfo?.fSubmit || '';
                // const diemFinalKhoa = data.tongKetInfo?.fSubmit ? data.tongKetInfo?.fSubmit : tongDiemKhoa;
                const diemKyLuat = data.tongKetInfo?.kyLuat?.length > 0 ? Math.min(...data.tongKetInfo?.kyLuat.map(hinhThuc => hinhThuc.drlMax)) : null;
                // const diemFinalDuKien = diemFinalKhoa ? Math.min(diemFinalKhoa + parseInt(data.diemTrungBinh || 0), diemKyLuat || Infinity) : null;
                const diemFinal = data.tongKetInfo?.tkSubmit;

                this.setState({
                    // tongDiem, tongDiemLt, tongDiemKhoa, 
                    diemFinal, diemKyLuat,
                    // diemFinalKhoa, diemFinalDuKien,
                    lyDoDanhGiaKhoa
                });
                // this.tongDiem?.value(tongDiem);
                // this.tongDiemLt?.value(tongDiemLt);
                // this.tongDiemKhoa?.value(tongDiemKhoa);
                // this.lyDoTongKetKhoa?.value(data.tongKetInfo?.lyDoF || '');
                this.diemTongKet?.value(diemFinal);
            }));
            this.props.getStudentsPhucKhaoAll(mssv, this.state.namHoc, this.state.hocKy, itemsPk => {
                // Build phúc khảo mapper
                this.setState({ listPk: Object.assign({}, ...itemsPk.map(item => ({ [item.maTieuChi]: item }))) });
            });
        });
    }

    genDataNamHoc = (nam) => {
        const currYear = new Date().getFullYear();
        this.setState({ namHoc: Array.from({ length: currYear - nam + 1 }, (_, i) => `${nam + i} - ${nam + i + 1} `) });
    }

    drlMapper(diem) {
        if (diem >= 90) {
            return <span className='font-weight-bold' style={{ color: '#019445' }}>Xuất sắc</span>;
        } else if (diem >= 80 && diem < 90) {
            return <span className='font-weight-bold' style={{ color: '#91cb63' }}>Tốt</span>;
        } else if (diem >= 65 && diem < 80) {
            return <span className='font-weight-bold' style={{ color: '#fdb041' }}>Khá</span>;
        } else if (diem >= 50 && diem < 65) {
            return <span className='font-weight-bold' style={{ color: '#f25b2a' }}>Trung bình</span>;
        } else {
            return diem != 0 ? <span className='font-weight-bold' style={{ color: '#e22024' }}>Yếu</span> : '';
        }
    }

    kyLuatMapper = (danhSachKyLuat) => {
        const results = [];
        for (let i = 0; i < danhSachKyLuat.length; i++) {
            let s = danhSachKyLuat[i];
            results.push(<div key={results.length}> <span>
                {i + 1}. {s.tenKyLuat} {s.drlMax && (`(Điểm rèn luyện tối đa là ${s.drlMax})`)}
            </span></div>);
        }
        return results;
    }

    findItem = (list, ma) => {
        for (let item of list) {
            if (item.ma === ma) {
                return item;
            } else if (item.dsTieuChiCon) {
                let foundItem = this.findItem(item.dsTieuChiCon, ma);
                if (foundItem) {
                    return foundItem;
                }
            }
        }
        return null;
    }

    setDiemDanhGiaKhoa = (e, ma, maCha) => {
        const tieuChiCha = maCha ? this.findItem(this.state.lsBoTieuChi, maCha) : this.findItem(this.state.lsBoTieuChi, ma);
        let diemTong = 0;
        if (tieuChiCha.dsTieuChiCon?.length) {
            diemTong = tieuChiCha.dsTieuChiCon.reduce((init, item) => {
                const diemCong = getValue(this.diemTieuChiKhoa[item.ma]) ? Number(getValue(this.diemTieuChiKhoa[item.ma])) : 0;
                if (item.loaiTc == TcRange) {
                    const data = JSON.parse(item.diemMax);
                    if (diemCong != 0 && (diemCong < data[0] || diemCong > data[1])) {
                        T.notify('Không nằm trong khoảng cho phép', 'danger');
                        // this.diemTieuChiKhoa[item.ma].value(0);
                        return init + 0;
                    } else return init + diemCong;
                } else if (item.loaiTc == TcTitle || item.loaiTc == TcScalar) {
                    if (diemCong > Number(item.diemMax)) {
                        this.diemTieuChiKhoa[item.ma].value(Number(item.diemMax));
                        return init + Number(item.diemMax);
                    } else return init + diemCong;
                } else return init + diemCong;
            }, 0);
            if (diemTong > Number(tieuChiCha.diemMax)) {
                diemTong = Number(tieuChiCha.diemMax);
            }
        } else {
            diemTong = getValue(this.diemTieuChiKhoa[maCha ? maCha : ma]) || '';
            if (diemTong > Number(tieuChiCha.diemMax)) {
                diemTong = Number(tieuChiCha.diemMax);
            }
        }
        if (this.timeoutId[maCha]) {
            clearTimeout(this.timeoutId[maCha]);
        }
        this.timeoutId[maCha] = setTimeout(() => {
            this.diemTieuChiKhoa[maCha ? maCha : ma]?.value(diemTong || '');
            tieuChiCha.maCha && this.setDiemDanhGiaKhoa(e, tieuChiCha.maCha, null);
            const tongDiemKhoa = this.state.lsBoTieuChi.reduce((init, item) => init + Number(getValue(this.diemTieuChiKhoa[item.ma]) || 0), 0);
            this.tongDiemKhoa.value(tongDiemKhoa > 90 ? 90 : tongDiemKhoa);
            // this.tongDiem.value(0);
        }, 500);
    }

    checkRange = (val, range, item) => {
        if (this.timeoutId[item.ma]) {
            clearTimeout(this.timeoutId[item.ma]);
        }
        this.timeoutId[item.ma] = setTimeout(() => {
            if (val) {
                const [minVal, maxVal] = range;
                if (val < parseInt(minVal)) {
                    this.diemTieuChi[item.ma].value(minVal);
                    val = minVal;
                } if (val > parseInt(maxVal)) {
                    this.diemTieuChi[item.ma].value(maxVal);
                    val = maxVal;
                }
            } else {
                val = 0;
            }
            this.setDiemDanhGiaKhoa(val, item.ma, item.maCha);
        }, 500);
    }

    getDsDrl = (list) => {
        const res = list.reduce((prev, item) => {
            const diemF = Number(getValue(this.diemTieuChiKhoa[item.ma]));
            if (item.dsTieuChiCon?.length) {
                prev.push({
                    maTieuChi: item.ma,
                    diemF,
                    // lyDoF: this.lyDoDanhGiaKhoa[item.ma]?.value(),
                    lyDoF: this.state.lyDoDanhGiaKhoa[item.ma],
                    tenTieuChi: item.ten,
                    minhChung: item.minhChung,
                    isDiff: false
                });
                prev = prev.concat(this.getDsDrl(item.dsTieuChiCon));
            } else {
                prev.push({
                    maTieuChi: item.ma,
                    diemF,
                    // lyDoF: this.lyDoDanhGiaKhoa[item.ma]?.value(),
                    lyDoF: this.state.lyDoDanhGiaKhoa[item.ma],
                    tenTieuChi: item.ten,
                    minhChung: item.minhChung,
                    isDiff: true
                });
            }
            return prev;
        }, []);
        return res;
    }

    submitDrl = () => {
        const { lsBoTieuChi, mssv, lyDoDanhGiaKhoa } = this.state;
        const arrDiemDanhGia = this.getDsDrl(lsBoTieuChi, []);
        let lsDiemDiff = [];
        arrDiemDanhGia.forEach(item => {
            const diemLt = getValue(this.diemTieuChiLt[item.maTieuChi]);
            if (item.isDiff && diemLt && item.diemF != Number(diemLt)) {
                // if (!getValue(this.lyDoDanhGiaKhoa[item.maTieuChi])) {
                if (!lyDoDanhGiaKhoa[item.maTieuChi]) {
                    lsDiemDiff.push({
                        diemLt: Number(diemLt),
                        maTieuChi: item.maTieuChi,
                        diemF: item.diemF,
                        tenTieuChi: item.tenTieuChi,
                        lyDoF: lyDoDanhGiaKhoa[item.maTieuChi]
                    });
                } else item.lyDoF = lyDoDanhGiaKhoa[item.maTieuChi];
            }
        });
        this.setState({ lsDiemDiff }, () => {
            if (this.state.lsDiemDiff.length) {
                this.checkLyDoModal.show();
            } else {
                T.confirm('Lưu bảng đánh giá', 'Bạn có chắc muốn lưu bảng đánh giá điểm rèn luyện ?', 'warning', true, (isConfirm) => {
                    if (isConfirm) {
                        submitBangDanhGiaKhoa({
                            namHoc: getValue(this.namHoc),
                            hocKy: getValue(this.hocKy),
                            arrDiemDanhGia
                        }, mssv, () => this.loadPage(false));
                    }
                });
            }
        });
    }

    setDefaultDiemKhoa = () => {
        const { lsBoTieuChi } = this.state;
        T.confirm('Xác nhận chấp nhận điểm của cán bộ lớp!', '<p class="text-danger"><b>Lưu ý:</b> Tất cả lý do đánh giá khác điểm hiện tại sẽ bị xóa</p>', isConfirm => {
            if (isConfirm) {
                this.setDefaultDiemKhoaRecur(lsBoTieuChi || []);
                this.tongDiemKhoa.value(this.tongDiemLt.value());
                this.setState({ lyDoDanhGiaKhoa: {} });
            }
        });
    }

    setDefaultDiemKhoaTheoSv = () => {
        T.confirm('Xác nhận chấp nhận điểm của sinh viên!', '<p class="text-danger"><b>Lưu ý:</b> Tất cả lý do đánh giá khác điểm hiện tại sẽ bị xóa</p>', isConfirm => {
            if (isConfirm) {
                const { lsBoTieuChi } = this.state;
                this.setDefaultDiemKhoaTheoSvRecur(lsBoTieuChi || []);
                this.tongDiemKhoa.value(this.tongDiem.value());
                this.setState({ lyDoDanhGiaKhoa: {} });
            }
        });
    }

    setDefaultDiemKhoaRecur = (listTieuChi = []) => {
        listTieuChi.forEach(tieuChi => {
            const diem = this.diemTieuChiLt[tieuChi.ma].value() || '';
            this.diemTieuChiKhoa[tieuChi.ma].value(diem);
            this.setDefaultDiemKhoaRecur(tieuChi.dsTieuChiCon);
        });
    }

    setDefaultDiemKhoaTheoSvRecur = (listTieuChi = []) => {
        listTieuChi.forEach(tieuChi => {
            const diem = this.diemTieuChiSv[tieuChi.ma].value() || '';
            this.diemTieuChiKhoa[tieuChi.ma].value(diem);
            this.setDefaultDiemKhoaTheoSvRecur(tieuChi.dsTieuChiCon);
        });
    }

    submitDrlPhucKhao = () => {
        const { lsBoTieuChi, mssv } = this.state;
        const arrDiemDanhGia = this.getDsDrl(lsBoTieuChi, []);
        const list = this.props.tccbDanhGiaDrlPhucKhao ? this.props.tccbDanhGiaDrlPhucKhao.items : [];
        const data = {
            namHoc: getValue(this.namHoc),
            hocKy: getValue(this.hocKy),
            arrDiemDanhGia,
            lsPhucKhao: list.filter(item => item.tinhTrang == 'N').map(item => ({
                ...item,
                dataSau: JSON.stringify({ diemSv: getValue(this.diemTieuChiSv[item.maTieuChi]), diemLt: getValue(this.diemTieuChiLt[item.maTieuChi]), diemF: getValue(this.diemTieuChiKhoa[item.maTieuChi]) }),
                maTieuChi: item.maTieuChi
            })),
            mssv
        };
        this.submitDrlPhucKhaoModal.show(data);
    }

    setLichSuDiem = (listTieuChi, listDiem) => {
        const lyDoDanhGiaKhoa = { ...this.state.lyDoDanhGiaKhoa };
        listTieuChi.forEach(item => {
            const diem = listDiem.find(diem => diem.maTieuChi == item.ma) || null;
            this.diemTieuChiSv[item.ma]?.value((diem && diem.diemSv) ? diem.diemSv : '');
            this.diemTieuChiLt[item.ma]?.value((diem && diem.diemLt) ? diem.diemLt : '');
            this.diemTieuChiKhoa[item.ma]?.value((diem && diem.diemF) ? diem.diemF : '');
            this.lyDoDanhGia[item.ma]?.value((diem && diem.lyDoLt) ? diem.lyDoLt : '');
            // this.lyDoDanhGiaKhoa[item.ma]?.value((diem && diem.lyDoF) ? diem.lyDoF : '');
            lyDoDanhGiaKhoa[item.ma] = (diem && diem.lyDoF) ? diem.lyDoF : '';
            if (item.dsTieuChiCon.length) {
                this.setLichSuDiem(item.dsTieuChiCon, listDiem);
            }
        });
        this.setState({ lyDoDanhGiaKhoa });
    }

    changeNamHoc = (value) => {
        T.storage('tccbDrl:namHoc', { namHoc: value.id });
        this.setState({ namHoc: value.id }, () => {
            this.loadPage();
        });
    }

    changeHocKy = (value) => {
        T.storage('tccbDrl:hocKy', { hocKy: value.id });
        this.setState({ hocKy: value.id }, () => {
            this.loadPage();
        });
    }

    setLyDo = (list) => {
        const lyDoDanhGiaKhoa = { ...this.state.lyDoDanhGiaKhoa };
        list.forEach(item => {
            lyDoDanhGiaKhoa[item.maTieuChi] = item.lyDoF;
        });
        this.setState({ lsDiemDiff: list, lyDoDanhGiaKhoa }, () => this.submitDrl());
    }

    setLyDoForm = (e, item) => {
        this.lyDoDanhGiaForm?.value(this.state.lyDoDanhGiaKhoa[item.ma]);
        this.setState({ maLyDoEdit: item.ma, lyDoEditElement: e.currentTarget });
    }

    luuLyDoForm = (item) => {
        const lyDoDanhGiaKhoa = { ...this.state.lyDoDanhGiaKhoa };
        lyDoDanhGiaKhoa[item.ma] = this.lyDoDanhGiaForm.value();
        this.setState({ maLyDoEdit: null, lyDoDanhGiaKhoa });
    }


    initRows = (maCha, list, level, indexing = '') => {
        const { namHoc, hocKy, lsFileMinhChung, mssv, maLyDoEdit, lyDoDanhGiaKhoa } = this.state;
        const readOnly = this.state.canEdit ? '' : true;
        // const listPk = this.props.tccbDanhGiaDrlPhucKhao ? this.props.tccbDanhGiaDrlPhucKhao.items : [];
        const listPk = this.state.listPk || {};
        const res = list.reduce((prev, item, index) => {
            if (item.dsTieuChiCon?.length) {
                prev.push(<tr key={`${item.ma}`}>
                    <TableCell content={indexing ? indexing + '.' + (index + 1) : (index + 1)} style={{ fontWeight: item.loaiTc == TcTitle ? 'bold' : '' }} />
                    <TableCell content={item.ten} style={{ fontWeight: item.loaiTc == TcTitle ? 'bold' : '' }} />
                    <TableCell type='text' content={loaiTcLabel(item.loaiTc, item.diemMax)} style={{ textAlign: 'center' }} />
                    <TableCell style={{ textAlign: 'center' }} content={
                        item.loaiTc == TcSelect ? <FormSelect className='mb-0' ref={e => this.diemTieuChiSv[item.ma] = e} data={[0, ...JSON.parse(item.diemMax, '[]').map(item => item.diem)]} readOnly={true} /> :
                            <FormTextBox className='mb-0' type='number' ref={e => this.diemTieuChiSv[item.ma] = e} readOnly={true} />
                    }
                    />
                    <TableCell style={{ textAlign: 'center' }} content={
                        item.loaiTc == TcSelect ? <FormSelect className='mb-0' ref={e => this.diemTieuChiLt[item.ma] = e} data={[0, ...JSON.parse(item.diemMax, '[]').map(item => item.diem)]} readOnly={true} /> :
                            <FormTextBox className='mb-0' type='number' ref={e => this.diemTieuChiLt[item.ma] = e} readOnly={true} />
                    }
                    />
                    <TableCell style={{ textAlign: 'center' }} content={
                        item.loaiTc == TcSelect ? <FormSelect className='mb-0' ref={e => this.diemTieuChiKhoa[item.ma] = e} data={[0, ...JSON.parse(item.diemMax, '[]').map(item => item.diem)]} onChange={e => this.setDiemDanhGiaKhoa(e, item.ma, maCha)} readOnly={true} /> :
                            <FormTextBox className='mb-0' type='number' ref={e => this.diemTieuChiKhoa[item.ma] = e} onChange={e => this.setDiemDanhGiaKhoa(e, item.ma, maCha)} readOnly={true} />
                    }
                    />
                    <TableCell content={''} style={{ textAlign: 'center' }} />
                </tr>);
                prev = prev.concat(this.initRows(item.ma, item.dsTieuChiCon, level + 1, indexing ? indexing + '.' + (index + 1) : (index + 1)));
            } else {
                item.minhChung = lsFileMinhChung.find(file => file.maTieuChi == item.ma)?.filePath || null;
                const isEdit = item.ma == maLyDoEdit;
                // const showButton = ((lsDiemDanhGia.find(diem => diem.maTieuChi == item.ma)?.lyDoF
                //     || lsDiemDiff.some(diem => (diem.maTieuChi == item.ma && diem.lyDoF))) && this.state.canEdit)
                //     || (listPk[item.ma] && listPk[item.ma].tinhTrang == 'N');
                const showButton = ((item.lyDoF || lyDoDanhGiaKhoa[item.ma]) && this.state.canEdit)
                    || (listPk[item.ma] && listPk[item.ma].tinhTrang == 'N');
                prev.push(<tr key={`${item.ma}`}>
                    <TableCell content={indexing ? indexing + '.' + (index + 1) : (index + 1)} />
                    <TableCell content={item.ten} />
                    <TableCell content={loaiTcLabel(item.loaiTc, item.diemMax)} style={{ textAlign: 'center' }} />
                    <TableCell style={{ textAlign: 'center' }} content={
                        item.loaiTc == TcSelect ? <FormSelect className='mb-0' ref={e => this.diemTieuChiSv[item.ma] = e} data={[0, ...JSON.parse(item.diemMax, '[]').map(item => item.diem)]} readOnly={true} /> :
                            <FormTextBox className='mb-0' type='number' ref={e => this.diemTieuChiSv[item.ma] = e} readOnly={true} />
                    }
                    />
                    <TableCell style={{ textAlign: 'center' }} content={
                        <div className='position-relative'>
                            {item.loaiTc == TcSelect ? <FormSelect className='mb-0' style={{ display: 'inline-block' }} ref={e => this.diemTieuChiLt[item.ma] = e} data={[0, ...JSON.parse(item.diemMax, '[]').map(item => item.diem)]} readOnly={true} /> :
                                <FormTextBox className='mb-0' type='number' ref={e => this.diemTieuChiLt[item.ma] = e} readOnly={true} style={{ display: 'inline-block' }} />
                            }
                            {item.lyDoLt ? <Tooltip title={item.lyDoLt}><i className='text-primary fa fa-lg fa-question-circle ml-1' style={{ position: 'absolute', top: '0.3rem' }} /></Tooltip> : null}
                            {/* <FormTextBox type='text' className='text-sm mr-2 mb-0' ref={e => this.lyDoDanhGia[item.ma] = e} readOnly={true} /> */}
                        </div>
                    } />
                    <TableCell style={{ textAlign: 'center' }} content={
                        <div className='position-relative'>
                            <div className='d-flex justify-content-center align-items-end'>
                                {(() => {
                                    const _readOnly = readOnly && (!listPk[item.ma] || listPk[item.ma].tinhTrang != 'N');
                                    switch (item.loaiTc) {
                                        case TcSelect:
                                            return <FormSelect className='mb-0 input-group' style={{ maxWidth: readOnly && (!listPk[item.ma] || listPk[item.ma].tinhTrang != 'N') ? 'fit-content' : '', display: 'inline-block', width: '5rem' }} minimumResultsForSearch={-1} ref={e => this.diemTieuChiKhoa[item.ma] = e} data={[0, ...JSON.parse(item.diemMax, '[]').map(item => item.diem)]} onChange={e => this.setDiemDanhGiaKhoa(e, item.ma, maCha)} readOnly={_readOnly} />;
                                        case TcRange:
                                            return <FormTextBox className='mb-0' inputClassName='text-center' style={{ maxWidth: 'fit-content', display: 'inline-block', width: '5rem' }} type='number' ref={e => this.diemTieuChiKhoa[item.ma] = e} onChange={e => this.checkRange(e, JSON.parse(item.diemMax), item)} readOnly={_readOnly} />;
                                        default:
                                            return <FormTextBox className='mb-0' inputClassName='text-center' style={{ maxWidth: 'fit-content', display: 'inline-block', width: '5rem' }} type='number' ref={e => this.diemTieuChiKhoa[item.ma] = e} onChange={e => this.setDiemDanhGiaKhoa(e, item.ma, maCha)} readOnly={_readOnly} />;
                                    }
                                })()}
                                {/*Lớp trưởng: Lý do chấm khác điểm */}
                                {showButton && <>
                                    {isEdit ?
                                        <Tooltip title={'Lưu'}><button className={'btn btn-sm btn-success mb-1 ml-1'} type='button' onClick={() => this.luuLyDoForm(item)}><i className={'fa fa-check mr-0'} ></i></button></Tooltip> :
                                        <Tooltip title={<>
                                            <b>Lý do: </b><br />
                                            {lyDoDanhGiaKhoa[item.ma] ?? item.lyDoF ?? 'Chưa xác định'}`
                                        </>} placement='top-end'><button className={'btn btn-sm btn-primary mb-1 ml-1'} type='button' onClick={(e) => this.setLyDoForm(e, item)}><i className={'fa fa-commenting mr-0'} ></i></button></Tooltip>
                                    }
                                </>}
                            </div>
                            {/* <Popper open={item.ma == maLyDoEdit} anchorEl={this.state.lyDoEditElement} placement='top-end' keepMounted disablePortal>
                                <div className='tile bg-dark m-1'><FormTextBox ref={e => this.lyDoDanhGiaKhoa[item.ma] = e} style={{ zIndex: 10 }} placeholder='Lý do' className='text-sm mr-2 mb-0' inputStyle={{ whiteSpace: 'nowrap', minWidth: '150px', height: 'auto' }} /></div>
                            </Popper> */}
                            {readOnly && (!listPk[item.ma] || listPk[item.ma].tinhTrang != 'N') && item.lyDoF ? <Tooltip title={item.lyDoF}><i className='text-primary fa fa-lg fa-question-circle ml-2' style={{ position: 'absolute', top: '0.3rem' }} /></Tooltip> : null}
                        </div>
                    }
                    />
                    <TableCell content={
                        (item.coMinhChung ?
                            (item.minhChung ?
                                <span><button className='btn btn-link' onClick={(e) => e.preventDefault() || this.uploadModal.show(item, { mssv, namHoc, hocKy, index: indexing ? indexing + '.' + (index + 1) : (index + 1) })}>
                                    <i className='fa fa-sm fa-edit mr-1' />
                                    Chi tiết
                                </button></span>
                                : <span className='text-danger'>
                                    <i className='fa fa-sm fa-close mr-1' />
                                    Chưa có
                                </span>)
                            : '')
                    } style={{ textAlign: 'center' }} />
                </tr>);
            }
            return prev;
        }, []);

        return res;

    }

    componentPhucKhaoDiem = () => {
        const list = this.props.tccbDanhGiaDrlPhucKhao ? this.props.tccbDanhGiaDrlPhucKhao.items : [];
        let table = renderTable({
            getDataSource: () => list,
            emptyTable: 'Không có lịch sử đăng ký',
            header: 'thead-light',
            stickyHead: false,
            multipleTbody: true,
            renderHead: () => (<tr>
                <th style={{ widht: 'auto', whiteSpace: 'nowrap' }}>#</th>
                <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Tiêu chí</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Điểm</th>
                <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Thông tin điểm</th>
                <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Phúc khảo</th>
                <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Tình trạng</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={index + 1} />
                    <TableCell type='text' content={item.tenTieuChi || ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={loaiTcLabel(item.loaiTc, item.diemMax)} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={<>
                        Sinh viên: {JSON.parse(item.dataTruoc).diemSv}<br />
                        Lớp: {JSON.parse(item.dataTruoc).diemLt}<br />
                        Khoa: {JSON.parse(item.dataTruoc).diemF}<br />
                    </>} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.dataSau ? <>
                        Sinh viên: {JSON.parse(item.dataSau).diemSv}<br />
                        Lớp: {JSON.parse(item.dataSau).diemLt}<br />
                        Khoa: {JSON.parse(item.dataSau).diemF}<br />
                    </> : ''} />
                    <TableCell type='text' content={STATUS_MAPPER[item.tinhTrang]} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={
                        (item.tinhTrang == 'N') && <Tooltip title='Xử lý' arrow>
                            <button className='btn btn-info' onClick={e => {
                                e.preventDefault();
                                this.tabs.tabClick(null, 0);
                                setTimeout(() => this.diemTieuChiKhoa[item.maTieuChi].focus(), 250);
                                // list.forEach(item => {
                                //     (item.tinhTrang == 'N') && this.lyDoDanhGiaKhoa[item.maTieuChi]?.value('Điểm phúc khảo');
                                // });
                            }}>
                                <i className='fa fa-lg fa-pencil' />
                            </button>
                        </Tooltip>
                    } />
                </tr>)
        });
        return (<>
            <div className='row'>
                <div className='col-md-12' style={{ marginTop: '2%' }}>
                    {table}
                </div>
            </div>
        </>);
    }

    componentBangDanhGia = () => {
        const { namHoc, hocKy, listPk, maLyDoEdit } = this.state;
        const list = this.props.tccbDanhGiaDrlPhucKhao ? this.props.tccbDanhGiaDrlPhucKhao.items : [];


        return (<div className='tile-body position-relative'>
            <div className='d-flex justify-content-between align-items-center mb-3'>
                {/* {timeStart && timeEnd && <span>Thời gian: {(() => {
                    const now = Date.now();
                    const periodText = `${T.dateToText(timeStart)} - ${T.dateToText(timeEnd)}`;
                    if (now < timeStart) {
                        return <b className='text-primary'><i className='fa fa-clock-o pr-1' />{periodText}</b>;
                    } else if (now < timeEnd) {
                        return <b className='text-success'><i className='fa fa-check pr-1' />{periodText}</b>;
                    } else {
                        return <b className='text-danger'><i className='fa fa-times pr-1' />{periodText} </b>;
                    }
                })()}</span>} */}
                {/* <div>{this.state.canEdit ? <>
                    <button className='btn btn-warning mr-2' onClick={(e) =>
                        e.preventDefault() || this.setDefaultDiemKhoaTheoSv()
                    }><i className='fa fa-cogs' />Chấp nhận điểm sinh viên</button>
                    <button className='btn btn-info' onClick={(e) =>
                        e.preventDefault() || this.setDefaultDiemKhoa()
                    }><i className='fa fa-cogs' />Chấp nhận điểm lớp</button>
                </> : ''}</div> */}
            </div>
            {/* {table} */}
            <DrlTable namHoc={namHoc} hocKy={hocKy} mssv={this.state.mssv} user={'khoa'} readOnly={!this.state.canEdit} submit={submitBangDanhGiaKhoa} listPk={listPk} data={this.state.data} loadPage={this.loadPage} />

            <div className='d-flex justify-content-end'>
                {/* {this.state.canEdit ?
                    <button className='btn btn-success' onClick={e => e.preventDefault() || this.submitDrl()}>
                        <i className='fa fa-fw fa-lg fa-save' /> Lưu
                    </button> : ''} */}
                {list?.filter(item => item.tinhTrang == 'N').length ?
                    <button className='btn btn-success' onClick={e => e.preventDefault() || this.submitDrlPhucKhao()}>
                        <i className='fa fa-fw fa-lg fa-save' /> Lưu điểm phúc khảo
                    </button> : ''}
            </div>
            <UploadModal ref={e => this.uploadModal = e} readOnly={true} />
            <CheckLyDoModal ref={e => this.checkLyDoModal = e} lsDiemDiff={this.state.lsDiemDiff} setLyDo={this.setLyDo} />
            <SubmitDrlPhucKhaoModal ref={e => this.submitDrlPhucKhaoModal = e} submitBangDanhGiaPhucKhao={this.props.submitBangDanhGiaPhucKhao} loadPage={this.loadPage} />
            <Popper open={!!maLyDoEdit} anchorEl={this.state.lyDoEditElement} placement='top-end' keepMounted disablePortal>
                <div className='tile bg-light m-1 d-flex align-items-end'>
                    <FormTextBox ref={e => this.lyDoDanhGiaForm = e} label='Lý do' placeholder='Vui lòng điền lý do' className='text-sm mr-2 mb-0' inputStyle={{ whiteSpace: 'nowrap', minWidth: '150px', height: 'auto' }} />
                    <Tooltip title='Hủy'><button className='btn btn-sm btn-danger mb-1 ml-1' type='button' onClick={() => this.setState({ maLyDoEdit: null })}><i className='fa fa-times mr-0' ></i></button></Tooltip>
                </div>
            </Popper>
        </div>);
    }

    render() {
        const { svInfo } = this.state;
        return this.renderPage({
            title: 'Điểm rèn luyện',
            subTitle: svInfo != null && <>Sinh viên: <b>{svInfo.mssv} - {svInfo.hoTen} </b></>,
            icon: 'fa fa-graduation-cap',
            breadcrumb: ['Điểm rèn luyện'],
            backRoute: '/user/khoa/quan-ly-drl',
            header: <>
                <FormSelect ref={e => this.namHoc = e} data={SelectAdapter_SchoolYear} onChange={(value) => this.changeNamHoc(value)} className='mr-2' />
                <FormSelect ref={e => this.hocKy = e} data={[{ id: '1', text: 'HK1' }, { id: '2', text: 'HK2' }, { id: '3', text: 'HK3' }]} onChange={(value) => this.changeHocKy(value)} />
            </>,
            content: <div className='tile'>
                <FormTabs ref={e => this.tabs = e}
                    tabs={[
                        { title: 'Bảng đánh giá', component: this.componentBangDanhGia() },
                        { title: 'Đăng ký phúc khảo', component: this.componentPhucKhaoDiem() },
                    ]}
                />
            </div>,
        });
    }
}


const mapStateToProps = state => ({ system: state.system, tccbDanhGiaDrlPhucKhao: state.tccb.tccbDanhGiaDrlPhucKhao });
const mapActionsToProps = { getScheduleSettings, getStudentsPhucKhaoAll, submitBangDanhGiaPhucKhao };
export default connect(mapStateToProps, mapActionsToProps)(UserPage);