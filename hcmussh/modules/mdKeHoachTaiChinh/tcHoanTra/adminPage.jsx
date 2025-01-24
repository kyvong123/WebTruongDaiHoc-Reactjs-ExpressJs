import React from 'react';
import { connect } from 'react-redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, renderTable, TableCell, FormTextBox, FormSelect, FormDatePicker } from 'view/component/AdminPage';
import { getTcHoanTraPage, deleteTcHoanTra, updateTcHoanTra, createTcHoanTra, getSoDuHocPhi, xacNhanHoanTra, getDuLieuFwStudent, exportFileWord } from './redux';
import { getStudentHocPhi } from '../tcHocPhi/redux';
import { SelectAdapter_FwStudent } from 'modules/mdCongTacSinhVien/fwStudents/redux';
import { SelectAdapter_DmNganHang } from 'modules/mdDanhMuc/dmNganHang/redux';
import { Tooltip } from '@mui/material';
// import { Tooltip } from '@mui/material';

const yearDatas = () => {
    return Array.from({ length: 15 }, (_, i) => i + new Date().getFullYear() - 10);
};

const termDatas = [{ id: 1, text: 'HK1' }, { id: 2, text: 'HK2' }, { id: 3, text: 'HK3' }];

const lyDoHoanTra = ['Miễn giảm', 'Khác'];
class EditModal extends AdminModal {
    state = { isSubmitting: false }

    onChangeSoTienHoanTra = (soTien) => {
        if (soTien) {
            this.setAmountText(soTien, this.thanhChuHoanTra);
        }
    }

    onChangeSoTienDaDong = () => {
        const mssv = this.state.mssv ? this.state.mssv : this.mssv?.value();

        if (mssv) {
            this.props.getSoDuHocPhi(mssv, res => {
                if (!this.state.mssv) {
                    let name = this.mssv.data()?.text;
                    if (name) {
                        name = name.split(': ')[1];
                        this.chuTaiKhoan.value(name);
                    }
                }
                const soDuHocPhi = res?.soTien || 0;
                this.soDuHocPhi.value(soDuHocPhi);
                this.setAmountText(soDuHocPhi, this.thanhChuDaDong);
            });
            this.props.getDuLieuFwStudent(mssv, res => {
                this.stk.value(res.soTkNh || '');
                this.nganHang.value(res.tenNganHang || '');
            });
        }
        else {
            this.soDuHocPhi.value('');
        }
    }

    onChangeLyDo = () => {
        const lyDo = this.lyDo.value();
        this.setState({ lyDo });
    }

    setAmountText = (value, where) => {
        if (Number.isInteger(value)) {
            where?.value(T.numberToVnText(value.toString()) + ' đồng');
        }
    }

