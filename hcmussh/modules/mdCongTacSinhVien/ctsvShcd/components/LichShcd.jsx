import React from 'react';
import { connect } from 'react-redux';
import { FormRichTextBox, FormTabs, TableCell, TableHead, renderTable, FormSelect, getValue, AdminModal, FormDatePicker, FormTextBox } from 'view/component/AdminPage';
import Calendar from 'view/component/Calendar';
import { updateShcdNoiDung, createShcdNoiDung, deleteShcdNoiDung, SelectAdapter_CtsvShcdNoiDung } from '../redux/shcdNoiDungRedux';
import { createShcdEvent, updateShcdEvent, deleteShcdEvent, getListNganhShcdEvent, updateShcdLichNganh, getShcdMeetLink, getShcdLichListSv } from '../redux/shcdLichRedux';
import { setShcdAssignRole, getShcdAssignRole, deleteShcdAssignRole, updateShcdAssignRole } from '../redux/shcdAssignRoleRedux';
import { getAllDtNganhCountStudent, SelectAdapter_DtNganhDaoTao } from 'modules/mdCongTacSinhVien/ctsvDtNganhDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DmPhong } from 'modules/mdDanhMuc/dmPhong/redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { SelectAdapter_FwStudent } from 'modules/mdCongTacSinhVien/fwStudents/redux';
// import { AdminSelect } from 'view/component/AdminSelect';
import { Tooltip } from '@mui/material';
import ShcdLichModal from '../modals/shcdLichModal';
import ShcdNoiDungModal from '../modals/shcdNoiDungModal';
import ShcdDanhSachDiemDanhModal from '../modals/shcdDanhSachDiemDanhModal';
import '../style.scss';

import { Html5QrcodeScanner } from 'html5-qrcode';
import T from 'view/js/common';


class DraggableEvent extends React.Component {
    componentDidMount() {
        this.enableDraggable();
    }
    componentDidUpdate() {
        this.enableDraggable();
    }

    enableDraggable() {
        $(this.el).data('event', {
            title: this.props.title, // use the element's text as the event title
            duration: this.props.duration,
            data: this.props.data,
            color: this.props.color,
            stick: true, // maintain when user navigates (see docs on the renderEvent method)
            create: true,
        });

        // make the event draggable using jQuery UI
        $(this.el).draggable({
            zIndex: 999,
            helper: 'clone',
            revert: true,      // will cause the event to go back to its
            revertDuration: 0,  //  original position after the drag
        });
    }

    delete = (id) => {
        T.confirm('Xác nhận xóa nội dung?', '<p class="text-danger"><b>LƯU Ý</b>: Các sự kiện với nội dung này sẽ bị xóa!</p>', isConfirm => {
            isConfirm && this.props.onDelete && this.props.onDelete(id);
        });
    };

    render() {
        const { title, color, duration, data } = this.props || {};
        return <div ref={e => this.el = e} className='fc-event' style={{ whiteSpace: 'nowrap', width: '100%', backgroundColor: color }} >
            <div className='d-flex justify-content-between align-items-baseline flex-nowrap'>
                <p className='w-100 text-truncate'><span><b>{title}</b></span>
                    <br /><span className='mt-1'><small><b>Thời lượng: </b>{duration / 3600000} giờ</small></span>
                    <br /><span className='mt-1'><small><b>Phòng: </b>{data?.phong}</small></span>
                    <br /><span className='mt-1'><small><b>Sức chứa: </b>{data?.sucChua}</small></span>
                    <br /><span className='mt-1'><small><b>Hệ đào tạo: </b><br /><ul className='list-unstyled pl-1'>
                        {data?.tenHeDaoTao.split(',').map((item, index) => item && <li key={index} className='text-truncate'>{item}</li>)}
                    </ul></small></span>
                </p>
                <div className='d-flex flex-column'>
                    <a className='btn btn-link' onClick={e => e.preventDefault() || this.props.onEdit && this.props.onEdit(this.props.data)}><i className='fa fa-pencil' /></a>
                    <a className='btn btn-link' onClick={e => e.preventDefault() || this.delete(data.id)}><i className='fa fa-trash' /></a>
                </div>
            </div>
        </div >;
    }
}

// ===============================================================================

