import React from 'react';
import { Tooltip } from '@mui/material';
import { connect } from 'react-redux';
import { AdminPage, FormDatePicker, FormSelect, FormTextBox, renderTable, TableCell, AdminModal, FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { createInvoiceTransaction, getTongGiaoDichPage, getListNganHang, createGiaoDich, updateGiaoDich, cancelGiaoDich, getInfoInvocie, getPendingListInvoiceLength, createInvoiceList, getCongNo, setupExcelCanTru, downloadExcelCanTru } from './redux';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DtNganhDaoTao } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
import { SelectAdapter_FwNamTuyenSinh, SelectAdapter_FwStudent } from 'modules/mdCongTacSinhVien/fwStudents/redux';
import { SelectAdapter_DmBank, SelectAdapter_DmPhuongThucThanhToan } from 'modules/mdDanhMuc/dmBank/redux';
import StatisticModal from './modal/StatisticModal';
import TachTransactionModal from './modal/TachTransactionModal';
import MultipleInvoiceModal from './modal/CreateMultipleInvoiceModal';
import UploadTransactionModal from './modal/UploadTransactionModal';
import CreateInvoice from './modal/CreateInvoiceModal';
import ExcelCanTruModal from './modal/ExcelCanTru';
import { NumberIcon } from '../tcHocPhi/adminPage';
import { Link } from 'react-router-dom';
import CountUp from 'view/js/countUp';
import { DefaultColors } from 'view/component/Chart';

const yearDatas = () => {
    return Array.from({ length: 15 }, (_, i) => {
        const year = i + new Date().getFullYear() - 14;
        return { id: year, text: `${year} - ${year + 1}` };
    });
};

const termDatas = [{ id: 1, text: 'HK1' }, { id: 2, text: 'HK2' }, { id: 3, text: 'HK3' }];
const tinhTrangHoaDonAdapter = [{ id: 0, text: 'Chưa xuất' }, { id: 1, text: 'Đã xuất' }];
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

class DashboardIcon extends React.Component {
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
                <i className={'icon fa fa-3x ' + this.props.icon} style={{ backgroundColor: this.props.color || '' }} />
                <div className='info'>
                    {isShow && <p style={{ fontWeight: 'bold' }} ref={e => this.valueElement = e} />}
                    <label style={{ color: 'black' }}>{this.props.title} </label>

                </div>
            </div>
        );
        return this.props.link ? <Link to={this.props.link} style={{ textDecoration: 'none' }}>{content}</Link> : content;
    }
}
class EditModal extends AdminModal {

    onChangeQuery = () => {
        const mssv = this.sinhVien.value();
        const hocKy = this.hocKy.value();
        const namHoc = this.namHoc.value();
        if (mssv && hocKy && namHoc) {
            this.props.get(mssv, namHoc, hocKy, (hocPhi) => {
                this.soTien.value(hocPhi.congNo);
                this.setAmountText(hocPhi.congNo);
            });
        }
    }


    setAmountText = (value) => {
        if (Number.isInteger(value))
            this.thanhChu?.value(T.numberToVnText(value.toString()) + ' đồng');
    }

    onShow = () => {
        this.soTien?.value('');
        this.thanhChu?.value('');
        this.sinhVien?.value('');
    }