    onShow = (item) => {
        const { mssv, namHoc, hocKy, soTien, lyDo, ghiChu, soQuyetDinh, chuTaiKhoan, stk, nganHang, ngayRaQuyetDinh, tinhTrangHoanTra } = item ? item : { mssv: '', namHoc: '', hocKy: '', soTien: '', lyDo: '', ghiChu: '', soQuyetDinh: '', chuTaiKhoan: '', stk: '', nganHang: '', ngayRaQuyetDinh: '', tinhTrangHoanTra: 0 };
        this.setState({ mssv, namHoc, hocKy, soTien, lyDo, ghiChu, soQuyetDinh, chuTaiKhoan, stk, nganHang, ngayRaQuyetDinh, tinhTrangHoanTra }, () => {
            this.mssv.value(mssv);
            this.namHoc.value(namHoc);
            this.hocKy.value(hocKy);
            this.thanhChuDaDong.value('');
            this.onChangeSoTienDaDong();
            this.soTien.value(soTien);
            this.thanhChuHoanTra.value('');
            this.onChangeSoTienHoanTra(soTien);
            this.lyDo.value(lyDo);
            if (lyDo == 'Miễn giảm') {
                this.mucHoanTra.value(ghiChu);
            }
            else if (lyDo == 'Khác') {
                this.noiDungHoanTra.value(ghiChu);
            }
            else {
                this.mucHoanTra?.value('');
                this.noiDungHoanTra?.value('');
            }
            this.soQuyetDinh.value(soQuyetDinh);
            this.ngayRaQuyetDinh.value(ngayRaQuyetDinh);
            this.chuTaiKhoan.value(chuTaiKhoan);
            this.stk.value(stk);
            this.nganHang.value(nganHang);
            this.tinhTrangHoanTra.value(tinhTrangHoanTra);
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        const data = {
            mssv: this.mssv.value(),
            namHoc: this.namHoc.value(),
            hocKy: this.hocKy.value(),
            soTien: this.soTien.value(),
            lyDo: this.lyDo.value(),
            ghiChu: '',
            soQuyetDinh: this.soQuyetDinh.value(),
            ngayRaQuyetDinh: this.ngayRaQuyetDinh.value() ? this.ngayRaQuyetDinh.value().getTime() : '',
            chuTaiKhoan: this.chuTaiKhoan.value(),
            stk: this.stk.value(),
            nganHang: this.nganHang.value(),
            tinhTrangHoanTra: this.tinhTrangHoanTra.value()
        };

        if (this.state.lyDo == 'Miễn giảm') {
            data.ghiChu = this.mucHoanTra.value();
        }

        if (this.state.lyDo == 'Khác') {
            data.ghiChu = this.noiDungHoanTra.value();
        }

        if (!data.mssv) {
            T.notify('MSSV không được trống!', 'danger');
            this.mssv.focus();
        }
        else if (!data.namHoc) {
            T.notify('Năm học không được trống!', 'danger');
            this.namHoc.focus();
        }
        else if (!data.hocKy) {
            T.notify('Học kỳ không được trống!', 'danger');
            this.hocKy.focus();
        }
        else if (data.soTien == '') {
            T.notify('Số tiền không được trống!', 'danger');
            this.soTien.focus();
        }
        else if (data.lyDo == '') {
            T.notify('Lý do không được trống!', 'danger');
            this.lyDo.focus();
        }
        else if (data.soQuyetDinh == '') {
            T.notify('Số quyết định không được trống!', 'danger');
            this.soQuyetDinh.focus();
        }
        else if (data.ngayRaQuyetDinh == '') {
            T.notify('Ngày ra quyết định không được trống!', 'danger');
            this.ngayRaQuyetDinh.focus();
        }
        else if (data.chuTaiKhoan == '') {
            T.notify('Chủ tài khoản không được trống!', 'danger');
            this.stk.focus();
        }
        else if (data.stk == '') {
            T.notify('Số tài khoản không được trống!', 'danger');
            this.stk.focus();
        }
        else if (data.nganHang == '') {
            T.notify('Ngân hàng không được trống!', 'danger');
            this.nganHang.focus();
        }
        else {
            this.setState({ isSubmitting: true }, () => {
                if (this.state.mssv) {
                    this.props.update(
                        { mssv: data.mssv, namHoc: data.namHoc, hocKy: data.hocKy },
                        {
                            soTien: data.soTien,
                            lyDo: data.lyDo,
                            ghiChu: data.ghiChu,
                            soQuyetDinh: data.soQuyetDinh,
                            ngayRaQuyetDinh: data.ngayRaQuyetDinh,
                            chuTaiKhoan: data.chuTaiKhoan,
                            stk: data.stk,
                            nganHang: data.nganHang
                        }, res => {
                            this.setState({ isSubmitting: false }, () => {
                                if (!res?.error) this.hide();
                            });
                        });
                }
                else {
                    this.props.create(data, res => {
                        this.setState({ isSubmitting: false }, () => {
                            if (!res?.error) this.hide();
                        });
                    });
                }
            });
        }
    };

    render = () => {
        const readOnly = this.props.readOnly;

        return this.renderModal({
            title: 'Chỉnh sửa thông tin hoàn trả',
            isLoading: this.state.isSubmitting,
            size: 'large',
            body: <div className='row'>
                <FormSelect disabled={this.state.mssv || this.state.isSubmitting} type='text' data={SelectAdapter_FwStudent} className='col-md-6' ref={e => this.mssv = e} label='MSSV' placeholder='MSSV' readOnly={readOnly} required onChange={this.onChangeSoTienDaDong} />
                <FormSelect disabled={this.state.mssv || this.state.isSubmitting} type='text' data={yearDatas().reverse()} className='col-md-3' ref={e => this.namHoc = e} label='Năm học' placeholder='Năm học' readOnly={readOnly} required onChange={this.onChangeSoTienDaDong} />
                <FormSelect disabled={this.state.mssv || this.state.isSubmitting} type='text' data={termDatas} className='col-md-3' ref={e => this.hocKy = e} label='Học kỳ' placeholder='Học kỳ' readOnly={readOnly} required onChange={this.onChangeSoTienDaDong} />
                <FormTextBox disabled type='number' className='col-md-4' ref={e => this.soDuHocPhi = e} label='Số dư học phí (VNĐ)' placeholder='Số dư học phí' readOnly={readOnly} />
                <FormTextBox disabled label='Thành chữ' className='col-md-8' ref={e => this.thanhChuDaDong = e} readOnlyEmptyText='Chưa có dữ liệu đã trả' />
                <FormTextBox disabled={this.state.tinhTrangHoanTra == 1 || this.state.isSubmitting} type='number' className='col-md-4' ref={e => this.soTien = e} label='Số tiền hoàn trả (VNĐ)' placeholder='Số tiền hoàn trả' readOnly={readOnly} onChange={this.onChangeSoTienHoanTra} required />
                <FormTextBox disabled label='Thành chữ' className='col-md-8' ref={e => this.thanhChuHoanTra = e} readOnlyEmptyText='Chưa có dữ liệu hoàn trả' />
                <FormSelect disabled={this.state.tinhTrangHoanTra == 1 || this.state.isSubmitting} type='text' data={lyDoHoanTra} className='col-md-4' ref={e => this.lyDo = e} label='Lý do' placeholder='Lý do' readOnly={readOnly} required onChange={this.onChangeLyDo} />
                {this.state.lyDo == 'Miễn giảm' ?
                    <FormSelect disabled={this.state.tinhTrangHoanTra == 1 || this.state.isSubmitting} type='text' data={['50%', '70%', '100%']} className='col-md-8' ref={e => this.mucHoanTra = e} label='Mức hoàn trả' placeholder='Mức hoàn trả' readOnly={readOnly} required={this.state.lyDo == 'Miễn giảm'} onChange={this.onChangeLyDo} /> :
                    <FormTextBox disabled={this.state.lyDo != 'Khác' || this.state.tinhTrangHoanTra == 1 || this.state.isSubmitting} type='text' className='col-md-8' ref={e => this.noiDungHoanTra = e} label='Nội dung hoàn trả' placeholder='Nội dung hoàn trả' readOnly={readOnly} required={this.state.lyDo == 'Khác'} onChange={this.onChangeLyDo} />
                }
                <FormTextBox disabled={this.state.tinhTrangHoanTra == 1 || this.state.isSubmitting} type='text' className='col-md-6' ref={e => this.soQuyetDinh = e} label='Số quyết định' placeholder='Số quyết định' readOnly={readOnly} required />
                <FormDatePicker disabled={this.state.tinhTrangHoanTra == 1 || this.state.isSubmitting} type='text' className='col-md-6' ref={e => this.ngayRaQuyetDinh = e} label='Ngày ra quyết định' placeholder='Ngày ra quyết định' readOnly={readOnly} required />
                <FormTextBox disabled type='text' className='col-md-4' ref={e => this.chuTaiKhoan = e} label='Chủ tài khoản' placeholder='Chủ tài khoản' readOnly={readOnly} required />
                <FormTextBox disabled={this.state.tinhTrangHoanTra == 1 || this.state.isSubmitting} type='text' className='col-md-4' ref={e => this.stk = e} label='Số tài khoản' placeholder='Số tài khoản' readOnly={readOnly} required />
                <FormSelect disabled={this.state.tinhTrangHoanTra == 1 || this.state.isSubmitting} className='col-md-4' ref={e => this.nganHang = e} label='Tên ngân hàng' placeholder='Tên ngân hàng' data={SelectAdapter_DmNganHang} readOnly={readOnly} required />
                <FormSelect disabled type='text' className='col-md-12' data={[{ id: 0, text: 'Chưa hoàn trả tiền cho sinh viên' }, { id: 1, text: 'Đã hoàn trả tiền cho sinh viên' }]} ref={e => this.tinhTrangHoanTra = e} label='Tình trạng hoàn trả' placeholder='Tình trạng hoàn trả' readOnly={readOnly} required />
            </div>
        }
        );
    }
}
class tcHoanTraAdminPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/finance', () => {
            T.onSearch = (searchText) => this.props.getTcHoanTraPage(undefined, undefined, searchText || '');
            T.showSearchBox(true);
            this.props.getTcHoanTraPage(undefined, undefined, '');
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getTcHoanTraPage(pageN, pageS, pageC, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    xacNhanHoanTien = (item) => {
        T.confirm('Xác nhận hoàn trả', `Đồng ý xác nhận hoàn trả cho sinh viên ${item.mssv}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.xacNhanHoanTra({ mssv: item.mssv, namHoc: item.namHoc, hocKy: item.hocKy }, error => {
                if (!error) T.alert(`Xác nhận hoàn trả của sinh viên ${item.mssv} thành công!`, 'success', false, 800);
            });
        });
    }

    xuatDonXinRut = (e, item) => {
        this.props.exportFileWord(item, data => {
            T.FileSaver(new Blob([new Uint8Array(data.content.data)]), data.filename);
            T.notify('Tải đơn hoàn trả thành công', 'success');
        });
        e.preventDefault();
    }

    onDelete = (e, item) => {
        T.confirm('Xóa hoàn trả', `Bạn có chắc bạn muốn xóa hoàn trả của sinh viên ${item.mssv} này?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteTcHoanTra({ mssv: item.mssv, namHoc: item.namHoc, hocKy: item.hocKy }, error => {
                if (!error) T.alert(`Xoá hoàn trả của sinh viên ${item.mssv} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('tcHoanTra', ['read', 'write', 'delete', 'export']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tcHoanTra && this.props.tcHoanTra.page ?
            this.props.tcHoanTra.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };

        let table = renderTable({
            emptyTable: 'Không có dữ liệu danh sách hoàn trả',
            stickyHead: true,
            header: 'thead-light',
            getDataSource: () => list,
            renderHead: () => (<tr>
                <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Học kỳ</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>MSSV</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Họ và tên</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tiền (VNĐ)</th>
                <th style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }}>Lý do</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số quyết định</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Ngày ra quyết định</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Ngày hoàn trả</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
            </tr>),
            renderRow: (item, index) => (
                <tr style={{ background: item.tinhTrangHoanTra == 1 ? '#FEFFDC' : '' }} key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={`${item.namHoc} - HK${item.hocKy}`} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.mssv} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.hoVaTen} />
                    <TableCell type='number' style={{ textAlign: 'right', whiteSpace: 'nowrap' }} content={item.soTien} />
                    <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} content={item.lyDo == 'Khác' ? item.ghiChu : `${item.lyDo}: ${item.ghiChu}`} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.soQuyetDinh} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ngayRaQuyetDinh} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.thoiGianHoanTra} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={() => this.modal.show(item)} onDelete={this.onDelete}>
                        <Tooltip title='Xác nhận hoàn trả' arrow disableHoverListener={!!item.tinhTrangHoanTra}>
                            <span><button className='btn btn-success' disabled={item.tinhTrangHoanTra} onClick={e => e.preventDefault() || this.xacNhanHoanTien(item)}><i className='fa fa-lg fa-check-square-o' content={item} /></button></span>
                        </Tooltip>
                        <Tooltip title='Xuất đơn xin rút' arrow >
                            <button className='btn btn-warning' onClick={e => e.preventDefault() || this.xuatDonXinRut(e, item)}><i className='fa fa-lg fa-file-text' content={item} /></button>
                        </Tooltip>
                    </TableCell>

                </tr>
            )

        });


        return this.renderPage({
            icon: 'fa fa-money',
            title: 'Hoàn trả',
            breadcrumb: [
                'Hoàn trả'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} create={this.props.createTcHoanTra} update={this.props.updateTcHoanTra} getSoDuHocPhi={this.props.getSoDuHocPhi} getDuLieuFwStudent={this.props.getDuLieuFwStudent} readOnly={!permission.write} />
            </>,
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
            onExport: permission && permission.export ? () => T.handleDownload('/api/khtc/hoan-tra/download-excel') : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tcHoanTra: state.finance.tcHoanTra });
const mapActionsToProps = { getTcHoanTraPage, deleteTcHoanTra, updateTcHoanTra, createTcHoanTra, getStudentHocPhi, getSoDuHocPhi, xacNhanHoanTra, getDuLieuFwStudent, exportFileWord };
export default connect(mapStateToProps, mapActionsToProps)(tcHoanTraAdminPage);