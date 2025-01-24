import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, TableCell, renderTable, getValue, FormTextBox, loadSpinner, AdminModal } from 'view/component/AdminPage';
// import { getBoTieuChi } from '../redux';
import { getScheduleSettings } from 'modules/mdCongTacSinhVien/ctsvDtSetting/redux';
import UploadModal from 'modules/mdSinhVien/svDanhGiaDrl/minhChungModal';
import { Tooltip } from '@mui/material';
import TieuChiCell from './tieuChiBase';
import { deleteMinhChung, deleteHoatDong } from 'modules/mdSinhVien/svDanhGiaDrl/redux';
import BaoHiemInfoAdminModal from 'modules/mdBaoHiemYTe/svBaoHiemYTe/BhModal';

const TcTitle = 0, TcSelect = 1, TcRange = 2, TcScalar = 3, TcLinkSuKien = 4;

const loaiTcLabel = (loaiTc, diemMax) => {
    if (loaiTc == TcTitle) {
        return <span className='font-weight-bold' style={{ whiteSpace: 'nowrap' }}>{diemMax}</span>;
    } else if (loaiTc == TcScalar || loaiTc == TcLinkSuKien) {
        return <span style={{ whiteSpace: 'nowrap' }}>{diemMax}</span>;
    } else if (loaiTc == TcSelect) {
        const data = JSON.parse(diemMax);
        return <span style={{ whiteSpace: 'nowrap' }}>{data.map((item) => item.diem).join(' / ')}</span>;
    } else if (loaiTc == TcRange) {
        const data = JSON.parse(diemMax);
        return <span style={{ whiteSpace: 'nowrap' }}>{data[0]} - {data[1]}</span>;
    } else return '';
};

class CheckLyDoModal extends AdminModal {
    state = { filePath: null }
    lyDoDanhGia = []

    onShow = () => {
        let { lsDiemDiff } = this.props;
        lsDiemDiff.forEach(item => this.lyDoDanhGia[item.maTieuChi].value(''));
    }

    onSubmit = () => {
        let { lsDiemDiff, user } = this.props;
        if (user == 'khoa') lsDiemDiff = lsDiemDiff.map(item => ({ ...item, lyDoF: getValue(this.lyDoDanhGia[item.maTieuChi]) }));
        else lsDiemDiff = lsDiemDiff.map(item => ({ ...item, lyDoLt: getValue(this.lyDoDanhGia[item.maTieuChi]) }));
        this.props.setLyDo(lsDiemDiff, user);
        this.hide();
    }

