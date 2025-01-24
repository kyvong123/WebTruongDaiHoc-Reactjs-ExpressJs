import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { getDtLichSuDkhpPage, deleteDtLichSuDkhp } from 'modules/mdDaoTao/dtLichSuDkhp/redux';
import { AdminPage, FormTabs, TableCell, FormTextBox, renderTable, renderDataTable, FormSelect, TableHead, FormDatePicker } from 'view/component/AdminPage';
import { getDtDangKyHocPhanByStudent } from 'modules/mdDaoTao/dtDangKyHocPhan/redux';
import { getStudentInfo, getLichSuDKHPStudent, getCtdtStudent } from './redux';
import { getScheduleSettings } from 'modules/mdDaoTao/dtSettings/redux';
import { getDiem } from 'modules/mdDaoTao/dtMoPhongDangKy/redux';
import AddHocPhanModal from './addHocPhanModal';
import Pagination from 'view/component/Pagination';
import { getStudentQuyetDinhAdmin } from './redux';
import { Tooltip } from '@mui/material';
import AddModal from 'modules/mdCongTacSinhVien/svManageQuyetDinh/modal/addModal';
import { getStudentAdmin } from 'modules/mdCongTacSinhVien/fwStudents/redux';
import { getCtdt, getSoQuyetDinhRaCuoi } from 'modules/mdCongTacSinhVien/svManageQuyetDinh/redux';
import { getDtChungChiSinhVienAll } from 'modules/mdDaoTao/dtChungChiSinhVien/redux';
import CertModal from 'modules/mdSinhVien/svChungChi/CertModal';
import BangDiemSection from 'modules/mdDaoTao/dtMoPhongDangKy/section/BangDiemSection';

class StudentEditPage extends AdminPage {
    state = { dataSinhVien: null, listHocPhan: [], filter: {}, lichSuDangKy: [], filterLS: {}, sortTerm: 'thoiGianThacTac_DESC', isDev: false, mucCha: {}, mucCon: {}, listCtdt: [], dataDiem: [] }
    defaultSortTerm = 'thoiGianThacTac_DESC'
    fullData = []
    thaoTac = [
        { id: 'A', text: 'Đăng ký mới' },
        { id: 'D', text: 'Hủy đăng ký' },
        { id: 'C', text: 'Chuyển lớp' },
        { id: 'H', text: 'Hoàn tác' }
    ]

    componentDidMount() {
        const route = T.routeMatcher('/user/dao-tao/students/edit/:mssv'),
            mssv = route.parse(window.location.pathname)?.mssv;

        let permissions = this.props.system.user.permissions;
        this.setState({ isDev: permissions.includes('developer:login') });

        if (mssv) {
            this.props.getStudentInfo(mssv, data => {
                this.initData(data);
                let { namHoc, hocKy } = data.sems,
                    { namTuyenSinh, maNganh, loaiHinhDaoTao, maCtdt, mucCha, mucCon } = data.item;
                this.namHoc?.value(namHoc);
                this.hocKy?.value(hocKy);
                this.namHocLS?.value(namHoc);
                this.hocKyLS?.value(hocKy);
                this.setState({
                    dataSinhVien: data, mssv,
                    curNamHoc: namHoc, curHocKy: hocKy, mucCha, mucCon,
                    filter: { ...this.state.filter, khoaSinhVien: namTuyenSinh, nganh: maNganh, loaiHinhDaoTao, maCtdt },
                    filterLS: { namHoc, hocKy, userMssv: mssv }
                }, () => {
                    this.props.getStudentQuyetDinhAdmin(undefined, undefined, data.emailTruong, { kieuQuyetDinh: '', isDeleted: '0', ks_mssv: mssv });
                    this.getHocPhan();
                    this.getPage(undefined, undefined, '');
                    this.props.getCtdtStudent(this.state.filter, listCtdt => {
                        this.setState({ listCtdt });
                    });
                    getDiem(mssv, { isShowDiem: 1 }, data => this.setState({ dataDiem: data.dataDiem }));
                    this.props.getDtChungChiSinhVienAll(mssv, listChungChi => this.setState({ listChungChi }));
                    this.bangDiem.setValue(mssv, 1);
                });
            });
        }
    }

    getHocPhan = () => this.props.getDtDangKyHocPhanByStudent(this.state.mssv, {}, listHocPhan => this.setState({ listHocPhan }));


    getPage = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filterLS, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getDtLichSuDkhpPage(pageN, pageS, pageC, filter, done);
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filterLS: { ...this.state.filterLS, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    initData = (data) => {
        this.tab.tabClick(null, 0);
        if (data && data.item) {
            let item = data.item;
            this.mssv.value(item.mssv || '');
            this.ho.value(item.ho || '');
            this.ten.value(item.ten || '');
            this.ngaySinh.value(item.ngaySinh || '');

            this.maCtdt.value(item.maCtdt || '');
            this.gioiTinh.value(item.gioiTinh == 1 ? 'Nam' : 'Nữ');
            this.he.value(item.loaiHinhDaoTao || '');
            this.lop.value(item.lop || '');
            this.tinhTrang.value(item.tinhTrangSinhVien || '');
            this.khoa.value(item.tenKhoa || '');
            this.nganh.value(item.tenNganh || '');
            this.khoaSv?.value(item.khoaSinhVien || 0);

            this.emailCaNhan?.value(item.emailCaNhan || 0);
            this.emailTruong?.value(item.emailTruong || 0);
            this.dienThoaiCaNhan?.value(item.dienThoaiCaNhan || 0);
            this.tenCha.value(item.tenCha || '');
            this.tenMe.value(item.tenMe || '');
            this.sdtCha.value(item.sdtCha || '');
            this.sdtMe.value(item.sdtMe || '');
            this.hoTenNguoiLienLac.value(item.hoTenNguoiLienLac || '');
            this.sdtNguoiLienLac.value(item.sdtNguoiLienLac || '');
        }
        if (data && data.sems) {
            this.setState({ semester: data.sems });
        }
    }

    studentInfo = () => {
        let { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.dataSinhVien && this.props.dataSinhVien.quyetDinhPage ?
            this.props.dataSinhVien.quyetDinhPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null },
            pageCondition = this.state.dataSinhVien?.emailTruong;
        return (
            <>
                <div className='row'>
                    <h4 className='form-group col-md-12'>Thông tin sinh viên</h4>

                    <div className='form-group col-md-12'>
                        <div className='row'>
                            <FormTextBox ref={e => this.ho = e} label='Họ và tên lót' className='form-group col-md-3' readOnly />
                            <FormTextBox ref={e => this.ten = e} label='Tên' className='form-group col-md-3' readOnly />
                            <FormTextBox ref={e => this.mssv = e} label='Mã số sinh viên' className='form-group col-md-3' readOnly />
                            <FormDatePicker ref={e => this.ngaySinh = e} label='Ngày sinh' type='date-mask' className='form-group col-md-3' readOnly />

                            <FormTextBox ref={e => this.he = e} label='Hệ đào tạo' className='form-group col-md-3' readOnly />
                            <FormTextBox ref={e => this.khoa = e} label='Khoa' className='form-group col-md-3' readOnly />
                            <FormTextBox ref={e => this.khoaSv = e} label='Khóa sinh viên' className='form-group col-md-3' readOnly />
                            <FormTextBox ref={e => this.lop = e} label='Lớp' className='form-group col-md-3' readOnly />

                            <FormTextBox ref={e => this.nganh = e} label='Ngành' className='form-group col-md-3' readOnly />
                            <FormTextBox ref={e => this.maCtdt = e} label='Chương trình đào tạo' className='form-group col-md-3' readOnly />
                            <FormTextBox ref={e => this.tinhTrang = e} label='Tình trạng sinh viên' className='form-group col-md-3' readOnly />
                            <FormTextBox ref={e => this.gioiTinh = e} label='Giới tính' className='form-group col-md-3' readOnly />
                        </div>
                    </div>
                    <div className='form-group col-md-12'>
                        <div className='row'>
                            <FormTextBox ref={e => this.dienThoaiCaNhan = e} label='Điện thoại cá nhân' className='form-group col-md-3' type='phone' readOnly />
                            <FormTextBox ref={e => this.emailCaNhan = e} label='Email cá nhân' className='form-group col-md-3' readOnly />
                            <FormTextBox ref={e => this.emailTruong = e} label='Email trường' className='form-group col-md-6' readOnly />

                            <FormTextBox ref={e => this.tenCha = e} label='Họ và tên cha' className='form-group col-md-3' readOnly />
                            <FormTextBox ref={e => this.sdtCha = e} label='Số điện thoại cha' className='form-group col-md-3' type='phone' readOnly />

                            <FormTextBox ref={e => this.tenMe = e} label='Họ và tên mẹ' className='form-group col-md-3' readOnly />
                            <FormTextBox ref={e => this.sdtMe = e} label='Số điện thoại mẹ' className='form-group col-md-3' readOnly />

                            <FormTextBox ref={e => this.hoTenNguoiLienLac = e} label='Họ và tên người liên lạc' className='form-group col-md-6' readOnly />
                            <FormTextBox ref={e => this.sdtNguoiLienLac = e} label='Số điện thoại' className='form-group col-md-6' type='phone' readOnly />
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className='tile-title'>Lịch sử quyết định</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }} className='mb-3'>
                        <Pagination style={{ position: '', bottom: '', width: '' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                            getPage={this.props.getStudentQuyetDinhAdmin} />
                    </div>
                    {renderTable({
                        getDataSource: () => list ? list.filter(item => item.isDeleted == 0) : [],
                        renderHead: () => (
                            <tr>
                                {/* <th style={{ width: 'auto', textAlign: 'center' }}>#</th> */}
                                <th style={{ width: 'auto', textAlign: 'center' }}>Mã</th>
                                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Số quyết định</th>
                                <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Tình trạng</th>
                                <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Loại quyết định</th>
                                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày xử lý</th>
                                <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Người xử lý</th>
                                <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Ngày ký</th>
                                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                            </tr>
                        ),
                        renderRow: (item, index) => (
                            <tr key={`qd${index}`}>
                                {/* <TableCell type='number' content={pageSize * pageNumber + index + 1 - pageSize} /> */}
                                <TableCell type='text' content={item.maDangKy} />
                                <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.soQuyetDinh} />
                                <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tinhTrangSinhVien != null && (item.tinhTrangSinhVien)} />
                                <TableCell type='text' contentClassName='multiple-lines-3' content={item.tenFormDangKy} />
                                <TableCell type='date' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.thoiGianXuLy ? item.thoiGianXuLy : ''} dateFormat='dd/mm/yyyy HH:MM:ss' />
                                <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.hoNguoiXuLy != null && (item.hoNguoiXuLy + ' ' + item.tenNguoiXuLy)} />
                                <TableCell type='date' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ngayKy != null && (item.ngayKy)} dateFormat='dd/mm/yyyy HH:MM:ss' />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<>
                                    <Tooltip title='Xem chi tiết' arrow>
                                        <button className='btn btn-info' onClick={e => {
                                            e.preventDefault();
                                            this.quyetDinhAddModal.show(item);
                                        }}>
                                            <i className='fa fa-lg fa-edit' />
                                        </button>
                                    </Tooltip>
                                </>
                                }>
                                </TableCell>
                            </tr>
                        ),
                    })}
                    <AddModal ref={e => this.quyetDinhAddModal = e} readOnly={true} create={this.props.createStudentManageQuyetDinh} update={this.props.updateStudentManageQuyetDinh} getSoQDCuoi={this.props.getSoQuyetDinhRaCuoi} getDtChuongTrinhDaoTaoTheoNganh={this.props.getDtChuongTrinhDaoTaoTheoNganh} getCtdt={this.props.getCtdt} getSvInfo={this.props.getStudentAdmin} />
                </div>
            </>
        );
    }

    renderDanhSachHP = () => {
        return <div className='row'>
            <h4 className='col-md-12'>Danh sách học phần</h4>
            <div className='col-md-12'>
                {this.listHocPhan()}
            </div>
        </div>;
    }

    listHocPhan = () => renderTable({
        getDataSource: () => Object.keys((this.state.listHocPhan || []).groupBy('namHoc')),
        emptyTable: 'Không có thông tin học phần đăng ký',
        header: 'thead-light',
        stickyHead: false,
        multipleTbody: true,
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto' }} colSpan={2}>#</th>
                <th style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center' }}>Mã học phần</th>
                <th style={{ width: '35%', whiteSpace: 'nowrap', textAlign: 'center' }}>Tên môn học</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Phòng</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thứ</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tiết</th>
                <th style={{ width: '25%', whiteSpace: 'nowrap', textAlign: 'center' }}>Giảng viên</th>
                <th style={{ width: '25%', whiteSpace: 'nowrap', textAlign: 'center' }}>Trợ giảng</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Ngày bắt đầu</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Ngày kết thúc</th>
                {/* <th style={{ width: 'auto' }}>Thao tác</th> */}
                {/* <th style={{ width: 'auto' }}>Sĩ số</th> */}
            </tr>
        ),
        renderRow: (namHoc, index) => {
            const rows = [];
            let dataNamHoc = this.state.listHocPhan.groupBy('namHoc')[namHoc],
                dataHocKy = dataNamHoc.groupBy('hocKy');
            rows.push(
                <tr key={`nhkh${index}`}>
                    <th colSpan={11} style={{ backgroundColor: '#fff' }}>Năm học {namHoc}</th>
                </tr>
            );
            Object.keys(dataHocKy).sort((a, b) => a - b ? -1 : 0).map((hocKy) => {
                let list = dataHocKy[hocKy],
                    listMaHocPhan = Object.keys(list.groupBy('maHocPhan'));
                listMaHocPhan.map((item, index) => {
                    let listHocPhan = list.groupBy('maHocPhan')[item] || [],
                        rowSpan = listHocPhan.length;
                    if (rowSpan) {
                        for (let i = 0; i < rowSpan; i++) {
                            const hocPhan = listHocPhan[i];
                            if (i == 0) {
                                rows.push(
                                    <tr key={`dkhp${rows.length}${index}`}>
                                        {index == 0 && <th rowSpan={dataHocKy[hocKy].length} style={{ backgroundColor: '#fff' }}>HK{hocKy}</th>}
                                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={index + 1} rowSpan={rowSpan} />
                                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={hocPhan.maHocPhan} rowSpan={rowSpan} />
                                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={T.parse(hocPhan.tenMonHoc, { vi: '' })?.vi} rowSpan={rowSpan} />
                                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.phong} />
                                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.thu} />
                                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.tietBatDau ? `${hocPhan.tietBatDau} - ${parseInt(hocPhan.tietBatDau) + parseInt(hocPhan.soTietBuoi) - 1}` : ''} />
                                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={hocPhan.giangVien && hocPhan.giangVien.length ? hocPhan.giangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={hocPhan.troGiang && hocPhan.troGiang.length ? hocPhan.troGiang.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                        <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.ngayBatDau} rowSpan={rowSpan} />
                                        <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.ngayKetThuc} rowSpan={rowSpan} />
                                    </tr>
                                );
                            } else {
                                rows.push(<tr key={`dkhp${rows.length}${index}`}>
                                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.phong} />
                                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.thu} />
                                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.tietBatDau ? `${hocPhan.tietBatDau} - ${hocPhan.tietBatDau + hocPhan.soTietBuoi - 1}` : ''} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.giangVien && hocPhan.giangVien.length ? hocPhan.giangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.troGiang && hocPhan.troGiang.length ? hocPhan.troGiang.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                </tr>);
                            }
                        }
                    }
                });
            });
            return rows;
        }
    });

    xoaLichSu = (item) => {
        T.confirm('Cảnh báo', 'Bạn có chắc muốn xóa lịch sử đăng ký học phần này không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                T.alert('Đang xử lý', 'warning', false, null, true);
                this.props.deleteDtLichSuDkhp(item.id, () => {
                    T.alert('Xóa lịch sử đăng ký học phần thành công', 'success', false, 1000);
                });
            }
        });
    }

    renderLichSuDKHP = () => {
        const { namHoc, hocKy } = this.state.filterLS;
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.dtLichSuDkhp?.page || { pageNumber: 1, pageSize: 50, pageTotal: 0, totalItem: 0, list: null };

        let table = renderDataTable({
            data: list,
            emptyTable: (namHoc && hocKy) ? `Không có dữ liệu lịch sử đăng ký học phần cho HK${hocKy}, năm học ${namHoc}` : '',
            header: 'thead-light',
            stickyHead: list && list.length > 12,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Mã học phần' keyCol='maHocPhan' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên môn học' keyCol='tenMon' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Người thao tác' keyCol='nguoiThaoTac' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thời gian thao tác' keyCol='thoiGianThaoTac' />
                    <TableHead style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thao tác' keyCol='thaoTac' onKeySearch={this.handleKeySearch} onSort={this.onSort} data={this.thaoTac} typeSearch='select' />
                    <TableHead style={{ width: '35%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ghi chú' keyCol='ghiChu' />
                    {this.state.isDev ? <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}></th> : <></>}
                </tr>),
            renderRow: (item, index) => {
                let indexOfItem = (pageNumber - 1) * pageSize + index + 1;
                return (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'right' }} content={indexOfItem} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.maHocPhan} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.userModified} />
                        <TableCell type='date' dateFormat='dd/mm/yyyy HH:MM:ss' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.timeModified} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                            item.thaoTac == 'A' ? (
                                <div style={{ color: 'green' }}>
                                    <i className='fa fa-lg fa-check-circle-o' />&nbsp; Đăng ký mới </div>
                            ) : (
                                item.thaoTac == 'D' ? (
                                    <div style={{ color: 'red' }}>
                                        <i className='fa fa-lg fa-times-circle-o' />&nbsp; Hủy đăng ký </div>
                                ) : (
                                    item.thaoTac == 'H' ? (
                                        <div style={{ color: 'orange' }}>
                                            <i className='fa fa-lg fa-undo' />&nbsp; Hoàn tác </div>
                                    ) : (
                                        item.thaoTac == 'U' ? (
                                            <div style={{ color: '#DD58D6' }}>
                                                <i className='fa fa-lg fa-undo' />&nbsp; Đổi mã loại đăng ký </div>
                                        ) : (
                                            <div style={{ color: 'blue' }}>
                                                <i className='fa fa-lg fa-repeat' />&nbsp; Chuyển lớp </div>
                                        )
                                    )
                                )
                            )
                        } />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={
                            item.thaoTac == 'C' ? `Sinh viên được chuyển từ lớp học phần ${item.ghiChu}`
                                : (item.thaoTac != 'A' && item.thaoTac != 'D' && item.thaoTac != 'H' && item.thaoTac != 'U' ? item.thaoTac : item.ghiChu)
                        } />
                        {this.state.isDev ? <TableCell type='buttons' content={item} permission={{ delete: true }} onDelete={() => this.xoaLichSu(item)} /> : <></>}
                    </tr>
                );
            }
        });
        return (<>
            <div className='row'>
                <FormSelect ref={(e) => (this.namHocLS = e)} className='col-md-6' label='Năm học' data={SelectAdapter_SchoolYear} onChange={(value) =>
                    this.setState({
                        filterLS: { ...this.state.filterLS, namHoc: value?.text || '' }
                    }, () => this.getPage())
                } allowClear />
                <FormSelect ref={(e) => (this.hocKyLS = e)} className='col-md-6' label='Học kỳ' data={SelectAdapter_DtDmHocKy} onChange={(value) =>
                    this.setState({
                        filterLS: { ...this.state.filterLS, hocKy: value?.id || '' }
                    }, () => this.getPage())
                } allowClear />
            </div>
            <div>{table}</div>
            <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem }} getPage={this.getPage} pageRange={5} />
        </>);
    }

    chuongTrinhDaoTao = () => {
        const { mucCha, mucCon, listCtdt } = this.state;
        let table = (data) => renderTable({
            getDataSource: () => data,
            emptyTable: 'Không có môn trong chương trình đào tạo',
            header: 'thead-light',
            stickyHead: false,
            renderHead: () => (
                <>
                    <tr>
                        <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle', border: '1px solid #c2bfbc' }}>#</th>
                        <th rowSpan='2' style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle', border: '1px solid #c2bfbc' }}>Mã môn học</th>
                        <th rowSpan='2' style={{ width: '70%', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle', border: '1px solid #c2bfbc' }}>Tên môn học</th>
                        <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle', border: '1px solid #c2bfbc' }}>Tự chọn</th>
                        <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle', border: '1px solid #c2bfbc' }}>Tín chỉ</th>
                        <th rowSpan='1' colSpan='3' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', border: '1px solid #c2bfbc' }}>Số tiết</th>
                        <th rowSpan='2' style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle', border: '1px solid #c2bfbc' }}>Học kỳ dự kiến</th>
                        <th rowSpan='2' style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle', border: '1px solid #c2bfbc' }}>Năm học dự kiến</th>
                        <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle', border: '1px solid #c2bfbc' }}>Kết quả học tập</th>
                    </tr>
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center', border: '1px solid #c2bfbc' }}>LH</th>
                        <th style={{ width: 'auto', textAlign: 'center', border: '1px solid #c2bfbc' }}>TH</th>
                        <th style={{ width: 'auto', textAlign: 'center', border: '1px solid #c2bfbc' }}>Tổng</th>
                    </tr>
                </>
            ),
            renderRow: (item, index) => {
                let listDiem = this.state.dataDiem.filter(i => i.maMonHoc == item.maMonHoc);
                listDiem = listDiem.map(i => {
                    const { diem, configQC, diemDat } = i,
                        threshold = Number(diemDat || 5),
                        diemDacBiet = configQC.find(i => i.ma == diem['TK']);
                    let isPass = 0, isDiemDacBiet = 0;
                    if (diemDacBiet) {
                        let { tinhTinChi } = diemDacBiet;
                        tinhTinChi = Number(tinhTinChi);
                        if (tinhTinChi) {
                            isPass = 1;
                        }
                        isDiemDacBiet = 1;
                    } else {
                        if (parseFloat(diem['TK']) >= threshold) {
                            isPass = 1;
                        }
                    }
                    return { isPass, isDiemDacBiet, diem: diem['TK'] };
                });

                let text = listDiem.every(i => i.diem == null) ? <i className='fa fa-lg fa-info text-info'> Đã học</i> : (listDiem.find(i => i.isPass) ? <i className='fa fa-lg fa-check-circle text-success'> Đạt</i> : <i className='fa fa-lg fa-times-circle text-danger'> Chưa đạt</i>);
                return (
                    <React.Fragment key={`${index}-${item.group}`}>
                        <tr style={{ display: item.idx == 0 && item.childText ? '' : 'none' }}>
                            <td colSpan={10}><b>{item.childText?.text}</b></td>
                        </tr>
                        <tr style={{ backgroundColor: 'white', display: (item.idx != 0 || item.idx == null) ? '' : 'none' }}>
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={item.index + 1} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.maMonHoc} />
                            <TableCell style={{ textAlign: 'left' }} content={T.parse(item.tenMonHoc)?.vi} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.loaiMonHoc ? <i className='fa fa-fw fa-lg fa-check' /> : ''} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.soTinChi} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tietLH} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tietTH} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tongTiet} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.hocKyDuKien} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.namHocDuKien} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={listDiem.length ? text : ''} />
                        </tr>
                    </React.Fragment>
                );
            },
        });

        return <div>
            <h4 className='col-md-12'>Thông tin chương trình đào tạo</h4>
            {
                Object.keys(mucCha).map((key, index) => {
                    const childs = mucCon[key],
                        { text, id } = mucCha[key];

                    let datas = [];

                    if (childs && childs.length) {
                        childs.forEach(child => {
                            datas.push({ idx: 0, childText: child.value });
                            listCtdt.filter(i => i.maKhoiKienThuc == id && i.maKhoiKienThucCon == child.id).forEach((mon, index) => {
                                datas.push({ ...mon, index, group: `${key}-${child.id}` });
                            });
                        });
                    } else {
                        listCtdt.filter(i => i.maKhoiKienThuc == id).forEach((mon, index) => {
                            datas.push({ ...mon, index, group: key });
                        });
                    }

                    return <div className='tile' key={index}>
                        <div>
                            <h4>{text}</h4>
                        </div>
                        {table(datas)}
                    </div>;
                })
            }
        </div>;
    }

    chungChiSinhVien = () => {
        const mapperStatus = {
            0: { icon: 'fa fa-lg fa-file-o', text: 'Đang xử lý', color: 'orange' },
            1: { icon: 'fa fa-lg fa-check-circle', text: 'Hoàn tất', color: 'green' },
            null: { icon: '', text: '', color: '' },
        };
        let table = renderTable({
            getDataSource: () => this.state.listChungChi,
            emptyTable: 'Sinh viên chưa nộp chứng chỉ',
            header: 'thead-light',
            stickyHead: false,
            renderHead: () => (<tr>
                <TableHead content='#' style={{ width: 'auto', whiteSpace: 'nowrap' }} />
                <TableHead content='Loại chứng chỉ' style={{ minWidth: '150px', whiteSpace: 'nowrap', textAlign: 'center' }} />
                <TableHead content='Chứng chỉ' style={{ minWidth: '100px', whiteSpace: 'nowrap', textAlign: 'center' }} />
                <TableHead content='Trình độ' style={{ minWidth: '150px', whiteSpace: 'nowrap', textAlign: 'center' }} />
                <TableHead content='Điểm' style={{ minWidth: '150px', whiteSpace: 'nowrap', textAlign: 'center' }} />
                <TableHead content='Ngày cấp' style={{ minWidth: '120px', whiteSpace: 'nowrap', textAlign: 'center' }} />
                <TableHead content='Nơi cấp' style={{ minWidth: '150px', whiteSpace: 'nowrap', textAlign: 'center' }} />
                <TableHead content='Điều kiện' style={{ minWidth: '150px', whiteSpace: 'nowrap', textAlign: 'center' }} />
                <TableHead content='Ghi chú' style={{ minWidth: '100px', whiteSpace: 'nowrap', textAlign: 'center' }} />
                <TableHead content='Thời gian thao tác cuối' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} />
                <TableHead content='Thời gian đăng ký' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} />
                <TableHead content='Tình trạng' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} />
                <TableHead content='Ảnh minh chứng' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} />
            </tr>
            ),
            renderRow: (item, index) => {
                let dieuKien = item.chungChiKhac ? (item.isTotNghiep ? 'Đủ điều kiện tốt nghiệp' : 'Không đủ điều kiện tốt nghiệp') :
                    (item.isNotQualified ? 'Không đủ điều kiện' : <div>Đủ điều kiện sinh viên năm ba{item.isTotNghiep ? <><br />Đủ điều kiện tốt nghiệp</> : ''}</div>);

                const icon = mapperStatus[item.status].icon,
                    text = mapperStatus[item.status].text,
                    color = mapperStatus[item.status].color;

                let score = '';
                if (item.chungChiNgoaiNgu) {
                    score = item.score ? T.parse(item.score) : { score: '' };
                    score['Điểm'] = score.score;
                    delete score.score;
                    score = Object.keys(score).map((item, index) => <span key={item}>{item}: {score[item]}{index % 4 != 3 ? '  ' : <br />}</span>);
                } else {
                    score = item.score;
                }
                return <tr key={`cert-${index}`}>
                    <TableCell content={index + 1} style={{ whiteSpace: 'nowrap', textAlign: 'right' }} />
                    <TableCell content={item.loaiChungChi || 'Ngoại ngữ'} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={`${item.ngoaiNgu ? `${item.ngoaiNgu}: ` : ''}${item.chungChi}`} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.trinhDo} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={score || ''} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.ngayCap} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                    <TableCell content={item.noiCap} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={dieuKien} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.ghiChu} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.timeModified} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                    <TableCell content={item.timeCreated} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={<><i className={icon} />&nbsp; &nbsp;{text}</>} style={{ alignItems: 'center', whiteSpace: 'nowrap', color, fontWeight: 'bolder' }} />
                    <TableCell content={item.fileName} type='buttons' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} >
                        {!!item.fileName && <Tooltip title='Xem ảnh minh chứng' arrow>
                            <button className='btn btn-primary' onClick={e => e.preventDefault() || this.certModal.show({ fileName: item.fileName })}>
                                <i className='fa fa-lg fa-search' />
                            </button>
                        </Tooltip>}
                    </TableCell>
                </tr>;
            },
        });
        return <div>
            <CertModal ref={e => this.certModal = e} />
            <h4 className='col-md-12'>Chứng chỉ sinh viên</h4>
            {table}
        </div>;
    }

    handleChangeNam = value => {
        let namHoc = value ? value.text : null;
        this.setState({ filter: { ...this.state.filter, namHoc } }, () => {
            this.props.getCtdtStudent(this.state.filter, listCtdt => {
                this.setState({ listCtdt });
            });
        });
    }

    handleChangeHocKy = value => {
        let hocKy = value ? value.id : null;
        this.setState({ filter: { ...this.state.filter, hocKy } }, () => {
            this.props.getCtdtStudent(this.state.filter, listCtdt => {
                this.setState({ listCtdt });
            });
        });
    }

    render() {
        const { mssv } = this.state;
        let tabs = [
            { title: 'Thông tin sinh viên', component: this.studentInfo() },
            { title: 'Học phần đăng ký', component: this.renderDanhSachHP() },
            { title: 'Bảng điểm', component: <BangDiemSection ref={e => this.bangDiem = e} mssv={mssv} /> },
            { title: 'Chương trình đào tạo', component: this.chuongTrinhDaoTao() },
            { title: 'Chứng chỉ', component: this.chungChiSinhVien() }
        ];

        if (this.props.system.user.permissions.includes('developer:login')) tabs.push({ title: 'Lịch sử đăng ký', component: this.renderLichSuDKHP() });

        return this.renderPage({
            icon: 'fa fa-user',
            title: 'Điều chỉnh sinh viên',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao/students'>Đào tạo</Link>,
                'Điều chỉnh sinh viên'
            ],
            content: <div>
                <AddHocPhanModal ref={e => this.modal = e} mssv={mssv} getThoiKhoaBieu={this.getHocPhan} getLichSu={this.getPage} />
                <FormTabs id='tabsCanBo' ref={e => this.tab = e} contentClassName='tile' tabs={tabs} />
            </div >,
            backRoute: '/user/dao-tao/students',
            // onCreate: e => e.preventDefault() || this.modal.show({ curNamHoc: this.state.curNamHoc, curHocKy: this.state.curHocKy }),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtLichSuDkhp: state.daoTao.dtLichSuDkhp, dataSinhVien: state.daoTao.dataSinhVien });
const mapActionsToProps = {
    getStudentInfo, getDtDangKyHocPhanByStudent, getLichSuDKHPStudent, getScheduleSettings, getDtLichSuDkhpPage, getCtdtStudent, deleteDtLichSuDkhp,
    getStudentQuyetDinhAdmin, getStudentAdmin, getCtdt, getSoQuyetDinhRaCuoi, getDtChungChiSinhVienAll, getDiem
};
export default connect(mapStateToProps, mapActionsToProps)(StudentEditPage);