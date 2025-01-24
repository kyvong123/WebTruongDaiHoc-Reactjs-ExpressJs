import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, TableCell, renderTable, FormSelect } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
// import { Tooltip } from '@mui/material';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
// import { SelectAdapter_DtNganhDaoTao } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmMonHocAll } from 'modules/mdDaoTao/dmMonHoc/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_DtLopFilter } from 'modules/mdDaoTao/dtLop/redux';
import { SelectAdapter_HocPhan_Custom } from './redux';
import { getTcHocPhiTheoMonPage, capNhatThoiGianThanhToanGiangVien, capNhatThoiGianThanhToanGiangVienLength } from './redux';
import ThanhToanGiangVienModal from './modal/thanhToanGiangVienModal';
import { NumberIcon } from '../tcHocPhi/adminPage';
// import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';

const yearDatas = () => {
    return Array.from({ length: 15 }, (_, i) => {
        const year = i + new Date().getFullYear() - 14;
        return { id: year, text: `${year} - ${year + 1}` };
    });
};

const yearDatasNamTuyenSinh = () => {
    return Array.from({ length: 15 }, (_, i) => {
        const year = i + new Date().getFullYear() - 14;
        return { id: year, text: `${year}` };
    });
};
class HocPhiTheoMonPage extends AdminPage {
    state = { typePage: 0 }

    componentDidMount() {
        T.ready('/user/finance', () => {
            T.onSearch = (searchText) => this.props.getTcHocPhiTheoMonPage(undefined, undefined, searchText || '');
            T.showSearchBox(true);
            this.changeAdvancedSearch(true, false);
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getTcHocPhiTheoMonPage(pageN, pageS, pageC, this.state.filter, done);
    }

    exportExcel = () => {
        const filter = this.state?.filter || {};
        T.handleDownload(`/api/khtc/hoc-phi-theo-mon/download-excel?filter=${T.stringify(filter)}`, 'FAIL.xlsx');
    }

    capNhatThoiGianThanhToanGiangVien = () => {
        const filter = this.state?.filter || {};
        this.props.capNhatThoiGianThanhToanGiangVienLength(T.stringify(filter), length => {
            T.confirm('Xác nhận', `Ngày thanh toán cho giảng viên sẽ được cập nhật cho ${length} sinh viên. Bạn có chắc chắn cập nhật không?`, true, isConfirm => {
                if (isConfirm) {
                    this.props.capNhatThoiGianThanhToanGiangVien(T.stringify(filter), result => {
                        T.notify(`Đã cập nhật cho ${result} sinh viên`, 'success');
                    });
                }
            });
        });
    }

    changeAdvancedSearch = (isInitial = false, isReset = false, done) => {
        let { pageNumber, pageSize, pageCondition } = this.props && this.props.tcHocPhiTheoMon && this.props.tcHocPhiTheoMon.page ? this.props.tcHocPhiTheoMon.page : { pageNumber: 1, pageSize: 50, pageCondition: '' };
        if (pageCondition && (typeof pageCondition == 'string')) {
            T.setTextSearchBox(pageCondition);
        }
        const
            typePage = this.typePage.value(),
            namHoc = this.namHoc.value(),
            hocKy = this.hocKy.value(),
            listHeDaoTaoSv = this.heDaoTaoSv.value().toString(),
            listKhoa = this.khoa.value().toString(),
            listKhoaSinhVienSv = this.khoaSinhVienSv.value().toString(),
            listLopSv = this.lop.value().toString(),
            listHeDaoTaoHocPhan = this.heDaoTaoHocPhan.value().toString(),
            listDonViQuanLy = this.donViQuanLy.value().toString(),
            listKhoaSinhVienHocPhan = this.khoaSinhVienHocPhan.value().toString(),
            listMonHoc = this.monHoc.value().toString(),
            listMaHocPhan = this.hocPhan.value().toString();
        const pageFilter = (isInitial || isReset) ? {} : {
            typePage, namHoc, hocKy, listHeDaoTaoSv, listKhoa, listKhoaSinhVienSv, listLopSv,
            listHeDaoTaoHocPhan, listDonViQuanLy, listKhoaSinhVienHocPhan, listMonHoc, listMaHocPhan
        };
        if (typePage && namHoc && hocKy) {
            this.setState({ typePage, namHoc, hocKy });
        }
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, pageCondition, (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    const { namHoc, hocKy, typePage } = filter;
                    this.setState({ namHoc, hocKy, typePage, filter });
                    this.typePage.value(Number(typePage || 0));
                    this.namHoc.value(namHoc || '');
                    this.hocKy.value(hocKy || '');
                } else if (isReset) {
                    ['heDaoTaoSv', 'khoa', 'khoaSinhVienSv', 'lop', 'heDaoTaoHocPhan', 'donViQuanLy', 'khoaSinhVienHocPhan', 'monHoc', 'hocPhan'].forEach(e => this[e]?.value(''));
                    this.hideAdvanceSearch();
                }
            });
        });
        done && done();
    }

    render() {
        const permission = this.getUserPermission('tcHocPhiTheoMon', ['manage', 'write', 'delete', 'export']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, total, list } = this.props.tcHocPhiTheoMon && this.props.tcHocPhiTheoMon.page ?
            this.props.tcHocPhiTheoMon.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: null };
        let buttons = [];
        permission.export && buttons.push({ type: 'primary', icon: 'fa-file-excel-o', className: 'btn-success', tooltip: 'export', onClick: e => e.preventDefault() || this.exportExcel() });
        permission.write && buttons.push({ type: 'primary', icon: 'fa-table', className: 'btn-secondary', tooltip: 'Cập nhật thanh toán giảng viên', onClick: e => e.preventDefault() || this.thanhToanGv.show(this.state?.filter || {}) });
        let table;
        if (Number(this.state.typePage) == 1) {
            table = renderTable({
                header: 'thead-light',
                emptyTable: 'Không có dữ liệu đợt đóng học phí',
                getDataSource: () => list, stickyHead: true,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Năm học</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Học kỳ</th>
                        <th style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }}>Môn học</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tiết</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Đơn vị quản lý</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Cơ sở</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tổng SV đăng ký</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tổng SV đã đóng</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thơi gian thanh toán GV</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tiền</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Miễn giảm</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Đã đóng</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Còn lại</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Khóa SV</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Hệ đào tạo</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr style={{ background: item.daHoanDongHocPhi == 1 ? '#FEFFDC' : '' }} key={index}>
                        <TableCell content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={`${item.namHoc} - ${item.namHoc + 1}`} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={`HK${item.hocKy}`} />
                        <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} content={`${item.maHocPhan || ''}: ${T.parse(item.tenMonHoc)?.vi || ''}`} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.soTiet || ''} />
                        <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} content={item.donViQuanLy} />
                        <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} content={`${T.parse(item.coSo)?.vi || ''}`} />
                        <TableCell type='number' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tongSvDangKy} />
                        <TableCell type='number' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tongSvDaDong} />
                        <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={item.thoiGianThanhToan} />
                        <TableCell type='number' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.soTien} />
                        <TableCell type='number' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.soTienMienGiam} />
                        <TableCell type='number' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.soTienDaDong} />
                        <TableCell type='number' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.soTienConLai} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.khoaSinhVienHocPhan} />
                        <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} content={item.heDaoTaoHocPhan} />
                    </tr>
                )
            });
        }
        else {
            table = renderTable({
                header: 'thead-light',
                emptyTable: 'Không có dữ liệu đợt đóng học phí',
                getDataSource: () => list, stickyHead: true,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Năm học</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Học kỳ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Sinh viên</th>
                        <th style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }}>Môn học</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tiết</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Đơn vị quản lý</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Cơ sở</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tiền</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Miễn giảm</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Đã đóng</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Còn lại</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Khóa SV</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Lớp</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Hệ đào tạo</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Khoa</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Ngành</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thời gian thanh toán giảng viên</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr style={{ background: item.daHoanDongHocPhi == 1 ? '#FEFFDC' : '' }} key={index}>
                        <TableCell content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={`${item.namHoc} - ${item.namHoc + 1}`} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={`HK${item.hocKy}`} />
                        <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} content={`${item.mssv}: ${item.hoVaTen}`} />
                        <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} content={`${item.maHocPhan || ''}: ${T.parse(item.tenMonHoc)?.vi || ''}`} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.soTiet || ''} />
                        <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} content={item.donViQuanLy} />
                        <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} content={`${T.parse(item.coSo)?.vi || ''}`} />
                        <TableCell type='number' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.soTien} />
                        <TableCell type='number' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.soTienMienGiam} />
                        <TableCell type='number' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.soTienDaDong} />
                        <TableCell type='number' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.soTienConLai} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.khoaSinhVienSv} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.lop} />
                        <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} content={item.heDaoTaoSv} />
                        <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} content={item.khoa} />
                        <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} content={item.nganh} />
                        <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.thoiGianThanhToanGiangVien || ''} />
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Quản lý học phí theo môn học',
            header: <>
                <FormSelect ref={e => this.typePage = e} style={{ width: '150px', marginBottom: '0', marginRight: 10 }} placeholder='Chọn loại hiển thị' data={[{ id: 0, text: 'Theo sinh viên' }, { id: 1, text: 'Theo học phần' }]} onChange={
                    () => this.changeAdvancedSearch()} />
                <FormSelect ref={e => this.namHoc = e} style={{ width: '120px', marginBottom: '0', marginRight: 10 }} placeholder='Năm học' data={yearDatas()?.reverse()} onChange={
                    () => this.changeAdvancedSearch()} />
                <FormSelect ref={e => this.hocKy = e} style={{ width: '100px', marginBottom: '0' }} placeholder='Học kỳ' data={SelectAdapter_DtDmHocKy} onChange={
                    () => this.changeAdvancedSearch()} />
            </>,

            advanceSearch: <div className='row'>
                <FormSelect ref={e => this.heDaoTaoSv = e} label='Hệ đào tạo (SV)' data={SelectAdapter_DmSvLoaiHinhDaoTao} className='col-md-3' allowClear multiple />
                <FormSelect ref={e => this.khoa = e} label='Khoa (SV)' data={SelectAdapter_DmDonViFaculty_V2} className='col-md-3' allowClear multiple />
                <FormSelect ref={e => this.khoaSinhVienSv = e} label='Khóa sinh viên (SV)' data={yearDatasNamTuyenSinh()?.reverse()} className='col-md-3' allowClear multiple />
                <FormSelect ref={e => this.lop = e} label='Lớp' data={SelectAdapter_DtLopFilter()} className='col-md-3' allowClear multiple />
                <FormSelect ref={e => this.heDaoTaoHocPhan = e} label='Hệ đào tạo (HP)' data={SelectAdapter_DmSvLoaiHinhDaoTao} className='col-md-3' allowClear multiple />
                <FormSelect ref={e => this.donViQuanLy = e} label='Đơn vị quản lý' data={SelectAdapter_DmDonViFaculty_V2} className='col-md-3' allowClear multiple />
                <FormSelect ref={e => this.khoaSinhVienHocPhan = e} label='Khóa sinh viên (HP)' data={yearDatasNamTuyenSinh()?.reverse()} className='col-md-3' allowClear multiple />
                <FormSelect ref={e => this.monHoc = e} label='Môn học' data={SelectAdapter_DmMonHocAll()} className='col-md-6' allowClear multiple />
                <FormSelect ref={e => this.hocPhan = e} key={`${this.state.namHoc} - ${this.state.hocKy}`} label='Học phần' data={SelectAdapter_HocPhan_Custom({ namFilter: `${parseInt(this.state.namHoc)} - ${parseInt(this.state.namHoc) + 1}` || null, hocKyFilter: this.state.hocKy || null, sort: 'maHocPhan_ASC' })} className='col-md-6' allowClear multiple />
                <div className='col-md-12 d-flex justify-content-end align-items-center' style={{ gap: 10 }}>
                    <span>Tìm thấy <b>{totalItem}</b> Kết quả</span>
                    <button className='btn btn-danger' onClick={e => e.preventDefault() || this.changeAdvancedSearch(false, true)}><i className='fa fa-lg fa-times' />Xóa tìm kiếm</button>
                    <button className='btn btn-success' onClick={e => e.preventDefault() || this.changeAdvancedSearch()}><i className='fa fa-lg fa-search' />Tìm kiếm</button>
                </div>
            </div>,
            breadcrumb: [
                'Quản lý học phí theo môn học'
            ],
            content: <>
                <div className='row'>
                    <div className='col-md-3'>
                        <NumberIcon type='primary' icon='fa-users' title='Tổng số sinh viên đăng ký' value={total?.totalSinhVien || 0} />
                    </div>
                    <div className='col-md-3'>
                        <NumberIcon type='primary' icon='fa-users' title='Tổng đã đóng' value={total?.totalDaDong || 0} />
                    </div>
                    <div className='col-md-3'>
                        <NumberIcon type='primary' icon='fa-users' title='Tổng chưa đóng' value={total?.totalSinhVien - total?.totalDaDong || 0} />
                    </div>
                    <div className='col-md-3'>
                        <div className='widget-small coloured-icon primary'>
                            <i className='icon fa fa-3x fa-clock-o' />
                            <div className='info'>
                                <h4>Thời gian thanh toán GV</h4>
                                <p style={{ fontWeight: 'bold' }}>{total?.thoiGianThanhToan ? new Date(total.thoiGianThanhToan).ddmmyyyy() : 'Chưa có'}</p>
                            </div>
                        </div>
                    </div>

                    <div className='col-md-3'>
                        <NumberIcon type='info' icon='fa-money' title='Tổng số tiền học phí (VNĐ)' value={total?.totalCurrent || 0} />
                    </div>
                    <div className='col-md-3'>
                        <NumberIcon type='info' icon='fa-money' title='Tổng số tiền đã đóng (VNĐ)' value={total?.totalPaid || 0} />
                    </div>
                    <div className='col-md-3'>
                        <NumberIcon type='info' icon='fa-money' title='Tổng số tiền miễn giảm (VNĐ)' value={total?.totalMienGiam || 0} />
                    </div>
                    <div className='col-md-3'>
                        <NumberIcon type='info' icon='fa-money' title='Tổng số tiền còn lại (VNĐ)' value={total?.totalConLai || 0} />
                    </div>
                    <div className='col-md-12'>
                        <div className='tile'>
                            {table}
                            <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.getPage} />
                        </div>
                    </div>
                </div>
                <ThanhToanGiangVienModal ref={e => this.thanhToanGv = e} getLength={this.props.capNhatThoiGianThanhToanGiangVienLength} update={this.props.capNhatThoiGianThanhToanGiangVien} />
            </>,
            buttons,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tcHocPhiTheoMon: state.finance.tcHocPhiTheoMon });
const mapActionsToProps = { getTcHocPhiTheoMonPage, capNhatThoiGianThanhToanGiangVien, capNhatThoiGianThanhToanGiangVienLength };
export default connect(mapStateToProps, mapActionsToProps)(HocPhiTheoMonPage);