    onSubmit = () => {
        const data = {
            soTien: this.soTien.value(),
            hocKy: this.hocKy.value(),
            namHoc: this.namHoc.value(),
            sinhVien: this.sinhVien.value()
        };
        if (!data.namHoc) {
            T.notify('Năm học trống ', 'danger');
            this.namHoc.focus();
        }
        else if (!data.hocKy) {
            T.notify('Học kỳ trống ', 'danger');
            this.hocKy.focus();
        }
        else if (!data.sinhVien) {
            T.notify('Sinh viên trống ', 'danger');
            this.sinhVien.focus();
        }
        else if (!data.soTien) {
            T.notify('Số tiền trống', 'danger');
            this.soTien.focus();
        }
        else {
            this.props.create(data, () => this.hide());
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Thêm giao dịch',
            size: 'large',
            body: <div className='row'>
                <FormSelect required data={yearDatas()} label='Năm học' className='col-md-4' ref={e => this.namHoc = e} onChange={this.onChangeQuery} />
                <FormSelect required data={termDatas} label='Học kỳ' className='col-md-4' ref={e => this.hocKy = e} onChange={this.onChangeQuery} />
                <FormSelect required data={SelectAdapter_FwStudent} label='Sinh viên' className='col-md-4' ref={e => this.sinhVien = e} onChange={this.onChangeQuery} />
                <FormTextBox readOnly label='Số tiền' readOnlyEmptyText='Chưa có dữ liệu học phí' className='col-md-12' ref={e => this.soTien = e} />
                <FormTextBox readOnly label='Thành chữ' className='col-md-12' ref={e => this.thanhChu = e} readOnlyEmptyText='Chưa có dữ liệu học phí' />
            </div>
        });
    }
}

class AdminEditModal extends AdminModal {

    onChangeQuery = () => {
        const mssv = this.sinhVien.value();
        if (mssv) {
            this.props.get(mssv, (congNo) => {
                if (congNo > 0) {
                    this.soTien.value(congNo);
                    this.setAmountText(congNo);
                }
                else {
                    T.notify('Sinh viên không có khoản thu nào');
                }
            });
        }
    }

    setAmountText = (value) => {
        if (Number.isInteger(value))
            this.thanhChu?.value(T.numberToVnText(value.toString()) + ' đồng');
    }

    onShow = (item) => {
        const { transId, sinhVien, soTien, pttt, ngayGiaoDich, thoiGianSoPhu, ghiChu, isAllowInvoice } = item ? {
            transId: item.transactionId,
            sinhVien: item.mssv,
            soTien: item.khoanDong,
            ngayGiaoDich: item.ngayDong,
            thoiGianSoPhu: item.thoiGianSoPhu,
            pttt: item.pttt,
            ghiChu: (item.ghiChu || ''),
            isAllowInvoice: !!(item.isAllow || '')
        } : { transId: '', sinhVien: '', soTien: '', ngayGiaoDich: '', thoiGianSoPhu: '', pttt: '', ghiChu: '', isAllowInvoice: false };

        this.setState({ transId, sinhVien, soTien, ngayGiaoDich, thoiGianSoPhu, pttt, ghiChu, isAllowInvoice }, () => {
            this.sinhVien?.value(sinhVien);
            this.soTien?.value(soTien);
            this.pttt?.value(pttt);
            this.ngayGiaoDich?.value(new Date(parseInt(ngayGiaoDich)));
            this.thoiGianSoPhu?.value(thoiGianSoPhu ? new Date(parseInt(thoiGianSoPhu)) : '');
            this.ghiChu?.value(ghiChu);
            this.thanhChu?.value(soTien ? T.numberToVnText(soTien) + ' đồng' : '');
            this.isAllowInvoice?.value(isAllowInvoice || false);
            this.loaiGiaoDich?.value('HP');
        });
    }

