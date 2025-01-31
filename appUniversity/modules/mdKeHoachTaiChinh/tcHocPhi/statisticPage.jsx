import React from 'react';
import { AdminPage, FormDatePicker, FormSelect } from 'view/component/AdminPage';
import { getStatisticTcHocPhi } from './redux';
import { ChartArea } from 'modules/mdTccb/dashboardTCCB/adminPage';
import { NumberIcon } from './adminPage';
import { DefaultColors } from 'view/component/Chart';
import TachLoaiPhi from '../tcThongKe/modal/TachLoaiPhiModal';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DtNganhDaoTao } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
//import { SelectAdapter_FwNamTuyenSinh } from 'modules/mdSinhVien/fwStudents/redux';
// import { DefaultColors } from 'view/component/Chart';
const yearDatas = () => {
    return Array.from({ length: 15 }, (_, i) => i + new Date().getFullYear() - 10);
};
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
const termDatas = [{ id: 1, text: 'HK1' }, { id: 2, text: 'HK2' }, { id: 3, text: 'HK3' }];
export default class StatisticModal extends AdminPage {
    // Function
    state = { isSubmitting: false }
    changeAdvancedSearch = (isInitial = false, isReset = false) => {
        const listBacDaoTao = this.bacDaoTao?.value()?.toString(),
            listLoaiHinhDaoTao = this.loaiDaoTao?.value()?.toString(),
            listNganh = this.nganh?.value()?.toString(),
            listKhoa = this.khoa?.value()?.toString(), // chua co khoa
            namHoc = this.year?.value(),
            hocKy = this.term?.value(),
            namTuyenSinh = this.namTuyenSinh?.value(),
            { tuNgay, denNgay } = getTimeFilter(this.tuNgay?.value() || null, this.denNgay?.value() || null);
        let filter = (isInitial || isReset) ? {} : { namTuyenSinh, listBacDaoTao, listLoaiHinhDaoTao, listNganh, listKhoa, namHoc, hocKy, tuNgay, denNgay };
        this.setState({ statistic: {} }, () => {
            getStatisticTcHocPhi(filter || {}, (result) => this.setState(result));
        });
    }
    componentDidMount() {
        T.ready('/user/finance', () => {
            getStatisticTcHocPhi({}, (result) => this.setState(result));
            T.showSearchBox(true); // search box
        });
    }
    onSubmit = () => {
        //create data and check
        const data = {
            ...getTimeFilter(this.tuNgay.value() || null, this.denNgay.value() || null),
            namHoc: this.namHoc.value(),
            hocKy: this.hocKy.value(),
            bacDaoTao: this.bacDaoTao.value()?.toString(),
            nganh: this.nganh?.value()?.toString(),
            khoa: this.khoa?.value()?.toString(), // chua co khoa
            namTuyenSinh: this.namTuyenSinh?.value()
        };
        if (!data.namHoc) {
            T.notify('Vui lòng chọn năm học', 'danger');
            this.namHoc.focus();
        }
        else if (!data.hocKy) {
            T.notify('Vui lòng chọn học kỳ', 'danger');
            this.hocKy.focus();
        }
        else if (!data.bacDaoTao) {
            T.notify('Vui lòng chọn bậc đào tạo', 'danger');
            this.bacDaoTao.focus();
        }
        else if (!data.nganh) {
            T.notify('Vui lòng chọn ngành đào tạo', 'danger');
            this.nganh.focus();
        }
        else if (!data.khoa) {
            T.notify('Vui lòng chọn ngành đào tạo', 'danger');
            this.khoa.focus();
        }
        else {
            this.setState({ isSubmitting: true }, () => {
                this.props.onCreate(data, () => {
                    this.setState({ isSubmitting: false });
                });
            });
        }
    }
    onShow = (data) => {
        this.term.value(data.hocKy || '');
        this.year.value(data.namHoc || '');
        this.tuNgay.value(data.tuNgay || '');
        this.denNgay.value(data.denNgay || '');
        this.loaiDaoTao.value(data.loaiDaoTao || '');
        this.bacDaoTao.value(data.bacDaoTao || '');
        this.namTuyenSinh.value(data.namTuyenSinh || '');
    }

    onCreateListDownLoad = () => {
        this.tachLoaiPhi.show();
    }

