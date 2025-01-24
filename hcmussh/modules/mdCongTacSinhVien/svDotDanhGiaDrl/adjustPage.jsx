import React from 'react';
import AddModal from './addModal';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
// import { SelectAdapter_DtLopFilter } from '../dtLop/redux';
import { getSvDotDanhGiaDrl, getSoLuongSinhVien, getPendingGiaHan, chapNhanKienNghi, tuChoiGiaHan } from './redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_DmDonViFaculty_V3 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { AdminPage, FormTextBox, FormCheckbox, FormSelect, FormDatePicker, renderDataTable, TableCell, FormTabs, TableHead, AdminModal } from 'view/component/AdminPage';
import { updateSvDotDanhGiaDrl } from './redux';
import { updateDrlGiaHanKhoa } from 'modules/mdTccb/tccbDanhGiaDrl/redux/danhGiaDrlRedux';
import { getSvDssvDotDanhGiaDrlPage, getStudentInfo, updateSvDssvDotDanhGiaDrl, createListSV } from './dssvRedux';
import { SelectAdapter_FwStudentsManageForm } from '../fwStudents/redux';
import { Tooltip } from '@mui/material';
import GiaHanModal from './giaHanModal';
import TccbComponentKienNghi from 'modules/mdTccb/tccbDanhGiaDrl/componentKienNghi';

const APPROVED_MAPPER = {
    'A': <span className='text-success'><i className='fa fa-check' /> Chấp nhận</span>,
    'N': <span className='text-danger'><i className='fa fa-plus-square' /> Đăng ký mới</span>,
    'R': <span className='text-danger'><i className='fa fa-times' /> Từ chối</span>,
};

export class ProcessModal extends AdminModal {
    componentDidMount() {
        this.disabledClickOutside();
    }

    render = () => {
        return this.renderModal({
            showCloseButton: false,
            title: 'Kích hoạt đợt đánh giá điểm rèn luyện.',
            style: { paddingTop: '10%' },
            body: <div className='overlay' style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className='m-loader mb-2'>
                    <svg className='m-circular' viewBox='25 25 50 50'>
                        <circle className='path' cx='50' cy='50' r='20' fill='none' strokeWidth='4' strokeMiterlimit='10' />
                    </svg>
                </div>
                <h3 className='l-text mb-3'>Loading {this.props.process}</h3>
                <p className='l-text'>Vui lòng đừng rời trang cho đến khi hoàn thành việc kích hoạt này!</p>
            </div>
        });
    }
}

class adjustPage extends AdminPage {
    state = {
        item: {}, idDot: null, filter: {}, listSV: [], mssv: null, sortTerm: 'mssv_ASC', dsGiahan: []
    }
    defaultSortTerm = 'mssv_ASC';

    componentDidMount() {
        T.ready('/user/ctsv', () => {
            // T.socket.on('dkhp-init-ctdt', (data) => this.setState({ process: `${parseInt((data.count / data.sum) * 100)}%` }));
            this.idDot = this.props.match.params.id;
            this.tab.tabClick(null, 0);
            // this.setData(idDot, () => this.getPage(undefined, undefined, ''));
            this.loadData(this.idDot, () => this.getPage(undefined, undefined, ''));
            T.clearSearchBox();
            T.onSearch = (searchText) => {
                this.getPage(undefined, undefined, searchText || '');
                this.setState({ searchText });
            };
            T.showSearchBox();
        });
    }

    componentWillUnmount() {
        // T.socket.off('dkhp-init-ctdt');
    }

    loadData = (idDot, done) => {
        this.setData(idDot, done);
        this.getCountSinhVien(idDot);
    }

    setData = (idDot, done) => {
        this.props.getSvDotDanhGiaDrl(idDot, item => {
            if (item) {
                this.setState({ item: item, idDot: idDot, dsGiaHan: item.dsGiaHan || [] });
                this.setUp(item);
                done && done();
            }
        });

    }

    setDataGiaHan = (idDot, done) => {
        this.props.getSvDotDanhGiaDrl(idDot, item => {
            if (item) {
                this.setState({ dsGiaHan: item.dsGiaHan || [] });
                done && done();
            }
        });
    }

    getData = () => {
        this.compKienNghi.getData();
    }

