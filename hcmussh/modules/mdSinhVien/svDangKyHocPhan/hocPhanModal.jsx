import React from 'react';
import { renderTable, TableCell, TableHead, AdminModal } from 'view/component/AdminPage';
import { createDangKyHocPhan, updateDangKyHocPhan } from 'modules/mdDangKyMonHoc/dkHocPhan/redux';
import { connect } from 'react-redux';
import { Tooltip } from '@mui/material';


class HocPhanModal extends AdminModal {
    state = { listHocPhan: [], isUpdate: false, hocPhanChon: null, filter: [], isHocVuot: false, isLoading: false }

    componentDidMount() {
        $(document).ready(() => {
            this.onHidden(this.onHide);
        });
    }

    onShow = (item) => {
        let dataState = this.props.hocPhan || {};
        let { theoKeHoach, ngoaiKeHoach, ngoaiCtdt, isUpdate, loaiMonHoc, tenMonHoc, maMonHoc } = item;
        let filter = { theoKeHoach, ngoaiKeHoach, ngoaiCtdt, tenMonHoc };
        let listHocPhan = [];
        if (theoKeHoach) {
            let { fullDataKH } = dataState;
            listHocPhan = fullDataKH.filter(data => data.maMonHoc == item.maMonHoc);
        } else if (ngoaiKeHoach) {
            let { fullDataNKH } = dataState;
            let { namHoc, hocKy } = this.props.cauHinh;
            let isHocVuot = false;
            listHocPhan = fullDataNKH.filter(data => data.maMonHoc == item.maMonHoc);

            if (item.namHocDuKien && parseInt(item.namHocDuKien) > parseInt(namHoc)) {
                isHocVuot = true;
            } else if (item.namHocDuKien && parseInt(item.namHocDuKien) == parseInt(namHoc)) {
                if (parseInt(item.hocKyDuKien) && parseInt(item.hocKyDuKien) > parseInt(hocKy)) {
                    isHocVuot = true;
                }
            }
            this.setState({ isHocVuot });
        } else if (ngoaiCtdt) {
            let { fullDataNCTDT } = dataState;
            listHocPhan = fullDataNCTDT.filter(data => data.maMonHoc == item.maMonHoc);
        } else {
            let { fullDataKH, fullDataNKH, fullDataNCTDT } = dataState;
            let fullData = [...fullDataKH, ...fullDataNKH, ...fullDataNCTDT];
            listHocPhan = fullData.filter(data => data.maMonHoc == item.maMonHoc);
        }
        let currHocPhan = isUpdate ? item.maHocPhan : [];
        this.setState({ listHocPhan, isUpdate, currHocPhan, filter, loaiMonHoc, maMonHoc });
    }

    onHide = () => {
        let { hocPhanChon, listHocPhan } = this.state;
        if (hocPhanChon) {
            let index = listHocPhan.findIndex(hp => hp.maHocPhan == hocPhanChon);
            listHocPhan[index].siSo = listHocPhan[index].siSo - 1;
        }
        this.setState({ hocPhanChon: null, listHocPhan });
    }

    checkTrung = (item) => {
        const { listDataTuanHoc, dataKetQua } = this.props.hocPhan || { listDataTuanHoc: [], dataKetQua: [] };

        for (const curTuan of listDataTuanHoc.filter(tuan => tuan.maHocPhan == item.maHocPhan && !tuan.isNgayLe)) {
            const { ngayBatDau, ngayKetThuc } = curTuan;
            for (const ketQuaDangKy of dataKetQua) {
                if (ketQuaDangKy.maMonHoc != curTuan.maMonHoc) {
                    if (listDataTuanHoc.find(i => i.maHocPhan == ketQuaDangKy.maHocPhan && !i.isNgayLe && !(ngayKetThuc < i.ngayBatDau || ngayBatDau > i.ngayKetThuc))) {
                        this.setState({ isTrung: curTuan.maHocPhan, isLoading: false }, () => T.notify(`Học phần này bị trùng lịch với học phần ${ketQuaDangKy.maHocPhan}`, 'warning'));
                        return;
                    }
                }
            }
        }
        this.setState({ isLoading: false });
    }

    chonHocPhan = (item) => {
        let isHocPhan = this.props.hocPhan?.dataKetQua?.find(hocPhan => hocPhan.maMonHoc == item.maMonHoc);
        if (isHocPhan) {
            T.alert(`Bạn đã đăng ký môn ${isHocPhan.maMonHoc}: ${T.parse(item.tenMonHoc).vi}!`, 'error', true);
            this.setState({ isLoading: false });
        } else {
            if (item.isOnlyKhoa && item.khoaDangKy != this.props.system.user.data.khoa) {
                T.alert('Học phần không mở cho sinh viên khoa khác!', 'error', true);
                this.setState({ isLoading: false });
            } else {
                this.chuyenHocPhan(item);
            }
        }
    }