class ScanModal extends AdminModal {
    onScanSuccess = (decodedText) => {
        if (this.props.permission.read) {
            //Quét mã của CTSV:
            this.props.setShcdDiemDanh({ mssv: decodedText, id: this.state.item.id, loaiDiemDanh: getValue(this.loaiDiemDanhQr) }, () => {
                this.setState({});
            });
        } else {
            //Quét mã của sinh viên:
            let { id, loaiDiemDanh } = JSON.parse(decodedText);
            if (id != this.state.item.lichId) {
                T.notify('Không phải mã QR của buổi SHCD này', 'danger');
            }
            else {
                this.props.setShcdDiemDanh({ id, mssv: this.props.user.mssv, loaiDiemDanh }, () => {
                    this.setState({}, () => { this.props.getData(); this.hide(); });
                });
            }
        }
    }

    onShow = (item = null) => {
        let html5QrcodeScanner = new Html5QrcodeScanner(
            'reader',
            {
                fps: 10,
                qrbox: { width: 200, height: 200 },
                // supportedScanTypes: [ Html5QrcodeScanType.SCAN_TYPE_CAMERA ],
            },
            false);
        this.setState({ html5QrcodeScanner, item }, () => { html5QrcodeScanner.render(this.onScanSuccess, () => { }); });
    }

    setSvDiemDanh = () => {
        const mssv = getValue(this.mssv);
        this.props.setShcdDiemDanh({ mssv, id: this.state.item.id, loaiDiemDanh: getValue(this.loaiDiemDanhInput) }, () => {
            this.setState({});
        });
    }


    renderScanner = () => {
        return <div className='tile'>
            <FormSelect ref={e => this.loaiDiemDanhQr = e} data={[
                { id: 'VAO', text: 'Điểm danh vào' },
                { id: 'RA', text: 'Điểm danh ra' },
            ]} value='VAO' onChange={() => this.setState({}, () => this.onShow(this.state.item))} />
            <div id='reader'></div>
        </div>;
    }

    renderInput = () => {
        return <div className='tile'>
            <FormSelect ref={e => this.loaiDiemDanhInput = e} data={[
                { id: 'VAO', text: 'Điểm danh vào' },
                { id: 'RA', text: 'Điểm danh ra' },
            ]} value='VAO' onChange={() => this.setState({}, () => this.onShow(this.state.item))} />
            <FormSelect ref={e => this.mssv = e}
                data={SelectAdapter_FwStudent}
                label='Mã số sinh viên'
            />
            <div style={{ textAlign: 'right' }}>
                <button type='button' className='btn btn-primary' onClick={e => e.preventDefault() || this.setSvDiemDanh()}>
                    Xác nhận
                </button>
            </div>
        </div>;
    }

    render = () => {
        return this.renderModal({
            title: 'Điểm danh',
            size: 'large',
            showCloseButton: false,
            body: <>
                {this.props.permission.read ?
                    <FormTabs
                        // onChange={() => { this.setState({}, () => this.calendar.gotoDate(Date.now())); }}
                        tabs={[
                            { title: 'Quét mã', component: this.renderScanner() },
                            { title: 'Nhập MSSV', component: this.renderInput() },
                        ]}
                    /> :
                    <div id='reader' className='tile'></div>
                }
            </>,
            buttons:
                <button type='button' className='btn btn-secondary' onClick={e => e.preventDefault() || this.hide()}>
                    <i className='fa fa-fw fa-lg fa-times' />Đóng
                </button>
        });
    }
}

//================================================================================

// begin: Modal tạo mới assignRole
class ShcdAssignRoleModal extends AdminModal {
    onShow = (item) => {
        const { id: shcdId, ten, timeStart, timeEnd } = this.props.shcd;
        const { id, nguoiDuocGan = '', ngayBatDau = '', ngayKetThuc = '' } = item || {};
        this.setState({ id, shcdId, nguoiDuocGan, ngayBatDau, ngayKetThuc }, () => {
            this.nguoiDuocGan.value(nguoiDuocGan);
            this.shcd.value(ten);
            this.ngayBatDau.value(ngayBatDau || timeStart);
            this.ngayKetThuc.value(ngayKetThuc || timeEnd);
        });
    }

    onSubmit = () => {
        let shcdId = this.state.shcdId,
            nguoiDuocGan = getValue(this.nguoiDuocGan),
            ngayBatDau = getValue(this.ngayBatDau).getTime(),
            ngayKetThuc = getValue(this.ngayKetThuc).getTime();
        this.state.id ? this.props.updateShcdAssignRole(shcdId, nguoiDuocGan, { ngayBatDau, ngayKetThuc }, () => { this.props.getData(); this.hide(); }) : this.props.setShcdAssignRole({ shcdId, nguoiDuocGan, ngayBatDau, ngayKetThuc }, () => this.props.getData());
    }