    onSubmit = () => {
        const transId = this.state.transId;
        let data = {
            soTien: this.soTien.value(),
            sinhVien: this.sinhVien.value(),
            pttt: this.pttt.value(),
            ngayGiaoDich: this.ngayGiaoDich?.value(),
            thoiGianSoPhu: this.thoiGianSoPhu?.value(),
            ghiChu: this.ghiChu.value(),
            isAllowInvoice: Number(this.isAllowInvoice.value() || 0),
            loaiGiaoDich: this.loaiGiaoDich?.value()
        };
        if (!data.sinhVien) {
            T.notify('Sinh viên trống ', 'danger');
            this.sinhVien.focus();
        }
        else if (!data.soTien) {
            T.notify('Số tiền trống', 'danger');
            this.soTien.focus();
        }
        else if (data.ghiChu == this.state.ghiChu && data.pttt == this.state.pttt && this.state.ngayGiaoDich == data.ngayGiaoDich && this.state.thoiGianSoPhu == data.thoiGianSoPhu && this.state.isAllowInvoice == data.isAllowInvoice) {
            T.notify('Không có thay đổi', 'danger');
        }
        else {
            data.ngayGiaoDich && (data.ngayGiaoDich = data.ngayGiaoDich.setHours(12, 0, 0, 0));
            data.thoiGianSoPhu && (data.thoiGianSoPhu = data.thoiGianSoPhu.setHours(12, 0, 0, 0));

            if (this.state.sinhVien) {
                this.props.update({ transId }, {
                    ghiChu: data.ghiChu, pttt: data.pttt,
                    ngayGiaoDich: data.ngayGiaoDich,
                    thoiGianSoPhu: data.thoiGianSoPhu,
                    isAllowInvoice: data.isAllowInvoice,
                    loaiGiaoDich: data.loaiGiaoDich
                }, () => this.hide());
            }
            else {
                this.props.create(data, () => this.hide());
            }
        }
    }

    render = () => {
        return this.renderModal({
            title: this.state.sinhVien ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch',
            size: 'large',
            body: <div className='row'>
                <FormSelect required data={SelectAdapter_FwStudent} label='Sinh viên' className='col-md-12' ref={e => this.sinhVien = e} onChange={this.onChangeQuery} readOnly={this.state.sinhVien} />
                <FormTextBox label='Số tiền' readOnlyEmptyText='Chưa có dữ liệu học phí' className='col-md-9' ref={e => this.soTien = e} type='number' onChange={() => this.setAmountText(this.soTien.value())} readOnly={this.state.sinhVien} />
                <FormSelect label='Loại giao dịch' className='col-md-3' data={[{ id: 'HP', text: 'Học phí' }, { id: 'BH', text: 'BHYT' }]} ref={e => this.loaiGiaoDich = e} readOnly={this.state.sinhVien} />
                <FormTextBox disabled label='Thành chữ' className='col-md-12' ref={e => this.thanhChu = e} readOnlyEmptyText='Chưa có dữ liệu học phí' readOnly={this.state.sinhVien} />
                {this.state.sinhVien && <FormDatePicker className='col-md-6' ref={e => this.ngayGiaoDich = e} label='Ngày giao dịch' allowClear />}
                <FormSelect required data={SelectAdapter_DmPhuongThucThanhToan} label='Phương thức thanh toán' className={this.state.sinhVien ? 'col-md-6' : 'col-md-12'} ref={e => this.pttt = e} />
                <FormDatePicker className='col-md-12' ref={e => this.thoiGianSoPhu = e} label='Thời gian sổ phụ' allowClear />
                <FormTextBox label='Ghi chú' className='col-md-9' ref={e => this.ghiChu = e} />
                <FormCheckbox className='col-md-3' style={{ alignItems: 'center' }} ref={e => this.isAllowInvoice = e} label='Cho xuất hóa đơn' isSwitch />
            </div>
        });
    }
}

class AdminCancelModal extends AdminModal {

    setAmountText = (value) => {
        if (Number.isInteger(value))
            this.thanhChu?.value(T.numberToVnText(value.toString()) + ' đồng');
    }

    onShow = (data) => {
        this.namHoc?.value(data.namHoc);
        this.hocKy?.value(data.hocKy);
        this.sinhVien?.value(`${data.mssv}: ${data.ho || ''} ${data.ten || ''}`);
        this.soTien?.value(data.khoanDong);
        this.setAmountText(data.khoanDong);
        this.ghiChu?.value(data.ghiChu);
        this.setState({ transID: data.transactionId });
    }

