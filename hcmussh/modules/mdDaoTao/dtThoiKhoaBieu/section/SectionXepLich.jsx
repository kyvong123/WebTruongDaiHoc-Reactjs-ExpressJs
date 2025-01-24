import React from 'react';
import { AdminPage, TableCell, renderDataTable, FormTextBox, FormSelect, FormDatePicker, getValue } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { SelectAdapter_DmCaHoc } from 'modules/mdDanhMuc/dmCaHoc/redux';
import { SelectAdapter_DmCoSo } from 'modules/mdDanhMuc/dmCoSo/redux';
import { SelectAdapter_DmPhongAll, SelectAdapter_DmPhongCustomFilter } from 'modules/mdDanhMuc/dmPhong/redux';
import { DtTKBCustomCheckData } from 'modules/mdDaoTao/dtThoiKhoaBieu/redux';
import { SelectAdapter_FwCanBoGiangVien } from 'modules/mdTccb/tccbCanBo/redux';
import { DtTKBCustomSaveGen } from 'modules/mdDaoTao/dtThoiKhoaBieu/redux';
import { Tooltip } from '@mui/material';

class SectionRaiLich extends AdminPage {
    state = { dataHocPhan: [], listTuanHoc: [], dataEdit: {} }

    setValue = ({ fullData, dataCaHoc, listTuanHoc, dataNgayLe }, done) => {
        this.setState({ dataHocPhan: fullData, listTuanHoc, dataNgayLe, dataCaHoc });
        done && done();
    }

    selectCoSo = (item) => {
        let { editItem } = this.state,
            edit = editItem && editItem.ngayBatDau == item.ngayBatDau;
        return edit ? <FormSelect ref={e => this.coSo = e} className='mb-0' value={item.coSo} data={SelectAdapter_DmCoSo} required /> : item.coSo;
    }

    selectPhong = (item) => {
        let { editItem } = this.state,
            edit = editItem && editItem.ngayBatDau == item.ngayBatDau;
        return edit ? <FormSelect ref={e => this.phong = e} className='mb-0' value={item.phong} data={SelectAdapter_DmPhongAll(item.coSo)} /> : item.phong;
    }

    selectNgayHoc = (item) => {
        let { editItem } = this.state,
            edit = editItem && editItem.ngayBatDau == item.ngayBatDau;
        return edit ? <FormDatePicker ref={e => this.ngayHoc = e} className='mb-0' type='date-mask' value={item.ngayHoc} required /> : T.dateToText(item.ngayHoc, 'dd/mm/yyyy');
    }

    selectTietBatDau = (item) => {
        let { editItem } = this.state,
            edit = editItem && editItem.ngayBatDau == item.ngayBatDau;
        return edit ? <FormSelect ref={e => this.tietBatDau = e} className='mb-0' value={item.tietBatDau} data={SelectAdapter_DmCaHoc(item.coSo)} required /> : item.tietBatDau;
    }

    selectSoTiet = (item) => {
        let { editItem } = this.state,
            edit = editItem && editItem.ngayBatDau == item.ngayBatDau;
        return edit ? <FormTextBox ref={e => this.soTietBuoi = e} type='number' allowNegative={false} className='mb-0' value={item.soTietBuoi} required /> : item.soTietBuoi;
    }

    selectGiangVien = (item) => {
        let { editItem } = this.state,
            edit = editItem && editItem.ngayBatDau == item.ngayBatDau;
        return edit ? <FormSelect ref={e => this.shccGiangVien = e} className='mb-0' value={item.shccGiangVien} data={SelectAdapter_FwCanBoGiangVien} multiple allowClear /> : (item.giangVien && item.giangVien.length ? item.giangVien.map((i, idx) => <div key={idx}>{i}</div>) : '');
    }

    selectTroGiang = (item) => {
        let { editItem } = this.state,
            edit = editItem && editItem.ngayBatDau == item.ngayBatDau;
        return edit ? <FormSelect ref={e => this.shccTroGiang = e} className='mb-0' value={item.shccTroGiang} data={SelectAdapter_FwCanBoGiangVien} multiple allowClear /> : (item.troGiang && item.troGiang.length ? item.troGiang.map((i, idx) => <div key={idx}>{i}</div>) : '');
    }

    checkTrung = (changes, index) => {
        const { ngayBatDau, ngayKetThuc } = changes;
        return this.state.listTuanHoc.find((item, idx) => {
            if (idx == index) return false;
            return !(ngayBatDau > item.ngayKetThuc || ngayKetThuc < item.ngayBatDau);
        });
    }

