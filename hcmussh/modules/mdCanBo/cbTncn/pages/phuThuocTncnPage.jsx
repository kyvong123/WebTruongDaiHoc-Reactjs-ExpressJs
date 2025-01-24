import React from 'react';
import { AdminModal, AdminPage, FormDatePicker, FormTextBox, renderDataTable, TableCell } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import FileBoxHidden from '../components/FileBoxHidden';
import { createPhieuPhuThuoc, getLichSuDangKyPhuThuoc, updatePhieuPhuThuoc } from './../redux';

class TcDangKyPhuThuocModal extends AdminModal {
    componentDidMount() {
        this.disabledClickOutside();
    }
    onShow = ({ item }) => {
        if (!item) {
            this.hoVaTen?.value('');
            this.maSoThue?.value('');
            this.cmnd?.value('');
            this.ngayCap?.value('');
            this.phieuDangKy?.reset();
            this.cmndMatTruoc?.reset();
            this.cmndMatSau?.reset();
        } else {
            this.setState({ item }, () => {
                this.hoVaTen?.value(item.hoVaTen);
                this.maSoThue?.value(item.maSoThue);
                this.cmnd?.value(item.cmnd);
                this.ngayCap?.value(item.ngayCap);
            });
        }
    }
    onCreate = (data) => {
        if (!data.hoVaTen) {
            T.notify('Vui lòng điền họ và tên', 'danger');
            this.hoVaTen.focus();
        } else if (!data.maSoThue) {
            T.notify('Vui lòng điền mã số thuế', 'danger');
            this.maSoThue.focus();
        } else if (!data.cmnd) {
            T.notify('Vui lòng điền cmnd', 'danger');
            this.cmnd.focus();
        } else if (!data.ngayCap) {
            T.notify('Vui lòng điền ngày cấp cmnd', 'danger');
            this.ngayCap.focus();
        } else if (this.cmndMatTruoc && !this.cmndMatTruoc.isValid()) {
            T.notify('Vui lòng tải lên cccd/cmnd mặt trước!', 'danger');
        } else if (this.cmndMatSau && !this.cmndMatSau.isValid()) {
            T.notify('Vui lòng tải lên cccd/cmnd mặt sau!', 'danger');
        } else if (this.phieuDangKy && !this.phieuDangKy.isValid()) {
            T.notify('Vui lòng tải lên phiếu đăng ký!', 'danger');
        }
        else {
            this.props.createPhieuPhuThuoc(data, res => {
                // TODO create upload
                this.cmndMatTruoc.isValid() && this.cmndMatTruoc.onUploadFile(res);
                this.cmndMatSau.isValid() && this.cmndMatSau.onUploadFile(res);
                this.phieuDangKy.isValid() && this.phieuDangKy.onUploadFile(res);
                this.props.resetPage();
                this.hide();
            });
        }
    }
    onUpdate = (data) => {
        if (!data.hoVaTen) {
            T.notify('Vui lòng điền họ và tên', 'danger');
            this.hoVaTen.focus();
        } else if (!data.maSoThue) {
            T.notify('Vui lòng điền mã số thuế', 'danger');
            this.maSoThue.focus();
        } else if (!data.cmnd) {
            T.notify('Vui lòng điền cmnd', 'danger');
            this.cmnd.focus();
        } else if (!data.ngayCap) {
            T.notify('Vui lòng điền ngày cấp cmnd', 'danger');
            this.ngayCap.focus();
        }
        else {
            this.props.updatePhieuPhuThuoc(this.state.item.id, data, res => {
                this.cmndMatTruoc.isValid() && this.cmndMatTruoc.onUploadFile(res);
                this.cmndMatSau.isValid() && this.cmndMatSau.onUploadFile(res);
                this.phieuDangKy.isValid() && this.phieuDangKy.onUploadFile(res);
                this.props.resetPage();
                this.hide();
            });
        }
    }
    onSubmit = () => {
        const data = {
            hoVaTen: this.hoVaTen.value(),
            maSoThue: this.maSoThue.value(),
            cmnd: this.cmnd.value(),
            ngayCap: this.ngayCap?.value()?.getTime() || null
        };
        if (!this.state.item) {
            this.onCreate(data);
        } else {
            this.onUpdate(data);
        }
    }