    onSubmit = () => {
        const transId = this.state.transID;
        const ghiChu = this.ghiChu.value();
        if (!ghiChu) {
            T.notify('Thiếu ghi chú', 'danger');
            this.ghiChu.focus();
        } else {
            this.props.cancel({ transId, ghiChu }, () => this.hide());
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Hủy giao dịch',
            size: 'large',
            body: <div className='row'>
                <FormTextBox readOnly label='Năm học' className='col-md-4' ref={e => this.namHoc = e} />
                <FormTextBox readOnly label='Học kỳ' className='col-md-4' ref={e => this.hocKy = e} />
                <FormTextBox readOnly label='Sinh viên' className='col-md-4' ref={e => this.sinhVien = e} />
                <FormTextBox readOnly label='Số tiền' className='col-md-12' ref={e => this.soTien = e} type='number' />
                <FormTextBox disabled label='Thành chữ' className='col-md-12' ref={e => this.thanhChu = e} readOnlyEmptyText='Chưa có dữ liệu học phí' />
                <FormTextBox required label='Ghi chú' className='col-md-12' ref={e => this.ghiChu = e} />
            </div>
        });
    }
}

class DanhSachGiaoDich extends AdminPage {
    state = {
        filter: {},
        isShorten: true,
        typePage: 0
    }

    componentDidMount() {
        T.ready('/user/finance', () => {
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(true);
            this.props.getListNganHang();
        });
        this.changeAdvancedSearch(true);

        T.socket.on('downloadExcelCanTru', filePath => this.props.downloadExcelCanTru(filePath, data => {
            T.FileSaver(new Blob([new Uint8Array(data.buffer.data)]), data.filename);
        }));
    }

    onCreateInvocie = (e, item) => {
        e.preventDefault();
        this.onCreateInvocieModal.show(item);
    }
    changeAdvancedSearch = (isInitial = false, isReset = false) => {
        let { pageNumber, pageSize, pageCondition } = this.props && this.props.tcGiaoDich && this.props.tcGiaoDich.page ? this.props.tcGiaoDich.page : { pageNumber: 1, pageSize: 50, pageCondition: '' };
        if (pageCondition && (typeof pageCondition == 'string')) {
            T.setTextSearchBox(pageCondition);
        }
        let typePage = this.typePage.value(),
            listBacDaoTao = this.bacDaoTao.value().toString(),
            listLoaiHinhDaoTao = this.loaiHinhDaoTao.value().toString(),
            listNganh = this.nganh.value().toString(),
            listKhoa = this.khoa.value().toString(),
            nganHang = this.nganHang?.value().toString(),
            namTuyenSinh = this.namTuyenSinh.value(),
            tinhTrangHoaDon = this.tinhTrangHoaDon.value(),
            { tuNgay, denNgay } = this.getTimeFilter();

        const pageFilter = (isInitial || isReset) ? {} : { typePage, tuNgay, denNgay, listBacDaoTao, listLoaiHinhDaoTao, listNganh, listKhoa, nganHang, namTuyenSinh, tinhTrangHoaDon };
        if (typePage) {
            this.setState({ typePage: Number(typePage) });
        }
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, pageCondition, (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    const { typePage } = filter;
                    this.setState({ typePage: Number(typePage), filter });
                    this.typePage.value(Number(typePage || 0));
                } else if (isReset) {
                    ['heDaoTaoSv', 'khoa', 'khoaSinhVienSv', 'lop', 'heDaoTaoHocPhan', 'donViQuanLy', 'khoaSinhVienHocPhan', 'monHoc', 'hocPhan'].forEach(e => this[e]?.value(''));
                    this.hideAdvanceSearch();
                }
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getTongGiaoDichPage(pageN, pageS, pageC, this.state.filter, done);
    }

    onDownloadPsc = (e) => {
        e.preventDefault();
        T.download(`/api/khtc/danh-sach-giao-dich/download-psc?filter=${T.stringify({ ...this.state.filter, ...this.getTimeFilter() })}`, 'HOC_PHI.xlsx');
    }