    handleSaveEdit = (item, index) => {
        try {
            let changes = {}, { dataCaHoc, listTuanHoc, dataNgayLe } = this.state, ghiChu = '';
            ['coSo', 'phong', 'ngayHoc', 'tietBatDau', 'soTietBuoi', 'shccGiangVien', 'shccTroGiang'].forEach(key => {
                changes[key] = getValue(this[key]);
            });
            changes.giangVien = this.shccGiangVien.data().map(i => i.text);
            changes.troGiang = this.shccTroGiang.data().map(i => i.text);

            let ngay = changes['ngayHoc'];
            if (ngay instanceof Date && !isNaN(ngay)) {
                let thu = new Date(ngay).getDay() + 1;
                if (thu == 1) thu = 8;
                changes['ngayHoc'] = ngay.setHours(0, 0, 0, 0);
                changes['thu'] = thu;
                changes['tuanBatDau'] = new Date(ngay).getWeek();
            } else {
                T.notify('Ngày bắt đầu không hợp lệ!', 'danger');
                this.ngayHoc.focus();
                return;
            }

            let tietKetThuc = parseInt(changes['tietBatDau']) + parseInt(changes['soTietBuoi']) - 1,
                thoiGianBatDau = dataCaHoc.filter(i => i.maCoSo == changes['coSo']).find(i => i.ten == changes['tietBatDau']).thoiGianBatDau,
                thoiGianKetThuc = dataCaHoc.filter(i => i.maCoSo == changes['coSo']).find(i => i.ten == tietKetThuc)?.thoiGianKetThuc;

            if (thoiGianKetThuc) {
                const [gioBatDau, phutBatDau] = thoiGianBatDau.split(':'),
                    [gioKetThuc, phutKetThuc] = thoiGianKetThuc.split(':');
                changes.ngayBatDau = new Date(ngay).setHours(parseInt(gioBatDau), parseInt(phutBatDau));
                changes.ngayKetThuc = new Date(ngay).setHours(parseInt(gioKetThuc), parseInt(phutKetThuc));
            } else {
                T.notify('Không tồn tại tiết kết thúc', 'danger');
                this.soTietBuoi.focus();
                return;
            }

            if (this.checkTrung(changes, index)) {
                T.notify('Trùng thời gian học với lịch học khác của học phần', 'danger');
                return;
            }

            const getTrung = () => {
                listTuanHoc[index] = { ...item, ...changes, ghiChu, isNgayLe: checkNgayLe ? true : '', ngayLe: checkNgayLe ? checkNgayLe.moTa : '' };
                listTuanHoc.sort((a, b) => a.ngayBatDau - b.ngayBatDau);
                this.setState({ listTuanHoc, editItem: null });
            };

            const checkNgayLe = dataNgayLe.find(item => new Date(item.ngay).setHours(0, 0, 0) == new Date(changes.ngayBatDau).setHours(0, 0, 0));
            if (!checkNgayLe && changes.phong) {
                let { ngayHoc, ngayBatDau, ngayKetThuc, phong, coSo, tietBatDau, soTietBuoi } = changes,
                    { maHocPhan } = listTuanHoc[0];
                SelectAdapter_DmPhongCustomFilter({ coSo, ngayHoc, tietBatDau, soTietBuoi }).fetchValid({ maHocPhan, ngayBatDau, ngayKetThuc, phong }, item => {
                    if (item) {
                        ghiChu = item;
                        T.notify(ghiChu, 'warning');
                        getTrung();
                    } else getTrung();
                });
            } else {
                getTrung();
            }
        } catch (error) {
            console.error(error);
            error && T.notify('Vui lòng điền đầy đủ dữ liệu cơ sở, ngày, tiết', 'danger');
        }
    }

