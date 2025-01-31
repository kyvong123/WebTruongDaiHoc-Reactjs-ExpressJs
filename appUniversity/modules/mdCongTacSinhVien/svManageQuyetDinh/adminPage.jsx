import React from 'react';
import { connect } from 'react-redux';
import { updateSvManageQuyetDinh, getSvManageQuyetDinhPage, downloadWord, deleteSvManageQuyetDinh, createSvManageQuyetDinh, huyQuyetDinh, getSoQuyetDinhRaCuoi, getCtdt, svCheckSoQuyetDinh } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, FormSelect, FormTabs, FormCheckbox, FormDatePicker, TableHead, renderDataTable } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { Tooltip } from '@mui/material';
import { getStudentAdmin } from 'modules/mdCongTacSinhVien/fwStudents/redux';
import { SelectAdapter_CtsvDmFormTypeQuyetDinh } from 'modules/mdCongTacSinhVien/svDmFormType/redux';
import { SelectAdapter_DmTinhTrangSinhVienV2 } from 'modules/mdDanhMuc/dmTinhTrangSinhVien/redux';
import HuyQuyetDinhModal from './HuyQuyetDinhModal';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import CreateRequest from 'modules/mdHanhChinhTongHop/hcthSoDangKy/components/createRequest';
import { getScheduleSettings } from 'modules/mdCongTacSinhVien/ctsvDtSetting/redux';
import { downloadWordDaoTao, updateDtQuanLyQuyetDinh } from 'modules/mdDaoTao/dtQuanLyQuyetDinh/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import SwitchStatusModal from './modal/switchStatusModal';
import { SelectAdapter_HcthVanBanDiStatusSystemCtsv } from 'modules/mdHanhChinhTongHop/hcthVanBanDiStatusSystem/redux/statusSystem';
import MultipleAddModalQuyetDinhDaoTao from 'modules/mdDaoTao/dtQuanLyQuyetDinh/modal/dtMultipleQuyetDinhModal';
import AddModal from './modal/addModal';

const quyetDinhRa = '1';
const quyetDinhVao = '2';
const quyetDinhKhac = '3';
// const tinhTrangNghiHocTamThoi = '2';

class svManageQuyetDinhPage extends AdminPage {
    state = { filter: { isDeleted: 0 }, selected: [], showMulti: false }
    namHocHead = {}
    //selected: ['maDangKy1', 'maDangKy2', 'maDangKy3']
    tabFilterMapper = {
        0: {},
        1: { kieuQuyetDinh: 1 },
        2: { kieuQuyetDinh: 2 },
        3: { maDonVi: 33 },
        4: { isDeleted: 1, },
    }
    // this.setState({ kieuQuyetDinh: tabIndex == 4 ? null : tabIndex, filter: { ...this.state.filter, isDeleted: tabIndex == 4 ? 1 : 0, maDonVi: tabIndex == 3 ? 33 : null } }, this.getPage);
    componentDidMount() {
        T.ready('/user/ctsv', () => {
            T.showSearchBox(() => this.changeAdvancedSearch());
            this.props.getScheduleSettings(({ currentSemester }) => {
                this.namHoc?.value(currentSemester.namHoc);
                this.setState({ filter: { ...this.state.filter, namHoc: currentSemester.namHoc } }, () => {
                    this.namHocHead[this.tabs.selectedTabIndex()]?.searchBox.value(null);
                    this.getPage();
                });
            });
            T.socket.on('updated-quyetdinh', (data) => {
                const { email } = this.props.system.user;
                if (data && data.email != email && !data.isNew) {
                    const { firstName, lastName, maDangKy, action } = data;
                    (action == 'U') && T.notify(`Cán bộ ${lastName} ${firstName} đã chỉnh sửa !${maDangKy}`, 'info');
                    this.getPage();
                }
            });
            T.socket.on('created-quyetdinh', (data) => {
                this.addModal.checkSoQuyetDinh(data);
                this.getPage();
            });
        });
    }

