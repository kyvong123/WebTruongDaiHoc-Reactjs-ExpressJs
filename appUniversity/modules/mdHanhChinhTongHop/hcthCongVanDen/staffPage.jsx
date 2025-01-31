import React from 'react';
import { connect } from 'react-redux';
import {
    AdminPage,
    FormDatePicker,
    renderTable,
    FormSelect,
    TableCell,
    TableHeader,
    FormTabs,
    FormCheckbox
} from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import {
    getHcthCongVanDenAll,
    getHcthCongVanDenPage,
    createHcthCongVanDen,
    updateHcthCongVanDen,
    deleteHcthCongVanDen,
    getHcthCongVanDenSearchPage,
    updateUrgent
} from './redux';
import { SelectAdapter_DmDonViGuiCongVan } from 'modules/mdDanhMuc/dmDonViGuiCv/redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import Pagination from 'view/component/Pagination';
import { getTrangThaiText } from './staffEditPage';
import { Tooltip } from '@mui/material';
import { seenUpdate } from 'modules/mdHanhChinhTongHop/hcthVanPhongDienTu/redux';

const { trangThaiSwitcher } = require('../constant');

const timeList = [
    { id: 1, text: 'Theo ngày văn bản' },
    { id: 2, text: 'Theo ngày nhận' },
    { id: 3, text: 'Theo ngày hết hạn' },
];

const TAB_ID = 'congVanDenTabs';

const
    start = new Date().getFullYear(),
    end = 1900,
    yearSelector = [...Array(start - end + 1).keys()].map(i => ({
        id: start - i,
        text: start - i
    }));


class HcthCongVanDenStaffPage extends AdminPage {

    state = { filter: {}, sortBy: '', sortType: '', tab: 0 };