    render = () => {
        const { lsDiemDiff, user } = this.props;
        let table = renderTable({
            getDataSource: () => lsDiemDiff,
            emptyTable: 'Không có dữ liệu',
            header: 'thead-light',
            stickyHead: false,
            renderHead: () => (<tr>
                <th style={{ widht: 'auto', whiteSpace: 'nowrap' }}>#</th>
                <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tiêu chí</th>
                {user == 'khoa' ? <>
                    <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Lớp</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Khoa</th>
                </> : <>
                    <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Sinh viên</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Lớp trưởng</th>
                </>
                }
                <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Lý do đánh giá</th>
            </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={index + 1} />
                    <TableCell type='text' content={item.tenTieuChi || ''} />
                    {user == 'khoa' ? <>
                        <TableCell type='number' content={item.diemLt || ''} />
                        <TableCell type='number' content={item.diemF} />
                    </> : <>
                        <TableCell type='number' content={item.diemSv || ''} />
                        <TableCell type='number' content={item.diemLt} />
                    </>}
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={
                        <FormTextBox ref={e => this.lyDoDanhGia[item.maTieuChi] = e} required />
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

// ============ TABLE ==================
class DrlTable extends AdminPage {
    state = { lsBoTieuChi: [], lsDiemDanhGia: [], tongKetInfo: null, lsFileMinhChung: [], isSearch: false, namHocHienTai: '', hocKyHienTai: '', namHoc: '', hocKy: '', mssv: '', maLyDoEdit: null, editHoatDong: false }
    diemTieuChiSv = {}
    diemTieuChiLt = {}
    diemTieuChiKhoa = {}
    diemEventLt = {}
    diemEventF = {}

    componentDidMount() {
        T.ready('', () => {
            const { namHoc, hocKy, mssv, listPk } = this.props;
            // this.setState({ listPk });
            this.setState({ listPk, namHoc, hocKy, mssv }, () => {
                // this.prop.loadPage();
                this.setUpPage();
            });
        });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.data != this.props.data) {
            this.setUpPage(this.props.data);
        }
    }

    // loadPage = () => {
    //     this.setState({ isLoading: true }, () => {
    //         this.props.loadPage();
    //         // const { namHoc, hocKy, mssv } = this.state;
    //         // const { user } = this.props;
    //         // getBoTieuChi(namHoc, hocKy, mssv, user, data => this.setUpPage(data));
    //     });
    // }

    setUpPage = (data) => {
        data && this.setState({
            // isLoading: false,
            lsBoTieuChi: data.lsBoTieuChi, tongKetInfo: data.tongKetInfo, diemTrungBinh: data.diemTrungBinh,
            lsDiemDanhGia: data.lsDiemDanhGia,
            lsFileMinhChung: data.lsDiemDanhGia.filter(diem => diem.minhChung != null).map(diem => ({ maTieuChi: diem.maTieuChi, filePath: diem.minhChung })),
            listSuKien: data.listSuKien,
            lsMinhChung: data.lsMinhChung,
            bhytData: data.bhytData,
            timeStart: data.timeStart, timeEnd: data.timeEnd
        }, () => {
            const { lsDiemDanhGia } = this.state;
            lsDiemDanhGia.forEach(diem => {
                this.diemTieuChiSv[diem.maTieuChi]?.value(this.getDrl(Number(diem.maTieuChi), 'diemSv').toString());
                this.diemTieuChiLt[diem.maTieuChi]?.value(this.getDrl(Number(diem.maTieuChi), 'diemLt').toString());
                this.diemTieuChiKhoa[diem.maTieuChi]?.value(this.getDrl(Number(diem.maTieuChi), 'diemF').toString());
                this.diemTieuChiLt[diem.maTieuChi]?.valueLyDo(diem.lyDoLt || '');
                this.diemTieuChiKhoa[diem.maTieuChi]?.valueLyDo(diem.lyDoF || '');
            });
            let tongDiem = this.state.lsBoTieuChi.reduce((init, item) => init + Number(this.getDrl(Number(item.ma), 'diemSv')), 0),
                tongDiemLt = this.state.lsBoTieuChi.reduce((init, item) => init + Number(this.getDrl(Number(item.ma), 'diemLt')), 0),
                tongDiemKhoa = this.state.lsBoTieuChi.reduce((init, item) => init + Number(this.getDrl(Number(item.ma), 'diemF')), 0);
            // tongDiemKhoaFinal = data.tongKetInfo?.fSubmit ? data.tongKetInfo?.fSubmit : tongDiemKhoa;
            tongDiem = tongDiem > 90 ? 90 : tongDiem;
            tongDiemLt = tongDiemLt > 90 ? 90 : tongDiemLt;
            tongDiemKhoa = tongDiemKhoa > 90 ? 90 : tongDiemKhoa;
            // const diemFinal = data.tongKetInfo?.tkSubmit || data.tongKetInfo?.fSubmit || '';
            const diemFinalKhoa = data.tongKetInfo?.fSubmit ? data.tongKetInfo?.fSubmit : tongDiemKhoa;
            const diemKyLuat = data.tongKetInfo?.kyLuat?.length > 0 ? Math.min(...data.tongKetInfo?.kyLuat.map(hinhThuc => hinhThuc.drlMax)) : null;
            const diemFinalDuKien = diemFinalKhoa ? Math.min(diemFinalKhoa + parseInt(data.diemTrungBinh || 0), diemKyLuat || Infinity) : null;
            const diemFinal = data.tongKetInfo?.tkSubmit;

            this.setState({
                tongDiem, tongDiemLt, tongDiemKhoa, diemFinal, diemKyLuat, diemFinalKhoa, diemFinalDuKien,
            });
            this.tongDiem?.value(tongDiem);
            this.tongDiemLt?.value(tongDiemLt);
            this.tongDiemKhoa?.value(tongDiemKhoa);
            // this.lyDoTongKetKhoa?.value(data.tongKetInfo?.lyDoF || '');
            this.diemTongKet?.value(diemFinal);
        });
    }

    getDrl = (ma, loaiDiem) => {
        const { lsDiemDanhGia, listSuKien, lsMinhChung, bhytData } = this.state;
        const tieuChiCha = this.findItem(this.state.lsBoTieuChi, ma);
        if (tieuChiCha?.dsTieuChiCon?.length) {
            let diemTong = tieuChiCha?.dsTieuChiCon.reduce((init, item) => init + this.getDrl(item.ma, loaiDiem), 0);
            return diemTong > Number(tieuChiCha.diemMax) ? Number(tieuChiCha.diemMax) : diemTong;
        } else {
            // Liên kết BHYT:
            if (tieuChiCha.lienKetBhyt == 1) {
                const data = JSON.parse(tieuChiCha.diemMax);
                let diemMax = data.map((item) => +item.diem);
                if (bhytData?.daKeKhaiThongTin && (bhytData?.dienDong == '0' || bhytData.daThanhToan != null)) return diemMax[1];
                else return diemMax[0];
            }

            // ========================

            let objDiemDanhGia = Object.assign({}, ...lsDiemDanhGia.map(tieuChi => ({ [tieuChi.maTieuChi]: tieuChi })));
            if (tieuChiCha.theTieuChi == null) {
                switch (loaiDiem) {
                    case 'diemSv':
                        return objDiemDanhGia[tieuChiCha.ma] ? Math.floor(Number(objDiemDanhGia[tieuChiCha.ma].diemSv)) : 0;
                    case 'diemLt':
                        return objDiemDanhGia[tieuChiCha.ma] ? Math.floor(Number(objDiemDanhGia[tieuChiCha.ma].diemLt)) : 0;
                    case 'diemF':
                        return objDiemDanhGia[tieuChiCha.ma] ? Math.floor(Number(objDiemDanhGia[tieuChiCha.ma].diemF)) : 0;
                    default:
                        return 0;
                }
            } else {
                const listMC = lsMinhChung.filter(item => item.maTieuChi == tieuChiCha.ma),
                    listEvent = listSuKien.filter(item => item.maCha == tieuChiCha.ma);
                let diemTong = 0;
                switch (loaiDiem) {
                    case 'diemSv':
                        diemTong = listMC.reduce((init, item) => init + +item.diemSv, diemTong);
                        break;
                    case 'diemLt':
                        diemTong = listMC.reduce((init, item) => init + +item.diemLt, diemTong);
                        break;
                    case 'diemF':
                        diemTong = listMC.reduce((init, item) => init + +item.diemF, diemTong);
                        break;
                    default:
                        break;
                }
                diemTong = listEvent.reduce((init, item) => init + +item.diemF, diemTong);

                diemTong = Math.floor(diemTong);
                if (tieuChiCha.loaiTc == TcTitle || tieuChiCha.loaiTc == TcScalar || tieuChiCha.loaiTc == TcLinkSuKien) {
                    let diemMax = +tieuChiCha.diemMax;
                    return Math.min(diemMax, diemTong);
                } else if (tieuChiCha.loaiTc == TcSelect) {
                    const data = JSON.parse(tieuChiCha.diemMax);
                    let diemMax = data.map((item) => +item.diem);
                    let res = Math.max(...diemMax);
                    for (let i = 0; i < diemMax.length; i++) {
                        if (diemMax[i] > diemTong) {
                            if (i == 0) res = 0;
                            else res = diemMax[i - 1];
                            break;
                        }
                    }
                    return res;
                } else if (tieuChiCha.loaiTc == TcRange) {
                    const data = JSON.parse(tieuChiCha.diemMax);
                    if (diemTong < data[0]) return 0;
                    else if (diemTong > data[1]) return data[1];
                    else return diemTong;
                } else return 0;
            }

        }
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

    genDataNamHoc = (nam) => {
        const currYear = new Date().getFullYear();
        this.setState({ namHoc: Array.from({ length: currYear - nam + 1 }, (_, i) => `${nam + i} - ${nam + i + 1} `) });
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

    cellMapper(loaiDiem, ma) {
        if (loaiDiem == 'diemSv') {
            return this.diemTieuChiSv[ma];
        } else if (loaiDiem == 'diemLt') {
            return this.diemTieuChiLt[ma];
        } else {
            return this.diemTieuChiKhoa[ma];
        }
    }

    setDiemDanhGiaCell = () => {

    }

    setDiemDanhGia = (e, ma, maCha, loaiDiem) => {
        const tieuChiCha = maCha ? this.findItem(this.state.lsBoTieuChi, maCha) : this.findItem(this.state.lsBoTieuChi, ma);
        let diemTong = 0;
        if (tieuChiCha.dsTieuChiCon?.length) {
            diemTong = tieuChiCha.dsTieuChiCon.reduce((init, item) => {
                const diemCong = getValue(this.cellMapper(loaiDiem, item.ma)) ? Number(getValue(this.cellMapper(loaiDiem, item.ma))) : 0;
                if (item.loaiTc == TcRange) {
                    const data = JSON.parse(item.diemMax);
                    if (diemCong != 0 && (diemCong < data[0] || diemCong > data[1])) {
                        T.notify('Không nằm trong khoảng cho phép', 'danger');
                        this.cellMapper(loaiDiem, item.ma).value(0);
                        return init + 0;
                    } else return init + diemCong;
                } else if (item.loaiTc == TcTitle || item.loaiTc == TcScalar || item.loaiTc == TcLinkSuKien) {
                    if (diemCong > Number(item.diemMax)) {
                        this.cellMapper(loaiDiem, item.ma).value(Number(item.diemMax));
                        return init + Number(item.diemMax);
                    } else return init + diemCong;
                } else return init + diemCong;
            }, 0);
            if (diemTong > Number(tieuChiCha.diemMax)) {
                diemTong = Number(tieuChiCha.diemMax);
            }
        } else if (tieuChiCha.theTieuChi != null) {
            // TO DO: tính điểm tổng nếu là tiêu chí liên kết với sự kiện
            const { lsMinhChung, listSuKien } = this.state;
            const listMC = lsMinhChung.filter(item => item.maTieuChi == tieuChiCha.ma && item.id != ma),
                listEvent = listSuKien.filter(item => item.maCha == tieuChiCha.ma);
            switch (loaiDiem) {
                case 'diemSv':
                    diemTong = listMC.reduce((init, item) => init + +item.diemSv, diemTong);
                    break;
                case 'diemLt':
                    diemTong = listMC.reduce((init, item) => init + +item.diemLt, diemTong);
                    diemTong += getValue(this.diemEventLt?.[ma]) || 0;
                    break;
                case 'diemF':
                    diemTong = listMC.reduce((init, item) => init + +item.diemF, diemTong);
                    diemTong += getValue(this.diemEventF[ma]) || 0;
                    break;
                default:
                    break;
            }
            diemTong = listEvent.reduce((init, item) => init + +item.diemF, diemTong);
            diemTong = Math.floor(diemTong);
            if (tieuChiCha.loaiTc == TcTitle || tieuChiCha.loaiTc == TcScalar || tieuChiCha.loaiTc == TcLinkSuKien) {
                let diemMax = +tieuChiCha.diemMax;
                diemTong = Math.min(diemMax, diemTong);
            } else if (tieuChiCha.loaiTc == TcSelect) {
                const data = JSON.parse(tieuChiCha.diemMax);
                let diemMax = data.map((item) => +item.diem);
                let res = Math.max(...diemMax);
                for (let i = 0; i < diemMax.length; i++) {
                    if (diemMax[i] > diemTong) {
                        if (i == 0) res = 0;
                        else res = diemMax[i - 1];
                        break;
                    }
                }
                diemTong = res;
            } else if (tieuChiCha.loaiTc == TcRange) {
                const data = JSON.parse(tieuChiCha.diemMax);
                if (diemTong < data[0]) diemTong = 0;
                else if (diemTong > data[1]) diemTong = data[1];
            } else diemTong = 0;
        } else {
            diemTong = getValue(this.diemTieuChiKhoa[maCha ? maCha : ma]) || '';
            if (diemTong > Number(tieuChiCha.diemMax)) {
                diemTong = Number(tieuChiCha.diemMax);
            }
        }
        setTimeout(() => {
            if (loaiDiem == 'diemSv') {
                this.diemTieuChiSv[maCha ? maCha : ma]?.value(diemTong || '');
                tieuChiCha.maCha && this.setDiemDanhGia(e, tieuChiCha.maCha, null, loaiDiem);
                const tongDiem = this.state.lsBoTieuChi.reduce((init, item) => init + Number(getValue(this.cellMapper(loaiDiem, item.ma)) || 0), 0);
                this.tongDiem.value(tongDiem > 90 ? 90 : tongDiem);
            } else if (loaiDiem == 'diemLt') {
                this.diemTieuChiLt[maCha ? maCha : ma]?.value(diemTong || '');
                tieuChiCha.maCha && this.setDiemDanhGia(e, tieuChiCha.maCha, null, loaiDiem);
                const tongDiem = this.state.lsBoTieuChi.reduce((init, item) => init + Number(getValue(this.cellMapper(loaiDiem, item.ma)) || 0), 0);
                this.tongDiemLt.value(tongDiem > 90 ? 90 : tongDiem);
            } else {
                this.diemTieuChiKhoa[maCha ? maCha : ma]?.value(diemTong || '');
                tieuChiCha.maCha && this.setDiemDanhGia(e, tieuChiCha.maCha, null, loaiDiem);
                const tongDiem = this.state.lsBoTieuChi.reduce((init, item) => init + Number(getValue(this.cellMapper(loaiDiem, item.ma)) || 0), 0);
                this.tongDiemKhoa.value(tongDiem > 90 ? 90 : tongDiem);
            }
            // this.tongDiem.value(0);
        }, 500);
    }

    getDsDrl = (list) => {
        const { lsFileMinhChung } = this.state;
        const res = list.reduce((prev, item) => {
            if (item.dsTieuChiCon?.length) {
                prev.push({
                    maTieuChi: item.ma,
                    tenTieuChi: item.ten,
                    diemSv: getValue(this.cellMapper('diemSv', item.ma)) || 0,
                    diemLt: getValue(this.cellMapper('diemLt', item.ma)) || 0,
                    diemF: getValue(this.cellMapper('diemF', item.ma)) || 0,
                    minhChung: item.coMinhChung ? lsFileMinhChung.find(file => file.maTieuChi == item.ma)?.filePath : null,
                    canDiff: false
                });
                prev = prev.concat(this.getDsDrl(item.dsTieuChiCon));
            } else {
                prev.push({
                    maTieuChi: item.ma,
                    tenTieuChi: item.ten,
                    diemSv: getValue(this.cellMapper('diemSv', item.ma)) || 0,
                    diemLt: getValue(this.cellMapper('diemLt', item.ma)) || 0,
                    diemF: getValue(this.cellMapper('diemF', item.ma)) || 0,
                    minhChung: item.coMinhChung ? lsFileMinhChung.find(file => file.maTieuChi == item.ma)?.filePath : null,
                    canDiff: true
                });
            }
            return prev;
        }, []);
        return res;
    }

    submitDrl = (isFinal = true) => {
        const { lsBoTieuChi } = this.state;
        const { namHoc, hocKy, mssv, user, isInGiaHan } = this.props;

        let alertContent = isFinal ?
            '<span class="text-danger">Bạn chỉ có thể nộp bảng đánh giá điểm rèn luyện <span class="font-weight-bold">MỘT LẦN</span> duy nhất</span>' :
            '<span class="text-danger">Hệ thống sẽ không ghi nhận kết quả đánh giá là chính thức</span>';

        const arrDiemDanhGia = this.getDsDrl(lsBoTieuChi, []);
        let lsDiemDiff = [];
        if (user == 'khoa') {
            alertContent = 'Bạn có chắc muốn lưu bảng đánh giá điểm rèn luyện ?';
            arrDiemDanhGia.forEach(item => {
                const diemF = Number(getValue(this.diemTieuChiKhoa[item.maTieuChi]));
                if (item.canDiff && item.diemLt != diemF) {
                    if (!this.diemTieuChiKhoa[item.maTieuChi].valueLyDo()) {
                        lsDiemDiff.push({
                            diemF,
                            diemLt: item.diemLt,
                            maTieuChi: item.maTieuChi,
                            tenTieuChi: item.tenTieuChi,
                        });
                    } else item.lyDoF = this.diemTieuChiKhoa[item.maTieuChi].valueLyDo();
                }
            });
        }

        if (user == 'lopTruong') {
            alertContent = isInGiaHan ? 'Trong thời gian gia hạn bạn chỉ có thể lưu bảng đánh giá một lần duy nhất, bạn có chắc muốn lưu ?' : 'Bạn có chắc muốn lưu bảng đánh giá điểm rèn luyện ?';
            arrDiemDanhGia.forEach(item => {
                const diemLt = Number(getValue(this.diemTieuChiLt[item.maTieuChi]));
                if (item.canDiff && item.diemSv != diemLt) {
                    if (!this.diemTieuChiLt[item.maTieuChi].valueLyDo()) {
                        lsDiemDiff.push({
                            diemLt,
                            diemSv: item.diemSv,
                            maTieuChi: item.maTieuChi,
                            tenTieuChi: item.tenTieuChi,
                        });
                    } else item.lyDoLt = this.diemTieuChiLt[item.maTieuChi].valueLyDo();
                }
            });
        }

        let lsMinhChung = this.getDsHoatDong();

        this.setState({ lsDiemDiff }, () => {
            if (this.state.lsDiemDiff.length) {
                this.checkLyDoModal.show();
            } else {
                T.confirm('Lưu bảng đánh giá', alertContent, 'warning', true, (isConfirm) => {
                    if (isConfirm) {
                        this.props.submit({
                            namHoc,
                            hocKy,
                            arrDiemDanhGia,
                            lsMinhChung,
                            svSubmit: isFinal ? this.tongDiem.value() : '',
                        }, mssv, () => this.props.loadPage(false));
                    }
                });
            }
        });
    }

    // set điểm
    setDefaultDiemTheoLt = () => {
        const { lsBoTieuChi } = this.state;
        T.confirm('Xác nhận chấp nhận điểm của cán bộ lớp!', '<p class="text-danger"><b>Lưu ý:</b> Tất cả lý do đánh giá khác điểm hiện tại sẽ bị xóa</p>', isConfirm => {
            if (isConfirm) {
                this.setDefaultDiemKhoaRecur(lsBoTieuChi || []);
                this.setDiemSuKienTheoLt();
                this.tongDiemKhoa.value(this.tongDiemLt.value());
                // this.setState({ lyDoDanhGiaKhoa: {} });
            }
        });
    }

    setDefaultTheoSv = () => {
        T.confirm('Xác nhận chấp nhận điểm của sinh viên!', '<p class="text-danger"><b>Lưu ý:</b> Tất cả lý do đánh giá khác điểm hiện tại sẽ bị xóa</p>', isConfirm => {
            if (isConfirm) {
                const { lsBoTieuChi } = this.state,
                    { user } = this.props;
                this.setDefaultDiemTheoSvRecur(lsBoTieuChi || [], user);
                this.setDiemSuKienTheoSv(user);
                if (user == 'khoa') {
                    this.tongDiemKhoa.value(this.tongDiem.value());
                    // this.setState({ lyDoDanhGiaKhoa: {} });
                }
                else {
                    this.tongDiemLt.value(this.tongDiem.value());
                    // this.setState({ lyDoDanhGia: {} });
                }
            }
        });
    }

    setDefaultDiemKhoaRecur = (listTieuChi = []) => {
        listTieuChi.forEach(tieuChi => {
            const diem = this.diemTieuChiLt[tieuChi.ma].value() || '';
            this.diemTieuChiKhoa[tieuChi.ma].value(diem);
            this.diemTieuChiKhoa[tieuChi.ma].valueLyDo('');
            this.setDefaultDiemKhoaRecur(tieuChi.dsTieuChiCon);
        });
    }

    setDefaultDiemTheoSvRecur = (listTieuChi = [], user) => {
        listTieuChi.forEach(tieuChi => {
            const diem = this.diemTieuChiSv[tieuChi.ma].value() || '';
            if (user == 'khoa') {
                this.diemTieuChiKhoa[tieuChi.ma].value(diem);
                this.diemTieuChiKhoa[tieuChi.ma].valueLyDo('');
            } else {
                this.diemTieuChiLt[tieuChi.ma].value(diem);
                this.diemTieuChiLt[tieuChi.ma].valueLyDo('');
            }
            this.setDefaultDiemTheoSvRecur(tieuChi.dsTieuChiCon, user);
        });
    }

    setDiemSuKienTheoSv = (user)=>{
        const {lsMinhChung} = this.state;
        lsMinhChung.forEach(suKien => {
            const diem = suKien.diemSv;
            if (user == 'khoa'){
                this.diemEventF[suKien.id].value(diem);
            } else {
                this.diemEventLt[suKien.id].value(diem);
            }
        });
    }

    setDiemSuKienTheoLt = ()=>{
        const {lsMinhChung} = this.state;
        lsMinhChung.forEach(suKien => {
            const diem = this.diemEventLt[suKien.id].value() || '';
            this.diemEventF[suKien.id].value(diem);
        });
    }

    //=======================

    // ly do edit
    setLyDo = (list, user) => {
        if (user == 'khoa') {
            list.forEach(item => {
                this.diemTieuChiKhoa[item.maTieuChi]?.valueLyDo(item.lyDoF);
            });
            this.setState({ lsDiemDiff: list }, () => this.submitDrl());
        }
        else {
            list.forEach(item => {
                this.diemTieuChiLt[item.maTieuChi]?.valueLyDo(item.lyDoLt);
            });
            this.setState({ lsDiemDiff: list }, () => this.submitDrl());
        }
    }

    //========= Minh chứng ===================
    onMinhChungModalClose = () => {
        // const { editHoatDong } = this.state;
        // if (editHoatDong) this.setState({ editHoatDong: false }, this.props.loadPage(false));
    }

    updateLsMinhChung = (filePath, maTieuChi) => {
        let { lsFileMinhChung } = this.state;
        if (lsFileMinhChung.some(item => item.maTieuChi == maTieuChi)) {
            lsFileMinhChung = lsFileMinhChung.map(item => {
                if (item.maTieuChi == maTieuChi) {
                    item.filePath = filePath;
                }
                return item;
            });
        } else {
            lsFileMinhChung = [...lsFileMinhChung, { maTieuChi, filePath }];
        }
        this.setState({ lsFileMinhChung: lsFileMinhChung });
    }

    // ======== Hoạt động ====================
    updateLsHoatDong = (newItems, maTieuChi) => {
        let { lsMinhChung } = this.state;
        lsMinhChung = [...lsMinhChung.filter(item => item.maTieuChi != maTieuChi), ...newItems];
        this.diemTieuChiSv[maTieuChi].value(newItems.reduce((sum, item) => sum + (item.diemSv ?? 0), 0));
        this.setState({ lsMinhChung });
        // this.setState({ editHoatDong: true });
    }

    deleteHoatDong = (condition, filePath, done) => {
        this.setState({ editHoatDong: true }, deleteHoatDong(condition, filePath, done));
    }

    getDsHoatDong = () => {
        let { lsMinhChung } = this.state;
        lsMinhChung.forEach(item => {
            item.diemLt = getValue(this.diemEventLt[item.id]);
            item.diemF = getValue(this.diemEventF[item.id]);
        });
        return lsMinhChung;
    }

    //========================================

    initRows = (maCha, list, level, indexing = '') => {
        const { lsFileMinhChung, listSuKien, lsMinhChung } = this.state;
        const { namHoc, hocKy, mssv, listPk = [], readOnly } = this.props;
        const res = list.reduce((prev, origItem, index) => {
            let item = { ...origItem };
            if (item.dsTieuChiCon?.length) {
                prev.push(<tr key={`${item.ma}-${index}`}>
                    <TableCell content={indexing ? indexing + '.' + (index + 1) : (index + 1)} style={{ fontWeight: item.loaiTc == TcTitle ? 'bold' : '' }} />
                    <TableCell style={{ width: 'auto' }} type={item.loaiTc == 0 ? 'link' : ''} onClick={e => e.preventDefault()} content={<div style={{ paddingLeft: `${(level - 1) * 1.5}em`, display: 'inline-block', fontWeight: 'bold' }}>
                        <span className='pr-2'>{item.ten}</span>
                    </div>} />
                    <TableCell content={loaiTcLabel(item.loaiTc, item.diemMax)} style={{ textAlign: 'center' }} />
                    <TieuChiCell ref={e => this.diemTieuChiSv[item.ma] = e} loaiTc={item.loaiTc} item={item} />
                    <TieuChiCell ref={e => this.diemTieuChiLt[item.ma] = e} loaiTc={item.loaiTc} lyDo={item.lyDoLt} item={item} />
                    <TieuChiCell ref={e => this.diemTieuChiKhoa[item.ma] = e} loaiTc={item.loaiTc} lyDo={item.lyDoF} item={item} />
                    <TableCell content={''} style={{ textAlign: 'center' }} />
                </tr>);
                prev = prev.concat(this.initRows(item.ma, item.dsTieuChiCon, level + 1, indexing ? indexing + '.' + (index + 1) : (index + 1)));
            } else {
                // 
                const lienKetBhyt = item.lienKetBhyt;
                const isSuKien = item.theTieuChi != null;
                // let readOnly = this.props.readOnly || lienKetBhyt == 1;

                if (!isSuKien && item.coMinhChung) item.minhChung = lsFileMinhChung.find(file => file.maTieuChi == item.ma)?.filePath || null;
                if (isSuKien) {
                    let ls = lsMinhChung.filter(file => file.maTieuChi == item.ma);
                    ls.length > 0 && (item.minhChung = JSON.stringify(ls));
                }
                prev.push(<tr key={`${item.ma}-${index}`}>
                    <TableCell content={indexing ? indexing + '.' + (index + 1) : (index + 1)} />
                    <TableCell content={item.ten} style={{ paddingLeft: `${level * 1.5}em`, fontWeight: item.loaiTc == TcTitle ? 'bold' : '' }} />
                    <TableCell content={loaiTcLabel(item.loaiTc, item.diemMax)} style={{ textAlign: 'center', fontWeight: '' }} />
                    <TieuChiCell ref={e => this.diemTieuChiSv[item.ma] = e} loaiTc={item.loaiTc} item={item} onChange={e => this.setDiemDanhGia(e, item.ma, maCha, 'diemSv')} readOnly={readOnly || lienKetBhyt || this.props.user != 'sinhVien' || isSuKien} lyDo={lienKetBhyt ? 'Điểm được tính dựa trên thông tin bảo hiểm y tế của sinh viên trên hệ thống' : ''} />
                    <TieuChiCell ref={e => this.diemTieuChiLt[item.ma] = e} loaiTc={item.loaiTc} item={item} onChange={e => this.setDiemDanhGia(e, item.ma, maCha, 'diemLt')} readOnly={readOnly || this.props.user != 'lopTruong' || isSuKien} />
                    <TieuChiCell ref={e => this.diemTieuChiKhoa[item.ma] = e} loaiTc={item.loaiTc} item={item} onChange={e => this.setDiemDanhGia(e, item.ma, maCha, 'diemKhoa')} readOnly={(readOnly && (!listPk[item.ma] || listPk[item.ma].tinhTrang != 'N')) || this.props.user != 'khoa' || isSuKien} />
                    <TableCell content={
                        (item.coMinhChung || item.theTieuChi != null || lienKetBhyt ?
                            (isSuKien ?
                                <span><button href='#' className='btn btn-link' onClick={(e) => e.preventDefault() || this.uploadModal.show(item, { mssv, namHoc, hocKy, index: indexing ? indexing + '.' + (index + 1) : (index + 1), isSuKien },)}>
                                    <i className='fa fa-sm fa-edit mr-1' />
                                    Hoạt động
                                </button></span> :
                                (item.minhChung ?
                                    <span><button href='#' className='btn btn-link' onClick={(e) => e.preventDefault() || this.uploadModal.show(item, { mssv, namHoc, hocKy, index: indexing ? indexing + '.' + (index + 1) : (index + 1), isSuKien },)}>
                                        <i className='fa fa-sm fa-edit mr-1' />
                                        Chi tiết
                                    </button></span>
                                    :
                                    (this.props.user == 'sinhVien' && !readOnly ?
                                        <span><button className='text-secondary btn btn-link' onClick={(e) => e.preventDefault() || this.uploadModal.show(item, { mssv, namHoc, hocKy, index: indexing ? indexing + '.' + (index + 1) : (index + 1), isSuKien },)}>
                                            <i className='fa fa-sm fa-plus mr-1' />
                                            Thêm
                                        </button></span>
                                        :
                                        <span><a href='#' className='text-danger'>
                                            <i className='fa fa-sm fa-close mr-1' />
                                            Chưa có
                                        </a></span>)
                                )
                            )
                            : '')
                    } style={{ textAlign: 'center' }} />
                </tr>);
            }
            // Danh sách sự kiện trên hệ thống
            let eventIndex = 0;
            let lsSuKien = listSuKien.filter(suKien => suKien.maCha == item.ma);
            if (lsSuKien.length) {
                lsSuKien.forEach((suKien) => {
                    eventIndex++;
                    return prev.push(<tr key={`${item.ma}-${index}-${eventIndex}`}>
                        <TableCell content={indexing ? indexing + '.' + (index + 1) + '.' + (eventIndex) : (index + 1) + '.' + (eventIndex)} />
                        {/* <TableCell content={<span style={{ paddingLeft: '20px' }}> {suKien.tenSuKien}</span>} /> */}
                        <TableCell content={<div style={{ paddingLeft: `${(level + 1) * 1.5}em`, display: 'inline-block' }}>
                            <span className='pr-2'>{suKien.tenSuKien}</span>
                        </div>} />
                        <TableCell content={loaiTcLabel(suKien.loaiTc, suKien.diemMax)} style={{ textAlign: 'center' }} />
                        <TieuChiCell loaiTc={4} item={suKien} value={suKien.diemSv} readOnly />
                        <TieuChiCell loaiTc={4} item={suKien} value={suKien.diemLt} readOnly />
                        <TieuChiCell loaiTc={4} item={suKien} value={suKien.diemF} readOnly />
                        <TableCell content={''} style={{ textAlign: 'center' }} />
                    </tr>);
                });
            }
            // Danh sách sự kiện sinh viên bổ sung
            const listMinhChung = lsMinhChung.filter(suKien => suKien.maTieuChi == item.ma);
            if (listMinhChung.length) {
                listMinhChung.forEach((suKien) => {
                    eventIndex++;
                    return prev.push(<tr key={`${item.ma}-${index}-${eventIndex}`}>
                        <TableCell content={indexing ? indexing + '.' + (index + 1) + '.' + (eventIndex) : (index + 1) + '.' + (eventIndex)} />
                        <TableCell content={<div style={{ paddingLeft: `${(level + 1) * 1.5}em`, display: 'inline-block' }}>
                            <span className='pr-2'>{suKien.tenHoatDong}</span>
                        </div>} />
                        <TableCell content={loaiTcLabel(suKien.loaiTc, suKien.diemMax)} style={{ textAlign: 'center' }} />
                        <TieuChiCell loaiTc={4} item={suKien} value={suKien.diemSv} readOnly style={{ textAlign: 'center' }} />
                        <TieuChiCell loaiTc={4} ref={e => this.diemEventLt[suKien.id] = e} item={suKien} value={suKien.diemLt} onChange={e => this.setDiemDanhGia(e, suKien.id, item.ma, 'diemLt')} readOnly={readOnly || this.props.user != 'lopTruong'} />
                        <TieuChiCell loaiTc={4} ref={e => this.diemEventF[suKien.id] = e} item={suKien} value={suKien.diemF} onChange={e => this.setDiemDanhGia(e, suKien.id, item.ma, 'diemF')} readOnly={readOnly || this.props.user != 'khoa'} />
                        <TableCell content={''} style={{ textAlign: 'center' }} />
                    </tr>);
                });
            }
            return prev;
        }, []);

        return res;

    }

    render() {
        const { lsBoTieuChi, tongKetInfo, diemTrungBinh,
            tongDiemKhoa, diemFinal, diemKyLuat, diemFinalKhoa, diemFinalDuKien, timeStart, timeEnd } = this.state;
        const { namHoc, hocKy, readOnly = true } = this.props;
        let table = renderTable({
            getDataSource: () => lsBoTieuChi,
            emptyTable: `Không tìm thấy bộ tiêu chí cho HK${hocKy || ''}, năm học ${namHoc || ''}`,
            header: 'thead-light',
            stickyHead: false,
            multipleTbody: true,
            renderHead: () => (<tr>
                <th style={{ widht: 'auto', whiteSpace: 'nowrap' }}>#</th>
                <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Tiêu chí</th>
                <th style={{ width: '75px', whiteSpace: 'nowrap' }}>Điểm</th>
                <th style={{ width: '50px', whiteSpace: 'nowrap', textAlign: 'center' }}>Sinh viên</th>
                <th style={{ width: '50px', whiteSpace: 'nowrap', textAlign: 'center' }}>Lớp trưởng</th>
                <th style={{ width: '50px', whiteSpace: 'nowrap', textAlign: 'center' }}>Khoa/BM</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Minh chứng</th>
            </tr>),
            renderRow: <>
                <tbody>
                    {this.initRows(null, lsBoTieuChi || [], 1)}
                </tbody>
                <tfoot>
                    <tr>
                        <TableCell content={'#'} />
                        <TableCell content={<span><span className='font-weight-bold'>Điểm tiêu chí</span><br />
                            <small><i>Tổng điểm các tiêu chí không vượt quá 90 điểm</i></small></span>} />
                        <TableCell content={<span className='font-weight-bold'>90</span>} style={{ textAlign: 'center' }} />
                        <TableCell content={
                            <FormTextBox className='mb-0' ref={e => this.tongDiem = e} type='number' readOnly={true} />
                        } style={{ textAlign: 'center' }} />
                        <TableCell content={
                            <FormTextBox className='mb-0' ref={e => this.tongDiemLt = e} type='number' readOnly={true} />
                        } style={{ textAlign: 'center' }} />
                        <TableCell content={<FormTextBox className='mb-0' ref={e => this.tongDiemKhoa = e} type='number' readOnly={true} />
                        } style={{ textAlign: 'center' }} />
                        <TableCell style={{ textAlign: 'right', paddingRight: '1rem' }} content={tongDiemKhoa ? <>
                            {diemFinalKhoa != tongDiemKhoa ?
                                <>
                                    <del><span className='font-weight-bold text-secondary'>{tongDiemKhoa}</span></del>
                                    <Tooltip title={tongKetInfo.lyDoF}><span className='badge-pill badge-primary ml-3'><span className={'font-weight-bold'}>{diemFinalKhoa}</span></span></Tooltip>
                                </>
                                : <span className={'font-weight-bold text-success'}>{diemFinalKhoa}</span>}
                        </> : null} />
                    </tr>
                    <tr>
                        <TableCell content={'#'} />
                        <TableCell content={<span><span className='font-weight-bold'>Điểm học tập quy đổi {tongKetInfo && (tongKetInfo.diemTb || tongKetInfo.diemTb == 0) ? <Tooltip title='Điểm trung bình đã được khóa xét kết quả'>
                            <i className='fa fa-lg fa-lock text-primary mr-1' />
                        </Tooltip> : null}</span ><br />
                            <small style={{ display: diemTrungBinh || diemTrungBinh == 0 ? '' : 'none' }}>Lấy phần nguyên: <i>Điểm trung bình học kỳ của bạn là {diemTrungBinh} thì điểm lấy xét là {parseInt(diemTrungBinh)}</i></small></span>} style={{ fontWeight: 'bold' }} colSpan={5} />
                        <TableCell content={<>
                            <span className={(tongKetInfo && (tongKetInfo.diemTb || tongKetInfo.diemTb == 0) ? 'text-success' : 'text-secondary') + ' font-weight-bold'}>{diemTrungBinh || diemTrungBinh == 0 ? parseInt(diemTrungBinh) : ''}</span>
                        </>} style={{ textAlign: 'right', paddingRight: '1rem' }} />
                    </tr>

                    <tr>
                        <TableCell content={'#'} />
                        <TableCell content={<span><span className='font-weight-bold'>Tổng điểm</span ><br />
                            <small>Điểm tiêu chí (Khoa/BM) + Điểm trung bình học kỳ xét</small></span>} colSpan={5} />
                        <TableCell content={diemFinalKhoa ? <span className={'badge-pill ' + (diemFinal ? 'badge-success' : 'badge-secondary')}>{Number(diemFinalKhoa) + parseInt(diemTrungBinh || 0)}</span> : null} className='font-weight-bold' style={{ textAlign: 'right' }} />
                    </tr>

                    <tr>
                        <TableCell content={'#'} />
                        <TableCell content={<span><span className='font-weight-bold'>Vi phạm kỷ luật</span ><br />
                            <small><i>Áp dụng hình thức cao nhất</i></small></span>} style={{ fontWeight: 'bold' }} />
                        <TableCell content={<span>
                            {tongKetInfo?.kyLuat.length ? this.kyLuatMapper(tongKetInfo?.kyLuat) : 'Không'}
                        </span>} colSpan={4} />
                        <TableCell content={
                            diemKyLuat ? <span className='badge-pill badge-danger'>{diemKyLuat}</span> : ''
                        } className='font-weight-bold' style={{ textAlign: 'right', paddingTop: '20px', paddingBottom: '20px' }} />
                    </tr>

                    <tr>
                        <TableCell content={'#'} />
                        <TableCell content={<span><span className='font-weight-bold'>Điểm rèn luyện tổng kết</span ><br />
                            {!diemFinal ? <small><i>Đây chỉ là điểm dự kiến. Điểm sẽ bật xanh nếu đã tổng kết</i></small> : null}</span>} style={{ fontWeight: 'bold' }} colSpan={5} />
                        <TableCell content={diemFinalDuKien ?
                            <>{diemFinal && diemFinal != diemFinalDuKien ?
                                <>
                                    <del><span className='font-weight-bold text-secondary'>{diemFinalDuKien}</span></del>
                                    <Tooltip title={tongKetInfo.lyDoTk}><span className='badge-pill badge-success ml-3'><span className={'font-weight-bold'}>{diemFinal}</span></span></Tooltip>
                                </>
                                : <span className={'badge-pill ' + (diemFinal ? 'badge-success' : 'badge-secondary')}>{diemFinalDuKien || ''}</span>}</> : null
                        } className='font-weight-bold' style={{ textAlign: 'right', paddingTop: '20px', paddingBottom: '20px' }} />
                    </tr>
                </tfoot>
            </>
        });

        return this.props.isLoading ? loadSpinner() : <div className='row'>
            <div className='col-md-12'>
                <div className='d-flex justify-content-between'>
                    <div>
                        {(timeStart || timeEnd) && <span><b className='mr-31'>Thời gian:</b> {(() => {
                            const now = Date.now();
                            const periodText = `${T.dateToText(timeStart)} - ${T.dateToText(timeEnd)}`;
                            if (now < timeStart) {
                                return <b className='text-primary'><i className='fa fa-clock-o pr-1' />{periodText}</b>;
                            } else if (now < timeEnd) {
                                return <b className='text-success'><i className='fa fa-check pr-1' />{periodText}</b>;
                            } else {
                                return <b className='text-danger'><i className='fa fa-times pr-1' />{periodText} </b>;
                            }
                        })()}</span>}
                        {this.props.user == 'sinhVien' && tongKetInfo?.svSubmit ? <b className='text-success'> - Đã nộp</b> : null}
                    </div>
                    {!readOnly && this.props.user != 'sinhVien' ? <>
                        <div className='btn-group'>
                            <button className='btn btn-warning mr-2' onClick={(e) =>
                                e.preventDefault() || this.setDefaultTheoSv()
                            }><i className='fa fa-cogs' />Chấp nhận điểm sinh viên</button>
                            {this.props.user == 'khoa' && <button className='btn btn-info' onClick={(e) =>
                                e.preventDefault() || this.setDefaultDiemTheoLt()
                            }><i className='fa fa-cogs' />Chấp nhận điểm lớp</button>}

                        </div>
                    </> : ''}
                </div>
            </div>
            <div className='col-md-12 mt-3' >
                {table}
            </div>
            <div className='col-md-12'>
                {!readOnly && <>
                    <div className='d-flex justify-content-end' style={{ gap: '1.5rem' }}>
                        {this.props.user == 'sinhVien' && <button className='btn btn-warning' type='button' onClick={() => this.submitDrl(false)}>
                            <i className='fa fa-fw fa-lg fa-save' /> Lưu tạm thời
                        </button>}
                        <button className='btn btn-success' type='button' onClick={() => this.submitDrl()}>
                            <i className='fa fa-fw fa-lg fa-save' /> {this.props.user == 'sinhVien' ? 'Nộp' : 'Lưu'}
                        </button>
                    </div>
                </>}
            </div>
            <UploadModal ref={e => this.uploadModal = e} readOnly={readOnly || this.props.user != 'sinhVien'} updateLsMinhChung={this.updateLsMinhChung} deleteMinhChung={deleteMinhChung} updateLsHoatDong={this.updateLsHoatDong} deleteHoatDong={this.deleteHoatDong} onHidden={this.onMinhChungModalClose} />

            <CheckLyDoModal ref={e => this.checkLyDoModal = e} user={this.props.user} lsDiemDiff={this.state.lsDiemDiff || []} setLyDo={this.setLyDo} />
            <BaoHiemInfoAdminModal ref={e => this.bhytModal = e} readOnly={true} />
        </div>;
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getScheduleSettings };
export default connect(mapStateToProps, mapActionsToProps)(DrlTable);