    changeAdvancedSearch = (isReset = false) => {
        let { pageNumber, pageSize, pageCondition } = this.props.svManageQuyetDinh && this.props.svManageQuyetDinh.page ? this.props.svManageQuyetDinh.page : { pageNumber: 1, pageSize: 50, pageCondition: '' };
        this.getPage(pageNumber, pageSize, pageCondition, page => page && this.hideAdvanceSearch());
        const filter = T.updatePage('svManageQuyetDinhPage').filter;
        Object.keys(this).forEach(key => {
            if (filter[key]) {
                if (['toNhapHoc', 'fromNhapHoc'].includes(key)) this[key].value(filter[key]);
                else this[key].value(filter[key].toString().split(','));
            }
        });
        if (isReset) {
            this.listFaculty.value('');
            this.listKhoaSinhVien.value('');
            this.listLoaiHinhDaoTao.value('');
            this.fromXuLy.value('');
            this.toXuLy.value('');
        }
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    componentWillUnmount() {
        T.socket.off('updated-quyetdinh');
        T.socket.off('created-quyetdinh');
    }

    getPage = (pageNumber, pageSize, pageCondition) => {
        this.props.getSvManageQuyetDinhPage(pageNumber, pageSize, pageCondition, { kieuQuyetDinh: this.state.kieuQuyetDinh ? this.state.kieuQuyetDinh : null, ...this.state.filter, trangThai: this.state.trangThai });
    }

    showModal = (e) => {
        e.preventDefault();
        this.addModal.show();
    };


    downloadWord = (item) => {
        // e.preventDefault();
        this.props.downloadWord(item.maDangKy, data => {
            T.FileSaver(new Blob([new Uint8Array(data.data)]), item.soQuyetDinh + '_' + item.maFormDangKy + '.docx');
        });
    }

    downloadWordOptional = (item) => {
        T.confirm('Xác nhận xuất văn bản?', '', isConfirm => isConfirm && downloadWord(item));
    }

    downloadWordDaoTao = (e, item) => {
        e.preventDefault();
        this.props.downloadWordDaoTao(item.maDangKy, data => {
            T.FileSaver(new Blob([new Uint8Array(data.data)]), item.soQuyetDinh + '.docx');
        });
    }

    deleteItem = (item) => {
        T.confirm('Xóa form đăng ký này', 'Bạn có chắc bạn muốn xóa quyết định này?', true, isConfirm =>
            isConfirm && this.props.deleteSvManageQuyetDinh(item.maDangKy, item.idSoQuyetDinh));
    }

    exportData = (e) => {
        e.preventDefault();
        T.download(`/api/ctsv/quyet-dinh/export?filter=${JSON.stringify({ ...this.state.filter, kieuQuyetDinh: '', isDeleted: '0', maDonVi: '' })}`);
    }

    handleCheck = (maDangKy, value) => {
        const selected = this.state.selected;
        if (value) {
            selected.push(maDangKy);
        } else {
            const idx = selected.indexOf(maDangKy);
            selected.splice(idx, 1);
            this.selecteAll.value(0);
        }
        this.setState({ selected });
    }

    onApDung = (e) => {
        e.preventDefault();
        // const thaoTac = this.thaoTac.value();
        if (!this.state.trangThai)
            return T.alert('Vui lòng chọn thao tác trước', 'danger');
        else {
            const { list } = this.props.svManageQuyetDinh != null ? this.props.svManageQuyetDinh.page : { list: [] };
            const data = list.filter(i => this.state.selected.includes(i.maDangKy)).map(i => i.idCvd);
            if (!data.length) {
                return T.alert('Vui lòng chọn trong danh sách quyết định', 'danger');
            }
            this.switchStatusModal.forwardStatus(data);
        }
    }

    componentQuyetDinh = (kieuQuyetDinh) => {
        const permission = this.getUserPermission('manageQuyetDinh', ['read', 'write', 'cancel', 'delete', 'ctsv', 'edit']);
        const { list, totalItem } = this.props.svManageQuyetDinh != null ? this.props.svManageQuyetDinh.page : { list: [] };
        const { showMulti, filter: { namHoc } } = this.state;
        let table = renderDataTable({
            data: list,
            emptyTable: 'Không có dữ liệu',
            className: 'table-fix-col',
            stickyHead: true,
            header: 'thead-light',
            renderHead: () => (
                <tr>
                    {/* <th style={{ width: 'auto', textAlign: 'center' }}>#</th> */}
                    {showMulti && <th><FormCheckbox ref={e => this.selecteAll = e} content={this.state.selected.length ? 0 : 1} onChange={value => {
                        if (value) {
                            let { list } = (this.props.svManageQuyetDinh && this.props.svManageQuyetDinh.page ? this.props.svManageQuyetDinh.page : []);
                            list = list.map(item => item.maDangKy);
                            this.setState({ selected: list });
                        } else {
                            this.setState({ selected: [] });
                        }

                    }} style={{ marginBottom: '0' }} /></th>}
                    <th style={{ width: 'auto', textAlign: 'center' }}>Mã</th>
                    <TableHead style={{ width: 'auto' }} content='Số quyết định' keyCol='soQuyetDinh' onKeySearch={this.handleKeySearch} />
                    <th style={{ minWidth: '140px', whiteSpace: 'nowrap' }}>Ngày ký</th>
                    <TableHead style={{ minWidth: '125px' }} content='MSSV' keyCol='mssv' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ minWidth: '125px', whiteSpace: 'nowrap' }} content='Sinh viên' keyCol='hoTen' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ minWidth: '200px', whiteSpace: 'nowrap' }} typeSearch='admin-select' data={SelectAdapter_DmTinhTrangSinhVienV2} content='Tình trạng chuyển' keyCol='tinhTrangSv' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ minWidth: '400px', whiteSpace: 'nowrap' }} ref={e => this.namHocHead[kieuQuyetDinh || 0] = e} typeSearch='admin-select' data={SelectAdapter_CtsvDmFormTypeQuyetDinh(namHoc, kieuQuyetDinh)} content='Loại quyết định' keyCol='loaiQuyetDinh' onKeySearch={this.handleKeySearch} />
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Trạng thái quyết định</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày xử lý</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Người xử lý</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    {/* <TableCell type='number' content={pageSize * pageNumber + index + 1 - pageSize} /> */}
                    {showMulti && <TableCell type='checkbox' isCheck content={this.state.selected.some(qd => qd == item.maDangKy)} onChanged={value => { this.handleCheck(item.maDangKy, value); }} permission={permission} />}
                    <TableCell type='text' content={item.maDangKy} />
                    <TableCell type='link' style={{ whiteSpace: 'nowrap' }} content={item.soQuyetDinh} url={`/user/van-ban-di/${item.idCvd}`} />
                    <TableCell type='date' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ngayKy != null && (item.ngayKy)} dateFormat='dd/mm/yyyy HH:MM:ss' />
                    <TableCell type='text' content={item.mssvDangKy} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.hoDangKy != null && (item.hoDangKy + ' ' + item.tenDangKy)} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenChuyenTrangThaiRa ?? item.tenChuyenTrangThaiVao} />
                    <TableCell type='text' content={item.tenFormDangKy} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', color: item.trangThaiColor }} content={<div><i className={`fa fa-lg ${item.statusIcon}`} />&nbsp; &nbsp;{item.tenTrangThai}</div>}></TableCell>
                    <TableCell type='date' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.thoiGianXuLy ? item.thoiGianXuLy : ''} dateFormat='dd/mm/yyyy HH:MM:ss' />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.hoNguoiXuLy != null && (item.hoNguoiXuLy + ' ' + item.tenNguoiXuLy)} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={this.state.kiemDuyet ? <>
                        {!!item.trangThaiTraLai && <Tooltip title='Trả lại' arrow>
                            <button className='btn btn-danger' onClick={e => {
                                e.preventDefault();
                                this.switchStatusModal.backStatus([item.vanBanId]);
                            }}>
                                <i className='fa fa-lg fa-times' />
                            </button>
                        </Tooltip>}
                        {!!item.trangThaiTiepTheo && <Tooltip title='Duyệt' arrow>
                            <button className='btn btn-success' onClick={e => {
                                e.preventDefault();
                                this.switchStatusModal.forwardStatus([item.vanBanId]);
                            }}>
                                <i className='fa fa-lg fa-check' />
                            </button>
                        </Tooltip>}</> :
                        <>
                            {((item.tinhTrang == null || item.tinhTrang == 'U') && permission.edit) && <Tooltip title='Xem chi tiết' arrow>
                                <button className='btn btn-info' onClick={e => {
                                    e.preventDefault();
                                    this.addModal.show(item);
                                }}>
                                    <i className='fa fa-lg fa-edit' />
                                </button>
                            </Tooltip>}
                            {permission.cancel && <Tooltip title='Hủy' arrow>
                                <button className='btn btn-danger' onClick={e => { e.preventDefault(); this.huyModal.show(item); }}>
                                    <i className='fa fa-lg fa-ban' />
                                </button>
                            </Tooltip>}
                            <Tooltip title='Download' arrow>
                                <button className='btn btn-primary' onClick={e => { e.preventDefault(); this.downloadWord(item); }}>
                                    <i className='fa fa-lg fa-file-word-o' />
                                </button>
                            </Tooltip>
                            {permission.delete && <Tooltip title='Xóa' arrow>
                                <button className='btn btn-danger' onClick={e => { e.preventDefault(); this.deleteItem(item); }}>
                                    <i className='fa fa-lg fa-trash-o' />
                                </button>
                            </Tooltip>}
                        </>
                    }>
                    </TableCell>
                </tr>
            ),
        });
        return (<>
            <div className='d-flex justify-content-between mb-2'>
                <div className="d-flex" style={{ gap: 10 }}>
                    <p>Tìm thấy: {totalItem} kết quả</p>
                    <FormSelect className={showMulti ? '' : 'd-none'} style={{ width: '300px' }} data={SelectAdapter_HcthVanBanDiStatusSystemCtsv} placeholder='Thao tác' ref={e => this.thaoTac = e} onChange={this.onChangeThaoTac} />
                </div>
                <div>
                    {showMulti ? <button className='btn btn-success mr-2' onClick={this.onApDung}>
                        Duyệt
                    </button> : null}
                    <button className={`btn ${showMulti ? 'btn-danger' : 'btn-warning'}`} onClick={(e) => {
                        e.preventDefault();
                        this.setState({ showMulti: !this.state.showMulti, kiemDuyet: !this.state.kiemDuyet, trangThai: null }, () => {
                            if (this.state.showMulti) {
                                this.thaoTac.focus();
                            }
                            this.changeAdvancedSearch(true);
                        });
                    }}>{showMulti ? 'Hủy' : 'Kiểm duyệt'}</button>
                </div>
            </div>
            <div>{table}</div>
        </>);
    }

    onChangeThaoTac = (value) => {
        this.setState({ trangThai: value.data.trangThai }, this.getPage);
    }

    componentQuyetDinhDaoTao = () => {
        const permission = this.getUserPermission('manageQuyetDinh', ['read', 'write', 'cancel', 'delete', 'ctsv', 'edit']);
        const { list, totalItem } = this.props.svManageQuyetDinh != null ? this.props.svManageQuyetDinh.page : { list: [] };
        let table = renderDataTable({
            data: list,
            emptyTable: 'Không có dữ liệu',
            className: 'table-fix-col',
            stickyHead: true,
            header: 'thead-light',
            renderHead: () => (
                <tr>
                    {/* <th style={{ width: 'auto', textAlign: 'center' }}>#</th> */}
                    <th style={{ width: 'auto', textAlign: 'center' }}>Mã</th>
                    <TableHead style={{ width: 'auto' }} content='Số quyết định' keyCol='soQuyetDinh' onKeySearch={this.handleKeySearch} />
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày ký</th>
                    <TableHead style={{ width: '10%' }} content='MSSV' keyCol='mssv' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: '30%', whiteSpace: 'nowrap' }} content='Sinh viên' keyCol='hoTen' onKeySearch={this.handleKeySearch} />
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tình trạng</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Loại quyết định</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Trạng thái quyết định</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày xử lý</th>
                    <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Người xử lý</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Người cập nhật</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    {/* <TableCell type='number' content={pageSize * pageNumber + index + 1 - pageSize} /> */}
                    <TableCell type='text' content={item.maDangKy} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.soQuyetDinh} />
                    <TableCell type='date' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ngayKy != null && (item.ngayKy)} dateFormat='dd/mm/yyyy HH:MM:ss' />
                    <TableCell type='text' content={item.mssvDangKy} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.hoDangKy != null && (item.hoDangKy + ' ' + item.tenDangKy)} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tinhTrangSinhVien != null && (item.tinhTrangSinhVien)} />
                    <TableCell type='text' contentClassName='multiple-lines-3' content={'Quyết định chuyển hệ'} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', color: item.trangThaiColor }} content={<div><i className={`fa fa-lg ${item.statusIcon}`} />&nbsp; &nbsp;{item.tenTrangThai}</div>}></TableCell>
                    <TableCell type='date' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.thoiGianXuLy ? item.thoiGianXuLy : ''} dateFormat='dd/mm/yyyy HH:MM:ss' />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.hoNguoiXuLy != null && (item.hoNguoiXuLy + ' ' + item.tenNguoiXuLy)} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.hoNguoiCapNhat != null && (item.hoNguoiCapNhat + ' ' + item.tenNguoiCapNhat)} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<>
                        {(permission.write) && <Tooltip title='Xem chi tiết' arrow>
                            <button className='btn btn-info' onClick={e => {
                                e.preventDefault();
                                this.multiModal.show(item);
                            }}>
                                <i className='fa fa-lg fa-edit' />
                            </button>
                        </Tooltip>}
                        <Tooltip title='Download' arrow>
                            <button className='btn btn-primary' onClick={e => { e.preventDefault(); this.downloadWordDaoTao(e, item); }}>
                                <i className='fa fa-lg fa-file-word-o' />
                            </button>
                        </Tooltip>
                    </>
                    }>
                    </TableCell>
                </tr>
            ),
        });
        return (<>
            <p>Tìm thấy: {totalItem} kết quả</p>
            <div>{table}</div>
        </>);
    }

    componentQuyetDinhHuy = () => {
        const permission = this.getUserPermission('manageQuyetDinh', ['read', 'write', 'delete', 'ctsv']);
        const { list, totalItem } = this.props.svManageQuyetDinh != null ? this.props.svManageQuyetDinh.page : { list: [] };
        let table = renderDataTable({
            data: list.filter(item => item.isDeleted == 1),
            emptyTable: 'Không có dữ liệu',
            className: 'table-fix-col',
            stickyHead: true,
            header: 'thead-light',
            renderHead: () => (
                <tr>
                    {/* <th style={{ width: 'auto', textAlign: 'center' }}>#</th> */}
                    <th style={{ width: 'auto', textAlign: 'center' }}>Mã</th>
                    <TableHead style={{ width: 'auto' }} content='Số quyết định' keyCol='soQuyetDinh' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: '10%' }} content='MSSV' keyCol='mssv' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: '30%', whiteSpace: 'nowrap' }} content='Sinh viên' keyCol='hoTen' onKeySearch={this.handleKeySearch} />
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tình trạng chuyển</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Loại quyết định</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày xử lý</th>
                    <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Người xử lý</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày ký</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    {/* <TableCell type='number' content={pageSize * pageNumber + index + 1 - pageSize} /> */}
                    <TableCell type='text' content={item.maDangKy} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.soQuyetDinh} />
                    <TableCell type='text' content={item.mssvDangKy} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.hoDangKy != null && (item.hoDangKy + ' ' + item.tenDangKy)} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tinhTrangSinhVien != null && (item.tinhTrangSinhVien)} />
                    <TableCell type='text' contentClassName='multiple-lines-3' content={item.tenFormDangKy} />
                    <TableCell type='date' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.thoiGianXuLy ? item.thoiGianXuLy : ''} dateFormat='dd/mm/yyyy HH:MM:ss' />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.hoNguoiXuLy != null && (item.hoNguoiXuLy + ' ' + item.tenNguoiXuLy)} />
                    <TableCell type='date' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ngayKy != null && (item.ngayKy)} dateFormat='dd/mm/yyyy HH:MM:ss' />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<>
                        {(item.tinhTrang == null || item.tinhTrang == 'U') && <Tooltip title='Chỉnh sửa' arrow>
                            <button className='btn btn-info' onClick={e => {
                                e.preventDefault();
                                this.detailModal.show(item);
                            }}>
                                <i className='fa fa-lg fa-info-circle' />
                            </button>
                        </Tooltip>}
                        {permission.delete && <Tooltip title='Xóa' arrow>
                            <button className='btn btn-danger' onClick={e => { e.preventDefault(); this.deleteItem(item); }}>
                                <i className='fa fa-lg fa-trash-o' />
                            </button>
                        </Tooltip>}
                    </>
                    }>
                    </TableCell>
                </tr>
            ),
        });
        return (<>
            <p>Tìm thấy: {totalItem} kết quả</p>
            <div>{table}</div>
        </>);
    }

    onHideRequest = () => {
        this.addModal?.modal && $(this.addModal.modal)?.modal('show');
    }

    onChangeTab = (value) => {
        const { tabIndex } = value;
        this.namHocHead[tabIndex]?.searchBox.value(null);
        const { kieuQuyetDinh = null, isDeleted = 0, maDonVi } = this.tabFilterMapper[tabIndex];
        this.setState({ kieuQuyetDinh, filter: { ...this.state.filter, isDeleted, maDonVi, ...(tabIndex == 3 ? { namHoc: null } : {}) } }, this.getPage);
    }

    setFilter = (condition) => {
        let { filter = {} } = this.state;
        filter = { ...filter, ...condition };
        this.setState({ filter }, this.getPage);
    }

    render() {
        // user = this.props.system.user;
        const permission = this.getUserPermission('manageQuyetDinh', ['read', 'write', 'delete', 'ctsv']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition } = this.props.svManageQuyetDinh && this.props.svManageQuyetDinh.page ? this.props.svManageQuyetDinh.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };

        return this.renderPage({
            icon: 'fa fa-file-text-o',
            title: 'Quản lý quyết định',
            breadcrumb: [
                <Link key={0} to={'/user/ctsv'}>
                    Công tác sinh viên
                </Link>,
                'Quản lý quyết định',
            ],
            header: <>
                <FormSelect style={{ width: '150px' }} className='mr-3' ref={e => this.namHoc = e} placeholder='Năm học' data={SelectAdapter_SchoolYear}
                    onChange={(value) =>
                        this.setState({ filter: { ...this.state.filter, namHoc: value.id } }, () => {
                            this.namHocHead[this.tabs.selectedTabIndex()]?.searchBox.value(null);
                            this.getPage();
                        })} />
                {/* <FormSelect style={{ width: '150px' }} ref={e => this.hocKy = e} placeholder='Học kỳ' data={[{ id: 1, text: 'Học kỳ 1' }, { id: 2, text: 'Học kỳ 2' }, { id: 3, text: 'Học kỳ 3' }]} onChange={(value) => this.setState({ filter: { ...this.state.filter, hocKy: value.id } }, this.getPage)} /> */}
            </>,
            advanceSearch: <>
                <div className='row'>
                    <FormSelect multiple ref={e => this.listFaculty = e} data={SelectAdapter_DmDonViFaculty_V2} label='Khoa' className='col-md-4' allowClear onChange={value => {
                        let currentFilter = Object.assign({}, this.state.filter),
                            currentListFaculty = currentFilter.listFaculty?.split(',') || [];
                        if (value.selected) {
                            currentListFaculty.push(value.id);
                        } else currentListFaculty = currentListFaculty.filter(item => item != value.id);
                        this.setState({ filter: { ...currentFilter, listFaculty: currentListFaculty.toString() } });
                    }} />
                    <FormSelect multiple ref={e => this.listLoaiHinhDaoTao = e} data={SelectAdapter_DmSvLoaiHinhDaoTao} label='Loại hình đào tạo' className='col-md-4' allowClear onChange={value => {
                        let currentFilter = Object.assign({}, this.state.filter),
                            currentListLoaiHinhDaoTao = currentFilter.listLoaiHinhDaoTao?.split(',') || [];
                        if (value.selected) {
                            currentListLoaiHinhDaoTao.push(value.id);
                        } else currentListLoaiHinhDaoTao = currentListLoaiHinhDaoTao.filter(item => item != value.id);
                        this.setState({
                            filter: { ...currentFilter, listLoaiHinhDaoTao: currentListLoaiHinhDaoTao.toString() }
                        });
                    }} />
                    <FormSelect multiple ref={e => this.listKhoaSinhVien = e} data={[2022, 2021, 2020, 2019, 2018]} label='Khoá SV' className='col-md-4' allowClear onChange={value => {
                        let currentFilter = Object.assign({}, this.state.filter),
                            current = currentFilter.listKhoaSinhVien?.split(',') || [];
                        if (value.selected) {
                            current.push(value.id);
                        } else current = current.filter(item => item != value.id);
                        this.setState({
                            filter: { ...currentFilter, listKhoaSinhVien: current.toString() }
                        });
                    }} />
                    <FormDatePicker type='date-mask' ref={e => this.fromXuLy = e} label='Ngày xử lý (từ)' onChange={fromNhapHoc => {
                        if (fromNhapHoc && !isNaN(fromNhapHoc.getTime())) this.setState({
                            filter: { ...this.state.filter, fromXuLy: fromNhapHoc.setHours(0, 0, 0, 0) }
                        }); else this.setState({
                            filter: { ...this.state.filter, fromXuLy: '' }
                        });
                    }} className='col-md-4' />
                    <FormDatePicker type='date-mask' ref={e => this.toXuLy = e} label='Ngày xử lý (đến)' className='col-md-4' onChange={toNhapHoc => {
                        if (toNhapHoc && !isNaN(toNhapHoc.getTime())) this.setState({
                            filter: { ...this.state.filter, toXuLy: toNhapHoc.setHours(23, 59, 59, 99) }
                        }); else this.setState({
                            filter: { ...this.state.filter, toXuLy: '' }
                        });
                    }} />
                </div>
                <div style={{ textAlign: 'right' }}>
                    <button className='btn btn-secondary' onClick={e => e.preventDefault() || this.setState({ filter: { isDeleted: 0 } }, () => { this.changeAdvancedSearch(true); this.tabs.tabClick(e, 0); })} style={{ marginRight: '15px' }}>
                        <i className='fa fa-lg fa-times' />Reset
                    </button>
                    <button className='btn btn-info' onClick={e => e.preventDefault() || this.changeAdvancedSearch()}>
                        <i className='fa fa-lg fa-search-plus' />Tìm kiếm
                    </button>
                </div>
            </>,
            content: (
                <>
                    <FormTabs
                        ref={e => this.tabs = e}
                        onChange={this.onChangeTab}
                        contentClassName='tile'
                        tabs={[
                            { id: 0, title: 'Tất cả', component: this.componentQuyetDinh() },
                            { id: quyetDinhRa, title: 'Quyết định ra', component: this.componentQuyetDinh(1) },
                            { id: quyetDinhVao, title: 'Quyết định vào', component: this.componentQuyetDinh(2) },
                            { id: quyetDinhKhac, title: 'Quyết định đào tạo', component: this.componentQuyetDinhDaoTao() },
                            { id: -1, title: 'Quyết định hủy', component: this.componentQuyetDinhHuy() },
                        ]}
                    />
                    <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.getPage} />
                    <AddModal ref={e => this.addModal = e} requestModal={this.requestModal} readOnly={!permission.write} create={this.props.createSvManageQuyetDinh} update={this.props.updateSvManageQuyetDinh} download={this.downloadWord} getSoQDCuoi={this.props.getSoQuyetDinhRaCuoi} getCtdt={this.props.getCtdt} getSvInfo={this.props.getStudentAdmin} user={this.props.system.user} getPage={this.getPage} svCheckSoQuyetDinh={this.props.svCheckSoQuyetDinh} downloadWord={this.downloadWordOptional} />
                    <AddModal ref={e => this.detailModal = e} requestModal={this.requestModal} create={this.props.createSvManageQuyetDinh} update={this.props.updateSvManageQuyetDinh} readOnly={true} getCtdt={this.props.getCtdt} getSvInfo={this.props.getStudentAdmin} user={this.props.system.user} getPage={this.getPage} />
                    <HuyQuyetDinhModal ref={e => this.huyModal = e} readOnly={!permission.write} huyQuyetDinh={this.props.huyQuyetDinh} getPage={this.getPage} />
                    <CreateRequest ref={e => this.requestModal = e} onHide={this.onHideRequest} />
                    {/* <AddModalDaoTao ref={e => this.addModalDaoTao = e} getUserPermission={this.getUserPermission} updateDtQuanLyQuyetDinh={this.props.updateDtQuanLyQuyetDinh} /> */}
                    <MultipleAddModalQuyetDinhDaoTao ref={e => this.multiModal = e} requestModal={this.requestModal} getUserPermission={this.getUserPermission} />
                    <SwitchStatusModal ref={e => this.switchStatusModal = e} done={this.getPage} />
                </>
            ),
            backRoute: '/user/ctsv/quyet-dinh',
            collapse: [
                { icon: 'fa-plus', type: 'info', name: 'Tạo mới', onClick: () => this.addModal.show(), permission: permission.write },
                { icon: 'fa-download', type: 'light', name: 'Xuất dữ liệu', onClick: this.exportData, permission: permission.ctsv }
            ]
        });
    }
}

const mapStateToProps = state => ({ system: state.system, svManageQuyetDinh: state.ctsv.svManageQuyetDinh });
const mapActionsToProps = { updateSvManageQuyetDinh, getSvManageQuyetDinhPage, downloadWord, deleteSvManageQuyetDinh, createSvManageQuyetDinh, huyQuyetDinh, getSoQuyetDinhRaCuoi, getCtdt, getStudentAdmin, getScheduleSettings, updateDtQuanLyQuyetDinh, downloadWordDaoTao, svCheckSoQuyetDinh };
export default connect(mapStateToProps, mapActionsToProps)(svManageQuyetDinhPage);
