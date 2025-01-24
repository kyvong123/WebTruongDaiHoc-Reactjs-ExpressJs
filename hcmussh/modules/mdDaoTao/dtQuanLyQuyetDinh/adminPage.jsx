import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, FormTabs, TableHead, renderDataTable } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { Tooltip } from '@mui/material';
import { getDtQuanLyQuyetDinhPage, huyDtQuanLyQuyetDinh, downloadWordDaoTao } from './redux';
// import { SelectAdapter_FwStudentsManageForm } from 'modules/mdCongTacSinhVien/fwStudents/redux';
// import { SelectAdapter_DmTinhTrangSinhVienV2 } from 'modules/mdDanhMuc/dmTinhTrangSinhVien/redux';
// import { SelectAdapter_PhoTruong } from 'modules/mdTccb/qtChucVu/redux';
import CreateRequest from 'modules/mdHanhChinhTongHop/hcthSoDangKy/components/createRequest';
// import AddModalQuyetDinhDaoTao from './modal/dtQuyetDinhModal';
import MultipleAddModalQuyetDinhDaoTao from './modal/dtMultipleQuyetDinhModal';
// import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
// import { SelectAdapter_DtNganhDaoTao } from '../dtNganhDaoTao/redux';
// import { SelectAdapter_DtKhoaDaoTao } from '../dtKhoaDaoTao/redux';
// import { SelectAdapter_KhungDaoTaoCtsvFilter } from 'modules/mdCongTacSinhVien/ctsvDtChuongTrinhDaoTao/redux';
// import { SelectAdapter_DtLopFilter } from 'modules/mdDaoTao/dtLop/redux';
// import { SelectAdapter_DtLopCtdt } from 'modules/mdCongTacSinhVien/ctsvDtLop/redux';
// import { SelectAdapter_SoDangKyAlternative } from 'modules/mdHanhChinhTongHop/hcthSoDangKy/redux/soDangKy';


const quyetDinhKhac = 3;
class dtQuanLyQuyetDinhPage extends AdminPage {
    state = { filter: { isDeleted: 0, maDonVi: 33, kieuQuyetDinh: quyetDinhKhac } }
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.getPage();
            // T.socket.on('updated-quyetdinh', (data) => {
            //     const { email } = this.props.system.user;
            //     if (data && data.email != email && !data.isNew) {
            //         const { firstName, lastName, maDangKy, action } = data;
            //         (action == 'U') && T.notify(`Cán bộ ${lastName} ${firstName} đã chỉnh sửa !${maDangKy}`, 'info');
            //         this.getPage();
            //     }
            // });
            // T.socket.on('created-quyetdinh', (data) => {
            //     this.addModal.checkSoQuyetDinh(data);
            //     this.getPage();
            // });
        });
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    // componentWillUnmount() {
    //     T.socket.off('updated-quyetdinh');
    //     T.socket.off('created-quyetdinh');
    // }

    getPage = (pageNumber, pageSize, pageCondition) => {
        this.props.getDtQuanLyQuyetDinhPage(pageNumber, pageSize, pageCondition, { kieuQuyetDinh: this.state.kieuQuyetDinh ? this.state.kieuQuyetDinh : null, ...this.state.filter });
    }

    showModal = (e) => {
        e.preventDefault();
        this.addModal.show();
    };


    downloadWordDaoTao = (e, item) => {
        e.preventDefault();
        this.props.downloadWordDaoTao(item.maDangKy, data => {
            T.FileSaver(new Blob([new Uint8Array(data.data)]), item.soQuyetDinh + '.docx');
        });
    }

    deleteItem = (item) => {
        T.confirm('Hủy quyết định', 'Bạn có chắc bạn muốn hủy quyết định này?', true, isConfirm =>
            isConfirm && this.props.huyDtQuanLyQuyetDinh(item.maDangKy, item.idSoQuyetDinh));
    }

    exportData = (e) => {
        e.preventDefault();
        T.download('/api/ctsv/quyet-dinh/export');
    }


    componentQuyetDinh = () => {
        const permission = this.getUserPermission('dtQuanLyQuyetDinh', ['read', 'write', 'cancel', 'delete', 'ctsv', 'edit']);
        const { list } = this.props.dtQuanLyQuyetDinh != null ? this.props.dtQuanLyQuyetDinh.page : { list: [] };
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
                                // this.addModal.show(item);
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
                        {(permission.delete) && <Tooltip title='Xóa' arrow>
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
            <div>{table}</div>
        </>);
    }

    onHideRequest = () => {
        this.addModal?.modal && $(this.addModal.modal)?.modal('show');
    }

    render() {
        // user = this.props.system.user;
        const permission = this.getUserPermission('dtQuanLyQuyetDinh', ['manage', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition } = this.props.dtQuanLyQuyetDinh && this.props.dtQuanLyQuyetDinh.page ? this.props.dtQuanLyQuyetDinh.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };

        return this.renderPage({
            icon: 'fa fa-file-text-o',
            title: 'Quản lý quyết định',
            breadcrumb: [
                <Link key={0} to={'/user/dao-tao'}>
                    Đào tạo
                </Link>,
                'Quản lý quyết định',
            ],
            content: (
                <>
                    <FormTabs
                        ref={e => this.tabs = e}
                        contentClassName='tile'
                        tabs={[
                            { id: 0, title: 'Tất cả', component: this.componentQuyetDinh() },
                        ]}
                    />
                    <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.getPage} />
                    {/* <AddModalQuyetDinhDaoTao ref={e => this.addModal = e} requestModal={this.requestModal} getUserPermission={this.getUserPermission} /> */}
                    <MultipleAddModalQuyetDinhDaoTao ref={e => this.multiModal = e} requestModal={this.requestModal} getUserPermission={this.getUserPermission} />
                    <CreateRequest ref={e => this.requestModal = e} onHide={this.onHideRequest} />
                </>
            ),
            backRoute: '/user/dao-tao',
            onCreate: () => permission.write && this.multiModal.show(),
            // collapse: [
            //     // { icon: 'fa-plus', type: 'info', name: 'Tạo mới', onClick: () => this.addModal.show(), permission: permission.write },
            //     { icon: 'fa-plus', type: 'success', name: 'Tạo mới', onClick: () => this.multiModal.show(), permission: permission.write },
            // ]
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtQuanLyQuyetDinh: state.daoTao.dtQuanLyQuyetDinh });
const mapActionsToProps = { getDtQuanLyQuyetDinhPage, huyDtQuanLyQuyetDinh, downloadWordDaoTao };
export default connect(mapStateToProps, mapActionsToProps)(dtQuanLyQuyetDinhPage);
