import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, AdminModal, TableCell, FormCheckbox, renderDataTable, TableHead, FormRichTextBox } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';
import { DtThoiKhoaBieuGetDataHocPhan, DtTKBCustomDeleteTuan, DtTKBCustomBaoNghiHoanTac, deletePhong } from 'modules/mdDaoTao/dtThoiKhoaBieu/redux';
import AdjustGVModal from 'modules/mdDaoTao/dtThoiKhoaBieu/modal/adjustGVModal';
import BaoNghiModal from 'modules/mdDaoTao/dtThoiKhoaBieu/modal/BaoNghiModal';
import BaoBuModal from 'modules/mdDaoTao/dtThoiKhoaBieu/modal/BaoBuModal';
import AdjustTuanModal from 'modules/mdDaoTao/dtThoiKhoaBieu/modal/adjustTuanModal';
import AddTuanHocModal from 'modules/mdDaoTao/dtThoiKhoaBieu/modal/AddTuanHocModal';
import { SelectAdapter_DmPhongCustomFilter } from 'modules/mdDanhMuc/dmPhong/redux';


export class Note extends AdminModal {
    componentDidMount() {
        this.disabledClickOutside();
        this.onHidden(() => {
            this.setState({ isWait: 0 });
        });
    }

    onShow = (item) => {
        this.setState({ item });
    }

    onSubmit = () => {
        const ghiChu = this.lyDo.value();
        const { idTuan, maHocPhan } = this.state.item;
        this.setState({ isWait: true });
        this.props.DtTKBCustomBaoNghiHoanTac({ idTuan, maHocPhan, ghiChu }, data => {
            if (data.error) {
                this.setState({ isWait: false });
            } else {
                this.props.handleSetData && this.props.handleSetData(data.dataNgay);
                this.props.handleRefresh && this.props.handleRefresh();
                this.hide();
                this.lyDo.value('');
            }
        });
    }

    render = () => {
        let { isWait } = this.state;

        return this.renderModal({
            title: 'Ghi chú',
            isShowSubmit: false,
            body: <div className='row'>
                <FormRichTextBox ref={e => this.lyDo = e} type='text' className='col-md-12' label='Ghi chú' required />
            </div>,
            postButtons: <button type='submit' className='btn btn-danger' disabled={isWait}>
                <i className={isWait ? 'fa fa-spin fa-lg fa-spinner' : 'fa fa-fw fa-lg fa-undo'} /> Lưu
            </button>
        });
    }
}

class SectionTuanHoc extends AdminPage {
    state = { listTuanHoc: [], listAddTuanHoc: [], listRenderTuan: [] }

    setValue = (data) => {
        this.setState({ listTuanHoc: data, listAddTuanHoc: [], listRenderTuan: data });
    }

    getValue = () => {
        return this.state.listTuanHoc;
    }

    getDataTuan = (dataNgay) => {
        dataNgay && this.props.setNgayHocPhan(dataNgay);
        T.alert('Đang xử lý!', 'warning', false, null, true);
        this.props.DtThoiKhoaBieuGetDataHocPhan(this.props.maHocPhan, data => {
            this.setState({ listAddTuanHoc: [], listTuanHoc: data.listTuanHoc, listRenderTuan: data.listTuanHoc }, () => {
                T.alert('Xử lý thành công', 'success', false, 500);
                this.checkAll?.value('');
            });
        });
    }

    handleChooseTuan = (index) => {
        let { listAddTuanHoc } = this.state;
        if (listAddTuanHoc.includes(index)) {
            this.setState({ listAddTuanHoc: listAddTuanHoc.filter(item => item != index) });
        }
        else {
            this.setState({ listAddTuanHoc: [...listAddTuanHoc, index] });
        }
    }