    render() {
        let { totalStudents = 0, totalTransactions = 0, totalInvoices = 0, amountByBank = {}, amountByEduLevel = {}, amountByEduMethod = {}, totalCurrentMoney = 0,
            totalCancelInvoices = 0, amountPaid = 0, amountNotPaid = 0, amountByDepartment = {}, totalByDate = {}, totalInvoiceByDate = {} } = this.state?.statistic || {},
            { hocPhiNamHoc, hocPhiHocKy } = this.state?.settings || {};
        const sortByDate = function (a, b) {
            if (a.split('/').reverse().join('/') > b.split('/').reverse().join('/')) {
                return 1;
            }
            return -1;
        };
        return this.renderPage({
            title: 'Thống kê',
            icon: 'fa fa-table',
            header: <>
                <FormSelect ref={e => this.year = e} style={{ width: '100px', marginBottom: '0', marginRight: 10 }} placeholder='Năm học' data={yearDatas()} onChange={() => this.changeAdvancedSearch()} />
                <FormSelect ref={e => this.term = e} style={{ width: '100px', marginBottom: '0' }} placeholder='Học kỳ' data={termDatas} onChange={() => this.changeAdvancedSearch()} />
            </>,
            advanceSearch: <div className='row'>
                {/* <FormSelect ref={e => this.namTuyenSinh = e} label='Năm tuyển sinh' data={SelectAdapter_FwNamTuyenSinh} className='col-md-4' required /> */}
                <FormSelect ref={e => this.bacDaoTao = e} label='Bậc đào tạo' data={SelectAdapter_DmSvBacDaoTao} className='col-md-6' allowClear />
                <FormSelect ref={e => this.loaiDaoTao = e} label='Hệ đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTao} className='col-md-6' allowClear />
                <FormSelect ref={e => this.khoa = e} label='Khoa' data={SelectAdapter_DmDonViFaculty_V2} className='col-md-6' allowClear />
                <FormSelect ref={e => this.nganh = e} label='Ngành' data={SelectAdapter_DtNganhDaoTao} className='col-md-6' allowClear />
                <FormDatePicker ref={e => this.tuNgay = e} className='col-md-6' label='Từ ngày' allowClear />
                <FormDatePicker ref={e => this.denNgay = e} className='col-md-6' label='Đến ngày' allowClear />
                <div className='col-md-12 d-flex justify-content-end' style={{ gap: 10 }}>
                    <button className='btn btn-danger' onClick={e => e.preventDefault() || this.changeAdvancedSearch(false, true)}><i className='fa fa-lg fa-times' />Xóa tìm kiếm</button>
                    <button className='btn btn-success' onClick={e => e.preventDefault() || this.changeAdvancedSearch()}><i className='fa fa-lg fa-search' onClick={e => e.preventDefault() || this.changeAdvancedSearch()} />Tìm kiếm</button>
                </div>
            </div>,
            buttons: [{ className: 'btn-info', icon: 'fa-arrows-alt', tooltip: 'Khác', onClick: e => e.preventDefault() || this.props.history.push('/user/finance/statistic/khac') }],
            breadcrumb: ['Thống kê'],
            content: <div className='row'>
                <div className='col-lg-4'>
                    <NumberIcon type='primary' icon='fa-users' title='Tổng học viên thu' value={totalStudents || 0} />
                </div>
                <div className='col-lg-4'>
                    <NumberIcon type='primary' icon='fa-exchange' title='Tổng giao dịch' value={totalTransactions || 0} className='form-group col-lg-3' />
                </div>
                <div className='col-lg-4'>
                    <NumberIcon type='primary' icon='fa-money' title='Tổng thu' value={totalCurrentMoney || 0} className='form-group col-lg-3' />
                </div>
                <div className='col-lg-4'>
                    <NumberIcon type='primary' icon='fa-bars' title='Tổng hóa đơn' value={totalInvoices || 0} />
                </div>
                <div className='col-lg-4'>
                    <NumberIcon type='primary' icon='fa-ban' title='Hóa đơn đã hủy' value={totalCancelInvoices || 0} />
                </div>
                <div className='col-lg-4'>
                    <NumberIcon type='primary' icon='fa-list-alt' title='Hóa đơn phát hành' value={totalInvoices - totalCancelInvoices || 0} />
                </div>

                <div className='col-lg-12'>
                    <div className='tile'>
                        <h5 className='tile-title'>Số liệu {hocPhiNamHoc || ''} {hocPhiNamHoc ? ' - ' + (parseInt(hocPhiNamHoc) + 1) : ''}, HK{hocPhiHocKy || ''}</h5>
                        <div className='col-lg-12 row'>
                            <p className='col-md-4'>Tổng học viên: <b>{totalStudents}</b></p>
                            <p className='col-md-4'>Đã thanh toán đủ: <b>{amountPaid}</b></p>
                            <p className='col-md-4'>Chưa thanh toán: <b>{amountNotPaid}</b></p>
                            <p className='col-md-4'>Các ngân hàng thanh toán: <b>{Object.keys(amountByBank).join(', ')}</b></p>
                            <p className='col-md-4'>Các bậc đào tạo: <b>{Object.keys(amountByEduLevel).join(', ')}</b></p>
                            <p className='col-md-4'>Các hệ đào tạo: <b>{Object.keys(amountByEduMethod).join(', ')}</b></p>
                            <p className='col-md-4'>Tổng hóa đơn: <b>{totalInvoices}</b></p>
                            <p className='col-md-4'>Hóa đơn đã hủy: <b>{totalCancelInvoices}</b></p>
                            <p className='col-md-4'>Hóa đơn phát hành: <b>{totalInvoices - totalCancelInvoices}</b></p>
                        </div>

                        <div className='justify-content-center col-lg-15 row' style={{ gap: 10 }}>
                            <button className='btn btn-info col-md-3' onClick={e => e.preventDefault() || this.props.history.push('/user/finance/hoc-phi')}><i className='fa fa-lg fa-child' />Tới trang Học phí</button>
                            <button className='btn btn-info col-md-3' onClick={e => e.preventDefault() || this.props.history.push('/user/finance/danh-sach-giao-dich')}><i className='fa fa-lg fa-money' />Tới trang Giao dịch</button>
                            <button className='btn btn-info col-md-3' onClick={e => e.preventDefault() || this.props.history.push('/user/finance/invoice')}><i className='fa fa-lg fa-money' />Tới trang Hóa đơn</button>
                            <button className='btn btn-success col-md-3' onClick={e => e.preventDefault() || T.download(`/api/khtc/danh-sach-giao-dich/download-psc?filter=${T.stringify({})}`)}><i className='fa fa-lg fa-download' />Tải xuống Danh sách giao dịch</button>
                            <button className='btn btn-success col-md-3' onClick={e => e.preventDefault() || T.download(`/api/khtc/hoc-phi/download-excel?filter=${T.stringify({})}`)}><i className='fa fa-lg fa-download' />Tải xuống Học phí</button>
                            <button className='btn btn-success col-md-3' onClick={e => e.preventDefault() || this.onCreateListDownLoad()}><i className='fa fa-lg fa-download' />Tải xuống Danh sách đóng học phí</button>
                        </div>
                    </div>
                </div>
                <ChartArea className='col-lg-6' title='Tổng quan' chartType='doughnut' data={{
                    labels: ['Chưa đóng', 'Đã đóng'],
                    datas: {
                        'Số lượng': [amountNotPaid, amountPaid]
                    }
                }} aspectRatio={2} hideMinimize />
                <ChartArea className='col-lg-6' title='Ngân hàng' chartType='pie' data={{
                    labels: Object.keys(amountByBank),
                    datas: {
                        'Số lượng': Object.keys(amountByBank).map(item => amountByBank[item])
                    },
                }} aspectRatio={2} hideMinimize />

                <ChartArea className='col-lg-6' title='Bậc đào tạo' chartType='bar' data={{
                    labels: Object.keys(amountByEduLevel),
                    datas: {
                        'Số lượng': Object.keys(amountByEduLevel).map(item => amountByEduLevel[item])
                    }
                }} aspectRatio={2} hideMinimize />

                <ChartArea className='col-lg-6' title='Hệ đào tạo' chartType='bar' data={{
                    labels: Object.keys(amountByEduMethod),
                    datas: {
                        'Số lượng': Object.keys(amountByEduMethod).map(item => amountByEduMethod[item])
                    }
                }} aspectRatio={2} hideMinimize />

                <ChartArea className='col-lg-12' title='Ngành học' chartType='bar' data={{
                    labels: Object.keys(amountByDepartment),
                    datas: {
                        'Học viên': Object.keys(amountByDepartment).map(item => amountByDepartment[item])
                    },
                }} aspectRatio={3} hideMinimize />

                <ChartArea className='col-lg-12' title='Số giao dịch theo ngày' chartType='line' data={{
                    labels: Object.keys(totalByDate).sort(sortByDate),
                    datas: {
                        'Số giao dịch': Object.keys(totalByDate).sort(sortByDate).map(item => totalByDate[item])
                    },
                    colors: DefaultColors.orange
                }} aspectRatio={3} hideMinimize />
                <ChartArea className='col-lg-12' title='Số hóa đơn theo ngày' chartType='line' data={{
                    labels: Object.keys(totalInvoiceByDate).sort(sortByDate),
                    datas: {
                        'Số hóa đơn': Object.keys(totalInvoiceByDate).sort(sortByDate).map(item => totalInvoiceByDate[item]),
                    },
                    colors: DefaultColors.yellow,
                }} aspectRatio={3} hideMinimize />
                <TachLoaiPhi ref={e => this.tachLoaiPhi = e} ></TachLoaiPhi>
            </div>
        });
    }
}

