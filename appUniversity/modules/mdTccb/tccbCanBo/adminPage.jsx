import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import { AdminPage, loadSpinner, TableCell, TableHead, renderDataTable, FormTabs, FormCheckbox, FormSelect } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getStaffPage, exportExcel } from './redux';
import { NghiViecModal } from '../qtNghiViec/adminPage';
import { createQtNghiViecStaff, updateQtNghiViecStaff } from '../qtNghiViec/redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmChucVuV2 } from 'modules/mdDanhMuc/dmChucVu/redux';
import { SelectAdapter_DmChucDanhChuyenMonV2 } from 'modules/mdDanhMuc/dmChucDanhChuyenMon/redux';
import { SelectAdapter_DmTrinhDoV2 } from 'modules/mdDanhMuc/dmTrinhDo/redux';
class StaffPage extends AdminPage {
    state = { filter: { loaiCanBo: '0' }, isLoading: true };
    mapCanBo = {
        '0': { name: 'Danh sách cán bộ trường' },
        '1': { name: 'Danh sách cán bộ đơn vị' },
        '2': { name: 'Danh sách cán bộ ngoài trường' },
        '3': { name: 'Danh sách cán bộ nghỉ việc' },
    }

    danhSachLoaiCanBo = [
        'Biên chế',
        'Hợp đồng',
        'Hợp đồng trách nhiệm',
        'Cán bộ ngoài trường',
        'Cán bộ nghỉ việc',
    ]

    create = (e) => {
        e.preventDefault();
        this.props.history.push('/user/tccb/staff/new');
    };

    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.onSearch = (searchText) => {
                this.getPage(undefined, undefined, searchText || '');
            };
            T.showSearchBox(() => {
                ['maDonVi', 'maChucVu', 'tenChucDanhChuyenMon', 'loaiCanBo', 'trinhDo'].forEach(e => this[e]?.value(''));
            });
            this.formTab.tabClick(null, 0, () => {
                this.changeAdvancedSearch(true, false);
            });
        });
    }

    changeAdvancedSearch = (isInitial = false, isReset = false) => {
        let { pageNumber, pageSize } = this.props && this.props.staff && this.props.staff.page ? this.props.staff.page : { pageNumber: 1, pageSize: 50 };
        const listDonVi = this.maDonVi?.value().toString() || '';
        const listChucVu = this.maChucVu?.value().toString() || '';
        const listChucDanhChuyenMon = this.tenChucDanhChuyenMon?.value().toString() || '';
        const listLoaiCanBo = this.loaiCanBo?.value().toString() || '';
        const listTrinhDo = this.trinhDo?.value().toString() || '';
        const pageFilter = (isInitial || isReset) ? { loaiCanBo: this.state.filter.loaiCanBo } : { listDonVi, listChucVu, listChucDanhChuyenMon, listLoaiCanBo, listTrinhDo, loaiCanBo: this.state.filter.loaiCanBo };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.maDonVi?.value(filter.listDonVi || '');
                    this.maChucVu?.value(filter.listChucVu || '');
                    this.tenChucDanhChuyenMon?.value(filter.listChucDanhChuyenMon || '');
                    this.loaiCanBo?.value(filter.listLoaiCanBo || '');
                    this.trinhDo?.value(filter.listTrinhDo || '');
                } else {
                    this.hideAdvanceSearch();
                    if (isReset) {
                        ['maDonVi', 'maChucVu', 'tenChucDanhChuyenMon', 'loaiCanBo', 'trinhDo'].forEach(e => this[e]?.value(''));
                        this.getPage();
                    }
                }
            });
        });
    }


    // handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
    //     this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
    //         this.getPage(pageNumber, pageSize, pageCondition);
    //     });
    // }

    // getPage = (pageN, pageS, pageC, done) => {
    //     this.props.getStaffPage(pageN, pageS, pageC, { ...this.state.filter, allStaff: this.state.allStaff ?? 0 }, done);
    // }


    // delete = (e, item) => {
    //     e.preventDefault();
    //     T.confirm('Cán bộ', 'Bạn có chắc bạn muốn xóa cán bộ này?', 'warning', true, isConfirm =>
    //         isConfirm && this.props.deleteStaff(item.shcc));
    handleKeySearch = (data) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } },
            () => {
                this.getPage();
            });
    };


    // handleBienChe = (value) => {
    //     if (value && value.id == '1') {
    //         this.setState({ visibleHDTN: true }, () => this.loaiHopDong.focus());
    //     } else {
    //         this.setState({ visibleHDTN: false });
    //     }
    getPage = (pageN, pageS, pageC, done) => {
        this.setState({ isLoading: false }, () => {
            this.props.getStaffPage(pageN, pageS, pageC, this.state.filter, done);
        });
    }

    // handleChucDanhNgheNghiep = () => {
    //     if (this.listNgach.value().includes('01.003')) {
    //         this.setState({ visibleCVDT: true }, () => this.loaiChuyenVien.focus());
    //     } else {
    //         this.setState({ visibleCVDT: false });
    //     }
    onChange = (value) => {
        const { listDonVi, listChucVu, listChucDanhChuyenMon, listLoaiCanBo, listTrinhDo } = this.state.filter;
        this.setState({
            filter: {
                loaiCanBo: value.tabIndex?.toString() || '', listDonVi, listChucVu, listChucDanhChuyenMon, listLoaiCanBo, listTrinhDo
            }
        }, () => {
            this.getPage();
        });
    }


    // export = (e, pageCondition) => {
    //         e.preventDefault();
    //         if (e.type == 'click') {
    //             this.setState({ exported: true }, () => {
    //                 const filter = T.stringify(this.state.filter);
    //                 let pageC = pageCondition;
    //                 pageC = typeof pageC === 'string' ? pageC : '';
    //                 if (pageC.length == 0) pageC = null;
    //                 T.download(`/api/tccb/staff/download-excel/${filter}/${pageC}`, 'DANH_SACH_CAN_BO.xlsx');
    //                 setTimeout(() => {
    //                     this.setState({ exported: false });
    //                 }, 1000);
    //             });
    export = (e, pageCondition) => {
        e.preventDefault();
        let pageC = pageCondition;
        pageC = typeof pageC === 'string' ? pageC : '';
        if (pageC.length == 0) pageC = null;
        this.props.exportExcel(this.state.filter, pageCondition);
    }

    onSort = (sortTerm) => {
        this.setState({
            filter: {
                ...this.state.filter, sortKey: sortTerm?.split('_')[0].toString() || '', sortMode: sortTerm?.split('_')[1].toString() || ''
            }
        }, () => {
            this.getPage();
        });
    }

    render() {
        const onKeySearch = this.state.isKeySearch ? this.handleKeySearch : null,
            // const permission = this.getUserPermission('staff');
            // let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.staff && this.props.staff.page ?
            //     this.props.staff.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
            // const table = renderDataTable({
            permission = this.getUserPermission('staff', ['read', 'write', 'export']),
            { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.staff && this.props.staff.page ? this.props.staff.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] },
            canBoTruongTable = renderDataTable({
                emptyTable: 'Không có dữ liệu',
                data: list,
                divStyle: { height: '80vh' },
                header: 'thead-light',
                className: this.state.isFixCol ? 'table-fix-col' : '',
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <TableHead onKeySearch={onKeySearch} onSort={this.onSort} style={{ width: '40%', textAlign: 'center', minWidth: '220px' }} content='Họ tên' keyCol='hoTen' />
                        <TableHead onKeySearch={onKeySearch} onSort={this.onSort} style={{ width: 'auto', textAlign: 'center', minWidth: '180px' }} content='Mã cán bộ' keyCol='shcc' />
                        <TableHead onKeySearch={onKeySearch} style={{ width: 'auto', textAlign: 'center', minWidth: '150px' }} content='Ngày sinh' keyCol='ngaySinh' typeSearch='date' />
                        <TableHead onKeySearch={onKeySearch} onSort={this.onSort} style={{ width: '40%', textAlign: 'center', minWidth: '220px' }} content='Đơn vị công tác' keyCol='donVi' />
                        <TableHead onKeySearch={onKeySearch} style={{ width: '20%', textAlign: 'center', minWidth: '150px' }} content='Chức vụ' keyCol='chucVu' />
                        <TableHead onKeySearch={onKeySearch} style={{ width: 'auto', textAlign: 'center', minWidth: '220px' }} content='Chức danh chuyên môn' keyCol='chucDanhChuyenMon' />
                        <TableHead onKeySearch={onKeySearch} style={{ width: 'auto', textAlign: 'center', minWidth: '150px' }} content='Trình Độ' keyCol='hocVi' />
                        <TableHead onKeySearch={onKeySearch} style={{ width: 'auto', textAlign: 'center', minWidth: '150px' }} content='Loại cán bộ' keyCol='loaiCanBo' />
                        <TableHead onKeySearch={onKeySearch} style={{ width: 'auto', textAlign: 'center', minWidth: '300px' }} content='Tình trạng công việc' keyCol='tinhTrangCongViec' />
                        {permission.write && this.state.filter.loaiCanBo == '0' && <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>}
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} type='text' content={<a href={this.state.filter.loaiCanBo == '0' ? `/user/tccb/staff/${item.shcc}` : null} target='_blank' rel='noreferrer' >{this.state.filter.loaiCanBo == '3' ? item.hoTen?.toUpperCase() || '' : (item.ho?.toUpperCase() || '') + ' ' + (item.ten?.toUpperCase() || '')}</a>} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.shcc} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy' content={item.ngaySinh} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.donVi || ''} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.chucVu || ''} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.chucDanhChuyenMon || ''} contentClassName='multiple-lines-2' />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hocVi || ''} contentClassName='multiple-lines-2' />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.loaiCanBo} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tinhTrangCongViec} />
                        {permission.write && this.state.filter.loaiCanBo == '0' && <TableCell style={{ whiteSpace: 'nowrap' }} type='buttons' content={item} permission={permission} onEdit={(this.state.filter.loaiCanBo == '0' || this.state.filter.loaiCanBo == '3') ? `/user/tccb/staff/${item.shcc}` : null} >
                            {permission.write && this.state.filter.loaiCanBo == '0' && <Tooltip title='Đánh dấu nghỉ việc' arrow>
                                <button className='btn btn-secondary' onClick={e => {
                                    item.hoCanBo = item.ho;
                                    item.hoTen = (item.ho || '') + ' ' + (item.ten || '');
                                    e.preventDefault() || this.nghiViec.show(item);
                                }}>
                                    <i className='fa fa-lg fa-user-times' />
                                </button>
                            </Tooltip>}
                        </TableCell>}
                    </tr >
                )
            });

        const danhSachCanBo = <>
            {this.state.isLoading ? loadSpinner() : canBoTruongTable}
            <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.getPage} />
        </>;

        return this.renderPage({
            icon: 'fa fa-users',
            title: 'Cán bộ',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Cán bộ'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormSelect className='col-12 col-md-6' ref={e => this.maDonVi = e} label='Đơn vị' data={SelectAdapter_DmDonVi} allowClear multiple minimumResultsForSearch={-1} />
                    <FormSelect className='col-md-6' ref={e => this.maChucVu = e} label='Chức vụ' data={SelectAdapter_DmChucVuV2} allowClear multiple />
                    <FormSelect className='col-md-6' ref={e => this.tenChucDanhChuyenMon = e} label='Chức danh chuyên môn' data={SelectAdapter_DmChucDanhChuyenMonV2} allowClear multiple />
                    <FormSelect className='col-md-6' ref={e => this.loaiCanBo = e} label='Loại cán bộ' data={this.danhSachLoaiCanBo} allowClear multiple />
                    <FormSelect className='col-md-6' ref={e => this.trinhDo = e} label='Trình độ' data={SelectAdapter_DmTrinhDoV2} allowClear multiple />
                    <div className='col-12'>
                        <div className='row justify-content-between'>
                            <div className='form-group col-md-12' style={{ textAlign: 'right' }}>
                                <button className='btn btn-danger' style={{ marginRight: '10px' }} type='button' onClick={e => e.preventDefault() || this.changeAdvancedSearch(false, true)}>
                                    <i className='fa fa-fw fa-lg fa-times' />Xóa bộ lọc
                                </button>
                                <button className='btn btn-info' type='button' onClick={e => e.preventDefault() || this.changeAdvancedSearch()}>
                                    <i className='fa fa-fw fa-lg fa-search-plus' />Tìm kiếm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </>,
            content: <>
                <div className='tile'>
                    <div style={{ marginBottom: '10px' }}>Kết quả: {<b>{totalItem}</b>} cán bộ</div>
                    <div style={{ gap: 10, display: 'inline-flex' }}>
                        <FormCheckbox label='Tìm theo cột' onChange={value => this.setState({ isKeySearch: value })} style={{ marginBottom: '0' }} />
                        <FormCheckbox label='Thao tác nhanh' onChange={value => this.setState({ isFixCol: value })} style={{ marginBottom: '0' }} />
                    </div>
                    <FormTabs ref={e => this.formTab = e} onChange={value => this.onChange(value)}
                        tabs={
                            Object.entries(this.mapCanBo).map(item => {
                                return { title: item[1].name, component: this.state.filter.loaiCanBo == item[0] ? danhSachCanBo : null };
                            })
                        }
                    />
                    <NghiViecModal ref={e => this.nghiViec = e} getStaffPage={this.props.getStaffPage}
                        create={this.props.createQtNghiViecStaff} canBoSend={true} update={this.props.updateQtNghiViecStaff} />
                </div>
            </>,
            backRoute: '/user/tccb',
            collapse: [
                { icon: 'fa-plus-square', name: 'Thêm cán bộ mới', permission: permission.write, type: 'info', onClick: (e) => this.create(e) },
                { icon: 'fa-print', name: 'Export', permission: permission.write, type: 'success', onClick: (e) => this.export(e, pageCondition) },
                { icon: 'fa-list-ol', name: 'Tạo danh sách nghỉ hưu dự kiến', permission: permission.write, type: 'warning', onClick: () => this.props.history.push('/user/tccb/qua-trinh/nghi-viec/create-list') },
                // { icon: 'fa-print', name: 'Export', permission: permission.write, type: 'info', onClick: (e) => this.export(e, pageCondition) },
            ]
        });
    }
}

const mapStateToProps = state => ({ system: state.system, staff: state.tccb.staff, canBoDonVi: state.tccb.canBoDonVi, dtCanBoNgoaiTruong: state.daoTao.dtCanBoNgoaiTruong, qtNghiViec: state.tccb.qtNghiViec });
const mapActionsToProps = { getStaffPage, createQtNghiViecStaff, updateQtNghiViecStaff, exportExcel };
export default connect(mapStateToProps, mapActionsToProps)(StaffPage);