    chuyenHocPhan = (item) => {
        let { hocPhanChon, listHocPhan } = this.state;
        let isCheck = hocPhanChon == item.maHocPhan;
        if (!hocPhanChon) {
            item.siSo = item.siSo + 1;
            hocPhanChon = item.maHocPhan;
            this.checkTrung(item);
        } else if (isCheck) {
            hocPhanChon = null;
            item.siSo = item.siSo - 1;
            this.setState({ isLoading: false });
        } else {
            item.siSo = item.siSo + 1;
            let index = listHocPhan.findIndex(hp => hp.maHocPhan == hocPhanChon);
            listHocPhan[index].siSo = listHocPhan[index].siSo - 1;
            hocPhanChon = item.maHocPhan;
            this.checkTrung(item);
        }
        this.setState({ hocPhanChon, listHocPhan });
    }

    renderTiet = (tuan) => {
        let { tietBatDau, soTietBuoi, thoiGianBatDau, thoiGianKetThuc } = tuan;
        let tietKetThuc = tietBatDau + soTietBuoi - 1;
        const dataTiet = tietBatDau == tietKetThuc ? tietBatDau : `${tietBatDau} - ${tietKetThuc}`;
        return `Tiết: ${dataTiet} (${thoiGianBatDau} - ${thoiGianKetThuc})`;
    }

    mapperTiet = (item) => {
        if (item.isNgayLe) return `Nghỉ lễ: ${item.tenNgayLe}`;
        else if (item.isNghi) return `Giảng viên báo nghỉ: ${item.ghiChu}`;
        else return this.renderTiet(item);
    }

    onSave = () => {
        let { hocPhanChon, currHocPhan, isUpdate, isCaiThien, isHocLai, isHocVuot, maMonHoc } = this.state;
        if (hocPhanChon) {
            let { theoKeHoach, ngoaiKeHoach, ngoaiCtdt, tenMonHoc } = this.state.filter;
            let { id, namHoc, hocKy } = this.props.cauHinh;
            const filter = {
                cauHinh: { id, namHoc, hocKy },
                maMonHoc, isCaiThien, isHocLai, isHocVuot,
                loaiMonHoc: this.state.loaiMonHoc,
                tkbSoLuongDuKienMax: this.props.cauHinhTKB?.tkbSoLuongDuKienMax,
                tenMonHoc: T.parse(tenMonHoc, { vi: '' })?.vi,
            };
            if (theoKeHoach) {
                filter.theoKeHoach = true;
            } else if (ngoaiKeHoach) {
                filter.ngoaiKeHoach = true;
            } else if (ngoaiCtdt) {
                filter.ngoaiCtdt = true;
            }
            if (isUpdate) {
                T.confirm('Xác nhận', `Bạn sẽ đăng ký học phần ${hocPhanChon} thay cho ${currHocPhan} (${T.parse(tenMonHoc, { vi: '' })?.vi})`, 'warning', true, isConfirm => {
                    if (isConfirm) {
                        this.props.loading((done) => {
                            this.props.updateDangKyHocPhan(currHocPhan, hocPhanChon, filter, this.props.configDispatch, done);
                            this.hide();
                        });
                    }
                });
            } else {
                T.confirm('Xác nhận', `Bạn sẽ đăng ký học phần ${hocPhanChon}: ${T.parse(tenMonHoc, { vi: '' })?.vi}?`, 'warning', true, isConfirm => {
                    filter.rotMon = this.props.cauHinhDiem?.rotMon || 5;
                    if (isConfirm) {
                        this.props.loading((done) => {
                            this.props.createDangKyHocPhan(hocPhanChon, filter, this.props.configDispatch, null, done);
                            this.hide();
                        });
                    }
                });
            }
        } else {
            T.alert('Bạn chưa chọn học phần nào!', 'error', true);
        }
    }

