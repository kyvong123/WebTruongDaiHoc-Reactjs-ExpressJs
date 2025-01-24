import React from 'react';
import { AdminModal, AdminPage, FormDatePicker, FormSelect, FormTextBox, renderDataTable, TableCell } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import FileBoxHidden from '../components/FileBoxHidden';
import { getLichSuUyQuyen, createUyQuyenThue } from './../redux';
const yearDatas = () => {
    return Array.from({ length: 15 }, (_, i) => {
        const nam = i + new Date().getFullYear() - 10;
        return { id: nam, text: `${nam}` };
    });
};
class TcUyQuyenModal extends AdminModal {

    componentDidMount() {
        this.disabledClickOutside();
    }
    onShow = ({ item }) => {
        if (!item) {
            this.hoVaTen?.value('');
            this.nam?.value('');
            this.cmnd?.value('');
            this.ngayCap?.value('');
            this.phieuDangKy?.reset();
            this.cmndMatTruoc?.reset();
            this.cmndMatSau?.reset();
        } else {
            this.setState({ item }, () => {
                this.hoVaTen?.value(item.hoVaTen);
                this.nam?.value(item.maSoThue);
                this.cmnd?.value(item.cmnd);
                this.ngayCap?.value(item.ngayCap);
            });
        }
    }
    onCreate = (data) => {
        if (!data.hoVaTen) {
            T.notify('Vui lòng điền họ và tên', 'danger');
            this.hoVaTen.focus();
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
            this.props.createUyQuyenThue(data, res => {
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
            nam: this.nam.value(),
            cmnd: this.cmnd.value(),
            ngayCap: this.ngayCap?.value()?.getTime() || null
        };
        this.onCreate(data);
    }

    render = () => {
        return this.renderModal({
            title: this.state.item ? 'Cập nhật phiếu đăng ký' : 'Tạo mới phiếu đăng ký',
            size: 'large',
            body: <>
                <div className='row'>
                    <FormTextBox ref={e => this.hoVaTen = e} className='col-md-6' placeholder='Họ và tên' label='Họ và tên'></FormTextBox>
                    <FormSelect ref={e => this.nam = e} className='col-md-6' placeholder='Năm' label='Năm' data={yearDatas()}></FormSelect>
                    <FormTextBox ref={e => this.cmnd = e} className='col-md-6' placeholder='CMND/CCCD' label='CMND/CCCD'></FormTextBox>
                    <FormDatePicker ref={e => this.ngayCap = e} className='col-md-6' placeholder='Ngày cấp' label='Ngày cấp'></FormDatePicker>
                    <div className='col-md-12 col-lg-12 mt-3'>
                        <div className='row' style={{ alignItems: 'center' }}>
                            <b className='col-md-4'>Phiếu đăng ký <a href='/api/cb/tncn/tai-bieu-mau/uyQuyen'>(Tải mẫu)</a></b>
                            <FileBoxHidden uploadType='TcUyQuyen' userData='TcUyQuyenToKhai' className='col-md-4' ref={e => this.phieuDangKy = e} label='Tải lên'></FileBoxHidden>
                        </div>
                    </div>
                    <div className='col-md-12 col-lg-12 mt-3'>
                        <div className='row' style={{ alignItems: 'center' }}>
                            <b className='col-md-4'>CMND/CCCD mặt trước</b>
                            <FileBoxHidden uploadType='TcUyQuyen' userData='TcUyQuyenCmndTruoc' className='col-md-4' ref={e => this.cmndMatTruoc = e} label='Tải lên'></FileBoxHidden>
                        </div>
                    </div>
                    <div className='col-md-12 col-lg-12 mt-3'>
                        <div className='row' style={{ alignItems: 'center' }}>
                            <b className='col-md-4'>CMND/CCCD mặt sau</b>
                            <FileBoxHidden uploadType='TcUyQuyen' userData='TcUyQuyenCmndSau' className='col-md-4' ref={e => this.cmndMatSau = e} label='Tải lên'></FileBoxHidden>
                        </div>
                    </div>
                </div>
            </>
        });
    }

}
export class TcUyQuyenPage extends AdminPage {
    componentDidMount() {
        this.getPage();
    }
    getPage = () => {
        this.props.getLichSuUyQuyen(res => {
            this.setState({ items: res.lichSuDangKy });
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
                    <th style={{ width: 'auto', textAlign: 'left', whiteSpace: 'nowrap' }}>Năm</th>
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
                    <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} type='number' content={<span>Phiếu số #{item.id}</span>} />
                    <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} type='text' content={item.hoVaTen} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} type='text' content={item.nam} />
                    <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} type='text' content={item.cmnd} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} type='text' content={T.dateToText(item.ngayCap, 'dd/mm/yyyy')} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} type='text' content={T.dateToText(item.ngayTao, 'HH:MM dd/mm/yyyy')} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} type='text' content={T.dateToText(item.ngayUpdate, 'HH:MM dd/mm/yyyy')} />
                    <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} type='text' content={item.lyDo} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} type='text' content={tinhTrang(item.lyDo)[item.trangThai]} />
                    <TableCell type='buttons' content={item} style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <Tooltip title='Tải minh chứng'>

                            <button className='btn btn-warning' onClick={(e) => {
                                e.preventDefault();
                                T.download(`/api/cb/tncn/uy-quyen/download/${item.id}`);
                            }}>
                                <i className='fa fa-download' />
                            </button>

                        </Tooltip>
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
                            disabled={this.state.items && this.state.items.some(item => item.trangThai == 'CHO_XAC_NHAN')}
                            onClick={(e) => {
                                e.preventDefault();
                                this.modal.show({});
                            }}
                        > Đăng ký mới</button>
                    </div>
                    {table}
                </div>
                <TcUyQuyenModal ref={e => this.modal = e}
                    createUyQuyenThue={this.props.createUyQuyenThue}
                    resetPage={() => this.getPage()}
                ></TcUyQuyenModal>
            </>,
        });
    }
}




const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getLichSuUyQuyen, createUyQuyenThue };
export default connect(mapStateToProps, mapActionsToProps)(TcUyQuyenPage);