    handleAddNew = (list) => {
        try {
            let changes = {}, { dataCaHoc, dataNgayLe } = this.state, ghiChu = '';
            ['coSo', 'phong', 'ngayHoc', 'tietBatDau', 'soTietBuoi', 'shccGiangVien', 'shccTroGiang'].forEach(key => {
                changes[key] = getValue(this[key + 'New']);
            });

            changes.giangVien = this.shccGiangVienNew.data().map(i => i.text);
            changes.troGiang = this.shccTroGiangNew.data().map(i => i.text);

            let ngay = changes['ngayHoc'];
            if (ngay instanceof Date && !isNaN(ngay)) {
                let thu = new Date(ngay).getDay() + 1;
                if (thu == 1) thu = 8;
                changes['ngayHoc'] = ngay.setHours(0, 0, 0, 0);
                changes['thu'] = thu;
                changes['tuanBatDau'] = new Date(ngay).getWeek();
            } else {
                T.notify('Ngày bắt đầu không hợp lệ!', 'danger');
                this.ngayHocNew.focus();
                return;
            }

            let tietKetThuc = parseInt(changes['tietBatDau']) + parseInt(changes['soTietBuoi']) - 1,
                thoiGianBatDau = dataCaHoc.filter(i => i.maCoSo == changes['coSo']).find(i => i.ten == changes['tietBatDau']).thoiGianBatDau,
                thoiGianKetThuc = dataCaHoc.filter(i => i.maCoSo == changes['coSo']).find(i => i.ten == tietKetThuc)?.thoiGianKetThuc;

            if (thoiGianKetThuc) {
                const [gioBatDau, phutBatDau] = thoiGianBatDau.split(':'),
                    [gioKetThuc, phutKetThuc] = thoiGianKetThuc.split(':');
                changes.ngayBatDau = new Date(ngay).setHours(parseInt(gioBatDau), parseInt(phutBatDau));
                changes.ngayKetThuc = new Date(ngay).setHours(parseInt(gioKetThuc), parseInt(phutKetThuc));
            } else {
                T.notify('Không tồn tại tiết kết thúc', 'danger');
                this.soTietBuoiNew.focus();
                return;
            }

            if (this.checkTrung(changes, list.length + 1)) {
                T.notify('Trùng thời gian học với lịch học khác của học phần', 'danger');
                return;
            }

            const getTrung = () => {
                let item = { ...list[0], ...changes, ghiChu, isNgayLe: checkNgayLe ? true : '', ngayLe: checkNgayLe ? checkNgayLe.moTa : '' };
                list.push(item);
                list.sort((a, b) => a.ngayBatDau - b.ngayBatDau);
                this.setState({ listTuanHoc: list }, () => {
                    ['coSo', 'phong', 'ngayHoc', 'tietBatDau', 'soTietBuoi', 'shccGiangVien', 'shccTroGiang'].forEach(key => {
                        this[key + 'New'].value('');
                    });
                });
            };

            const checkNgayLe = dataNgayLe.find(item => new Date(item.ngay).setHours(0, 0, 0) == new Date(changes.ngayBatDau).setHours(0, 0, 0));
            if (!checkNgayLe && changes.phong) {
                let { ngayHoc, ngayBatDau, ngayKetThuc, phong, coSo, tietBatDau, soTietBuoi } = changes,
                    { maHocPhan } = list[0];
                SelectAdapter_DmPhongCustomFilter({ coSo, ngayHoc, tietBatDau, soTietBuoi }).fetchValid({ maHocPhan, ngayBatDau, ngayKetThuc, phong }, item => {
                    if (item) {
                        ghiChu = item;
                        T.notify(ghiChu, 'warning');
                        getTrung();
                    } else getTrung();
                });
            } else {
                getTrung();
            }
        } catch (error) {
            console.error(error);
            error && T.notify('Vui lòng điền đầy đủ dữ liệu cơ sở, ngày, tiết', 'danger');
        }
    }

    handleSave = () => {
        let { listTuanHoc, dataHocPhan } = this.state;
        T.alert('Đang xử lý...', 'warning', false, null, true);
        this.props.DtTKBCustomSaveGen(T.stringify(listTuanHoc), T.stringify(dataHocPhan), () => {
            T.alert('Cập nhật lịch học học phần thành công', 'success', true, 5000);
            this.props.created(listTuanHoc[0].maHocPhan);
        });
    }