    render = () => {
        return this.renderModal({
            title: 'Phân quyền quản lý sinh hoạt công dân',
            size: 'large',
            body: <div className='row'>
                <FormTextBox ref={e => this.shcd = e} className='col-md-12' label='Đợt sinh hoạt công dân' readOnly />
                <FormSelect ref={e => this.nguoiDuocGan = e} className='col-md-12' label='Sinh viên hỗ trợ' data={SelectAdapter_FwStudent} required readOnly={this.state.id} />
                <FormDatePicker ref={e => this.ngayBatDau = e} className='col-md-6' label='Ngày bắt đầu' required />
                <FormDatePicker ref={e => this.ngayKetThuc = e} className='col-md-6' label='Ngày kết thúc' required />
            </div>
        });
    }
}
// end

class LichShcd extends React.Component {
    state = { listGuestFilted: [], editIndex: null }
    boardFilter = {}

    componentDidMount() {
        this.props.getData(data => {
            this.calendar.gotoDate(data.timeStart);
        });
    }

    renderListNoiDung = () => {
        const listNoiDung = this.props.ctsvShcd?.listNoiDung || [];
        return <>
            <div style={{ maxHeight: '70vh', overflow: 'hidden auto' }}>
                {listNoiDung.map((item, index) => <DraggableEvent key={index} title={item.ten} duration={item.thoiLuong}
                    data={item} color={item.color}
                    onEdit={() => this.noiDungModal.show({ ...item, nextColorIndex: listNoiDung.length })}
                    onDelete={(id) => this.props.deleteShcdNoiDung(id, this.props.getData)} />)}
            </div>
            <button className='btn btn-link w-100' onClick={e => e.preventDefault() || this.noiDungModal.show()}><i className='fa fa-plus' />Thêm</button>
            <ShcdNoiDungModal ref={e => this.noiDungModal = e} getData={this.props.getData} shcdId={this.props.ctsvShcd?.item?.id}
                create={this.props.createShcdNoiDung}
                update={this.props.updateShcdNoiDung} />
        </>;
    }

    onEventClick = (calEvent) => {
        const { item: { khoaSinhVien }, listGuest } = this.props.ctsvShcd || {};
        this.eventModal.show({
            ...calEvent.data, khoaSinhVien,
            listNganh: listGuest?.filter(item => item.lichId == calEvent.data.id)
        });
    }

    createEvent = (calEvent) => {
        this.calendar.removeEvents(calEvent.fcId);
        const data = {
            shcdId: this.props.ctsvShcd?.item?.id,
            noiDungId: calEvent.data.id,
            phong: calEvent.data.phong,
            timeStart: calEvent.start.getTime(),
            timeEnd: calEvent.end.getTime(),
        };
        this.props.createShcdEvent(data, () => this.props.getData());
    }

    updateEvent = (calEvent) => {
        calEvent.revert();
        const changes = {
            noiDungId: calEvent.data.noiDungId,
            phong: calEvent.data.phong,
            giangVien: calEvent.data.giangVien,
            timeStart: calEvent.start.getTime(),
            timeEnd: calEvent.end.getTime()
        };
        this.props.updateShcdEvent(calEvent.data.id, changes, () => this.props.getData());
    }

    renderCalendar = () => {
        const { listEvent = [], listGuest = [] } = this.props.ctsvShcd || {};
        return <>
            <div className='tile'>
                <div className='row'>
                    {this.props.permission.write ?
                        <div className='col-md-2'>
                            <p className='tile-title'>Các nội dung</p>
                            <div className='title-body'>{this.renderListNoiDung()}</div>
                        </div>
                        : <></>
                    }
                    <div className={this.props.permission.write ? 'col-md-10' : 'col-md-12'}>
                        <div className='d-flex justify-content-between align-items-baseline flex-nowrap'>
                            <p className='tile-title'>Lịch sinh hoạt công dân</p>
                        </div>
                        <div className='tile-body'>
                            <Calendar ref={e => this.calendar = e} data={listEvent} editable={this.props.permission.write} droppable={this.props.permission.delete} eventDurationEditable={false} hideAllDay timezone='local'
                                // onEventDragStart={this.onDragStart}
                                onEventClick={this.props.permission.read ? this.onEventClick : ''}
                                onEventReceive={this.props.permission.write ? this.createEvent : ''}
                                onEventDrop={this.props.permission.write ? this.updateEvent : ''} />

                        </div>
                    </div>
                </div>
            </div>
            {this.props.permission.read ?
                <ShcdLichModal ref={e => this.eventModal = e} listEvent={listEvent} listGuest={listGuest} getData={this.props.getData} setShcdDiemDanh={this.props.setShcdDiemDanh} scanModal={this.scanModal} permission={this.props.permission} />
                : <></>
            }
        </>;
    }

