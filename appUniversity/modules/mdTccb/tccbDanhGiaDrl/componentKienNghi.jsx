import React from 'react';
import { AdminModal, FormRichTextBox, getValue, renderDataTable, TableCell, FormTabs, FormDatePicker, FormCheckbox } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';
import GiaHanModal from './modal/giaHanModal';
import GiaHanSinhVienModal from './modal/giaHanSinhVienModal';

class TuChoiKienNghiModal extends AdminModal {
    onShow = (item) => {
        this.setState({ id: item.id, readOnly: !!item.lyDoTuChoi });
        this.lyDoTuChoi.value(item.lyDoTuChoi || '');
    }

    onSubmit = () => {
        const data = {
            id: this.state.id,
            lyDoTuChoi: getValue(this.lyDoTuChoi)
        };
        T.confirm('Xác nhận từ chối gia hạn cho sinh viên?', 'Phản hồi của bạn sẽ được gửi đến sinh viên', isConfirm => {
            if (isConfirm) {
                this.props.tuChoiGiaHan(data, this.hide);
            }
        });
    }

    render = () => {

        return this.renderModal({
            title: 'Lý do từ chối',
            body: <div>
                <FormRichTextBox ref={e => this.lyDoTuChoi = e} readOnly={this.state.readOnly} required />
            </div>
        });
    }
}
class GiaHanConfirmation extends AdminModal {
    onShow = (item) => {
        this.setState({ id: item.id, multiple: item.multiple, item });
    }

    onSubmit = () => {
        if (this.state.multiple) {
            this.props.moKhoaDanhGiaMultiple(+this.reset.value(), +this.notify.value(), this.hide);
        } else {
            this.props.moKhoaDanhGia && this.props.moKhoaDanhGia(this.state.item, +this.reset.value(), +this.notify.value(), this.hide);
        }
    }

    render = () => {

        return this.renderModal({
            // title: 'Gia hạn đánh giá điểm rèn luyện',
            // showCloseButton: false,
            center: true,
            body: <>
                <div className='swal-icon swal-icon--warning'>
                    <span className='swal-icon--warning__body'>
                        <span className='swal-icon--warning__dot'></span>
                    </span>
                </div>
                <h3 className='swal-title'> Xác nhận gia hạn đánh giá</h3>
                <div key={this.state.id ?? ''} className='row justify-content-center '>
                    <div className='col-md-5'>
                        <FormCheckbox ref={e => this.reset = e} label='Khởi tạo lại điểm sinh viên' value={1} />
                        <FormCheckbox ref={e => this.notify = e} label='Thông báo đến sinh viên' value={1} />
                    </div>
                </div>
            </>,
            submitText: 'Đồng ý',
        });
    }
}

class TccbComponentKienNghi extends React.Component {
    state = { items: [], editItem: null, tabIndex: 0, multipleMode: false, selectedGiaHan: {} }

    tinhTrangMapper = (maTinhTrang, text) => {
        switch (maTinhTrang) {
            case 1: return <span className='text-success'><i className='fa fa-check pr-2' />{text}</span>;
            default: return <span className='text-danger'><i className='fa fa-times pr-2' />{text}</span>;
        }
    }

    renderTabHeader = (tabIndex) => {
        const { multipleMode } = this.state;
        let canGiaHan = this.state.isKhoa && !this.state.isInDot;
        const tabHeader = {
            // Tab gia han moi
            0: [
                // Nut gia han
                canGiaHan && <button key={0} className='btn btn-warning'
                    disabled={!this.state.newly || !this.state.newly.length}
                    onClick={e => e.preventDefault() || this.createDrlGiaHan()}
                >Đăng ký gia hạn
                    <Tooltip title='Đăng ký gia hạn với danh sách sinh viên dưới'><span className='ml-1 badge badge-pill badge-dark'><i className='fa fa-info' style={{ marginRight: '0' }} /></span></Tooltip>
                </button>,
                // Thao tac nhieu
                !multipleMode ? <button key={1} className='btn btn-primary' type='button' onClick={() => this.setState({ multipleMode: true })}>Thao tác nhiều</button>
                    : <>
                        <FormDatePicker className='mb-0' placeholder='Ngày hết hạn' type='date-mask' ref={e => this.timeEnd = e} />
                        <button className='btn btn-success' ref={e => this.giaHanButton = e} type='button' onClick={() => this.confirmGiaHan.show({ multiple: true })}>Gia hạn</button>
                        <button className='btn btn-danger' type='button' onClick={() => this.setState({ multipleMode: false })}>Hủy</button>
                    </>
            ]
        };
        return tabHeader[tabIndex];
    }