    table = (list) => renderDataTable({
        emptyTable: '',
        data: list,
        style: { fontSize: '0.8rem' },
        header: 'thead-light',
        renderHead: () => <tr>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>STT</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tuần</th>
            <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Ngày học</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Cơ sở</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Phòng</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thứ</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tiết bắt đầu</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tiết/Buổi</th>
            <th style={{ width: '15%', whiteSpace: 'nowrap' }}>Giảng viên</th>
            <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Trợ giảng</th>
            <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Ghi chú</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
        </tr>,
        renderRow: <tbody>
            {list.map((item, index) => {
                let { editItem } = this.state,
                    edit = editItem && editItem.ngayBatDau == item.ngayBatDau;
                return (<tr key={`${item.id}-${index}`} >
                    <TableCell content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tuanBatDau} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={this.selectNgayHoc(item)} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={this.selectCoSo(item)} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={this.selectPhong(item)} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.thu == 8 ? 'Chủ nhật' : item.thu} />
                    <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={this.selectTietBatDau(item)} />
                    <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={this.selectSoTiet(item)} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={this.selectGiangVien(item)} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={this.selectTroGiang(item)} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.isNgayLe ? `Nghỉ lễ: ${item.ngayLe}` : item.ghiChu} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} type='buttons' content={item}
                        onEdit={() => {
                            if (!item.isNgayLe) {
                                if (edit) {
                                    this.handleSaveEdit(item, index);
                                } else this.setState({ editItem: item });
                            }
                        }}
                        onDelete={() => { item.isDelete = 1; this.setState({ listTuanHoc: list.filter(i => i.isDelete != 1) }); }}
                        permission={{ write: !item.isNgayLe, delete: true }}>
                        {edit && <Tooltip title='Hủy chỉnh sửa' arrow>
                            <button className='btn btn-secondary' onClick={(e) => e && e.preventDefault() || this.setState({ editItem: null })}>
                                <i className={'fa fa-lg fa-ban'} />
                            </button>
                        </Tooltip>}
                    </TableCell>
                </tr>);
            })}
            <tr>
                <TableCell />
                <TableCell colSpan={2} content={<FormDatePicker type='date-mask' ref={e => this.ngayHocNew = e} className='mb-0' placeholder='Thêm ngày học mới' required />} />
                <TableCell content={<FormSelect ref={e => this.coSoNew = e} className='mb-0' data={SelectAdapter_DmCoSo} placeholder='Thêm cơ sở mới' required onChange={(value) => {
                    this.setState({ coSo: value.id }, () => {
                        this.phongNew.value('');
                        this.tietBatDauNew.value('');
                    });
                }} />} />
                <TableCell content={<FormSelect ref={e => this.phongNew = e} className='mb-0' data={SelectAdapter_DmPhongAll(this.state.coSo)} placeholder='Thêm phòng mới' required />} />
                <TableCell />
                <TableCell content={<FormSelect ref={e => this.tietBatDauNew = e} className='mb-0' placeholder='Thêm tiết mới' data={SelectAdapter_DmCaHoc(this.state.coSo)} required />} />
                <TableCell content={<FormTextBox ref={e => this.soTietBuoiNew = e} type='number' allowNegative={false} placeholder='Thêm số tiết mới' className='mb-0' />} required />
                <TableCell content={<FormSelect ref={e => this.shccGiangVienNew = e} className='mb-0' placeholder='Thêm giảng viên mới' data={SelectAdapter_FwCanBoGiangVien} multiple allowClear />} />
                <TableCell content={<FormSelect ref={e => this.shccTroGiangNew = e} className='mb-0' placeholder='Thêm trợ giảng mới' data={SelectAdapter_FwCanBoGiangVien} multiple allowClear />} />
                <TableCell />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                    <Tooltip title='Thêm'>
                        <button className='btn btn-info' onClick={e => e.preventDefault() || this.handleAddNew(list)}>
                            <i className='fa fa-lg fa-plus' />
                        </button>
                    </Tooltip>
                } />
            </tr>

        </tbody>
    })

    render() {
        let { dataHocPhan, listTuanHoc = [] } = this.state, { maHocPhan, tenMonHoc, tongTiet } = dataHocPhan[0] || {};
        let tongTietRai = listTuanHoc.filter(i => !i.isNgayLe).reduce((total, curr) => total + parseInt(curr.soTietBuoi), 0);

        return <div className='tile'>
            <div className='tile-title row'>
                <h6 className='col-md-3'>Mã học phần: {maHocPhan} - {T.parse(tenMonHoc || '{}')?.vi || ''}</h6>
                <h6 className='col-md-3'>Tổng số tiết rải/Tổng số tiết: {tongTietRai}/{tongTiet}</h6>
                <div className='col-md-6'>
                    <button style={{ height: 'fit-content' }} className='btn btn-success' type='button' onClick={() => this.handleSave()}>
                        <i className='fa fa-fw fa-lg fa-save' /> Lưu danh sách tuần học
                    </button>
                </div>
            </div>
            <div className='tile-body'>
                {this.table(this.state.listTuanHoc)}
            </div>
        </div>;
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    DtTKBCustomSaveGen, DtTKBCustomCheckData
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionRaiLich);