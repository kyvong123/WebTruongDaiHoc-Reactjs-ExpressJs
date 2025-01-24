import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormDatePicker, FormSelect, renderTable, TableCell, AdminModal, FormTextBox, FormCheckbox } from 'view/component/AdminPage';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DtNganhDaoTao } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
import { SelectAdapter_FwNamTuyenSinh } from 'modules/mdCongTacSinhVien/fwStudents/redux';
import { SelectAdapter_DmLoaiSinhVienV2 } from 'modules/mdDanhMuc/dmLoaiSinhVien/redux';
import {
    updateLoaiTinhPhi, updateXoaSoDuPsc, updateActiveLoaiPhi, getSubDetailHocPhi, getDetailHocPhiSinhVien,
    createInvoice, createMultipleHocPhi, getHocPhi, getTcHocPhiPage, updateTrangThai, getHoaDonDetail,
    getLengthRemindMail, sendRemindMail, getDataBhyt, updateDienDongBhyt, sendThongBaoHocPhiLength, sendThongBaoHocPhi
} from './redux';
// import { updateSvBaoHiemYTeBhyt } from 'modules/mdSinhVien/svManageBaoHiemYTe/redux';
import Pagination from 'view/component/Pagination';
import CountUp from 'view/js/countUp';
import Detail from './modal/DetailModal';
import CreateInvoice from './modal/CreateInvoiceModal';
import { EditModal } from './modal/EditModal';
import SendMailNhacNo from './modal/SendMailNhacNoModal';
import TachMssvModal from './tachMssvModal';
import UpLoadNoModal from './modal/UpLoadNoModal';
import BhytModal from './modal/BhytModal';
import ExportThongKeTheoMonModal from './modal/ExportThongKeTheoMonModal';
import SendThongBaoHocPhiModal from './modal/SendThongBaoHocPhiModal';
import { SubDetail } from './modal/SubDetailModal';
import { Tooltip } from '@mui/material';

export class NumberIcon extends React.Component {
    componentDidMount() {
        setTimeout(() => {
            const endValue = this.props.value ? parseInt(this.props.value) : 0;
            new CountUp(this.valueElement, 0, endValue, 0, 2, { separator: '.', decimal: ',' }).start();
        }, 100);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.value !== this.props.value)
            setTimeout(() => {
                const endValue = this.props.value ? parseInt(this.props.value) : 0;
                new CountUp(this.valueElement, prevProps.value, endValue, 0, 2, { separator: '.', decimal: ',' }).start();
            }, 100);
    }

    render() {
        let isShow = true;
        if (this.props.isShowValue != undefined) {
            if (this.props.isShowValue == false) isShow = false;
        }
        const content = (
            <div className={'widget-small coloured-icon ' + this.props.type}>
                <i className={'icon fa fa-3x ' + this.props.icon} />
                <div className='info'>
                    <h4>
                        {this.props.title}
                    </h4>
                    {isShow && <p style={{ fontWeight: 'bold' }} ref={e => this.valueElement = e} />}
                </div>
            </div>
        );
        return this.props.link ? <Link to={this.props.link} style={{ textDecoration: 'none' }}>{content}</Link> : content;
    }
}

class InvoiceResultModal extends AdminModal {
    onShow = (data) => {
        this.tongHoaDon.value(data.totalInvoice.toString());
        this.thanhCong.value(`${data.success}/${data.totalInvoice}` || '');
    }

    render = () => {
        return this.renderModal({
            title: 'Kết quả xuất hóa đơn',
            size: 'large',
            body: <div className='row'>
                <FormTextBox readOnly ref={e => this.tongHoaDon = e} className='col-md-12' label='Tổng số hóa đơn' />
                <FormTextBox readOnly ref={e => this.thanhCong = e} className='col-md-12' label='Hóa đơn tạo thành công' />
            </div>
        });
    }
}

const getTimeFilter = (tuNgay, denNgay) => {
    if (tuNgay) {
        tuNgay.setHours(0, 0, 0, 0);
        tuNgay = tuNgay.getTime();
    }
    if (denNgay) {
        denNgay.setHours(23, 59, 59, 999);
        denNgay = denNgay.getTime();
    }
    return { tuNgay, denNgay };
};

const yearDatas = () => {
    return Array.from({ length: 15 }, (_, i) => i + new Date().getFullYear() - 10);
};

const termDatas = [{ id: 1, text: 'HK1' }, { id: 2, text: 'HK2' }, { id: 3, text: 'HK3' }];
class TcHocPhiAdminPage extends AdminPage {
    state = { filter: {}, totalCurrent: 0, totalPaid: 0, isButtonsExpanded: false }

    componentDidMount() {
        T.ready('/user/finance', () => {
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                let filterCookie = T.getCookiePage('pageTcHocPhi', 'F'),
                    { nhapHoc = '', daDong = '', listBacDaoTao = '', listLoaiHinhDaoTao = '', listNganh = '', listKhoa = '' } = filterCookie;
                this.nhapHoc.value(nhapHoc);
                this.daDong.value(daDong);
                this.bacDaoTao.value(listBacDaoTao);
                this.loaiHinhDaoTao.value(listLoaiHinhDaoTao);
                this.nganh.value(listNganh);
                this.khoa.value(listKhoa);
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.changeAdvancedSearch(true);
            this.setState({ thaoTacNhanh: true }, () => {
                this.thaoTacNhanh?.value(true);
            });
        });
    }

