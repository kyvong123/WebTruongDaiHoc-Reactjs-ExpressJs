import React from 'react';
import AddModal from './addModal';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { getDtCauHinhDotDkhp, updateDtCauHinhDotDkhp, getSoLuongSinhVien } from './redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_DmDonViFaculty_V3 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { AdminPage, FormTextBox, FormCheckbox, FormSelect, FormDatePicker, renderDataTable, TableCell, FormTabs, TableHead, AdminModal } from 'view/component/AdminPage';
import { getDtDssvTrongDotDkhpPage, updateDtDssvTrongDotDkhp, createListSV, SelectAdapter_DanhSachSinhVien, getStudentInfo, reLoadListSv } from 'modules/mdDaoTao/dtDssvTrongDotDkhp/redux';
import { Tooltip } from '@mui/material';
import CtdtModal from './ctdtModal';
import MienSection from './addMienSection';

export class ProcessModal extends AdminModal {
    componentDidMount() {
        this.disabledClickOutside();
        this.setState({ process: this.props.process });
    }

    componentDidUpdate(prev) {
        if (prev.process != this.props.process) this.setState({ process: this.props.process });
    }

    render = () => {
        return this.renderModal({
            showCloseButton: false,
            title: this.props.title || '',
            style: { paddingTop: '10%', },
            body: <div style={{ minHeight: '150px' }}>
                <div className='overlay' style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div className='m-loader mb-2 mt-2'>
                        <svg className='m-circular' viewBox='25 25 50 50'>
                            <circle className='path' cx='50' cy='50' r='20' fill='none' strokeWidth='4' strokeMiterlimit='10' />
                        </svg>
                    </div>
                    <h3 className='l-text mb-3'>Loading {this.state.process || '...'}</h3>
                    <b>{this.props.caption || 'Vui lòng đừng rời khỏi trang'}</b>
                </div>
            </div>
        });
    }
}

class GhiChuModal extends AdminModal {
    state = { item: {} }

    onShow = (item) => {
        this.ghiChu.value(item.ghiChu);
        this.setState({ item });
    }

    onSubmit = () => {
        let { item } = this.state;
        if (!this.ghiChu.value() || this.ghiChu.value().trim() == '') {
            T.notify('Vui lòng nhập lý do!', 'danger');
        } else {
            T.confirm('Cảnh báo', `Bạn có chắc muốn tắt kích hoạt sinh viên ${item.mssv} ?`, 'warning', true, isConfirm => {
                if (isConfirm) {
                    T.alert('Đang xử lý', 'warning', false, null, true);
                    item.ghiChu = this.ghiChu.value();

                    this.props.updateDtDssvTrongDotDkhp(item.id, item, (value) => {
                        if (value.error) T.alert('Tắt kích hoạt sinh viên thất bại', 'warning', false, 1000);
                        else {
                            T.alert('Tắt kích hoạt sinh viên thành công', 'success', false, 1000);
                            this.props.getCountSinhVien(this.props.idDot);
                            this.hide();
                            this.ghiChu.value('');
                        }
                    });
                }
            });
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Lý do tắt kích hoạt sinh viên',
            size: 'large',
            body: <>
                <div className='row'>
                    <FormTextBox ref={e => this.ghiChu = e} type='text' className='col-md-12' label='Ghi chú' />
                </div>
            </>,
        });
    }
}

class adjustPage extends AdminPage {
    state = {
        item: {}, idDot: null, filter: {}, listSV: [], mssv: null, sortTerm: 'mssv_ASC',
        namHoc: null, hocKy: null
    }
    defaultSortTerm = 'mssv_ASC'
    hocPhi = [
        { id: '1', text: 'Đã đóng đủ học phí' },
        { id: '0', text: 'Chưa đóng đủ học phí' },
    ]

    componentDidMount() {
        let idDot = this.props.match.params.id;
        this.tab.tabClick(null, 0);

        T.ready('/user/dao-tao', () => {
            // T.socket.on('dkhp-init-ctdt', (data) => this.setState({ process: `${parseInt((data.count / data.sum) * 100)}%` }));
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.setData(idDot);
        });
    }

    componentWillUnmount() {
        // T.socket.off('dkhp-init-ctdt');
    }

    setData = (idDot) => {
        this.props.getDtCauHinhDotDkhp(idDot, item => {
            const d = Date.now();
            if (item.ngayKetThuc < d) this.setState({ readOnly: true });

            this.setState({ item: item, idDot: idDot }, () => this.mienSection.setValue(idDot));
            this.setUp(item);
        });
        this.getCountSinhVien(idDot);
    }

    getCountSinhVien = (idDot) => this.props.getSoLuongSinhVien(idDot, value => {
        this.count.value(value);
        if (value === 0) this.count.value('0');
    });

    checkPermission = () => {
        let readOnly = this.state.readOnly;
        const permission = this.getUserPermission('dtCauHinhDotDkhp', ['write', 'delete', 'manage']);
        if (readOnly) {
            permission.write = false;
            permission.delete = false;
        }
        return permission;
    }

    getPage = (pageN, pageS, pageC, done) => {
        let idDot = this.state.idDot;
        let filter = {
            ...this.state.filter,
            sort: this.state?.sortTerm || this.defaultSortTerm,
            namHoc: this.state.namHoc,
            hocKy: this.state.hocKy
        };
        this.props.getDtDssvTrongDotDkhpPage(pageN, pageS, pageC, filter, idDot, done);
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));


    setUp = (item) => {
        let { tenDot, namHoc, hocKy, ngayBatDau, ngayKetThuc, khoa, khoaSinhVien, loaiHinhDaoTao, theoKeHoach, ngoaiKeHoach, ngoaiCtdt, caiThien, chuyenLop, hocLai, huyMon, ghepLop, congNo, active, ngoaiNgu } = item;
        this.setState({ ngayBatDau, ngayKetThuc });

        loaiHinhDaoTao = loaiHinhDaoTao.split(', ');
        khoa = khoa.split(', ');

        ngayBatDau = new Date(ngayBatDau);
        ngayKetThuc = new Date(ngayKetThuc);

        this.tenDot.value(tenDot);
        this.ngayBatDau.value(ngayBatDau);
        this.ngayKetThuc.value(ngayKetThuc);
        this.namHoc.value(namHoc);
        this.hocKy.value(hocKy);

        this.loaiHinhDaoTao.value(loaiHinhDaoTao);
        this.khoa.value(khoa);
        this.khoaSinhVien.value(khoaSinhVien);

        this.theoKeHoach.value(theoKeHoach);
        this.ngoaiKeHoach.value(ngoaiKeHoach);
        this.ngoaiCtdt.value(ngoaiCtdt);

        this.hocLai.value(hocLai);
        this.huyMon.value(huyMon);
        this.chuyenLop.value(chuyenLop);
        this.ghepLop.value(ghepLop);
        this.caiThien.value(caiThien);
        this.congNo.value(congNo);
        this.ngoaiNgu.value(ngoaiNgu);
        // this.chuanSinhVien.value(chuanSinhVien);

        this.active.value(active);
        namHoc = namHoc.split(' - ');
        this.setState({ item, hocKy, namHoc: namHoc[0] }, () => {
            this.getPage(undefined, undefined, '');
        });
    };

    backgroundColor = (item) => {
        if (item.isEmpty == true) {
            return '#FFCCCB';
        } else if (item.tinhTrang != 1 || item.tinhPhi == '0') {
            return '#FAF884';
        }
    }

    renderDSSV = () => {
        let permission = this.checkPermission();
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.dtDssvTrongDotDkhp?.page || { pageNumber: 1, pageSize: 50, pageTotal: 0, totalItem: 0, list: null };

        let table = renderDataTable({
            emptyTable: 'Chưa có sinh viên',
            data: list,
            header: 'thead-light',
            stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Kích hoạt' keyCol='kichHoat' onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='MSSV' keyCol='mssv' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Họ tên' keyCol='hoTen' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='LHDT' keyCol='loaiHinhDaoTao' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '40%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Khoa' keyCol='khoa' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Lớp' keyCol='lop' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='CTDT' keyCol='ctdt' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Môn CTDT' keyCol='soLuong' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tình trạng SV' keyCol='tinhTrangSinhVien' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Học phí' keyCol='hocPhi' onKeySearch={this.handleKeySearch} onSort={this.onSort} typeSearch='select' data={this.hocPhi} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ghi chú' keyCol='ghiChu' />
                </tr>),
            renderRow: (item, index) => {
                let indexOfItem = (pageNumber - 1) * pageSize + index + 1;
                return (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'right' }} content={indexOfItem} />
                        <TableCell style={{ textAlign: 'center' }} content={item.kichHoat} type='checkbox' permission={permission}
                            onChanged={value => {
                                item.kichHoat = value;
                                if (value == 1 && item.tinhTrang != 1) {
                                    T.confirm('Sinh viên không còn học!', 'Bạn có chắc bạn muốn kích hoạt sinh viên này?', true, isConfirm =>
                                        isConfirm && this.props.updateDtDssvTrongDotDkhp(item.id, item, () => this.getCountSinhVien(item.idDot)));
                                } else if (value == 1 && item.tinhPhi == 0) {
                                    T.confirm('Sinh viên nợ học phí!', 'Bạn có chắc bạn muốn kích hoạt sinh viên này?', true, isConfirm =>
                                        isConfirm && this.props.updateDtDssvTrongDotDkhp(item.id, item, () => this.getCountSinhVien(item.idDot)));
                                } else if (value == 1) {
                                    this.props.updateDtDssvTrongDotDkhp(item.id, item, () => this.getCountSinhVien(item.idDot));
                                } else this.ghiChuModal.show(item);
                            }}
                        />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.mssv} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.loaiHinhDaoTao} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.lop} />
                        <TableCell type='link' style={{ whiteSpace: 'nowrap', textAlign: 'center', backgroundColor: item.soLuong == 0 ? '#FFCCCB' : null }} onClick={(e) => e.preventDefault() || this.ctdtModal.show(item.maCtdt)}
                            content={item.soLuong == 0
                                ? <Tooltip title='Chương trình đào tạo bị trống'>
                                    <div>{item.maCtdt}</div>
                                </Tooltip> : item.maCtdt} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center', backgroundColor: item.soLuong == 0 ? '#FFCCCB' : null }}
                            content={item.soLuong == 0
                                ? <Tooltip title='Chương trình đào tạo bị trống'>
                                    <div>{item.soLuong}</div>
                                </Tooltip> : item.soLuong} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center', backgroundColor: item.tinhTrang != 1 ? '#FFCCCB' : null }} content={item.tenTinhTrang} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} contentClassName={item.tinhPhi == '0' ? 'text-danger' : 'text-success'}
                            content={item.tinhPhi == '0'
                                ? <Tooltip title='Còn nợ học phí'>
                                    <i className='fa fa-lg fa-times-circle' />
                                </Tooltip>
                                : <Tooltip title='Đã đóng đủ'>
                                    <i className='fa fa-lg fa-check-circle' />
                                </Tooltip>} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ghiChu} />
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
        const permission = this.getUserPermission('dtCauHinhDotDkhp', ['write', 'delete', 'manage']);
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
                        <FormSelect ref={e => this.sinhVien = e} className='col-md-12' placeholder='Sinh viên' data={SelectAdapter_DanhSachSinhVien}
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
        let { listSV, ngayBatDau, ngayKetThuc } = this.state;
        let check = true;

        for (let sinhVien of listSV) {
            if (sinhVien.mssv == mssv) {
                check = false;
                break;
            }
        }

        if (check) {
            this.props.getStudentInfo(mssv, ngayBatDau, ngayKetThuc, value => {
                if (value.message) {
                    this.sinhVien.focus();
                    T.alert(value.message, 'warning', false, 1500);
                } else {
                    let data = value.dataSinhVien;
                    let item = {
                        mssv: data.mssv,
                        loaiHinhDaoTao: data.loaiHinhDaoTao,
                        khoaSinhVien: data.namTuyenSinh,
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
    }

    showModal = (e) => {
        e.preventDefault();
        let item = this.state.item;
        this.modal.show(item);
    }

    reLoadListSv = (e) => {
        e.preventDefault();
        let idDot = this.state.idDot;
        T.confirm('Bạn có chắc muốn chạy lại danh sách sinh viên?', 'Tất cả thay đổi trước đây của bạn sẽ không được lưu!', 'warning', true, isConfirm => {
            if (isConfirm) {
                T.alert('Đang chạy lại danh sách sinh viên', 'warning', false, null, true);
                this.props.reLoadListSv(idDot, (data) => {
                    if (data.error) T.alert('Chạy lại danh sách sinh viên thất bại', 'warning', false, 1000);
                    else {
                        this.getCountSinhVien(idDot);
                        T.alert('Chạy lại danh sách sinh viên thành công', 'success', false, 1000);
                    }
                });
            }
        });
    }

    updateDot = (id, changes, done) => this.props.updateDtCauHinhDotDkhp(id, changes, (value) => {
        if (value.error) {
            done && done(value);
        } else {
            this.setData(id);
            this.getPage(undefined, undefined, '');
            done && done(value);
        }
    });

    render() {
        const permission = this.getUserPermission('dtCauHinhDotDkhp', ['write', 'delete', 'manage']);
        let idDot = this.state.idDot;
        let readOnly = this.state.readOnly;

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Chi tiết đợt đăng ký học phần',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/edu-schedule'>Quản lý học phần</Link>,
                <Link key={1} to='/user/dao-tao/edu-schedule/cau-hinh-dkhp'>Cấu hình đợt đăng ký học phần</Link>,
                'Chi tiết đợt đăng ký học phần'
            ],
            content: <>
                <div className='tile row'>
                    <FormTextBox ref={e => this.tenDot = e} className='col-md-6' label='Tên đợt' required readOnly />
                    <FormTextBox ref={e => this.namHoc = e} className='col-md-2' label='Năm học' type='scholastic' required readOnly />
                    <FormSelect ref={e => this.hocKy = e} className='col-md-2' label='Học kỳ' data={SelectAdapter_DtDmHocKy} required readOnly />
                    <FormCheckbox ref={e => this.active = e} className='col-md-2' label='Kích hoạt' isSwitch permission={permission} onChange={value => {
                        this.active.value(0);
                        value ? T.confirm('Xác nhận', 'Kích hoạt hệ thống ĐKHP theo đợt đăng ký này. Lưu ý, để đạt chất lượng tốt nhất, vui lòng kích hoạt trước 30 phút trước khi bắt đầu!', 'warning', true, isConfirm => {
                            if (isConfirm) {
                                this.processModal.show();
                                this.props.updateDtCauHinhDotDkhp(idDot, { active: !!value }, () => {
                                    this.processModal.hide();
                                    value && T.alert('Kích hoạt hệ thống ĐKHP thành công!', 'success', true);
                                    this.active.value(1);
                                });
                            }
                        }) : this.props.updateDtCauHinhDotDkhp(idDot, { active: !!value });
                    }} disable={readOnly} />

                    <FormDatePicker ref={e => this.ngayBatDau = e} className='col-md-3' label='Ngày bắt đầu' type='time' required readOnly />
                    <FormDatePicker ref={e => this.ngayKetThuc = e} className='col-md-3' label='Ngày kết thúc' type='time' required readOnly />
                    <FormTextBox ref={e => this.count = e} className='col-md-6' label='Số lượng sinh viên đăng ký' required readOnly />


                    <FormSelect ref={e => this.loaiHinhDaoTao = e} className='col-md-12' label='Loại hình đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTao} multiple readOnly />
                    <FormSelect ref={e => this.khoa = e} className='col-md-12' label='Khoa' data={SelectAdapter_DmDonViFaculty_V3} multiple readOnly />
                    <FormTextBox ref={e => this.khoaSinhVien = e} className='col-md-12' label='Khóa sinh viên' required readOnly />

                    <div className='col-md-12'>
                        <div className='row'>
                            <FormCheckbox ref={e => this.theoKeHoach = e} className='col-md-4' label='Cho phép đăng ký theo kế hoạch' onChange={value => this.theoKeHoach.value(value ? 0 : 1)} />
                            <FormCheckbox ref={e => this.ngoaiKeHoach = e} className='col-md-4' label='Cho phép đăng ký ngoài kế hoạch' onChange={value => this.ngoaiKeHoach.value(value ? 0 : 1)} />
                            <FormCheckbox ref={e => this.ngoaiCtdt = e} className='col-md-4' label='Cho phép đăng ký ngoài CTDT' onChange={value => this.ngoaiCtdt.value(value ? 0 : 1)} />

                            <FormCheckbox ref={e => this.hocLai = e} className='col-md-4' label='Cho phép đăng ký học lại' onChange={value => this.hocLai.value(value ? 0 : 1)} />
                            <FormCheckbox ref={e => this.caiThien = e} className='col-md-8' label='Cho phép đăng ký cải thiện' onChange={value => this.caiThien.value(value ? 0 : 1)} />
                        </div>
                        <div className='row mt-1'>
                            <FormCheckbox ref={e => this.huyMon = e} className='col-md-4' label='Cho phép hủy môn' onChange={value => this.huyMon.value(value ? 0 : 1)} />
                            <FormCheckbox ref={e => this.chuyenLop = e} className='col-md-4' label='Cho phép chuyển lớp' onChange={value => this.chuyenLop.value(value ? 0 : 1)} />
                            <FormCheckbox ref={e => this.ghepLop = e} className='col-md-4' label='Cho phép ghép lớp' onChange={value => this.ghepLop.value(value ? 0 : 1)} />
                        </div>
                        <div className='row mt-1'>
                            <FormCheckbox ref={e => this.congNo = e} className='col-md-4' label='Xét học phí' onChange={value => this.congNo.value(value ? 0 : 1)} />
                            <FormCheckbox ref={e => this.ngoaiNgu = e} className='col-md-4' label='Xét ngoại ngữ không chuyên' onChange={value => this.ngoaiNgu.value(value ? 1 : 0)} />
                            {/* <FormCheckbox ref={e => this.chuanSinhVien = e} className='col-md-8' label='Xét chuẩn anh văn năm 3' onChange={value => this.chuanSinhVien.value(value ? 1 : 0)} /> */}
                        </div>
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
                            { title: 'Danh sách sinh viên miễn ngoại ngữ', component: <MienSection ref={e => this.mienSection = e} idDot={this.state.idDot} /> }
                        ]} />
                    </div>}

                {readOnly ? <div /> : <AddModal ref={e => this.modal = e} updateDot={this.updateDot} />}
                <ProcessModal ref={e => this.processModal = e} process={this.state.process} title='Kích hoạt đợt đăng ký học phần' caption='Vui lòng đừng rời trang cho đến khi hoàn thành việc kích hoạt này!' />
                <CtdtModal ref={e => this.ctdtModal = e} process={this.state.process} />
                <GhiChuModal ref={e => this.ghiChuModal = e} idDot={idDot} updateDtDssvTrongDotDkhp={this.props.updateDtDssvTrongDotDkhp} getCountSinhVien={this.getCountSinhVien} />
            </>,
            backRoute: '/user/dao-tao/edu-schedule/cau-hinh-dkhp',
            collapse: readOnly ? null : [
                { icon: 'fa-edit', name: 'Chỉnh sửa đợt đăng ký học phần', type: 'primary', permission: permission.write, onClick: e => this.showModal(e) },
                { icon: 'fa-undo', name: 'Chạy lại danh sách sinh viên', type: 'warning', permission: permission.write, onClick: e => this.reLoadListSv(e) },
            ],
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtDssvTrongDotDkhp: state.daoTao.dtDssvTrongDotDkhp });
const mapActionsToProps = { getSoLuongSinhVien, getDtCauHinhDotDkhp, getDtDssvTrongDotDkhpPage, updateDtDssvTrongDotDkhp, createListSV, getStudentInfo, updateDtCauHinhDotDkhp, reLoadListSv };
export default connect(mapStateToProps, mapActionsToProps)(adjustPage);