    getCountSinhVien = (idDot) => this.props.getSoLuongSinhVien(idDot, value => {
        this.count.value(value);
        if (value === 0) this.count.value('0');
    });

    checkPermission = () => {
        let readOnly = this.state.readOnly;
        const permission = this.getUserPermission('ctsvDotDanhGiaDrl', ['write', 'delete', 'manage']);
        if (readOnly) {
            permission.write = false;
            permission.delete = false;
        }
        return permission;
    }

    getPage = (pageN, pageS, pageC, done) => {
        let idDot = this.state.idDot;
        let filter = { ...this.state.filter, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getSvDssvDotDanhGiaDrlPage(pageN, pageS, pageC, filter, idDot, done);
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));


    setUp = (item) => {
        let { ten, namHoc, hocKy, ngayBatDau, ngayKetThuc, khoa, khoaSinhVien, loaiHinhDaoTao, active, timeEndSv, timeEndLt, timeEndFaculty, timeStartSv, timeStartFaculty } = item;
        this.setState({ ngayBatDau, ngayKetThuc });

        loaiHinhDaoTao = loaiHinhDaoTao.split(', ');
        khoa = khoa.split(', ');

        this.tenDot.value(ten);
        this.ngayBatDauSv.value(timeStartSv || '');
        // this.ngayBatDauLt.value(timeStartLt || '');
        this.ngayBatDauKhoa.value(timeStartFaculty || '');
        this.ngayKetThucSv.value(timeEndSv || '');
        this.ngayKetThucLt.value(timeEndLt || '');
        this.ngayKetThucKhoa.value(timeEndFaculty || '');
        this.namHoc.value(namHoc);
        this.hocKy.value(hocKy);

        this.loaiHinhDaoTao.value(loaiHinhDaoTao);
        this.khoa.value(khoa);
        this.khoaSinhVien.value(khoaSinhVien);

        this.active.value(active);
    };