    handleDeleteTuan = (item) => {
        let { idTuan, idThoiKhoaBieu, ngayBatDau, ngayKetThuc, maHocPhan } = item;
        T.confirm('Cảnh báo', 'Bạn có chắc chắn muốn xóa buổi học này không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                this.props.DtTKBCustomDeleteTuan({ idTuan, idThoiKhoaBieu, ngayBatDau, ngayKetThuc, maHocPhan }, data => {
                    this.getDataTuan(data);
                });
            }
        });
    }

    renderTiet = (tuan) => {
        let { tietBatDau, soTietBuoi, thoiGianBatDau, thoiGianKetThuc } = tuan;
        let tietKetThuc = tietBatDau + soTietBuoi - 1;
        const dataTiet = tietBatDau == tietKetThuc ? tietBatDau : `${tietBatDau} - ${tietKetThuc}`;
        return <>
            {`Tiết: ${dataTiet} (${thoiGianBatDau} - ${thoiGianKetThuc})`}
            <br />
            {tuan.isLate ? `Đi trễ: ${tuan.ghiChu}` : (tuan.isSoon ? `Về sớm: ${tuan.ghiChu}` : tuan.ghiChu)}
        </>;
    }

    mapperTiet = (item) => {
        if (item.isNgayLe) return `Nghỉ lễ: ${item.tenNgayLe}`;
        else if (item.isNghi) return `Giảng viên báo nghỉ: ${item.ghiChu || ''}`;
        else if (item.isVang) return `Lịch học vắng: ${item.ghiChu || ''}`;
        else return this.renderTiet(item);
    }

    handleDownloadTuan = () => {
        let { listTuanHoc = [] } = this.state, { fullData } = this.props,
            { namHoc, hocKy, coSo, maMonHoc, tenMonHoc, maLop, tenKhoaBoMon, tongTiet, maHocPhan, tietLyThuyet, tietThucHanh, soLuongDuKien, siSo } = fullData[0],
            dataHocPhan = {
                namHoc, hocKy, coSo, maMonHoc, tenMonHoc, maLop, tenKhoaBoMon, tongTiet, maHocPhan, tietLyThuyet, tietThucHanh, soLuongDuKien, siSo
            };
        if (!listTuanHoc.length) return T.notify('Học phần chưa có tuần học nào!', 'danger');
        T.handleDownload(`/api/dt/thoi-khoa-bieu/export-lich-day?dataHocPhan=${T.stringify(dataHocPhan)}`);
    }

    hoanTacNghi = (tuan) => {
        const { phong, ngayBatDau, ngayKetThuc, idTuan, coSo, ngayHoc, maHocPhan, tietBatDau, soTietBuoi } = tuan, { listTuanHoc } = this.state;
        T.confirm('Cảnh báo', 'Bạn có chắc chắn muốn hoàn tác nghỉ buổi học này không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                if (listTuanHoc.filter(i => i.idNgayNghi == idTuan).length) {
                    T.notify('Tuần học đã có lịch bù!', 'danger');
                } else {
                    SelectAdapter_DmPhongCustomFilter({ coSo, ngayHoc, tietBatDau, soTietBuoi }).fetchValid({ maHocPhan, ngayBatDau, ngayKetThuc, phong }, item => {
                        if (item) {
                            T.notify(item, 'warning');
                        } else {
                            this.note.show(tuan);
                        }
                    });
                }
            }
        });
    }

    deletePhong = () => {
        T.confirm('Lưu ý', 'Bạn có chắc chắn muốn xóa phòng học không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                let { listRenderTuan, listAddTuanHoc } = this.state,
                    listTime = [...new Set(listRenderTuan.filter((_, index) => listAddTuanHoc.includes(index)))];
                listTime = listTime.map(e => e.idTuan);
                this.props.deletePhong(listTime, () => {
                    T.alert('Xóa phòng học thành công', 'success');
                    this.getDataTuan();
                    this.props.handleReloadData();
                });
            }
        });
    }

    handleKeySearch = (key) => {
        let [ks, searchTerm] = key.split(':'),
            { listTuanHoc, listRenderTuan } = this.state;

        if (ks == 'ks_coSo') {
            listRenderTuan = listTuanHoc.filter(i => (i.tenCoSoPhong || i.tenCoSo) ? (i.tenCoSoPhong || i.tenCoSo).toLowerCase().includes(searchTerm.toLowerCase()) : false);
        } else if (ks == 'ks_thu') {
            listRenderTuan = listTuanHoc.filter(i => (i.thu == 8 ? 'CN' : i.thu.toString()).includes(searchTerm));
        } else if (ks == 'ks_phong') {
            listRenderTuan = listTuanHoc.filter(i => i.phong ? i.phong.includes(searchTerm) : false);
        } else if (ks == 'ks_giangVien') {
            listRenderTuan = listTuanHoc.filter(i => i.giangVien && i.giangVien.length ? i.giangVien.join(', ').toLowerCase().includes(searchTerm.toLowerCase()) : false);
        } else if (ks == 'ks_troGiang') {
            listRenderTuan = listTuanHoc.filter(i => i.troGiang && i.troGiang.length ? i.troGiang.join(', ').toLowerCase().includes(searchTerm.toLowerCase()) : false);
        } else if (ks == 'ks_tiet') {
            listRenderTuan = listTuanHoc.filter(i => !searchTerm || (!i.isNghi && !i.isNgayLe && i.tietBatDau == searchTerm));
        }
        this.setState({ listRenderTuan, listAddTuanHoc: [] }, () => this.checkAll.value(''));
    }

    tableTuan = (list) => renderDataTable({
        data: list,
        emptyTable: 'Chưa có tuần học nào!',
        header: 'thead-light',
        stickyHead: list && list.length > 10,
        renderHead: () => <tr>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>STT</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>
                <FormCheckbox ref={e => this.checkAll = e} readOnly={!this.getUserPermission('dtThoiKhoaBieu', ['write']).write || this.props.viewing} onChange={(value) => {
                    if (value) {
                        this.setState({
                            listAddTuanHoc: this.state.listRenderTuan.map((tuan, index) => {
                                if (!(tuan.isNgayLe || tuan.isBu || tuan.isNghi)) return index;
                            }).filter(item => item != null || item != undefined)
                        });
                    } else {
                        this.setState({ listAddTuanHoc: [] });
                    }
                }} />
            </th>
            <th style={{ width: '5%', whiteSpace: 'nowrap' }}>Tuần</th>
            <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Ngày học</th>
            <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Cơ sở' keyCol='coSo' onKeySearch={this.handleKeySearch} />
            <TableHead style={{ width: '5%', whiteSpace: 'nowrap' }} content='Thứ' keyCol='thu' onKeySearch={this.handleKeySearch} />
            <TableHead style={{ width: '5%', whiteSpace: 'nowrap' }} content='Phòng' keyCol='phong' onKeySearch={this.handleKeySearch} />
            <TableHead style={{ width: '35%', whiteSpace: 'nowrap' }} content='Tiết' keyCol='tiet' onKeySearch={this.handleKeySearch} />
            <TableHead style={{ width: '20%', whiteSpace: 'nowrap' }} content='Giảng viên' keyCol='giangVien' onKeySearch={this.handleKeySearch} />
            <TableHead style={{ width: '20%', whiteSpace: 'nowrap' }} content='Trợ giảng' keyCol='troGiang' onKeySearch={this.handleKeySearch} />
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
        </tr>,
        renderRow: (item, index) => {
            let isCheck = this.state.listAddTuanHoc.includes(index), { isAdjust } = this.props;
            const permissions = this.getUserPermission('dtThoiKhoaBieu', ['read', 'write', 'delete', 'manage', 'export', 'import']),
                viewing = this.props.viewing;

            return (<tr key={index} style={{ backgroundColor: item.isNgayLe || item.isNghi ? '#e9e9e9' : (isCheck ? '#9fc5e8' : '') }}>
                <TableCell content={index + 1} />
                <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={isCheck} permission={{ write: !(item.isNgayLe || item.isNghi || item.isBu) && permissions.write && !viewing }} onChanged={() => this.handleChooseTuan(index)} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={new Date(item.ngayHoc).getWeek()} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={T.convertDate(item.ngayHoc, 'DD/MM/YYYY')} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={T.parse(item.tenCoSoPhong || item.tenCoSo, { vi: '' })?.vi} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.thu == 8 ? 'CN' : item.thu} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.phong} />
                <TableCell content={this.mapperTiet(item)} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.giangVien && item.giangVien.length ? item.giangVien.map((gv, i) => <div key={i}>{gv}</div>) : ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.troGiang && item.troGiang.length ? item.troGiang.map((tg, i) => <div key={i}>{tg}</div>) : ''} />
                <TableCell type='buttons' style={{ textAlign: 'center', display: permissions.write && !viewing ? '' : 'none' }} content={item}>
                    <Tooltip title='Báo nghỉ tuần học' arrow>
                        <button className='btn btn-danger' style={{ display: isAdjust && !(item.isNgayLe || item.isNghi || item.isVang) ? '' : 'none' }} onClick={e => e.preventDefault() || this.baoNghiModal.show(item)}>
                            <i className='fa fa-lg fa-power-off' />
                        </button>
                    </Tooltip>
                    <Tooltip title='Báo bù tuần học' arrow>
                        <button className='btn btn-info' style={{ display: item.isNghi || item.isVang ? '' : 'none' }} onClick={e => e.preventDefault() || this.baoBuModal.show({ ...item, isEdit: false })}>
                            <i className='fa fa-lg fa-retweet' />
                        </button>
                    </Tooltip>
                    <Tooltip title='Hoàn tác nghỉ' arrow>
                        <button className='btn btn-warning' style={{ display: item.isNghi && !item.isVang ? '' : 'none' }} onClick={e => e.preventDefault() || this.hoanTacNghi(item)}>
                            <i className='fa fa-lg fa-undo' />
                        </button>
                    </Tooltip>
                    <Tooltip title='Cập nhật lịch bù' arrow>
                        <button className='btn btn-success' style={{ display: item.isBu && !(item.isVang || item.isNghi) ? '' : 'none' }} onClick={e => e.preventDefault() || this.baoBuModal.show({ ...item, isEdit: true })}>
                            <i className='fa fa-lg fa-repeat' />
                        </button>
                    </Tooltip>
                    <Tooltip title='Xóa tuần học' arrow>
                        <button className='btn btn-warning' style={{ display: isAdjust && !item.isNghi && !item.isVang ? '' : 'none' }} onClick={(e) => e.preventDefault() || this.handleDeleteTuan(item)}>
                            <i className='fa fa-lg fa-trash' />
                        </button>
                    </Tooltip>
                </TableCell>
            </tr>);
        }
    })

    render() {
        let { listTuanHoc, listAddTuanHoc, listRenderTuan } = this.state, { dataTiet, fullData = [], listNgayLe = [], dataTeacher = [] } = this.props, { tongTiet } = fullData[0] || { tongTiet: 0 };
        let tongTietRai = listTuanHoc.filter(i => !(i.isNgayLe || i.isNghi)).reduce((total, curr) => total + parseInt(curr.soTietBuoi), 0);
        const permissions = this.getUserPermission('dtThoiKhoaBieu', ['read', 'write', 'delete', 'manage', 'export', 'import']);

        return <>
            <AdjustGVModal ref={e => this.modal = e} dataTuan={listRenderTuan} listAddTuanHoc={listAddTuanHoc} handleUpdate={this.props.handleUpdateGV} maHocPhan={this.props.maHocPhan} />
            <AdjustTuanModal ref={e => this.tuanModal = e} dataTiet={dataTiet} dataTuan={listRenderTuan} listAddTuanHoc={listAddTuanHoc} maHocPhan={this.props.maHocPhan} update={this.getDataTuan} getData={this.props.getData} />
            <BaoNghiModal ref={e => this.baoNghiModal = e} baoNghi={this.getDataTuan} />
            <BaoBuModal ref={e => this.baoBuModal = e} dataTuan={listTuanHoc} dataTiet={dataTiet} baoBu={this.getDataTuan} />
            <AddTuanHocModal ref={e => this.addTuanModal = e} dataTiet={dataTiet} listTuanHoc={listTuanHoc} listNgayLe={listNgayLe} fullData={fullData} update={this.getDataTuan} />
            <Note ref={e => this.note = e} DtTKBCustomBaoNghiHoanTac={this.props.DtTKBCustomBaoNghiHoanTac} handleSetData={this.getDataTuan} />
            <div className='d-flex'>
                {<button className='btn btn-info' type='button' style={{ width: 'fit-content', margin: '10px' }} onClick={this.handleDownloadTuan}>
                    <i className='fa fa-lg fa-download' /> Export lịch dạy
                </button>}
                {<button className='btn btn-primary' type='button' style={{ width: 'fit-content', margin: '10px', display: listTuanHoc.length && permissions.write && !this.props.viewing ? '' : 'none' }} onClick={e => e && e.preventDefault() || this.addTuanModal.show()}>
                    <i className='fa fa-lg fa-download' /> Thêm tuần học
                </button>}
                {listRenderTuan.length > 0 && <button className='btn btn-success' type='button' style={{ width: 'fit-content', margin: '10px', display: listAddTuanHoc.length ? '' : 'none' }} onClick={e => e && e.preventDefault() || this.modal.show()}>
                    <i className='fa fa-lg fa-plus' /> Thêm giảng viên và trợ giảng
                </button>}
                {listRenderTuan.length > 0 && <button className='btn btn-warning' type='button' style={{ width: 'fit-content', margin: '10px', display: listAddTuanHoc.length ? '' : 'none' }} onClick={e => e && e.preventDefault() || this.tuanModal.show()}>
                    <i className='fa fa-lg fa-repeat' /> Chỉnh sửa thông tin tuần học
                </button>}
                {listRenderTuan.length > 0 && <button className='btn btn-danger' type='button' style={{ width: 'fit-content', margin: '10px', display: listAddTuanHoc.length ? '' : 'none' }} onClick={e => e && e.preventDefault() || this.deletePhong()}>
                    <i className='fa fa-lg fa-trash' /> Xóa phòng học
                </button>}
            </div>
            <div style={{ fontWeight: 'bold', margin: '10px 0' }}> Tổng số tiết rải/Tổng số tiết: {tongTietRai}/{tongTiet} </div>
            <div style={{ display: dataTeacher.length ? 'flex' : 'none', flexDirection: 'column' }}>
                <p className='font-weight-bold'>Danh sách giảng viên được gán vào lớp học phần</p>
                {dataTeacher.map((gv, idx) => <p key={`gv-${idx}`} className='text-danger font-weight-bold'>{gv.hoTen}</p>)}
            </div>
            <div>
                {this.tableTuan(listRenderTuan)}
            </div>
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { DtThoiKhoaBieuGetDataHocPhan, DtTKBCustomDeleteTuan, DtTKBCustomBaoNghiHoanTac, deletePhong };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionTuanHoc);