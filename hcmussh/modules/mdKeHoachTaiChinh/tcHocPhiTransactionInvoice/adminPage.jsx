import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, FormDatePicker, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import T from 'view/js/common';
import { getInvoicePage, sendInvoiceMail, cancelInvoice, addInvoice, checkStatusInvoice } from './redux';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DtNganhDaoTao } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
import { Tooltip } from '@mui/material';
import { SelectAdapter_FwStudent } from 'modules/mdCongTacSinhVien/fwStudents/redux';

const yearDatas = () => Array.from({ length: 15 }, (_, i) => i + new Date().getFullYear() - 10);

const termDatas = [{ id: 1, text: 'HK1' }, { id: 2, text: 'HK2' }, { id: 3, text: 'HK3' }];

const trangThaiHoaDon = [
    { id: 0, trangThai: 'CHO_CAP_MA', text: 'Chờ cấp mã' },
    { id: 1, trangThai: 'GUI_LOI', text: 'Gửi lỗi' },
    { id: 2, trangThai: 'DA_CAP_MA', text: 'Đã cấp mã' },
    { id: 3, trangThai: 'TU_CHOI_CAP_MA', text: 'Từ chối cấp mã' },
    { id: 4, trangThai: 'GUI_LOI_4', text: 'Gửi lỗi (4)' },
    { id: 5, trangThai: 'INVOICE_NOT_EXIST', text: 'Hóa đơn không tồn tại' },
    { id: 6, trangThai: 'CANCELED', text: 'Đã hủy' },
    { id: 7, trangThai: 'UNKNOWN', text: 'Không xác định' },
];

const SelectAdapter_TrangThaiHoaDon = trangThaiHoaDon.map(item => ({ id: item.trangThai, text: item.text }));
const trangThaiHoaDonDict = trangThaiHoaDon.reduce((total, cur) => ({ ...total, [cur.trangThai]: cur }), {});

class CancelModal extends AdminModal {
    state = { isLoading: false, id: null }

    onShow = (id) => {
        this.setState({ isLoading: false, id });
        this.lyDoHuy.value('');
    }

    onSubmit = () => {
        const lyDo = this.lyDoHuy.value();
        if (!lyDo) {
            T.notify('Vui lòng nhập lý do hủy hóa đơn', 'danger');
            this.lyDoHuy.focus();
        } else {
            this.setState({ isLoading: true }, () => {
                this.props.cancel(this.state.id, lyDo, () => {
                    this.hide();
                });
            }, () => this.setState({ isLoading: false }));
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Hủy hóa đơn',
            size: 'large',
            body: <div className='rows'>
                <FormTextBox className='col-md-12' label='Lý do hủy' required ref={e => this.lyDoHuy = e} />
            </div>,
            isLoading: this.state.isLoading,
        });
    }
}
class EditModal extends AdminModal {
    onSubmit = () => {
        const data = {
            refId: this.refId.value(),
            namHoc: this.namHoc.value(),
            hocKy: this.hocKy.value(),
            mssv: this.mssv.value(),
            invoiceTransactionId: this.invoiceTransId.value(),
            invoiceNumber: this.invoiceNumber.value(),
            ngayPhatHanh: Number(this.ngayPhatHanh.value().getTime()),
            transId: this.transId.value(),
            meinvoiceMauHoaDon: this.meinvoiceMauHoaDon.value()
        };
        if (!data.namHoc) {
            T.notify('Vui lòng chọn năm học', 'danger');
        }
        else if (!data.hocKy) {
            T.notify('Vui lòng chọn học kỳ', 'danger');
        }
        else if (!data.mssv) {
            T.notify('Vui lòng chọn sinh viên', 'danger');
        }
        else if (!data.refId) {
            T.notify('Vui lòng nhập RefId', 'danger');
        }
        else if (!data.invoiceTransactionId) {
            T.notify('Vui lòng nhập mã giao dịch hóa đơn', 'danger');
        }
        else if (!data.invoiceNumber) {
            T.notify('Vui lòng nhập số hóa đơn', 'danger');
        }
        else if (!data.ngayPhatHanh) {
            T.notify('Vui lòng chọn ngày phát hành', 'danger');
        }
        else if (!data.meinvoiceMauHoaDon) {
            T.notify('Vui lòng chọn mẫu hóa đơn', 'danger');
        }
        else {
            // console.log(this.mssv);
            T.confirm('Thêm hóa đơn', `Bạn chắc chắn muốn tạo hóa đơn cho sinh viên ${this.mssv.value()}?`, true, isConfirm =>
                isConfirm && this.props.addInvoice(data, () => this.hide()));
        }

    }
    render = () => {
        return this.renderModal({
            title: 'Thêm hóa đơn',
            size: 'large',
            submitText: 'Tạo hóa đơn',
            body: <div className="row">
                <FormSelect ref={e => this.namHoc = e} className='col-md-4' label='Năm học' placeholder='Năm học' data={yearDatas()} />
                <FormSelect ref={e => this.hocKy = e} className='col-md-4' label='Học kỳ' placeholder='Học kỳ' data={termDatas} />
                <FormSelect ref={e => this.mssv = e} className='col-md-4' label='Sinh viên' data={SelectAdapter_FwStudent} />
                <FormTextBox ref={e => this.refId = e} className='col-md-6' label='REF ID' />
                <FormTextBox ref={e => this.invoiceTransId = e} className='col-md-6' label='Mã giao dịch của hóa đơn' />
                <FormTextBox ref={e => this.invoiceNumber = e} className='col-md-6' label='Số hóa đơn' />
                <FormDatePicker ref={e => this.ngayPhatHanh = e} className='col-md-6' label='Ngày phát hành hóa đơn' />
                <FormSelect className='col-md-4' ref={e => this.meinvoiceMauHoaDon = e} label='Mẫu hóa đơn' data={['2C22TCH', '2C22TDH', '2C23TCH', '2C23TDH']} />
                <FormTextBox ref={e => this.transId = e} className='col-md-8' label='Mã giao dịch trên hệ thống' required />
            </div>
        });
    }
}