    renderDSSV = () => {
        let permission = this.checkPermission();
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.svDssvDotDanhGiaDrl?.page || { pageNumber: 1, pageSize: 50, pageTotal: 0, totalItem: 0, list: null };
        let table = renderDataTable({
            emptyTable: 'Chưa có sinh viên',
            data: list,
            header: 'thead-light',
            stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <TableHead style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }} content='MSSV' keyCol='mssv' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '40%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Họ tên' keyCol='hoTen' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Loại hình đào tạo' keyCol='loaiHinhDaoTao' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Khoa' keyCol='khoa' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Khóa Sinh Viên' keyCol='khoaSinhVien' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Lớp' keyCol='lop' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tình trạng sinh viên' keyCol='tinhTrangSinhVien' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Cho phép' keyCol='kichHoat' onSort={this.onSort} />
                </tr>),
            renderRow: (item, index) => {
                let indexOfItem = (pageNumber - 1) * pageSize + index + 1;
                return (
                    <tr key={index} style={{ backgroundColor: item.tinhTrang != 1 ? '#f7de97' : '' }}>
                        <TableCell style={{ textAlign: 'right' }} content={indexOfItem} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.loaiHinhDaoTao} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.khoaSinhVien} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.lop} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenTinhTrang} />
                        <TableCell style={{ textAlign: 'center' }} content={item.kichHoat} type='checkbox' permission={permission}
                            onChanged={value => {
                                item.kichHoat = value;
                                let { mssv, namHoc, hocKy } = item;
                                if (value == 1 && item.tinhTrang != 1) {
                                    T.confirm('Sinh viên không còn học!', 'Bạn có chắc bạn muốn kích hoạt sinh viên này?', true, isConfirm =>
                                        isConfirm && this.props.updateSvDssvDotDanhGiaDrl({ mssv, namHoc, hocKy }, item, () => this.getCountSinhVien(item.idDot)));
                                } else this.props.updateSvDssvDotDanhGiaDrl({ mssv, namHoc, hocKy }, item, () => this.getCountSinhVien(item.idDot));
                            }}
                        />
                    </tr>
                );
            }
        });
        return (<>
            <div className='tile'>
                <div>{table}</div>
            </div>
            <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem }}
                getPage={this.getPage} pageRange={5} />
        </>);
    }

    addSinhVien = () => {
        let listSv = this.state.listSV;
        const permission = this.getUserPermission('ctsvDotDanhGiaDrl', ['write', 'delete', 'manage']);
        let table = renderDataTable({
            emptyTable: 'Chưa có sinh viên',
            data: listSv,
            header: 'thead-light',
            stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }}>MSSV</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }}>Họ tên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Loại hình đào tạo</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }}>Khoa</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Khóa sinh viên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Lớp</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tình trạng sinh viên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Xóa</th>

                </tr>),
            renderRow: (item, index) => {
                return (
                    <tr key={index} style={{ backgroundColor: item.tinhTrang != 1 ? '#f7de97' : '' }}>
                        <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.loaiHinhDaoTao} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.khoaSinhVien} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.lop} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenTinhTrang} />
                        <TableCell style={{ textAlign: 'center' }} type='buttons' content={item} permission={permission}
                            onDelete={() => {
                                let listSv = this.state.listSV;
                                listSv = listSv.filter(e => e.mssv != item.mssv);
                                this.setState({ listSV: listSv });
                            }} />
                    </tr>
                );
            }
        });
        return (<>
            <div className='tile'>
                <div className='row'>
                    <div className='col-md-12 my-2'>
                        <h4 className='tile-title'>Tìm kiếm sinh viên</h4>
                        <FormSelect ref={e => this.sinhVien = e} className='col-md-12' placeholder='Sinh viên' data={SelectAdapter_FwStudentsManageForm}
                            onChange={(value) => this.selectSinhVien(value.id)} />
                    </div>
                </div>
                {listSv.length == 0 ? <div />
                    : < div>
                        < div> {table} </div>
                        <div style={{ display: 'flex', justifyContent: 'end' }} >
                            <button className='btn btn-success' onClick={(e) => e.preventDefault() || this.luuSinhVien()}>
                                <i className='fa fa-fw fa-lg fa-handshake-o' /> Thêm sinh viên
                            </button>
                        </div>
                    </div>}
            </div>
        </>);
    }

    giaHanKhoa = () => {
        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu',
            stickyHead: true,
            header: 'thead-light',
            loadingStyle: { backgroundColor: 'white' },
            className: this.state.quickAction ? 'table-fix-col' : '',
            data: this.state.dsGiaHan,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '20%', textAlign: 'left' }}>Người đăng ký</th>
                    <th style={{ width: '15%', textAlign: 'center' }}>Ngày đăng ký</th>
                    <th style={{ width: '15%', textAlign: 'center' }}>Ngày kết thúc gia hạn</th>
                    <th style={{ width: '30%', textAlign: 'center' }}>Khoa</th>
                    <th style={{ width: '20%', textAlign: 'center' }}>Tình trạng</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell content={item.hoTen || ''} />
                    <TableCell style={{ textAlign: 'center' }} type='date' dateFormat='dd/mm/yyyy' content={item.ngayDangKy} />
                    <TableCell style={{ textAlign: 'center' }} type='date' dateFormat='dd/mm/yyyy' content={item.ngayHetHan} />
                    <TableCell style={{ textAlign: 'center' }} content={item.tenKhoa} />
                    <TableCell style={{ textAlign: 'center' }} content={<>
                        {APPROVED_MAPPER[item.tinhTrang]}
                        {item.lyDo && <Tooltip className='ml-2 text-danger' title={item.lyDo} arrow placeholder='right'><i className="pr-2 fa fa-info-circle"></i></Tooltip>}
                    </>} />
                    <TableCell type='buttons' style={{}} content={item}>
                        <Tooltip title={'Xem chi tiết'}>
                            <button className='btn btn-primary' type='button' onClick={(e) => {
                                e.preventDefault();
                                this.giaHanModal.show({ namHoc: this.state.item.namHoc, hocKy: this.state.item.hocKy, thongTinDot: this.state.item, id: item.id, thoiGianGiaHan: item.ngayHetHan, maKhoa: item.maKhoa, tinhTrang: item.tinhTrang });
                            }} >
                                <i className='fa fa-lg fa-pencil' />
                            </button>
                        </Tooltip>
                    </TableCell>
                </tr>
            )
        });
        return (<>
            <div className='tile'>
                <div className='mt-3'>
                    {table}
                </div>
            </div>
        </>);
    }

    luuSinhVien = () => {
        let { listSV, idDot } = this.state;
        listSV = listSV.map(item => item.mssv);
        listSV = listSV.join('; ');
        let data = { listSV, idDot };
        this.props.createListSV(data, data => {
            if (!data.error) {
                this.setState({ listSV: [] });
                this.sinhVien.value('');
            }
            this.getCountSinhVien(idDot);
            this.getPage();
        });
    }

    selectSinhVien = (mssv) => {
        let { listSV, item } = this.state;
        let { namHoc, hocKy } = item;
        let check = true;

        for (let sinhVien of listSV) {
            if (sinhVien.mssv == mssv) {
                check = false;
                break;
            }
        }

        if (check) {
            this.props.getStudentInfo(mssv, namHoc, hocKy, value => {
                if (value.message) {
                    this.sinhVien.focus();
                    T.alert(value.message, 'warning', false, 1500);
                } else {
                    let data = value.dataSinhVien;
                    let item = {
                        mssv: data.mssv,
                        loaiHinhDaoTao: data.loaiHinhDaoTao,
                        khoaSinhVien: data.khoaSinhVien,
                        lop: data.lop,
                        hoTen: data.hoTen,
                        tenKhoa: data.tenKhoa,
                        tinhTrang: data.tinhTrang,
                        tenTinhTrang: data.tenTinhTrang,
                    };
                    listSV.push(item);
                    this.setState({ listSV });
                }
            });
        } else T.alert('Sinh viên đã chọn!', 'warning', false, 1500);
        this.sinhVien.value(null);
    }

    showModal = (e) => {
        e.preventDefault();
        let item = this.state.item;
        this.modal.show(item);
    }

    updateDot = (id, changes, done) => this.props.updateSvDotDanhGiaDrl(id, changes, () => {
        this.loadData(id);
        this.getPage(undefined, undefined, '');
        done && done();
    });

    onChangeKichHoat = (idDot) => {
        this.setData(idDot);
    }

    render() {
        const permission = this.getUserPermission('svDotDanhGiaDrl', ['write', 'delete', 'manage']);
        let idDot = this.state.idDot;
        let readOnly = this.state.readOnly;

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Chi tiết đợt đánh giá điểm rèn luyện',
            breadcrumb: [
                <Link key={0} to='/user/ctsv'>Công tác sinh viên</Link>,
                <Link key={1} to='/user/ctsv/diem-ren-luyen'>Điểm rèn luyện</Link>,
                <Link key={1} to='/user/ctsv/dot-danh-gia-drl'>Đợt đánh giá </Link>,
                'Chi tiết đợt đánh giá điểm rèn luyện'
            ],
            content: <>
                <div className='tile'>
                    <h6 className='tile-title'>Thông tin đợt</h6>
                    <div className='row'>
                        <FormTextBox ref={e => this.tenDot = e} className='col-md-3' label='Tên đợt' required readOnly />
                        <FormTextBox ref={e => this.namHoc = e} className='col-md-3' label='Năm học' type='scholastic' required readOnly />
                        <FormSelect ref={e => this.hocKy = e} className='col-md-3' label='Học kỳ' data={SelectAdapter_DtDmHocKy} required readOnly />
                        <FormCheckbox ref={e => this.active = e} className='col-md-3' label='Kích hoạt' isSwitch permission={permission} onChange={value => {
                            this.active.value(0);
                            value ? T.confirm('Xác nhận', 'Kích hoạt đợt đánh giá này. Lưu ý, để đạt chất lượng tốt nhất, vui lòng kích hoạt trước 30 phút trước khi bắt đầu!', 'warning', true, isConfirm => {
                                if (isConfirm) {
                                    this.props.updateSvDotDanhGiaDrl(idDot, { active: 1 }, () => {
                                        this.onChangeKichHoat(idDot);
                                        value && T.alert('Kích hoạt đợt đánh giá thành công!', 'success', true);
                                        this.active.value(1);
                                    });
                                }
                            }) : this.props.updateSvDotDanhGiaDrl(idDot, { active: 0 }, () => this.onChangeKichHoat(idDot));
                        }} disable={readOnly} />
                    </div>
                    {/* <h5>Cá nhân và lớp</h5> */}
                    <div className='row'>
                        <FormDatePicker ref={e => this.ngayBatDauSv = e} className='col-md-4' label='Bắt đầu đánh giá' type='time' required readOnly />
                        <FormDatePicker ref={e => this.ngayKetThucSv = e} className='col-md-4' label='Hạn chót sinh viên đánh giá' type='time' required readOnly />
                        {/* <FormDatePicker ref={e => this.ngayBatDauLt = e} className='col-md-6' label='Thời gian bắt đầu lớp trưởng đánh giá' type='time' required readOnly /> */}
                        <FormDatePicker ref={e => this.ngayKetThucLt = e} className='col-md-4' label='Hạn chót lớp trưởng đánh giá' type='time' required readOnly />
                    </div>
                    {/* <h5>Khoa</h5> */}
                    <div className='row'>
                        <FormDatePicker ref={e => this.ngayBatDauKhoa = e} className='col-md-4' label='Bắt đầu khoa đánh giá' type='time' required readOnly />
                        <FormDatePicker ref={e => this.ngayKetThucKhoa = e} className='col-md-4' label='Hạn chót khoa đánh giá' type='time' required readOnly />
                    </div>
                    <div className='row'>
                        <FormTextBox ref={e => this.count = e} className='col-md-6' label='Số lượng sinh viên được đánh giá' required readOnly />
                        <FormSelect ref={e => this.loaiHinhDaoTao = e} className='col-md-12' label='Loại hình đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTao} multiple readOnly />
                        <FormSelect ref={e => this.khoa = e} className='col-md-12' label='Khoa' data={SelectAdapter_DmDonViFaculty_V3} multiple readOnly />
                        <FormTextBox ref={e => this.khoaSinhVien = e} className='col-md-12' label='Khóa sinh viên' required readOnly />
                    </div>
                </div>
                {readOnly ?
                    <div>
                        {this.renderDSSV()}
                    </div>
                    : <div >
                        <FormTabs ref={e => this.tab = e} tabs={[
                            { title: 'Danh sách sinh viên', component: this.renderDSSV() },
                            { title: 'Thêm sinh viên', component: this.addSinhVien() },
                            { title: `Danh sách đăng ký gia hạn (${this.state.dsGiaHan ? this.state.dsGiaHan.length : 0})`, component: this.giaHanKhoa() },
                            {
                                title: 'Danh sách kiến nghị', component: <div className='tile'><TccbComponentKienNghi
                                    ref={e => this.compKienNghi = e}
                                    searchText={this.state.searchText}
                                    user={this.props.system.user}
                                    thongTinDot={this.state.item}
                                    chapNhanKienNghi={chapNhanKienNghi}
                                    tuChoiGiaHan={tuChoiGiaHan}
                                    getPendingGiaHan={this.props.getPendingGiaHan}
                                    namHoc={this.namHoc?.value()}
                                    hocKy={this.hocKy?.value()}
                                /></div>
                            },
                        ]} />
                    </div>}

                {readOnly ? <div /> : <AddModal ref={e => this.modal = e} updateDot={this.updateDot} />}
                <ProcessModal ref={e => this.processModal = e} process={this.state.process} />
                <GiaHanModal ref={e => this.giaHanModal = e} readOnly={true} onSubmit={() => {
                    this.setDataGiaHan(this.idDot, this.getData);
                }} />
                {/* <LyDoModal ref={e => this.lyDoModal = e} giaHanModal={this.giaHanModal} updateDrlGiaHanKhoa={this.props.updateDrlGiaHanKhoa} /> */}
            </>,
            backRoute: '/user/ctsv/dot-danh-gia-drl',
            buttons: readOnly ? null : { icon: 'fa-edit', tooltip: 'Chỉnh sửa đợt đánh giá', className: 'btn btn-primary', onClick: e => this.showModal(e) },
        });
    }
}

const mapStateToProps = state => ({ system: state.system, svDssvDotDanhGiaDrl: state.ctsv.svDssvDotDanhGiaDrl });
const mapActionsToProps = {
    getSoLuongSinhVien, getSvDotDanhGiaDrl, getSvDssvDotDanhGiaDrlPage, updateSvDotDanhGiaDrl, createListSV,
    getStudentInfo, updateSvDssvDotDanhGiaDrl, updateDrlGiaHanKhoa, getPendingGiaHan
};
export default connect(mapStateToProps, mapActionsToProps)(adjustPage);