    onKeySearch = (key) => {
        const [name, value] = key.split(':');
        this.boardFilter[name] = value;
        this.filterListGuest();
    }

    filterListGuest = () => {
        const { listGuest = [] } = this.props.ctsvShcd || {},
            { ks_nganh, ks_heDaoTao, ks_phong, ks_giangVien, ks_noiDung } = this.boardFilter || {};
        const result = listGuest.filter(lichNganh => (
            (!ks_nganh || lichNganh.maNganh == ks_nganh)
            && (!ks_heDaoTao || lichNganh.heDaoTao == ks_heDaoTao)
            && (!ks_phong || lichNganh.phong == ks_phong)
            && (!ks_giangVien || lichNganh.giangVien == ks_giangVien)
            && (!ks_noiDung || lichNganh.noiDungId == ks_noiDung)
        ));
        this.setState({ listGuestFilted: result, editIndex: null });
    }

    saveGhiChu = (lichId, maNganh) => {
        T.confirm('Xác nhận lưu ghi chú?', '', isConfirm => {
            if (!isConfirm) return;
            this.props.updateShcdLichNganh(lichId, maNganh, { ghiChu: this.lichGhiChu?.value() }, this.props.getData);
            this.setState({ editIndex: null });
        });
    }

    renderDiemDanhSinhVien = (item) => {
        const danhSachDiemDanh = this.props.ctsvShcd?.danhSachDiemDanh;
        let thoiGianVao = danhSachDiemDanh?.[danhSachDiemDanh?.map(i => i.lichId).indexOf(item.lichId)].thoiGianVao,
            thoiGianRa = danhSachDiemDanh?.[danhSachDiemDanh?.map(i => i.lichId).indexOf(item.lichId)].thoiGianRa;
        return (thoiGianVao && thoiGianRa) ?
            <div className={'animated-checkbox'}>
                <label >
                    <input type='checkBox' checked={true} onClick={e => e.preventDefault()} />
                    <span className={'label-text text-primary'}>Đã điểm danh</span>
                </label>
            </div>
            : thoiGianVao ?
                <div className={'animated-checkbox'}>
                    <label >
                        <input type='checkBox' checked={false} onClick={e => e.preventDefault() || this.scanModal.show(item)} />
                        <span className={'label-text text-secondary'}>Điểm danh ra</span>
                    </label>
                </div>
                : <div className={'animated-checkbox'}>
                    <label >
                        <input type='checkBox' checked={false} onClick={e => e.preventDefault() || this.scanModal.show(item)} />
                        <span className={'label-text text-secondary'}>Điểm danh vào</span>
                    </label>
                </div>
            ;
    }