    changeAdvancedSearch = (isInitial = false, isReset = false) => {
        let { pageNumber, pageSize, pageCondition } = this.props && this.props.tcHocPhi && this.props.tcHocPhi.page ? this.props.tcHocPhi.page : { pageNumber: 1, pageSize: 50, pageCondition: '' };
        const daDong = this.daDong.value().toString(),
            tinhTrangHoaDon = this.tinhTrangHoaDon.value(),
            nhapHoc = this.nhapHoc.value(),
            listBacDaoTao = this.bacDaoTao.value().toString(),
            listLoaiHinhDaoTao = this.loaiHinhDaoTao.value().toString(),
            listNganh = this.nganh.value().toString(),
            listKhoa = this.khoa.value().toString(),
            namHoc = this.year.value(),
            hocKy = this.term.value(),
            namTuyenSinh = this.namTuyenSinh.value(),
            hoanTra = this.hoanTra.value(),
            loaiSinhVien = this.loaiSinhVien.value(),
            { tuNgay, denNgay } = getTimeFilter(this.tuNgay.value() || null, this.denNgay.value() || null);
        const pageFilter = (isInitial || isReset) ? {} : { namTuyenSinh, tinhTrangHoaDon, nhapHoc, daDong, hoanTra, loaiSinhVien, listBacDaoTao, listLoaiHinhDaoTao, listNganh, listKhoa, namHoc, hocKy, tuNgay, denNgay };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, pageCondition, (page) => {
                const { settings: { namHoc, hocKy, totalPaid, totalCurrent } } = page;
                if (isInitial) {
                    this.year.value(namHoc);
                    this.term.value(hocKy);
                    const filter = page.filter || {};
                    const filterCookie = T.getCookiePage('pageTcHocPhi', 'F');
                    let { nhapHoc, daDong, hoanTra, listBacDaoTao, listLoaiHinhDaoTao, listNganh, listKhoa, loaiSinhVien, tinhTrangHoaDon } = filter;
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.tinhTrangHoaDon.value(tinhTrangHoaDon || filterCookie.tinhTrangHoaDon || '');
                    this.namTuyenSinh.value(namTuyenSinh || filterCookie.namTuyenSinh);
                    this.loaiSinhVien.value(loaiSinhVien || filterCookie.loaiSinhVien || '');
                    this.daDong.value(daDong || filterCookie.daDong || '');
                    this.hoanTra.value(hoanTra || filterCookie.hoanTra || '');
                    this.nhapHoc.value(nhapHoc || filterCookie.nhapHoc || '');
                    this.bacDaoTao.value(listBacDaoTao || filterCookie.listBacDaoTao || '');
                    this.loaiHinhDaoTao.value(listLoaiHinhDaoTao || filterCookie.listLoaiHinhDaoTao || '');
                    this.nganh.value(listNganh || filterCookie.listNganh || '');
                    this.khoa.value(listKhoa || filterCookie.listKhoa || '');

                } else if (isReset) {
                    ['nhapHoc', 'daDong', 'bacDaoTao', 'loaiHinhDaoTao', 'nganh', 'khoa', 'hoanTra', 'loaiSinhVien', 'tinhTrangHoaDon'].forEach(e => this[e].value(''));
                    this.hideAdvanceSearch();
                }
                this.setState({ totalCurrent, totalPaid });
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getTcHocPhiPage(pageN, pageS, pageC, this.state.filter, done);
    }

    onDownloadPsc = (e) => {
        e.preventDefault();
        T.download(`/api/khtc/hoc-phi/download-psc?filter=${T.stringify(this.state.filter)}`, 'HOC_PHI.xlsx');
    }

    onCreateInvocie = (e, item) => {
        e.preventDefault();
        if (item.congNo >= item.hocPhi) {
            T.notify('Không thể tạo hóa đơn cho sinh viên chưa đóng học phí', 'danger');
            return;
        }
        if (!item.hoanTra) {
            e.target.setAttribute('disabled', true);
            this.createInvoiceModal.show(item);
            e.target.setAttribute('disabled', false);
        } else {
            T.notify('Không thể tạo hóa đơn cho sinh viên đã được hoàn trả học phí', 'danger');
            return;
        }
    }
    exportHocPhi = () => {
        const daDong = this.daDong.value().toString(),
            tinhTrangHoaDon = this.tinhTrangHoaDon.value(),
            nhapHoc = this.nhapHoc.value(),
            listBacDaoTao = this.bacDaoTao.value().toString(),
            listLoaiHinhDaoTao = this.loaiHinhDaoTao.value().toString(),
            listNganh = this.nganh.value().toString(),
            listKhoa = this.khoa.value().toString(),
            namHoc = this.year.value(),
            hocKy = this.term.value(),
            namTuyenSinh = this.namTuyenSinh.value(),
            hoanTra = this.hoanTra.value(),
            loaiSinhVien = this.loaiSinhVien.value(),
            { tuNgay, denNgay } = getTimeFilter(this.tuNgay.value() || null, this.denNgay.value() || null);
        const filter = {
            namTuyenSinh, tinhTrangHoaDon, nhapHoc, daDong, hoanTra, loaiSinhVien, listBacDaoTao, listLoaiHinhDaoTao, listNganh, listKhoa, namHoc, hocKy, tuNgay, denNgay
        };
        T.handleDownload(`/api/khtc/hoc-phi/download-excel?filter=${T.stringify(filter)}`, 'HOC_PHI.xlsx');
    }
    render() {
        let invoicePermission = this.getUserPermission('tcInvoice');
        let permission = this.getUserPermission('tcHocPhi', ['read', 'write', 'delete', 'manage', 'export']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list, settings } = this.props.tcHocPhi && this.props.tcHocPhi.page ? this.props.tcHocPhi.page : {
            pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null
        };
        const buttons = [];

        if (this.state.isButtonsExpanded) {
            buttons.push({ className: 'btn-secondary', icon: 'fa-caret-right', tooltip: 'Thu gọn', onClick: e => e.preventDefault() || this.setState({ isButtonsExpanded: false }) });
            invoicePermission.write && buttons.push(
                {
                    className: 'btn-primary', icon: 'fa-scissors', tooltip: 'Tách MSSV', onClick: (e) => {
                        e.preventDefault();
                        this.tachMssvModal.show();
                    }
                });
            permission.manage && buttons.push({ type: 'primary', icon: 'fa-table', tooltip: 'Thống kê', onClick: e => e.preventDefault() || (permission.manage && this.props.history.push('/user/finance/statistic')) });
            permission.write && buttons.push({ type: 'primary', icon: 'fa-cloud-upload', className: 'btn-success', tooltip: 'Import', onClick: e => e.preventDefault() || this.props.history.push('/user/finance/import-hoc-phi') });
            permission.export && buttons.push({ type: 'primary', icon: 'fa-file-excel-o', className: 'btn-success', tooltip: 'export', onClick: e => e.preventDefault() || this.exportHocPhi() });
            permission.export && buttons.push({ type: 'danger', icon: 'fa-file-excel-o', className: 'btn-danger', tooltip: 'Thống kê theo môn học', onClick: e => e.preventDefault() || this.thongKeTheoMon.show() });
            permission.manage && buttons.push({ type: 'primary', icon: 'fa fa-envelope-o', className: 'btn-warning', tooltip: 'Gửi email nhắc nợ', onClick: e => e.preventDefault() || this.sendMailModal.show() });
            permission.manage && buttons.push({ type: 'primary', icon: 'fa fa-bell', className: 'btn-primary', tooltip: 'Gửi thông báo thu học phí', onClick: e => e.preventDefault() || this.thongBaoHocPhiModal.show() });
            permission.manage && buttons.push({ icon: 'fa fa-usd', className: 'btn-info', tooltip: 'UpLoad nợ hệ thống cũ', onClick: e => e.preventDefault() || this.upLoadNoModal.show() });
        } else {
            buttons.push({ className: 'btn-info', icon: 'fa-caret-left', tooltip: 'Mở rộng', onClick: e => e.preventDefault() || this.setState({ isButtonsExpanded: true }) });
        }
        let table = renderTable({
            getDataSource: () => list,
            stickyHead: true,
            header: 'thead-light',
            className: this.state.thaoTacNhanh ? 'table-fix-col' : '',
            emptyTable: 'Chưa có dữ liệu học phí học kỳ hiện tại',
            renderHead: () => (<tr>
                <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                <th style={{ width: 'auto', textAlign: 'center' }}>Học kỳ</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>MSSV</th>
                <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Họ và tên</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Học phí (VNĐ)</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Công nợ (VNĐ)</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Đã đóng (VNĐ)</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Miễn giảm (VNĐ)</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Đã hoàn trả (VNĐ)</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Điện thoại</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Email cá nhân</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian đóng</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Khoa/Bộ môn</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngành</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Bậc</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hệ</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tình Trạng Sinh Viên</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Trạng thái</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ghi chú</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>),
            renderRow: (item, index) => {

                return (
                    <tr style={{ background: item.hoanTra ? '#FEFFDC' : '' }} key={index}>
                        <TableCell style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={`${item.namHoc} - HK${item.hocKy}`} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} type='text' content={<a href={`/user/finance/danh-sach-sinh-vien/${item.mssv}`} target='_blank' rel='noreferrer' >{item.mssv}</a>} />
                        <TableCell type='link' style={{ whiteSpace: 'nowrap' }} content={item.hoTenSinhVien} url={`/user/finance/hoc-phi/${item.mssv}`} />
                        <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={item.hocPhi} />
                        <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={item.congNo} />
                        <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={parseInt(item.hocPhi) - parseInt(item.congNo) - parseInt(item.soTienMienGiam || 0)} />
                        <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={item.soTienMienGiam || 0} />
                        <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={item.soTienHoanTra} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={item.soDienThoai} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.emailCaNhan} />
                        <TableCell type={item.lastTransaction ? 'date' : 'text'} dateFormat='HH:MM:ss dd/mm/yyyy' style={{ whiteSpace: 'nowrap' }} content={item.lastTransaction ? Number(item.lastTransaction) : ''} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.maNganh}: ${item.tenNganh}`} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenBacDaoTao} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenLoaiHinhDaoTao} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tinhTrangSinhVien} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.trangThai} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ghiChu ? item.ghiChu : ''} />
                        <TableCell type='buttons' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item)}>
                            <Tooltip title='Chi tiết' arrow>
                                <button className='btn btn-success' onClick={e => e.preventDefault() || this.detailModal.show(item)}>
                                    <i className='fa fa-lg fa-eye' />
                                </button>
                            </Tooltip>
                            <Tooltip title='Bảo hiểm y tế' arrow>
                                <button className='btn btn-secondary' onClick={e => e.preventDefault() || this.bhytModal.show(item)}>
                                    <i className='fa fa-lg fa-cog' />
                                </button>
                            </Tooltip>
                        </TableCell>
                    </tr>
                );
            },
        });
        return this.renderPage({
            title: 'Học phí',
            icon: 'fa fa-money',
            header: <><FormSelect ref={e => this.year = e} style={{ width: '100px', marginBottom: '0', marginRight: 10 }} placeholder='Năm học' data={yearDatas()} onChange={
                () => this.changeAdvancedSearch()
            } /><FormSelect ref={e => this.term = e} style={{ width: '100px', marginBottom: '0' }} placeholder='Học kỳ' data={termDatas} onChange={
                () => this.changeAdvancedSearch()
            } /></>,
            advanceSearch: <div className='row'>
                <FormSelect ref={e => this.daDong = e} label='Tình trạng học phí' data={[{ id: 0, text: 'Đã đóng đủ' }, { id: 1, text: 'Đóng chưa đủ' }, { id: 2, text: 'Chưa đóng' }]} className='col-md-4' multiple allowClear />
                <FormSelect ref={e => this.nhapHoc = e} label='Tình trạng nhập học' data={[{ id: 0, text: 'Đã nhập học' }, { id: 1, text: 'Chưa nhập học' }]} className='col-md-4' allowClear />
                <FormSelect ref={e => this.loaiSinhVien = e} label='Loại Sinh Viên' data={SelectAdapter_DmLoaiSinhVienV2} className='col-md-4' allowClear />
                <FormSelect ref={e => this.tinhTrangHoaDon = e} label='Tình trạng hóa đơn' data={[{ id: 0, text: 'Chưa xuất' }, { id: 1, text: 'Đã xuất' }]} className='col-md-4' allowClear />
                <FormSelect ref={e => this.hoanTra = e} label='Hoàn trả' data={[{ id: 0, text: 'Chưa hoàn trả' }, { id: 1, text: 'Đã hoàn trả' }]} className='col-md-4' allowClear />
                <FormSelect ref={e => this.bacDaoTao = e} label='Bậc đào tạo' data={SelectAdapter_DmSvBacDaoTao} className='col-md-4' allowClear multiple />
                <FormSelect ref={e => this.loaiHinhDaoTao = e} label='Hệ đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTao} className='col-md-4' allowClear multiple />
                <FormSelect ref={e => this.namTuyenSinh = e} label='Năm tuyển sinh' data={SelectAdapter_FwNamTuyenSinh} className='col-md-4' allowClear />
                <FormSelect ref={e => this.khoa = e} label='Khoa' data={SelectAdapter_DmDonViFaculty_V2} className='col-md-4' allowClear multiple />
                <FormSelect ref={e => this.nganh = e} label='Ngành' data={SelectAdapter_DtNganhDaoTao} className='col-md-4' allowClear multiple />
                <FormDatePicker className='col-md-4' ref={e => this.tuNgay = e} label='Từ ngày' allowClear />
                <FormDatePicker className='col-md-4' ref={e => this.denNgay = e} label='Đến ngày' allowClear />
                <div className='col-md-12 d-flex justify-content-end align-items-center' style={{ gap: 10 }}>
                    <span>Tìm thấy <b>{totalItem}</b> kết quả</span>
                    <button className='btn btn-danger' onClick={e => e.preventDefault() || this.changeAdvancedSearch(false, true)}><i className='fa fa-lg fa-times' />Xóa tìm kiếm</button>
                    <button className='btn btn-success' onClick={e => e.preventDefault() || this.changeAdvancedSearch()}><i className='fa fa-lg fa-search' />Tìm kiếm</button>
                </div>
            </div>,
            breadcrumb: ['Học phí'],
            content:
                <div className='row'>
                    <div className='col-md-6'>
                        <NumberIcon type='primary' icon='fa-users' title='Tổng số sinh viên đóng học phí' value={totalItem || 0} />
                    </div>
                    <div className='col-md-6'>
                        <NumberIcon type='info' icon='fa-users' title='Số sinh viên đã đóng đủ' value={settings?.totalPaid || 0} />
                    </div>
                    <div className='col-md-12'>
                        <div className='tile'>
                            <div><FormCheckbox isSwitch label={'Thao tác nhanh'} ref={e => this.thaoTacNhanh = e} onChange={value => this.setState({ thaoTacNhanh: value })} /></div>
                            {table}
                            <Pagination {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} pageRange={3}
                                getPage={this.getPage} />
                            <EditModal ref={e => this.modal = e} permission={permission} update={this.props.updateTrangThai} readOnly={permission.readOnly} getPage={this.changeAdvancedSearch} />
                            <CreateInvoice ref={e => this.createInvoiceModal = e} getHocPhi={this.props.getHocPhi} tcHocPhi={this.props.tcHocPhi} getHoaDonDetail={this.props.getHoaDonDetail} create={this.props.createInvoice} readOnly={!permission.write} />
                        </div>
                    </div>
                    <InvoiceResultModal ref={e => this.resultModal = e} />
                    <TachMssvModal ref={e => this.tachMssvModal = e} />
                    <SendMailNhacNo ref={e => this.sendMailModal = e} sendRemindMail={this.props.sendRemindMail} getLengthRemindMail={this.props.getLengthRemindMail} />
                    <UpLoadNoModal ref={e => this.upLoadNoModal = e} />
                    <SubDetail updateLoaiTinhPhi={this.props.updateLoaiTinhPhi} editModal={this.detailModal} ref={e => this.subDetail = e} getSubDetailHocPhi={this.props.getSubDetailHocPhi} />
                    <ExportThongKeTheoMonModal ref={e => this.thongKeTheoMon = e} />
                    <Detail updateXoaSoDuPsc={this.props.updateXoaSoDuPsc} tcHocPhi={this.props.tcHocPhi} subModal={this.subDetail} ref={e => this.detailModal = e} getHocPhi={this.props.getHocPhi} create={this.props.createMultipleHocPhi} getDetailHocPhiSinhVien={this.props.getDetailHocPhiSinhVien} getSubDetailHocPhi={this.props.getSubDetailHocPhi} permission={permission} updateActiveLoaiPhi={this.props.updateActiveLoaiPhi} />
                    <BhytModal ref={e => this.bhytModal = e} getData={this.props.getDataBhyt} updateDienDong={this.props.updateDienDongBhyt} permission={permission} />
                    <SendThongBaoHocPhiModal ref={e => this.thongBaoHocPhiModal = e}
                        sendThongBaoHocPhiLength={this.props.sendThongBaoHocPhiLength}
                        sendThongBaoHocPhi={this.props.sendThongBaoHocPhi}
                    ></SendThongBaoHocPhiModal>
                </div>,
            buttons: buttons,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tcHocPhi: state.finance.tcHocPhi });
const mapActionsToProps = {
    updateLoaiTinhPhi, updateXoaSoDuPsc, updateActiveLoaiPhi, getSubDetailHocPhi, getDetailHocPhiSinhVien,
    getTcHocPhiPage, updateTrangThai, getHocPhi, createMultipleHocPhi, createInvoice, getHoaDonDetail,
    getLengthRemindMail, sendRemindMail, getDataBhyt, updateDienDongBhyt, sendThongBaoHocPhiLength, sendThongBaoHocPhi
};
export default connect(mapStateToProps, mapActionsToProps)(TcHocPhiAdminPage);