    componentDidMount() {
        const permission = this.props.user && this.props.user.permissions ? this.props.user.permissions : [];
        const isKhoa = permission.includes('staff:drl-manage'),
            isCtsv = permission.includes('ctsvDotDanhGiaDrl:manage');
        this.setState({ isKhoa, isCtsv });
    }

    componentDidUpdate(prevProps) {
        if (this.props?.thongTinDot?.id != prevProps?.thongTinDot?.id || this.props.searchText != prevProps.searchText) {
            this.getData();
        }
    }

    // Lấy danh sách kiến nghị gia hạn từ sinh viên
    getData = () => {
        const thongTinDot = this.props.thongTinDot,
            searchText = this.props.searchText;
        if (thongTinDot) {
            this.props.getPendingGiaHan && this.props.getPendingGiaHan(thongTinDot.id, searchText, (data) => this.setState({ ...data }));
        } else {
            this.setState({ pending: [], reject: [], handled: [] });
        }
    }

    onTabChange = (tab) => {
        this.setState({ tabIndex: tab.tabIndex, editItem: null });
    }

    tuChoiGiaHan = (data, done) => {
        this.props.tuChoiGiaHan && this.props.tuChoiGiaHan(data, () => {
            this.getData();
            done && done();
        });
    }

    moKhoaDanhGia = (item, reset = 0, notify = 1, done) => {
        let timeEnd = this.timeEnd.value(),
            { id: idDot, timeEndFaculty } = this.props.thongTinDot || {},
            { id } = item;
        timeEnd && (timeEnd = timeEnd.setHours(23, 59, 59));
        if (!timeEnd) {
            T.notify('Thời gian hết hạn bị trống!', 'danger');
        } else if (timeEnd <= Date.now() && this.state.isCtsv || (this.state.isKhoa && timeEnd > timeEndFaculty)) {
            T.notify('Thời gian không hợp lệ!', 'danger');
        } else if (timeEnd == item.timeEnd) {
            T.notify('Thời gian không thay đổi!', 'warning');
            this.setState({ editItem: null });
        } else {
            this.props.chapNhanKienNghi({ id, idDot, timeEnd, reset, notify },
                () => {
                    this.setState({ editItem: null });
                    this.getData();
                    done && done();
                });
        }
    }


    moKhoaDanhGiaMultiple = (reset = 0, notify = 1, done) => {
        let id = Object.keys(this.state.selectedGiaHan ?? {}).filter(v => this.state.selectedGiaHan[v]);
        this.moKhoaDanhGia({ id }, reset, notify, () => this.setState({ selectedGiaHan: {}, multipleMode: false }, () => done && done()));
    }

    createDrlGiaHan = () => {
        const { namHoc, hocKy } = this.props;
        const newly = this.state.newly || [];
        this.giaHanModal.show({ namHoc, hocKy, thongTinDot: this.props.thongTinDot, dsSinhVien: newly });
    }