    onClearSearch = (e) => {
        e.preventDefault();
        ['tuNgay', 'denNgay', 'bacDaoTao', 'loaiHinhDaoTao', 'khoa', 'nganh', 'nganHang', 'tinhTrangHoaDon'].forEach(key => this[key]?.value(''));
        this.changeAdvancedSearch();
    }

    onCreateInvoiceList = (data, done) => {
        this.props.createInvoiceList(data, () => {
            done();
            this.multipleInvoiceModal.hide();
        }, done);
    }

    getTimeFilter = () => {
        let tuNgay = this.tuNgay.value() || null,
            denNgay = this.denNgay.value() || null;
        if (tuNgay) {
            tuNgay.setHours(0, 0, 0, 0);
            tuNgay = tuNgay.getTime();
        }
        if (denNgay) {
            denNgay.setHours(23, 59, 59, 999);
            denNgay = denNgay.getTime();
        }
        return { tuNgay, denNgay };
    }


    render() {
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list, totalMoney, detailNganHang } = this.props.tcGiaoDich && this.props.tcGiaoDich.page ? this.props.tcGiaoDich.page : {
            pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null, totalMoney: 0, detailNganHang: null
        };
        let invoicePermission = this.getUserPermission('tcInvoice');
        let permission = this.getUserPermission('tcGiaoDich', ['read', 'export', 'write', 'check', 'cancel']);
        const buttons = [];
        invoicePermission.write && buttons.push(
            {
                className: 'btn-info', icon: 'fa-print', tooltip: 'Xuất hóa đơn', onClick: (e) => {
                    e.preventDefault();
                    this.multipleInvoiceModal.show({
                        tuNgay: this.tuNgay?.value(),
                        denNgay: this.denNgay?.value(),
                    });
                }
            });
        permission.write && buttons.push({ className: 'btn-secondary', icon: 'fa-bar-chart', tooltip: 'Tách theo loại phí', onClick: (e) => e.preventDefault() || this.statisModal.show() });
        permission.write && buttons.push({ className: 'btn-secondary btn-warning', icon: 'fa fa-scissors', tooltip: 'Đối chiếu giao dịch từ sổ phụ', onClick: (e) => e.preventDefault() || this.props.history.push('/user/finance/danh-sach-giao-dich/compare') });
        permission.export && buttons.push({ type: 'primary', icon: 'fa-download', className: 'btn-success', tooltip: 'Excel giao dịch cấn trừ', onClick: e => e.preventDefault() || this.canTruModal.show() });
        permission.export && buttons.push({ type: 'primary', icon: 'fa fa-plus-square', className: 'btn-success', tooltip: 'Tải lên giao dịch', onClick: e => e.preventDefault() || this.uploadTransactionModal.show() });
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
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Khoản đóng (VNĐ)</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Trạng thái</th>
                {!this.state.isShorten && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Phương thức</th>}
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngân hàng</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian đóng</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian sổ phụ</th>
                {!this.state.isShorten && <><th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Khoa</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngành</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Bậc</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hệ</th></>}
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ghi chú</th>
                {!this.state.isShorten && !this.state.typePage && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Khoản thu</th>}
                {!this.state.typePage && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>}
            </tr>),
            renderRow: (item, index) => {
                let content = <></>;
                const objectKhoanThu = JSON.parse(item.khoanThu);
                if (objectKhoanThu) {
                    const contentKhoanThu = Object.keys(objectKhoanThu);
                    content = contentKhoanThu.map((cur, index) => {
                        return <li style={{ listStyle: 'none' }} key={index}>{`${objectKhoanThu[cur].ten}: ${T.numberDisplay(Number(objectKhoanThu[cur].soTien))} VNĐ`}</li>;
                    });
                }

                return (<tr style={{ color: item.trangThai ? '' : '#F48484' }} key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={item.R} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.namHoc} - HK0${item.hocKy}`} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.ho || ''} ${item.ten || ''}`.toUpperCase().trim()} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} type='number' content={item.khoanDong} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={
                        item.trangThai ? <div style={{ color: 'green' }}><i className='fa fa-lg fa-check-circle-o' /> Thành công</div> : <div style={{ color: 'red' }}><i className='fa fa-lg fa-times-circle-o' /> Thất bại</div>
                    } />
                    {!this.state.isShorten && <TableCell style={{ whiteSpace: 'nowrap' }} content={item.pttt} />}
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.nganHang} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ngayDong ? T.dateToText(new Date(parseInt(item.ngayDong)), 'HH:MM, dd/mm/yyyy') : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.thoiGianSoPhu ? T.dateToText(new Date(parseInt(item.thoiGianSoPhu)), 'HH:MM, dd/mm/yyyy') : ''} />
                    {!this.state.isShorten && <><TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.maNganh}: ${item.tenNganh}`} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenBacDaoTao} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenLoaiHinhDaoTao} /></>}
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ghiChu} />
                    {!this.state.isShorten && !this.state.typePage && <TableCell style={{ whiteSpace: 'nowrap' }} content={content} />}
                    {!this.state.typePage && <TableCell type='buttons' style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={item} permission={permission} onEdit={() => this.adminModal.show(item)}>
                        {!!item.trangThai && !!item.isAllow && (item.invoiceId ?
                            <Tooltip title='Xem hóa đơn' arrow>
                                <span><button className='btn btn-warning' onClick={e => e.preventDefault() || window.open(`/api/khtc/invoice/view/${item.invoiceId}`, '_blank', 'noopener,noreferrer')}>
                                    <i className='fa fa-lg fa-credit-card' />
                                </button></span>
                            </Tooltip> :
                            <Tooltip title='Tạo hóa đơn' arrow>
                                <span><button className='btn btn-info' onClick={e => e.preventDefault() || this.onCreateInvocie(e, item)}>
                                    <i className='fa fa-lg fa-print' />
                                </button></span>
                            </Tooltip>)
                        }
                        {permission.cancel && <Tooltip title='Hủy' arrow disableHoverListener={!item.trangThai}>
                            <span><button className='btn btn-danger' disabled={!item.trangThai} onClick={e => e.preventDefault() || this.adminCancelModal.show(item)}>
                                <i className='fa fa-lg fa-times' />
                            </button></span>
                        </Tooltip>}
                    </TableCell>}
                </tr>);
            },

        });
        return this.renderPage({
            title: 'Danh sách giao dịch',
            icon: 'fa fa-money',
            header: <>
                <FormSelect ref={e => this.typePage = e} style={{ width: '150px', marginBottom: '0', marginRight: 10 }} placeholder='Chọn loại giao dịch' data={[{ id: 0, text: 'GD học phí' }, { id: 1, text: 'GD BHYT' }]} onChange={
                    () => this.changeAdvancedSearch()} />
            </>,
            advanceSearch: <div className='row'>
                <FormSelect ref={e => this.nganHang = e} label='Ngân hàng' data={SelectAdapter_DmBank} className='col-md-4' allowClear multiple />
                <FormSelect ref={e => this.bacDaoTao = e} label='Bậc đào tạo' data={SelectAdapter_DmSvBacDaoTao} className='col-md-4' allowClear multiple />
                <FormSelect ref={e => this.loaiHinhDaoTao = e} label='Hệ đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTao} className='col-md-4' allowClear multiple />
                <FormSelect ref={e => this.namTuyenSinh = e} label='Năm tuyển sinh' data={SelectAdapter_FwNamTuyenSinh} className='col-md-4' allowClear />
                <FormSelect ref={e => this.khoa = e} label='Khoa' data={SelectAdapter_DmDonViFaculty_V2} className='col-md-4' allowClear multiple />
                <FormSelect ref={e => this.nganh = e} label='Ngành' data={SelectAdapter_DtNganhDaoTao} className='col-md-4' allowClear multiple />
                <FormDatePicker className='col-md-4' ref={e => this.tuNgay = e} label='Từ ngày' allowClear />
                <FormDatePicker className='col-md-4' ref={e => this.denNgay = e} label='Đến ngày' allowClear />
                <FormSelect className='col-md-4' ref={e => this.tinhTrangHoaDon = e} label='Tình trạng hóa đơn' data={tinhTrangHoaDonAdapter} allowClear></FormSelect>

                <div className='col-md-12 d-flex justify-content-end' style={{ gap: 10 }}>
                    <button className='btn btn-danger' onClick={this.onClearSearch}><i className='fa fa-lg fa-times' />Xóa tìm kiếm</button>
                    <button className='btn btn-success' onClick={e => e.preventDefault() || this.changeAdvancedSearch()}><i className='fa fa-lg fa-search' />Tìm kiếm</button>
                </div>
            </div>,
            breadcrumb: ['Danh sách giao dịch'],
            content: (<div className='row'>
                <div className='col-md-6'>
                    <NumberIcon type='primary' icon='fa-users' title='Tổng số giao dịch' value={totalItem || 0} />
                </div>
                <div className='col-md-6'>
                    <NumberIcon type='info' icon='fa-money' title='Tổng số tiền đã đóng' value={totalMoney || 0} />
                </div>
                {
                    !this.state.typePage && detailNganHang && detailNganHang.map((item, index) =>
                    (
                        <div key={index} className='col-md-6 col-xl-3'>
                            <DashboardIcon type='info' icon='fa-university' color={Object.values(DefaultColors)[index]} title={item.bank} value={item.tongTien} />
                        </div>
                    )
                    )
                }
                <div className='col-md-12'>
                    <div className='tile'>
                        <FormCheckbox ref={e => this.isShorten = e} label='Hiển thị đầy đủ' onChange={(value) => this.setState({ isShorten: !value })} />
                        {table}
                        <Pagination {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                            getPage={this.getPage} />
                    </div>
                </div>
                <AdminCancelModal ref={e => this.adminCancelModal = e} cancel={this.props.cancelGiaoDich} />
                <AdminEditModal ref={e => this.adminModal = e} create={this.props.createGiaoDich} update={this.props.updateGiaoDich} get={this.props.getCongNo} />
                <EditModal ref={e => this.modal = e} create={this.props.createGiaoDich} get={this.props.getStudentHocPhi} />
                <StatisticModal ref={e => this.statisModal = e} />
                <TachTransactionModal ref={e => this.tachTransactionModal = e} />
                <ExcelCanTruModal ref={e => this.canTruModal = e} setup={this.props.setupExcelCanTru} />
                <CreateInvoice ref={e => this.onCreateInvocieModal = e} getInfoInvocie={this.props.getInfoInvocie} createInvoiceTransaction={this.props.createInvoiceTransaction} />
                <MultipleInvoiceModal ref={e => this.multipleInvoiceModal = e} onCreate={this.onCreateInvoiceList} permissions={invoicePermission} getPendingListInvoiceLength={this.props.getPendingListInvoiceLength} />
                <InvoiceResultModal ref={e => this.resultModal = e} />
                <UploadTransactionModal ref={e => this.uploadTransactionModal = e} />
            </div>),
            onCreate: permission.check ? () => this.adminModal.show() : null,
            buttons,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tcGiaoDich: state.finance.tcGiaoDich });
const mapActionsToProps = { createInvoiceTransaction, getInfoInvocie, getTongGiaoDichPage, getListNganHang, createGiaoDich, updateGiaoDich, getCongNo, cancelGiaoDich, getPendingListInvoiceLength, createInvoiceList, setupExcelCanTru, downloadExcelCanTru };
export default connect(mapStateToProps, mapActionsToProps)(DanhSachGiaoDich);