    renderBoard = () => {
        let { listGuestFilted, editIndex } = this.state || {};
        (listGuestFilted.length != 0) || (listGuestFilted = this.props.ctsvShcd?.listGuest || []);
        return <div className='tile'>
            <p className='tile-title'>Bảng kế hoạch sinh hoạt công dân</p>
            <div className='tile-body'>
                {renderTable({
                    getDataSource: () => [{}],
                    stickyHead: true, header: 'thead-light',
                    renderHead: () => {
                        return !this.props.permission.read ? <tr>
                            <th style={{ whiteSpace: 'nowrap' }}>#</th>
                            <th style={{ whiteSpace: 'nowrap', width: '40%', minWidth: '150px' }}>Hệ đào tạo</th>
                            <th style={{ whiteSpace: 'nowrap', minWidth: '150px' }}>Bắt đầu</th>
                            <th style={{ whiteSpace: 'nowrap', minWidth: '150px' }}>Kết thúc</th>
                            <th style={{ whiteSpace: 'nowrap', width: '20%' }}>Nội dung</th>
                            <th style={{ whiteSpace: 'nowrap' }}>Phòng</th>
                            <th style={{ whiteSpace: 'nowrap', width: '20%' }}>Giảng viên</th>
                            <th style={{ whiteSpace: 'nowrap', width: '20%', minWidth: '150px' }}>Điểm danh</th>
                        </tr> : <tr>
                            <th style={{ whiteSpace: 'nowrap' }}>#</th>
                            <TableHead style={{ whiteSpace: 'nowrap', width: '100%', minWidth: '150px' }} typeSearch='admin-select' data={SelectAdapter_DtNganhDaoTao} content='Ngành' keyCol='nganh' onKeySearch={this.onKeySearch} />
                            <th style={{ whiteSpace: 'nowrap' }}>Số lượng</th>
                            <TableHead style={{ whiteSpace: 'nowrap', minWidth: '150px' }} typeSearch='admin-select' data={SelectAdapter_DmSvLoaiHinhDaoTao} content='Hệ đào tạo' onKeySearch={this.onKeySearch} keyCol='heDaoTao' />
                            <th style={{ whiteSpace: 'nowrap' }}>Bắt đầu</th>
                            <th style={{ whiteSpace: 'nowrap' }}>Kết thúc</th>
                            <TableHead style={{ whiteSpace: 'nowrap', minWidth: '150px' }} typeSearch='admin-select' data={SelectAdapter_CtsvShcdNoiDung(this.props.ctsvShcd?.item?.id)} content='Nội dung' onKeySearch={this.onKeySearch} keyCol='noiDung' />
                            <TableHead style={{ whiteSpace: 'nowrap', minWidth: '150px' }} typeSearch='admin-select' data={SelectAdapter_DmPhong} content='Phòng' onKeySearch={this.onKeySearch} keyCol='phong' />
                            <TableHead style={{ whiteSpace: 'nowrap', minWidth: '200px' }} typeSearch='admin-select' data={SelectAdapter_FwCanBo} content='Giảng viên' onKeySearch={this.onKeySearch} keyCol='giangVien' />
                            <th style={{ minWidth: '250px' }}>Ghi chú</th>
                            <th style={{ whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>;
                    },
                    renderRow: <>
                        {!this.props.permission.read ?
                            listGuestFilted.map((item, index) => <tr key={index}>
                                <td>{index + 1}</td>
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenHeDaoTao} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy HH:MM' content={item.timeStart} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy HH:MM' content={item.timeEnd} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenNoiDung} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phong} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTenGiangVien} />
                                <TableCell content={this.renderDiemDanhSinhVien(item)} />
                            </tr>) :
                            listGuestFilted.map((item, index) => <tr key={index}>
                                <td>{index + 1}</td>
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenNganh} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.soLuong} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenHeDaoTao} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy HH:MM' content={item.timeStart} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy HH:MM' content={item.timeEnd} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenNoiDung} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phong} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTenGiangVien} />
                                {this.props.permission.write ?
                                    (editIndex == index ?
                                        <>
                                            <TableCell content={<FormRichTextBox ref={e => this.lichGhiChu = e} />} />
                                            <TableCell type='buttons' >
                                                <Tooltip title='Lưu' placement='left-start'><button type='button' className='btn btn-success' onClick={() => this.saveGhiChu(item.lichId, item.maNganh)}><i className='fa fa-check'></i></button></Tooltip>
                                                <Tooltip title='Hủy' placement='left-start'><button type='button' className='btn btn-danger' onClick={() => this.setState({ editIndex: null })}><i className='fa fa-times'></i></button></Tooltip>
                                            </TableCell>
                                        </> : <>
                                            <TableCell style={{ whiteSpace: 'pre-wrap' }} content={item.ghiChu} />
                                            <TableCell type='buttons' >
                                                <Tooltip title='Ghi chú' placement='left-start'><button type='button' className='btn btn-warning' onClick={() => this.setState({ editIndex: index }, () => this.lichGhiChu.value(item.ghiChu))}><i className='fa fa-sticky-note'></i></button></Tooltip>
                                                <Tooltip title='Danh sách điểm danh' placement='left-start'><button type='button' className='btn btn-primary' onClick={e => e.preventDefault() || this.diemDanhModal.show(item)}><i className='fa fa-list'></i></button></Tooltip>
                                            </TableCell>
                                        </>) :
                                    <>
                                        <TableCell style={{ whiteSpace: 'pre-wrap' }} content={item.ghiChu} />
                                        <TableCell type='buttons' >
                                            <Tooltip title='Danh sách điểm danh' placement='left-start'><button type='button' className='btn btn-primary' onClick={e => e.preventDefault() || this.diemDanhModal.show(item)}><i className='fa fa-list'></i></button></Tooltip>
                                        </TableCell>
                                    </>
                                }
                            </tr>)}
                    </>
                })}
            </div>
            <ShcdDanhSachDiemDanhModal ref={e => this.diemDanhModal = e} permission={this.props.permission} />
        </div>;
    }

    // begin: render assign role======
    deleteAssignRole = (item) => {
        T.confirm('Xóa phân quyền', 'Bạn có chắc bạn muốn xóa quyền của sinh viên này?', true,
            isConfirm => isConfirm && this.props.deleteShcdAssignRole(item, () => this.props.getData()));
    }

    renderAssignRole = () => {
        return <div className='tile'>
            <div className='row'>
                <div className='col-md-10'>
                    <h3 className='tile-title'>Danh sách phân quyền</h3>
                </div>
                <div style={{ textAlign: 'right' }} className='col-md-2'>
                    <button type='button' className='btn btn-primary' onClick={e => e.preventDefault() || this.ShcdAssignRoleModal.show()}>
                        <i className='fa fa-fw fa-lg fa-plus' />Tạo mới
                    </button>
                </div>
            </div>
            <div className='tile-body'>
                {renderTable({
                    getDataSource: () => this.props.ctsvShcd?.listAssignRole || [{}],
                    renderHead: () => <tr>
                        <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>#</th>
                        <th style={{ whiteSpace: 'nowrap', width: '30%' }}>Họ tên</th>
                        <th style={{ whiteSpace: 'nowrap' }}>Mssv</th>
                        <th style={{ whiteSpace: 'nowrap', width: '40%' }}>Đợt sinh hoạt công dân</th>
                        <th style={{ whiteSpace: 'nowrap', width: '15%' }}>Ngày bắt đầu</th>
                        <th style={{ whiteSpace: 'nowrap', width: '15%' }}>Ngày kết thúc</th>
                        <th style={{ whiteSpace: 'nowrap' }}>Thao tác</th>
                    </tr>,
                    renderRow: (item, index) => <tr key={index}>
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={index + 1} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ho + ' ' + item.ten} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.nguoiDuocGan} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={this.props.ctsvShcd?.item?.ten} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={T.dateToText(item.ngayBatDau, 'dd/mm/yyyy')} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={T.dateToText(item.ngayKetThuc, 'dd/mm/yyyy')} />
                        <TableCell type='buttons' permission={this.props.permission}
                            onEdit={() => this.ShcdAssignRoleModal.show(item)}
                            onDelete={() => this.deleteAssignRole(item)} />
                    </tr>
                })}
            </div>
            <ShcdAssignRoleModal ref={e => this.ShcdAssignRoleModal = e} setShcdAssignRole={this.props.setShcdAssignRole} getData={this.props.getData} updateShcdAssignRole={this.props.updateShcdAssignRole} shcd={this.props.ctsvShcd?.item} />
        </div>;
    }


    // end============================

    render() {
        return <>{this.props.permission.read ?
            <div className='row'>
                <div className='col-md-12'>
                    <FormTabs
                        // onChange={() => { this.setState({}, () => this.calendar.gotoDate(Date.now())); }}
                        tabs={[
                            { title: 'Lịch', component: this.renderCalendar() },
                            { title: 'Bảng', component: this.renderBoard() },
                            this.props.permission.write ? { title: 'Cấp quyền', component: this.renderAssignRole() } : ''
                        ]}
                    />
                </div>
            </div> :
            <div className='row'>
                <div className='col-md-12'>
                    <FormTabs
                        // onChange={() => { this.setState({}, () => this.calendar.gotoDate(Date.now())); }}
                        tabs={[
                            { title: 'Bảng', component: this.renderBoard() },
                            { title: 'Lịch', component: this.renderCalendar() }
                        ]}
                    />
                </div>
            </div>}
            <ScanModal ref={e => this.scanModal = e} setShcdDiemDanh={this.props.setShcdDiemDanh} item={this.state.item} user={this.props.system.user} getData={this.props.getData} permission={this.props.permission} />
        </>;
    }
}

const mapStateToProps = (state) => ({ system: state.system, ctsvShcd: state.ctsv.ctsvShcd || state.student.svShcd });
const mapActionsToProps = {
    updateShcdNoiDung, createShcdNoiDung, deleteShcdNoiDung, createShcdEvent, updateShcdEvent, deleteShcdEvent,
    getAllDtNganhCountStudent, getListNganhShcdEvent, updateShcdLichNganh, getShcdMeetLink, getShcdLichListSv,
    setShcdAssignRole, getShcdAssignRole, deleteShcdAssignRole, updateShcdAssignRole
};

export default connect(mapStateToProps, mapActionsToProps)(LichShcd);