    componentNewly = () => {
        const { multipleMode, selectedGiaHan = {}, } = this.state;
        const canKienNghi = (
            this.state.isKhoa && this.state.isInDot || //Khoa duyet trong dot
            this.state.isCtsv //CTSV duyet ngoai dot
        );
        const list = this.state?.newly || [];

        return <div style={{ position: 'relative' }}>
            {/* <div className='d-flex justify-content-end' style={{ position: 'absolute', top: 'calc(-1.625rem - 20px)', right: 'calc(0.75rem + 2px)' }}>
                {canGiaHan && <button className='btn btn-warning'
                    disabled={!this.state.newly || !this.state.newly.length}
                    onClick={e => e.preventDefault() || this.createDrlGiaHan()}
                >Đăng ký gia hạn
                    <Tooltip title='Đăng ký gia hạn với danh sách sinh viên dưới'><span className='ml-1 badge badge-pill badge-dark'><i className='fa fa-info' style={{ marginRight: '0' }} /></span></Tooltip>
                </button>}
                {!multipleMode ? <button className='btn btn-primary' type='button' onClick={() => this.setState({ multipleMode: true })}>Thao tác nhiều</button>
                    : <>
                        <FormDatePicker className='mb-0' placeholder='Ngày hết hạn' type='date-mask' ref={e => this.timeEnd = e} />
                        <button className='btn btn-success' ref={e => this.giaHanButton = e} type='button' onClick={() => this.confirmGiaHan.show({ multiple: true })}>Gia hạn</button>
                        <button className='btn btn-danger' type='button' onClick={() => this.setState({ multipleMode: false })}>Hủy</button>
                    </>}
                {isCtsv && <button className='btn btn-warning' type='button' onClick={() => this.giaHanSinhVienModal.show()}>Thêm gia hạn</button>}
            </div> */}
            {renderDataTable({
                data: list,
                renderHead: () => <tr>
                    <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>#</th>
                    {multipleMode && <th></th>}
                    <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>MSSV</th>
                    <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Họ tên</th>
                    <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Lớp</th>
                    <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Hệ</th>
                    <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Khoa</th>
                    <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Tình trạng</th>
                    <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Ngày gửi</th>
                    <th style={{ whiteSpace: 'nowrap', width: '100%' }}>Lý do</th>
                    <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Cán bộ xử lý</th>
                    <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Thời gian xử lý</th>
                    <th style={{ whiteSpace: 'nowrap', width: '200px' }}>Ngày hết hạn</th>
                    {!multipleMode && <th style={{ whiteSpace: 'nowrap', width: '100%' }}>Thao tác</th>}
                </tr>,
                renderRow: (item, index) => <tr key={index}>
                    <td style={{ whiteSpace: 'nowrap' }}>{index + 1}</td>
                    {multipleMode && <TableCell style={{ whiteSpace: 'nowrap' }} content={<FormCheckbox onChange={value => this.setState({ selectedGiaHan: { ...selectedGiaHan, [item.id]: value }, })} />} />}
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.lop} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.heDaoTao} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={<>{this.tinhTrangMapper(item.maTinhTrang, item.tinhTrang)}</>} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy' content={item.timeSubmit} />
                    <TableCell style={{ whiteSpace: 'pre-wrap', maxWidth: '15rem' }} content={item.lyDoKienNghi} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.canBoXuLy} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy HH:MM:ss' content={item.thoiGianXuLy} />
                    {this.state.editItem == index ?
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={
                            <FormDatePicker className='mb-0' type='date-mask' ref={e => this.timeEnd = e} readOnly={this.state.editItem != index} />
                        } />
                        : <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy' content={item.timeEnd} />}
                    {!multipleMode && <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} type='buttons'>
                        {this.state.editItem != index ? <>
                            {/* Định ngày kết thúc đánh giá cho kiến nghị */}
                            {canKienNghi && <Tooltip title='Chấp nhận'><button type='button' className='btn btn-warning'
                                onClick={() => this.setState({ editItem: index }, () => this.timeEnd.value(item.timeEnd) || this.timeEnd.focus())}
                            ><i className='fa fa-check' /></button></Tooltip>}
                            <Tooltip title='Từ chối'><button type='button' className='btn btn-danger'
                                onClick={() => this.tuChoiModal.show(item)}><i className='fa fa-ban' /></button></Tooltip>
                        </> : <>
                            <Tooltip title='Hoàn thành'><button type='button' className='btn btn-success'
                                onClick={() => this.confirmGiaHan.show(item)}
                            ><i className='fa fa-check' /></button></Tooltip>
                            <Tooltip title='Hủy'><button type='button' className='btn btn-danger'
                                onClick={() => this.setState({ editItem: null })}
                            ><i className='fa fa-times' /></button></Tooltip>
                        </>}
                    </TableCell>}
                </tr>
            })}</div>;
    }

    componentPending = () => {
        const list = this.state?.pending || [];
        return <div style={{ position: 'relative' }}>
            {renderDataTable({
                data: list,
                renderHead: () => <tr>
                    <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>#</th>
                    <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Họ tên</th>
                    <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Lớp</th>
                    <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Hệ</th>
                    <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Khoa</th>
                    <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Tình trạng</th>
                    <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Ngày gửi</th>
                    <th style={{ whiteSpace: 'nowrap', width: '100%' }}>Lý do</th>
                    <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Cán bộ xử lý</th>
                    <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Thời gian xử lý</th>
                    <th style={{ whiteSpace: 'nowrap', width: '100%' }}>Thao tác</th>
                </tr>,
                renderRow: (item, index) => <tr key={index}>
                    <td style={{ whiteSpace: 'nowrap' }}>{index + 1}</td>
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.lop} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.heDaoTao} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={<>{this.tinhTrangMapper(item.maTinhTrang, item.tinhTrang)}</>} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy' content={item.timeSubmit} />
                    <TableCell style={{ whiteSpace: 'pre-wrap', maxWidth: '15rem' }} content={item.lyDoKienNghi} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.canBoXuLy} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy HH:MM:ss' content={item.thoiGianXuLy} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} type='buttons' />
                </tr>
            })}</div>;
    }

    componentHandled = () => {
        const canKienNghi = (
            this.state.isKhoa && this.state.isInDot || //Khoa duyet trong dot
            this.state.isCtsv //CTSV duyet ngoai dot
        );
        const list = this.state?.handled || [];
        return <div style={{ position: 'relative' }}>
            {renderDataTable({
                data: list,
                renderHead: () => <tr>
                    <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>#</th>
                    <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>MSSV</th>
                    <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Họ tên</th>
                    <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Lớp</th>
                    <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Hệ</th>
                    <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Khoa</th>
                    <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Tình trạng</th>
                    <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Ngày gửi</th>
                    <th style={{ whiteSpace: 'nowrap', width: '100%' }}>Lý do</th>
                    <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Cán bộ xử lý</th>
                    <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Thời gian xử lý</th>
                    <th style={{ whiteSpace: 'nowrap', width: '200px' }}>Ngày hết hạn</th>
                    <th style={{ whiteSpace: 'nowrap', width: '100%' }}>Thao tác</th>
                </tr>,
                renderRow: (item, index) => <tr key={index}>
                    <td style={{ whiteSpace: 'nowrap' }}>{index + 1}</td>
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.lop} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.heDaoTao} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={<>{this.tinhTrangMapper(item.maTinhTrang, item.tinhTrang)}</>} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy' content={item.timeSubmit} />
                    <TableCell style={{ whiteSpace: 'pre-wrap', maxWidth: '15rem' }} content={item.lyDoKienNghi} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.canBoXuLy} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy HH:MM:ss' content={item.thoiGianXuLy} />
                    {this.state.editItem == index ?
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={
                            <FormDatePicker className='mb-0' type='date-mask' ref={e => this.timeEnd = e} readOnly={this.state.editItem != index} value={item.timeEnd} />
                        } />
                        : <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy' content={item.timeEnd} />}
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} type='buttons'>
                        {this.state.editItem != index ? <>
                            {/* Định ngày kết thúc đánh giá cho kiến nghị */}
                            {canKienNghi && <Tooltip title='Chỉnh sửa'><button className='btn btn-primary'
                                onClick={e => e.preventDefault() || this.setState({ editItem: index })} //Vấn đề: Focus overwrite giá trị hiện tại
                            ><i className='fa fa-pencil' /></button></Tooltip>}
                            <Tooltip title='Từ chối'><button className='btn btn-danger'
                                onClick={e => e.preventDefault() || this.tuChoiModal.show(item)}><i className='fa fa-ban' /></button></Tooltip>
                        </> : <>
                            <Tooltip title='Hoàn thành'><button className='btn btn-success'
                                onClick={e => e.preventDefault() || this.confirmGiaHan.show(item)}
                            ><i className='fa fa-check' /></button></Tooltip>
                            <Tooltip title='Hủy'><button className='btn btn-danger'
                                onClick={e => e.preventDefault() || this.setState({ editItem: null })}
                            ><i className='fa fa-times' /></button></Tooltip>
                        </>}
                    </TableCell>
                </tr>
            })}</div>;
    }

    componentReject = () => {
        const list = this.state?.reject || [];
        return renderDataTable({
            data: list,
            renderHead: () => <tr>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>#</th>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>MSSV</th>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Họ tên</th>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Lớp</th>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Hệ</th>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Khoa</th>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Tình trạng</th>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Ngày gửi</th>
                <th style={{ whiteSpace: 'nowrap', width: '100%' }}>Lý do</th>
                <th style={{ whiteSpace: 'nowrap', width: '100%' }}>Cán bộ xử lý</th>
                <th style={{ whiteSpace: 'nowrap', width: '100%' }}>Thời gian xử lý</th>
                <th style={{ whiteSpace: 'nowrap', width: '100%' }}>Thao tác</th>
            </tr>,
            renderRow: (item, index) => <tr key={index}>
                <td style={{ whiteSpace: 'nowrap' }}>{index + 1}</td>
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.lop} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.heDaoTao} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={<>{this.tinhTrangMapper(item.maTinhTrang, item.tinhTrang)}</>} />
                <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy' content={item.timeSubmit} />
                <TableCell style={{ whiteSpace: 'pre-wrap', maxWidth: '15rem' }} content={item.lyDoKienNghi} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.canBoXyLy} />
                <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy HH:MM:ss' content={item.thoiGianXuLy} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} type='buttons'>
                    <Tooltip title='Xem lý do'><a href='#' className='btn btn-link text-danger'
                        onClick={e => e.preventDefault() || this.tuChoiModal.show(item)}><i className='fa fa-exclamation' /></a></Tooltip>
                </TableCell>
            </tr>
        });
    }

    render() {
        let { id: idDot } = this.props.thongTinDot || {};
        return <>
            <FormTabs
                ref={e => this.tabs = e}
                onChange={this.onTabChange}
                className='mt-3'
                header={<div className='d-flex justify-content-end' style={{ position: 'absolute', top: 'calc(-1.625rem - 20px)', right: 'calc(0.75rem + 2px)' }}>
                    {this.renderTabHeader(this.state.tabIndex)}
                    {this.state.isCtsv && <button className='btn btn-warning' type='button' onClick={() => this.giaHanSinhVienModal.show()}>Thêm gia hạn</button>}
                </div>}
                tabs={[
                    { title: <>Đăng ký mới {this.state.newly?.length ? <span className='badge badge-pill badge-info'>{this.state.newly.length}</span> : null}</>, component: this.state.tabIndex == 0 ? this.componentNewly() : null },
                    { title: <>Chưa duyệt {this.state.pending?.length ? <span className='badge badge-pill badge-info'>{this.state.pending.length}</span> : null}</>, component: this.state.tabIndex == 1 ? this.componentPending() : null },
                    { title: <>Đã duyệt {this.state.handled?.length ? <span className='badge badge-pill badge-info'>{this.state.handled.length}</span> : null}</>, component: this.state.tabIndex == 2 ? this.componentHandled() : null },
                    { title: 'Từ chối', component: this.state.tabIndex == 3 ? this.componentReject() : null },
                ]} />
            <GiaHanModal ref={e => this.giaHanModal = e} onSubmited={() => {
                this.getData();
                this.props.onSubmitGiaHan && this.props.onSubmitGiaHan();
            }} />
            <TuChoiKienNghiModal ref={e => this.tuChoiModal = e} tuChoiGiaHan={this.tuChoiGiaHan} />
            <GiaHanConfirmation ref={e => this.confirmGiaHan = e} moKhoaDanhGia={this.moKhoaDanhGia} moKhoaDanhGiaMultiple={this.moKhoaDanhGiaMultiple} />
            <GiaHanSinhVienModal ref={e => this.giaHanSinhVienModal = e} createDrlGiaHanSinhVien={this.props.createDrlGiaHanSinhVien} idDot={idDot} onSubmit={this.getData} />
        </>;
    }
}

export default TccbComponentKienNghi;