class DanhSachHoaDon extends AdminPage {
    state = { filter: {} }

    componentDidMount() {
        T.ready('/user/finance', () => {
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '', page => this.setFilter(page));
            T.showSearchBox(true);
        });
        this.changeAdvancedSearch(true);
    }

    setFilter = (page, isInitial = false) => {
        const { settings: { namHoc, hocKy } } = page;
        if (isInitial) {
            this.year.value(namHoc);
            this.term.value(hocKy);
        } else {
            this.year.value(namHoc);
            this.term.value(hocKy);
        }
    }

    changeAdvancedSearch = (isInitial = false, isReset = false) => {
        let { pageNumber, pageSize, pageCondition } = this.props && this.props.tcGiaoDich && this.props.tcGiaoDich.page ? this.props.tcGiaoDich.page : { pageNumber: 1, pageSize: 50, pageCondition: '' };
        if (pageCondition && (typeof pageCondition == 'string')) {
            T.setTextSearchBox(pageCondition);
        }
        let
            namHoc = this.year.value(),
            hocKy = this.term.value(),
            listBacDaoTao = this.bacDaoTao.value().toString(),
            listLoaiHinhDaoTao = this.loaiHinhDaoTao.value().toString(),
            listNganh = this.nganh.value().toString(),
            listKhoa = this.khoa.value().toString(),
            nganHang = this.nganHang?.value().toString(),
            trangThai = this.trangThai?.value()
            ;

        const pageFilter = (isInitial || isReset) ? { namHoc, hocKy } : { namHoc, hocKy, listBacDaoTao, listLoaiHinhDaoTao, listNganh, listKhoa, nganHang, trangThai };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, pageCondition, (page) => {
                this.setFilter(page, isInitial);
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getInvoicePage(pageN, pageS, pageC, this.state.filter, done);
    }

    onClearSearch = (e) => {
        e.preventDefault();
        ['tuNgay', 'denNgay', 'bacDaoTao', 'loaiHinhDaoTao', 'khoa', 'nganh', 'nganHang', 'trangThai'].forEach(key => this[key]?.value(''));
        this.changeAdvancedSearch();
    }

    onSendMail = (e, item) => {
        e.preventDefault();
        T.confirm('Gửi email hóa đơn', `Gửi email hóa đơn tới sinh viên ${`${item.ho} ${item.ten}`.normalizedName().trim()}`, true, isConfirm => isConfirm && this.props.sendInvoiceMail(item.id));
    }

    onCancelInvoicie = (e, item) => {
        e.preventDefault();
        this.cancelModal.show(item.id);
    }

    onCheckStatusInvoice = () => {
        this.props.checkStatusInvoice();
    }

    render() {
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tcInvoice && this.props.tcInvoice.page ? this.props.tcInvoice.page : {
            pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null
        };
        const permission = this.getUserPermission('tcInvoice', ['read', 'export', 'write']);
        let buttons = [];

        permission.write && buttons.push({ className: 'btn-warning', icon: 'fa-check', tooltip: 'Kiểm tra tình trạng hóa đơn', onClick: () => this.onCheckStatusInvoice() });

        let table = renderTable({
            getDataSource: () => list,
            stickyHead: true,
            header: 'thead-light',
            emptyTable: 'Chưa có dữ liệu giao dịch học kỳ hiện tại',
            renderHead: () => (<tr>
                <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Học kỳ</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>MSSV</th>
                <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Họ tên</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số hóa đơn</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Khoa</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngành</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Bậc</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hệ</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Trạng thái</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>),
            renderRow: (item, index) => (<tr style={item.trangThai == 'CANCELED' ? { backgroundColor: '#FEFFDC' } : {}} key={index}>
                <TableCell style={{ textAlign: 'right' }} content={item.R} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.namHoc} - HK0${item.hocKy}`} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.ho || ''} ${item.ten || ''}`.toUpperCase().trim()} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.invoiceNumber} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.maNganh}: ${item.tenNganh}`} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenBacDaoTao} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenLoaiHinhDaoTao} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={trangThaiHoaDonDict?.[item.trangThai]?.text || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} type='buttons' >
                    {item.trangThai == 'DA_CAP_MA' && <>
                        <Tooltip title='Xem hóa đơn' arrow>
                            <a className='btn btn-info' target='_blank' rel='noopener noreferrer' href={`/api/khtc/invoice/view/${item.id}`}>
                                <i className='fa fa-lg fa-eye' />
                            </a>
                        </Tooltip>
                        <Tooltip title='Mail hóa đơn' arrow>
                            <button className='btn btn-success' onClick={(e) => this.onSendMail(e, item)} >
                                <i className='fa fa-lg fa-envelope' />
                            </button>
                        </Tooltip>
                        <Tooltip title='Hủy hóa đơn' arrow>
                            <button className='btn btn-danger' onClick={(e) => this.onCancelInvoicie(e, item)} >
                                <i className='fa fa-lg fa-times' />
                            </button>
                        </Tooltip>
                    </>
                    }
                </TableCell>
            </tr>),
        });
        return this.renderPage({
            title: 'Danh sách hóa đơn',
            icon: 'fa fa-money',
            header: <>
                <FormSelect ref={e => this.year = e} style={{ width: '100px', marginBottom: '0', marginRight: 10 }} placeholder='Năm học' data={yearDatas()} onChange={() => this.changeAdvancedSearch()} />
                <FormSelect ref={e => this.term = e} style={{ width: '100px', marginBottom: '0' }} placeholder='Học kỳ' data={termDatas} onChange={() => this.changeAdvancedSearch()} />
            </>,
            advanceSearch: <div className='row'>
                <FormSelect ref={e => this.nganHang = e} label='Ngân hàng' data={this.props.tcGiaoDich?.nganHang || []} className='col-md-4' allowClear multiple />
                <FormSelect ref={e => this.bacDaoTao = e} label='Bậc đào tạo' data={SelectAdapter_DmSvBacDaoTao} className='col-md-4' allowClear multiple />
                <FormSelect ref={e => this.loaiHinhDaoTao = e} label='Hệ đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTao} className='col-md-4' allowClear multiple />
                <FormSelect ref={e => this.khoa = e} label='Khoa' data={SelectAdapter_DmDonViFaculty_V2} className='col-md-4' allowClear multiple />
                <FormSelect ref={e => this.nganh = e} label='Ngành' data={SelectAdapter_DtNganhDaoTao} className='col-md-4' allowClear multiple />
                <FormSelect ref={e => this.trangThai = e} label='Trạng thái' data={SelectAdapter_TrangThaiHoaDon} className='col-md-4' allowClear />
                {/* <FormDatePicker className='col-md-6' ref={e => this.tuNgay = e} label='Từ ngày' allowClear />
                <FormDatePicker className='col-md-6' ref={e => this.denNgay = e} label='Đến ngày' allowClear /> */}
                <div className='col-md-12 d-flex justify-content-end' style={{ gap: 10 }}>
                    <button className='btn btn-danger' onClick={this.onClearSearch}><i className='fa fa-lg fa-times' />Xóa tìm kiếm</button>
                    <button className='btn btn-success' onClick={e => e.preventDefault() || this.changeAdvancedSearch()}><i className='fa fa-lg fa-search' />Tìm kiếm</button>
                </div>
            </div>,
            breadcrumb: ['Danh sách hóa đơn'],
            content: (<div className='row'>
                <div className='col-md-12'>
                    <div className='tile'>
                        {table}
                        <CancelModal ref={e => this.cancelModal = e} cancel={this.props.cancelInvoice} />
                        <EditModal ref={e => this.editModal = e} addInvoice={this.props.addInvoice} />
                        <Pagination {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                            getPage={this.getPage} />
                    </div>
                </div>
            </div>),
            onCreate: permission.write ? (e) => this.editModal.show() || e.preventDefault() : null,
            onExport: permission.export ? (e) => e.preventDefault() || T.download(`/api/khtc/invoice/download-excel?filter=${T.stringify({ ...this.state.filter, ...{ namHoc: this.year.value(), hocKy: this.term.value() } })}`, 'DANHSACHGIAODICH.xlsx') : null,
            buttons,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tcInvoice: state.finance.tcInvoice });
const mapActionsToProps = { getInvoicePage, sendInvoiceMail, cancelInvoice, addInvoice, checkStatusInvoice };
export default connect(mapStateToProps, mapActionsToProps)(DanhSachHoaDon);