    render = () => {
        return this.renderModal({
            title: this.state.item ? 'Cập nhật phiếu đăng ký' : 'Tạo mới phiếu đăng ký',
            size: 'large',
            body: <>
                <div className='row'>
                    <FormTextBox ref={e => this.hoVaTen = e} className='col-md-6' placeholder='Họ và tên' label='Họ và tên'></FormTextBox>
                    <FormTextBox ref={e => this.maSoThue = e} className='col-md-6' placeholder='Mã số thuế' label='Mã số thuế'></FormTextBox>
                    <FormTextBox ref={e => this.cmnd = e} className='col-md-6' placeholder='CMND/CCCD' label='CMND/CCCD'></FormTextBox>
                    <FormDatePicker ref={e => this.ngayCap = e} className='col-md-6' placeholder='Ngày cấp' label='Ngày cấp'></FormDatePicker>
                    <div className='col-md-12 col-lg-12 mt-3'>
                        <div className='row' style={{ alignItems: 'center' }}>
                            <b className='col-md-4'>Phiếu đăng ký <a href='/api/cb/tncn/tai-bieu-mau/phuThuoc'>(Tải mẫu)</a></b>
                            <FileBoxHidden uploadType='TcDangKyPhuThuoc' userData='ToKhai' className='col-md-4' ref={e => this.phieuDangKy = e} label='Tải lên'></FileBoxHidden>
                        </div>
                    </div>
                    <div className='col-md-12 col-lg-12 mt-3'>
                        <div className='row' style={{ alignItems: 'center' }}>
                            <b className='col-md-4'>CCCD/CMND mặt trước</b>
                            <FileBoxHidden uploadType='TcDangKyPhuThuoc' userData='CmndMatTruoc' className='col-md-4' ref={e => this.cmndMatTruoc = e} label='Tải lên'></FileBoxHidden>
                        </div>
                    </div>
                    <div className='col-md-12 col-lg-12 mt-3'>
                        <div className='row' style={{ alignItems: 'center' }}>
                            <b className='col-md-4'>CCCD/CMND mặt sau</b>
                            <FileBoxHidden uploadType='TcDangKyPhuThuoc' userData='CmndMatSau' className='col-md-4' ref={e => this.cmndMatSau = e} label='Tải lên'></FileBoxHidden>
                        </div>
                    </div>
                </div>
            </>
        });
    }

}
export class TcThuePhuThuoc extends AdminPage {
    componentDidMount() {
        this.getPage();
    }
    getPage = () => {
        this.props.getLichSuDangKyPhuThuoc(res => {
            this.setState({ items: res.items });
        });
    }
    sendConfirm = (id) => {
        T.confirm('Gửi phiếu đăng ký', 'Thao tác này không thể hoàn tác! Bạn có chắc chắn muốn gửi phiếu đăng ký', true,
            isConfirm => isConfirm && this.props.updatePhieuPhuThuoc(id, { trangThai: 'CHO_XAC_NHAN' }, () => {
                this.getPage();
            }));
    }
    render() {
        const tinhTrang = (lyDo) => ({
            'BAN_NHAP': <span className='badge badge-pill badge-secondary p-1' style={{ width: '80px' }}>Bản nháp</span>,
            'CHO_XAC_NHAN': <span className='badge badge-pill badge-info p-1' style={{ width: '80px' }}>Chờ xác nhận</span>,
            'HUY': <Tooltip title={`Lý do: ${lyDo || ''}`} arrow>
                <span className='badge badge-pill badge-danger p-1' style={{ width: '80px' }}>Hủy</span>
            </Tooltip>,
            'TIEP_NHAN': <span className='badge badge-pill badge-warning p-1' style={{ width: '80px' }}>Tiếp nhận</span>,
            'HOAN_TAT': <span className='badge badge-pill badge-success p-1' style={{ width: '80px' }}>Hoàn tất</span>
        });
        const table = renderDataTable({
            data: this.state.items || [],
            stickyHead: true,
            divStyle: { height: '75vh' },
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'left', whiteSpace: 'nowrap' }}>#</th>
                    <th style={{ width: '50%', textAlign: 'left', whiteSpace: 'nowrap' }}>Người tạo</th>
                    <th style={{ width: 'auto', textAlign: 'left', whiteSpace: 'nowrap' }}>CMND/CCCD</th>
                    <th style={{ width: 'auto', textAlign: 'left', whiteSpace: 'nowrap' }}>Ngày cấp</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Ngày tạo</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Ngày cập nhật</th>
                    <th style={{ width: '50%', textAlign: 'center', whiteSpace: 'nowrap' }}>Lý do</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Tình trạng</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} type='number' content={<span><a href={`/user/tncn/phu-thuoc/${item.id}`}>Phiếu số #{item.id}</a></span>} />
                    <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} type='text' content={item.hoVaTen} />
                    <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} type='text' content={item.cmnd} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} type='text' content={T.dateToText(item.ngayCap, 'dd/mm/yy')} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} type='text' content={T.dateToText(item.ngayTao, 'HH:MM dd/mm/yy')} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} type='text' content={T.dateToText(item.ngayUpdate, 'HH:MM dd/mm/yy')} />
                    <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} type='text' content={item.lyDo} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} type='text' content={tinhTrang(item.lyDo)[item.trangThai]} />
                    <TableCell type='buttons' content={item} style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <Tooltip title='Tải minh chứng' arrow disableHoverListener={!item.pathFolder}>

                            <button className='btn btn-warning' disabled={!item.pathFolder} onClick={(e) => {
                                e.preventDefault();
                                T.download(`/api/cb/tncn/phu-thuoc/download/${item.id}`);
                            }}>
                                <i className='fa fa-download' />
                            </button>

                        </Tooltip>
                        {item.trangThai == 'BAN_NHAP' && <Tooltip title='Chỉnh sửa' arrow>
                            <button className='btn btn-primary' onClick={(e) => {
                                e.preventDefault();
                                this.modal.show({ item });
                            }} >
                                <i className='fa fa-pencil-square-o' />
                            </button>
                        </Tooltip>}
                        {item.trangThai == 'BAN_NHAP' && <Tooltip title='Gửi' arrow disableHoverListener={!item.pathFolder}>
                            <button className='btn btn-success' onClick={(e) => {
                                e.preventDefault();
                                this.sendConfirm(item.id);
                            }}>
                                <i className='fa fa-paper-plane' />
                            </button>
                        </Tooltip>}
                    </TableCell>
                </tr >),
        });
        return this.renderPage({
            title: 'Kê khai thông tin người phụ thuộc',
            icon: 'fa fa-id-card-o',
            breadcrumb: [
                <Link key={0} to='/user'>Trang cá nhân</Link>,
                <Link key={1} to='/user/tncn'>Thu nhập cá nhân</Link>,
                'Kê khai thông tin người phụ thuộc'],
            content: <>

                <div className='tile'>
                    <div className='d-flex justify-content-end my-2'>
                        <button className='btn btn-outline-primary' style={{ width: '100%', maxWidth: '200px' }}
                            disabled={this.state.items && this.state.items.some(item => item.trangThai == 'BAN_NHAP')}
                            onClick={e => e.preventDefault() || this.modal.show({
                                title: 'Kê khai mã số thuế',
                                typeKeKhai: 3
                            })}> Đăng ký mới</button>
                    </div>
                    {table}
                </div>
                <TcDangKyPhuThuocModal ref={e => this.modal = e}
                    createPhieuPhuThuoc={this.props.createPhieuPhuThuoc}
                    updatePhieuPhuThuoc={this.props.updatePhieuPhuThuoc}
                    resetPage={() => this.getPage()}
                ></TcDangKyPhuThuocModal>
            </>,
        });
    }
}




const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { createPhieuPhuThuoc, getLichSuDangKyPhuThuoc, updatePhieuPhuThuoc };
export default connect(mapStateToProps, mapActionsToProps)(TcThuePhuThuoc);