    componentDidMount() {
        T.ready(this.getSiteSetting().readyUrl, () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                this.congVanYear?.value(0);
                this.maDonViGuiCV?.value('');
                this.donViNhanCongVan?.value('');
                this.canBoNhanCongVan?.value('');
                this.timeType?.value('');
                this.fromTime?.value('');
                this.toTime?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
        });
    }


    getSiteSetting = () => {
        const pathName = window.location.pathname;
        if (pathName.startsWith('/user/hcth'))
            return {
                readyUrl: '/user/hcth',
                breadcrumb: [
                    <Link key={0} to='/user/hcth'>Hành chính tổng hợp</Link>,
                    'Danh sách Văn bản đến',
                ],
                backRoute: '/user/hcth',
                baseUrl: '/user/hcth/van-ban-den',
            };
        else
            return {
                readyUrl: '/user/van-phong-dien-tu',
                breadcrumb: [
                    <Link key={0} to='/user/'>...</Link>,
                    <Link key={1} to='/user/van-phong-dien-tu'>Văn phòng điện tử</Link>,
                    'Danh sách Văn bản đến',
                ],
                backRoute: '/user/van-phong-dien-tu',
                baseUrl: '/user/van-ban-den',
            };
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.hcthCongVanDen && this.props.hcthCongVanDen.page ? this.props.hcthCongVanDen.page : { pageNumber: 1, pageSize: 50 };
        let
            donViGuiCongVan = this.donViGuiCongVan?.value() || null,
            donViNhanCongVan = this.donViNhanCongVan?.value().toString() || null,
            canBoNhanCongVan = this.canBoNhanCongVan?.value() || null,
            timeType = this.timeType?.value() || null,
            fromTime = this.fromTime?.value() ? Number(this.fromTime.value()) : null,
            toTime = this.toTime?.value() ? Number(this.toTime.value()) : null,
            congVanYear = this.congVanYear?.value() || null,
            status = this.status?.value() || null,
            tab = this.tabs?.selectedTabIndex(),
            requireProcessing = Number(this.requireProcessing?.value()) || 0;

        const pageFilter = isInitial ? {} : { requireProcessing, donViGuiCongVan, donViNhanCongVan, canBoNhanCongVan, timeType, fromTime, toTime, congVanYear, tab, status };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                this.setState({ loading: false });
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.donViGuiCongVan?.value(filter.donViGuiCongVan || '');
                    this.donViNhanCongVan?.value(filter.donViNhanCongVan || '');
                    this.canBoNhanCongVan?.value(filter.canBoNhanCongVan || '');
                    this.timeType?.value(filter.timeType || '');
                    this.fromTime?.value(filter.fromTime || '');
                    this.toTime?.value(filter.toTime || '');
                    this.congVanYear?.value(filter.congVanYear || '');
                    this.status?.value(filter.status || '');
                    this.requireProcessing?.value(filter.requireProcessing || '');
                    if (!$.isEmptyObject(filter) && filter && (filter.donViGuiCongVan || filter.donViNhanCongVan || filter.canBoNhanCongVan || filter.timeType || filter.fromTime || filter.toTime || filter.requireProcessing)) this.showAdvanceSearch();
                }
            });
        });
    };

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getHcthCongVanDenSearchPage(pageN, pageS, pageC, { ...this.state.filter, sortBy: this.state.sortBy, sortType: this.state.sortType }, done);
    }



    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    onDelete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa Văn bản đến', 'Bạn có chắc bạn muốn xóa văn bản này?', true,
            isConfirm => isConfirm && this.props.deleteHcthCongVanDen(item.id));
    }

    onSort = (value, type) => {
        this.setState({ sortBy: type && value, sortType: type }, () => this.changeAdvancedSearch());
    }


    updateSeen = (item) => {
        this.props.seenUpdate(item.id, { seen: item.seen, loai: 'DEN' }, this.changeAdvancedSearch);
    }

    render() {
        const user = this.props.system && this.props.system.user ? this.props.system.user : {},
            { staff } = user, currentPermissions = this.getCurrentPermissions(),
            donViQuanLy = staff && staff.donViQuanLy ? staff.donViQuanLy : [],
            permission = this.getUserPermission('hcthCongVanDen', ['read', 'write', 'delete', 'manage']),
            { baseUrl, backRoute, breadcrumb } = this.getSiteSetting();
        const hcthStaff = currentPermissions.includes('hcth:login');

        const statusSelector = Object.keys(trangThaiSwitcher).filter(key => hcthStaff || trangThaiSwitcher[key].id != trangThaiSwitcher.MOI.id).map(key => trangThaiSwitcher[key]);

        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.hcthCongVanDen && this.props.hcthCongVanDen.page ? this.props.hcthCongVanDen.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = renderTable({
            style: { marginTop: '5px', maxHeight: '70vh' },
            getDataSource: () => this.state.loading ? null : list,
            emptyTable: 'Không có dữ liệu Văn bản đến',
            stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', }}>Số VB</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', }}>Số đến</th>
                    <TableHeader style={{ width: 'auto', whiteSpace: 'nowrap' }} sort isSorted={this.state.sortBy == 'tinhTrang'} onSort={(type) => this.onSort('tinhTrang', type)}>Tình trạng</TableHeader>
                    <TableHeader style={{ width: '10%', whiteSpace: 'nowrap' }} sort isSorted={this.state.sortBy == 'ngayNhan'} onSort={(type) => this.onSort('ngayNhan', type)}>Ngày nhận</TableHeader>
                    <TableHeader style={{ width: '10%', whiteSpace: 'nowrap' }} sort isSorted={this.state.sortBy == 'ngayHetHan'} onSort={(type) => this.onSort('ngayHetHan', type)}>Hết hạn</TableHeader>
                    <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Đơn vị gửi</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Đơn vị chủ trì</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Trích yếu</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Đơn vị, người nhận</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => {
                let danhSachCanBoNhan = item.danhSachCanBoNhan?.split(';');
                let danhSachDonViNhan = item.danhSachDonViNhan?.split(';');
                let requireDirect = item.isDirect != null && item.trangThai == trangThaiSwitcher.CHO_DUYET.id;
                return (
                    <tr key={index} style={item.mauDoKhanVanBan ? { backgroundColor: item.mauDoKhanVanBan } : {}} className={`${item.seen ? '' : 'font-weight-bold'} ${item.isUrgent ? 'table-danger' : ''}`}>
                        <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={<span>{(pageNumber - 1) * pageSize + index + 1} {[trangThaiSwitcher.DA_PHAN_PHOI.id, trangThaiSwitcher.THEO_DOI_TIEN_DO.id].includes(item.trangThai) && <i className='text-success fa fa-lg fa-check-circle-o' />}</span>} />
                        <TableCell type='text' content={
                            <>
                                <Link to={`${baseUrl}/${item.id}`}>{item.soCongVan || 'Chưa có số văn bản'}</Link>
                                {item.ngayCongVan ? <span style={{ whiteSpace: 'nowrap' }}><br />{'Ngày VB: ' + T.dateToText(item.ngayCongVan, 'dd/mm/yyyy')}</span> : null}
                                {item.doKhanVanBan ? <span style={{ whiteSpace: 'nowrap' }}><br />{'Độ khẩn: ' + item.doKhanVanBan}</span> : null}
                            </>
                        } />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.soDen} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={
                            <div className='d-flex flex-column'>
                                <span style={{ color: [trangThaiSwitcher.MOI.id, trangThaiSwitcher.TRA_LAI_BGH.id, trangThaiSwitcher.TRA_LAI_HCTH.id].includes(item.trangThai) ? 'red' : 'blue' }}>{getTrangThaiText(item.trangThai)}</span>
                                {item.hasNhiemVu && <div>(Đã giao nhiệm vụ)</div>}

                                {requireDirect && <div className='blinking badge badge-pill badge-primary m-0'><h6 className='m-0 p-0'>(yêu cầu chỉ đạo)</h6></div>}
                            </div>
                        } />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={
                            item.ngayNhan ? (<>
                                <span style={{ color: 'blue' }}> {T.dateToText(item.ngayNhan, 'dd/mm/yyyy')}</span>
                            </>) : null
                        } />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={
                            item.ngayHetHan ? (<>
                                <span style={{ color: 'red' }}> {T.dateToText(item.ngayHetHan, 'dd/mm/yyyy')}</span>
                            </>) : null
                        } />
                        <TableCell type='text' contentClassName='multiple-lines' contentStyle={{ width: '100%' }} content={item.tenDonViGuiCV} />
                        <TableCell type='text' contentClassName='multiple-lines' contentStyle={{ width: '100%' }} content={item.donViChuTri || ''} />
                        <TableCell type='text' contentClassName='multiple-lines-3' contentStyle={{ width: '100%', minWidth: '300px' }} content={<div style={{ display: 'inline-block' }}>
                            {item.isUrgent ? <div className='blinking badge badge-pill badge-danger m-0'><h6 className='m-0 p-0'>(Gấp) </h6></div> : null}&nbsp;
                            {item.maDoKhanVanBan && item.maDoKhanVanBan != 'THUONG' ? <div className='blinking badge badge-pill badge-danger m-0'><h6 className='m-0 p-0'>({item.doKhanVanBan}) </h6></div> : null}&nbsp;
                            {item.trichYeu || ''}
                        </div>} />
                        <TableCell type='text' contentClassName='multiple-lines' style={{}} content={
                            <>
                                <span>{danhSachCanBoNhan && danhSachCanBoNhan.length > 0 ? danhSachCanBoNhan.map((item, index) => (
                                    <span key={index}>
                                        <b style={{ color: 'blue' }}>{item.normalizedName()}</b>
                                        <br />
                                    </span>
                                )) : null}
                                </span>
                                <span>{danhSachDonViNhan && danhSachDonViNhan.length > 0 ? danhSachDonViNhan.map((item, index) => (
                                    <span key={index}>
                                        <b>{item || ''}</b>
                                        <br />
                                    </span>
                                )) : null
                                }</span>
                            </>
                        } />

                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={{ ...permission, delete: permission.delete && item.trangThai == trangThaiSwitcher.MOI.id }} onEdit={`${baseUrl}/${item.id}`} onDelete={(e) => this.onDelete(e, item)} permissions={currentPermissions} >
                            {item.seen == 1 && <Tooltip arrow title='Đánh dấu chưa đọc'>
                                <button className='btn btn-danger' onClick={(e) => e.preventDefault() || this.updateSeen(item)}>
                                    <i className='fa fa-envelope' />
                                </button>
                            </Tooltip>}
                            {item.seen == 0 && <Tooltip arrow title='Đánh dấu đã đọc'>
                                <button className='btn btn-success' onClick={(e) => e.preventDefault() || this.updateSeen(item)}>
                                    <i className='fa fa-envelope-open' />
                                </button>
                            </Tooltip>}
                            {permission.manage && !item.isUrgent && <Tooltip arrow title='Gấp'>
                                <button className='btn btn-warning' onClick={(e) => e.preventDefault() || this.props.updateUrgent(item.id, () => this.changeAdvancedSearch())}>
                                    <i className='fa fa-fire' />
                                </button>
                            </Tooltip>}
                            {permission.manage && !!item.isUrgent && <Tooltip arrow title=''>
                                <button className='btn btn-info' onClick={(e) => e.preventDefault() || this.props.updateUrgent(item.id, () => this.changeAdvancedSearch())}>
                                    <i className='fa fa-fire-extinguisher' />
                                </button>
                            </Tooltip>}
                        </TableCell>
                    </tr>);
            }
        });

        let tabList = {
            all: {
                title: 'Tất cả',
            },
            donVi: {
                title: 'Đơn vị quản lý',
            },
            self: {
                title: 'Cá nhân',
            }
        };

        const tabs = !(user.isStaff || user.isStudent) ? [tabList.all] :
            donViQuanLy.length || currentPermissions.includes('president:login') || currentPermissions.includes('donViCongVanDen:read') ? [tabList.all, tabList.donVi, tabList.self]
                : currentPermissions.includes('rectors:login') || (currentPermissions.includes('hcth:login')) ? [tabList.all, tabList.self]
                    : [tabList.self];

        return this.renderPage({
            icon: 'fa fa-caret-square-o-left',
            title: 'Văn bản đến',
            breadcrumb,
            header: <>
                <FormSelect style={{ width: '150px', marginBottom: '0' }} allowClear={true} ref={e => this.congVanYear = e} placeholder='Năm' onChange={() => this.changeAdvancedSearch()} data={yearSelector} />
                {(currentPermissions.includes('rectors:login') || currentPermissions.includes('hcth:login')) && <FormSelect style={{ width: '150px', marginBottom: '0', marginLeft: '5px' }} allowClear={true} ref={e => this.status = e} placeholder='Tình trạng' onChange={() => this.changeAdvancedSearch()} data={statusSelector} />}
            </>,
            advanceSearch: <>
                <div className='row'>
                    <div className='col-12 col-md-12 row'>

                        <FormSelect allowClear={true} className='col-md-4' ref={e => this.timeType = e} label='Theo thời gian' data={timeList} onChange={() => this.changeAdvancedSearch()} />
                        {this.timeType?.value() && (<>
                            <FormDatePicker type='date' className='col-md-4' ref={e => this.fromTime = e} label='Từ ngày' onChange={() => this.changeAdvancedSearch()} />
                            <FormDatePicker type='date' className='col-md-4' ref={e => this.toTime = e} label='Đến ngày' onChange={() => this.changeAdvancedSearch()} />
                        </>)}
                    </div>
                    <FormSelect allowClear={true} className='col-md-4' ref={e => this.donViGuiCongVan = e} label='Đơn vị gửi văn bản' data={SelectAdapter_DmDonViGuiCongVan} onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect multiple={true} allowClear={true} className='col-md-4' ref={e => this.donViNhanCongVan = e} label='Đơn vị nhận văn bản' data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect allowClear={true} className='col-md-4' ref={e => this.canBoNhanCongVan = e} label='Cán bộ nhận văn bản' data={SelectAdapter_FwCanBo} onChange={() => this.changeAdvancedSearch()} />
                </div>
            </>,
            content: <div className='tile'>
                <div className='col-md-12 d-flex' style={{ gap: 10 }}>
                    <FormCheckbox label='Văn bản chờ bạn xử lý' ref={e => this.requireProcessing = e} onChange={() => this.changeAdvancedSearch()} />
                </div>
                <FormTabs style={tabs.length == 1 ? { display: 'none' } : {}} ref={e => this.tabs = e} tabs={tabs} id={TAB_ID} onChange={() => this.setState({ loading: true }, this.changeAdvancedSearch)} />
                {table}
                < Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
            </div>,

            onCreate: permission && permission.write ? () => this.props.history.push(`${baseUrl}/new`) : null,
            onExport: (e) => {
                e.preventDefault();
                let filter = T.stringify(this.state.filter);
                if (filter.includes('%')) filter = '{}';
                T.download(`/api/hcth/van-ban-den/download-excel/${filter}`, 'CONG_VAN_DEN.xlsx');
            },
            backRoute,
            buttons: [
                currentPermissions.includes('hcthVanBanDenSigning:verification') && ({ className: 'btn-warning', icon: 'fa-certificate', tooltip: 'Xác thực', onClick: e => e.preventDefault() || this.props.history.push('/user/hcth/van-ban-den/sign') })
            ],
        });
    }
}


const mapStateToProps = state => ({ system: state.system, hcthCongVanDen: state.hcth.hcthCongVanDen });
const mapActionsToProps = { getHcthCongVanDenAll, getHcthCongVanDenPage, createHcthCongVanDen, updateHcthCongVanDen, deleteHcthCongVanDen, getHcthCongVanDenSearchPage, seenUpdate, updateUrgent };
export default connect(mapStateToProps, mapActionsToProps)(HcthCongVanDenStaffPage);