    table = (list) => renderTable({
        emptyTable: this.state.isUpdate ? 'Không có học phần để thay đổi' : 'Không tìm thấy học phần nào!',
        getDataSource: () => Object.keys((list || []).groupBy('maHocPhan')),
        stickyHead: list?.length > 20,
        header: 'thead-light',
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Chọn</th>
                <TableHead style={{ width: '30%', minWidth: 'auto', maxWidth: 'auto' }} content='Lớp học phần' keyCol='maHocPhan' />
                <TableHead content='Tên môn học' style={{ width: '60%', minWidth: 'auto', maxWidth: 'auto' }} keyCol='tenMonHoc' />
                <TableHead style={{ width: 'auto', minWidth: 'auto', maxWidth: 'auto' }} content='Sĩ số' keyCol='siSo' />
                <TableHead style={{ width: 'auto', minWidth: 'auto', maxWidth: 'auto' }} content='TC' keyCol='tinChi' />
                <TableHead style={{ width: 'auto', minWidth: 'auto', maxWidth: 'auto' }} content='Phòng' keyCol='phong' />
                <TableHead style={{ width: 'auto', minWidth: 'auto', maxWidth: 'auto' }} content='Thứ' keyCol='thu' />
                <TableHead style={{ width: '10%', minWidth: 'auto', maxWidth: 'auto' }} content='Tiết' keyCol='tiet' />
                <TableHead style={{ width: 'auto', minWidth: 'auto', maxWidth: 'auto' }} content='Lớp' keyCol='lop' />
                <TableHead style={{ width: 'auto', minWidth: 'auto', maxWidth: 'auto' }} content='Cơ sở' keyCol='coSo' />
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Bắt đầu</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kết thúc</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Giảng viên</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Trợ giảng</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Đơn vị tổ chức</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}></th>
            </tr>),
        renderRow: (item) => {
            let tkbSoLuongDuKienMax = this.props.cauHinhTKB?.tkbSoLuongDuKienMax;
            let { hocPhanChon, isCheckTuanHoc } = this.state;
            let isCheck = hocPhanChon == item;
            const rows = [];
            let listHocPhan = (list || []).groupBy('maHocPhan')[item] || [],
                rowSpan = listHocPhan.length;
            if (rowSpan) {
                for (let i = 0; i < rowSpan; i++) {
                    const hocPhan = listHocPhan[i];
                    let isTrung = this.state.isTrung == hocPhan.maHocPhan;
                    if (i == 0) {
                        rows.push(
                            <tr key={rows.length} style={{ backgroundColor: hocPhan.tinhTrang == 3 ? '#ffcccb' : (isCheck ? (isTrung ? '#f7de97' : '#90EE90') : '#ffffff') }}>
                                <TableCell type='checkbox' isCheck content={isCheck} permission={{ write: (isCheck || !(hocPhan.siSo != null && hocPhan.siSo >= (hocPhan.soLuongDuKien || parseInt(tkbSoLuongDuKienMax) || 100))) && hocPhan.tinhTrang == 2 }}
                                    onChanged={() => {
                                        this.setState({ isLoading: true });
                                        this.state.isUpdate ? this.chuyenHocPhan(hocPhan) : this.chonHocPhan(hocPhan);
                                    }} rowSpan={rowSpan} />
                                <TableCell style={{ width: 'auto', whiteSpace: 'nowrap' }} content={hocPhan.maHocPhan} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={
                                    <Tooltip title={hocPhan.tenKhoaBoMon} arrow placement='right-end'>
                                        <span>{T.parse(hocPhan.tenMonHoc, { vi: '' })?.vi}</span>
                                    </Tooltip>
                                } rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} type='number' content={(hocPhan.siSo || 0) + '/' + (hocPhan.soLuongDuKien || tkbSoLuongDuKienMax || '100')} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} type='number' content={hocPhan.tongTinChi} rowSpan={rowSpan} />
                                <TableCell style={{ width: 'auto', whiteSpace: 'nowrap' }} content={<Tooltip title={hocPhan.sucChua || ''} arrow ><span>{hocPhan.phong}</span></Tooltip>} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} type='number' content={hocPhan.thu} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.tietBatDau ? `${hocPhan.tietBatDau} - ${hocPhan.tietBatDau + hocPhan.soTietBuoi - 1}` : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.listMaLop && hocPhan.listMaLop.length ? hocPhan.listMaLop.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.coSo} rowSpan={rowSpan} />
                                <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={hocPhan.ngayBatDau} />
                                <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={hocPhan.ngayKetThuc} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.giangVien && hocPhan.giangVien.length ? hocPhan.giangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.troGiang && hocPhan.troGiang.length ? hocPhan.troGiang.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                <TableCell style={{ width: 'auto', whiteSpace: 'nowrap' }} content={hocPhan.tenKhoaDangKy} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: ' center', color: 'blue', cursor: 'pointer' }} rowSpan={rowSpan} content={
                                    <Tooltip title='Xem chi tiết tuần học' arrow>
                                        <i className='fa fa-lg fa-search' onClick={e => {
                                            e && e.preventDefault();
                                            if (isCheckTuanHoc == item) this.setState({ isCheckTuanHoc: null });
                                            else this.setState({ isCheckTuanHoc: item });
                                        }} />
                                    </Tooltip>
                                } />
                            </tr >,
                        );
                    } else {
                        rows.push(
                            <tr key={rows.length} style={{ backgroundColor: hocPhan.tinhTrang == 3 ? '#ffcccb' : (isCheck ? (isTrung ? '#f7de97' : '#90EE90') : '#ffffff') }}>
                                <TableCell style={{ width: 'auto', whiteSpace: 'nowrap' }} content={<Tooltip title={hocPhan.sucChua || ''} arrow ><span>{hocPhan.phong}</span></Tooltip>} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} type='number' content={hocPhan.thu} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.tietBatDau ? `${hocPhan.tietBatDau} - ${hocPhan.tietBatDau + hocPhan.soTietBuoi - 1}` : ''} />
                                <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={hocPhan.ngayBatDau} />
                                <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={hocPhan.ngayKetThuc} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.giangVien && hocPhan.giangVien.length ? hocPhan.giangVien.split(',').map((item, i) => <div key={`gv_${i}`}>{item}</div>) : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.troGiang && hocPhan.troGiang.length ? hocPhan.troGiang.split(',').map((item, i) => <div key={`tg_${i}`}>{item}</div>) : ''} />
                            </tr>
                        );
                    }
                }
            }
            let dataTuan = (this.props.hocPhan?.listDataTuanHoc || []).filter(i => i.maHocPhan == item);
            rows.push(<tr style={{ display: isCheckTuanHoc == item ? '' : 'none' }}>
                <td colSpan={15}>
                    {
                        renderTable({
                            getDataSource: () => dataTuan,
                            emptyTable: 'Chưa có thông tin tuần học!',
                            header: 'thead-light',
                            stickyHead: dataTuan.length > 10,
                            renderHead: () => <tr>
                                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>STT</th>
                                <th style={{ width: '5%', whiteSpace: 'nowrap' }}>Tuần</th>
                                <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Ngày học</th>
                                <th style={{ width: '5%', whiteSpace: 'nowrap' }}>Thứ</th>
                                <th style={{ width: '5%', whiteSpace: 'nowrap' }}>Phòng</th>
                                <th style={{ width: '35%', whiteSpace: 'nowrap' }}>Tiết học</th>
                                <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Giảng viên</th>
                                <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Trợ giảng</th>
                            </tr>,
                            renderRow: (item, index) => {
                                return (<tr key={item.maHocPhan + index}>
                                    <TableCell content={index + 1} />
                                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={new Date(item.ngayHoc).getWeek()} />
                                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={T.dateToText(item.ngayHoc, 'dd/mm/yyyy')} />
                                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.thu == 8 ? 'CN' : item.thu} />
                                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.phong} />
                                    <TableCell content={this.mapperTiet(item)} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.dataTenGiangVien && item.dataTenGiangVien.length ? item.dataTenGiangVien.split(',').map((gv, i) => <div key={`tuan_gv_${i}`}>{gv}</div>) : ''} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.dataTenTroGiang && item.dataTenTroGiang.length ? item.dataTenTroGiang.split(',').map((tg, i) => <div key={`tuan_tg_${i}`}>{tg}</div>) : ''} />
                                </tr>);
                            }
                        })
                    }
                </td>
            </tr>
            );
            return rows;
        }
    });

    render = () => {
        let { isLoading, isUpdate, listHocPhan, hocPhanChon } = this.state;
        return this.renderModal({
            title: isUpdate ? 'Cập nhật lớp học phần' : 'Đăng ký lớp học phần',
            size: 'elarge',
            isLoading: isLoading,
            body: <>
                {this.table(listHocPhan)}
            </>,
            postButtons: <button type='button' disabled={isLoading} className='btn btn-primary' onClick={e => e.preventDefault() || this.onSave()} style={{ display: hocPhanChon ? '' : 'none' }}>
                {isLoading ? <i className='fa fa-spin fa-lg fa-spinner' /> : <i className='fa fa-fw fa-lg fa-save' />} Chọn đăng ký
            </button>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hocPhan: state.student.hocPhan });
const mapActionsToProps = { createDangKyHocPhan, updateDangKyHocPhan };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(HocPhanModal);
