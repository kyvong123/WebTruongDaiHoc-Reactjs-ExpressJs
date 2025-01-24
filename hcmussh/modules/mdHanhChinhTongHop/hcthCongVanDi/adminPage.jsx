import React from 'react';
import { connect } from 'react-redux';
import {
    createHcthCongVanDi,
    updateHcthCongVanDi,
    deleteHcthCongVanDi,
    getHcthCongVanDiSearchPage
} from './redux/vanBanDi';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, FormSelect, TableCell, FormDatePicker, FormCheckbox, FormTabs } from 'view/component/AdminPage';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { SelectAdapter_DmDonViGuiCongVan } from 'modules/mdDanhMuc/dmDonViGuiCv/redux';
import { SelectAdapter_DmLoaiVanBan } from 'modules/mdDanhMuc/dmLoaiVanBan/redux/dmLoaiVanBan';
import { SelectAdapter_HcthCapVanBan } from 'modules/mdHanhChinhTongHop/hcthVanBanDiStatusSystem/redux/hcthCapVanBan';

import { SelectAdapter_HcthVanBanDiStatus } from 'modules/mdHanhChinhTongHop/hcthVanBanDiStatusSystem/redux/hcthVanBanDiStatus';
import { Tooltip } from '@mui/material';
import VanBanHorizontalTimeTine from './components/horizontalTimeline';
import { seenUpdate } from 'modules/mdHanhChinhTongHop/hcthVanPhongDienTu/redux';
const { capVanBan } = require('../constant');


const timeList = [
    { id: 1, text: 'Theo ngày gửi' },
    { id: 2, text: 'Theo ngày ký' }
];

const TAB_ID = 'VAN_BAN_DI_TABS';

const start = new Date().getFullYear(),
    end = 1900,
    yearSelector = [...Array(start - end + 1).keys()].map(i => ({
        id: start - i,
        text: start - i
    }));

class HcthCongVanDi extends AdminPage {
    state = { filter: {}, detail: false };

    componentDidMount() {
        T.ready(this.getSiteSetting().readyUrl, () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                this.congVanYear?.value(0);
                this.maDonViGui?.value('');
                this.maDonViNhan?.value('');
                this.maCanBoNhan?.value('');
                this.donViNhanNgoai?.value('');
                this.status?.value('');
                this.timeType?.value('');
                this.fromTime?.value('');
                this.toTime?.value('');
                this.loaiVanBan?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.detail.value(false);
        });
    }

    getSiteSetting = () => {
        const pathName = window.location.pathname;
        if (pathName.startsWith('/user/hcth'))
            return {
                readyUrl: '/user/hcth',
                breadcrumb: [
                    <Link key={0} to='/user/hcth'>Hành chính tổng hợp</Link>,
                    'Danh sách văn bản đi',
                ],
                backRoute: '/user/hcth',
                baseUrl: '/user/hcth/van-ban-di',
            };
        else
            return {
                readyUrl: '/user/van-phong-dien-tu',
                breadcrumb: [
                    <Link key={0} to='/user/'>...</Link>,
                    <Link key={1} to='/user/van-phong-dien-tu'>Văn phòng điện tử</Link>,
                    'Danh sách văn bản đi',
                ],
                backRoute: '/user',
                baseUrl: '/user/van-ban-di',
            };
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.hcthCongVanDi && this.props.hcthCongVanDi.page ? this.props.hcthCongVanDi.page : { pageNumber: 1, pageSize: 50 };
        let donViGui = this.donViGui?.value() || null;
        let donViNhan = this.donViNhan?.value() || null;
        let canBoNhan = this.canBoNhan?.value() || null;
        let capVanBan = this.capVanBan?.value() || null;
        let loaiVanBan = this.loaiVanBan?.value() || null;
        let donViNhanNgoai = this.donViNhanNgoai?.value() || null;
        let status = this.status?.value() || null;
        let timeType = this.timeType?.value() || null;
        let fromTime = this.fromTime?.value() ? Number(this.fromTime.value()) : null;
        let toTime = this.toTime?.value() ? Number(this.toTime.value()) : null;
        let congVanYear = this.congVanYear?.value() || null;
        let tabId = this.tabs?.selectedTabIndex(), requireProcessing = 0, isProcessed = 0;
        if (tabId == 1) {
            requireProcessing = 1;
        } else if (tabId == 2) {
            isProcessed = 1;
        }
        let permissions = this.getCurrentPermissions();
        let hcthStaff = permissions.includes('hcth:login') ? { capVanBan: 'TRUONG', requireProcessing, isProcessed } : { requireProcessing, isProcessed };

        const pageFilter = isInitial ? hcthStaff : { isProcessed, requireProcessing, donViGui, donViNhan, canBoNhan, capVanBan, loaiVanBan, donViNhanNgoai, status, timeType, fromTime, toTime, congVanYear };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page?.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.donViGui?.value(filter.donViGui || '');
                    this.donViNhan?.value(filter.donViNhan || '');
                    this.canBoNhan?.value(filter.canBoNhan || '');
                    this.capVanBan?.value(filter.capVanBan || '');
                    this.loaiVanBan?.value(filter.loaiVanBan || '');
                    this.status?.value(filter.status || '');
                    this.donViNhanNgoai?.value(filter.donViNhanNgoai || '');
                    this.timeType?.value(filter.timeType || '');
                    this.fromTime?.value(filter.fromTime || '');
                    this.toTime?.value(filter.toTime || '');
                    this.congVanYear?.value(filter.congVanYear || '');
                    if (!$.isEmptyObject(filter) && filter && (filter.donViGui || filter.donViNhan || filter.canBoNhan || filter.donViNhanNgoai || filter.timeType || filter.fromTime || filter.toTime || filter.loaiVanBan)) this.showAdvanceSearch();
                }
            });
        });
    };

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getHcthCongVanDiSearchPage(pageN, pageS, pageC, this.state.filter, () => {
            this.setState({ loading: false }, done);
        });
    }

    onDelete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa văn bản', 'Bạn có chắc chắn muốn xóa văn bản này?', true,
            isConfirm => isConfirm && this.props.deleteHcthCongVanDi(item.id));
    }

    getButtons = () => {
        const buttons = [];
        const { baseUrl } = this.getSiteSetting(),
            permissions = this.getCurrentPermissions();
        if (permissions.some(item => ['hcthSoVanBan:write', 'donViCongVanDi:edit'].includes(item))) {
            buttons.push({ className: 'btn-info', icon: 'fa-refresh', tooltip: 'Chuyển đổi văn bản', onClick: e => { e.preventDefault(); this.props.history.push(`${baseUrl}/new?isConverted=1`); } });
        }
        if (permissions.some(item => item == 'hcthVanBanDiSigning:verification')) {
            buttons.push({ className: 'btn-warning', icon: 'fa-pencil-square-o', tooltip: 'Ký xác thực văn bản', onClick: e => { e.preventDefault(); this.props.history.push('/user/hcth/van-ban-di/files/signing'); } });
        }
        return buttons;
    }

    updateSeen = (item) => {
        this.props.seenUpdate(item.id, { seen: item.seen, loai: 'DI' }, this.changeAdvancedSearch);
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('hcthCongVanDi', ['read', 'write', 'delete']),
            hcthManagePermission = this.getUserPermission('hcthCongVanDi', ['manage']),
            unitManagePermission = this.getUserPermission('donViCongVanDi', ['manage']),
            // chuyên viên soạn thảo
            unitEditPermission = this.getUserPermission('donViCongVanDi', ['edit']),

            { baseUrl, breadcrumb, backRoute } = this.getSiteSetting();
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.hcthCongVanDi && this.props.hcthCongVanDi.page ?
            this.props.hcthCongVanDi.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: null };

        // Chỉ trưởng phòng mới có quyền thêm văn bản
        let table = renderTable({
            emptyTable: 'Chưa có dữ liệu văn bản đi',
            getDataSource: () => list,
            stickyHead: true,
            loadingClassName: 'd-flex justify-content-center align-items-center',
            loadingOverlay: false,
            style: { maxHeight: '70vh' },
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }}>#</th>
                    <th style={{ width: 'auto', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Số văn bản</th>
                    {this.state.detail && <>
                        <th style={{ width: 'auto', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Cấp văn bản</th>
                        <th style={{ width: 'auto', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Loại văn bản</th>
                    </>}
                    <th style={{ width: '100%', verticalAlign: 'middle' }}>Trích yếu</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Trạng thái</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Thời gian</th>
                    <th style={{ width: 'auto', verticalAlign: 'middle' }}>Đơn vị gửi</th>
                    {this.state.detail && <th style={{ width: 'auto', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Đơn vị, người nhận</th>}
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Người tạo</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Người ký</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Văn bản giấy</th>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => {
                let danhSachDonViNhan = item.danhSachDonViNhan?.split(';'),
                    danhSachCanBoNhan = item.danhSachCanBoNhan?.split(';'),
                    danhSachDonViNhanNgoai = item.danhSachDonViNhanNgoai?.split(';'),
                    capVanBanItem = item.capVanBan && capVanBan[item.capVanBan];
                return (
                    <tr key={index} style={item.mauDoKhanVanBan ? { backgroundColor: item.mauDoKhanVanBan } : {}} className={item.seen ? '' : 'font-weight-bold'}>
                        <TableCell type='text' style={{ textAlign: 'center' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' style={{ whiteSpace: 'nowrap' }} url={`${baseUrl}/${item.id}`} content={<span>{item.soCongVan ? item.soCongVan : item.soDangKy ? item.soDangKy : 'Chưa có số văn bản'} {item.doKhanVanBan ? <p>Độ khẩn: {item.doKhanVanBan}</p> : ''}</span>} />
                        {this.state.detail && <>
                            <TableCell type='text' style={{ whiteSpace: 'nowrap', color: capVanBanItem ? capVanBanItem.color : 'blue' }} content={capVanBanItem?.text} />
                            <TableCell type='text' style={{ whiteSpace: 'nowrap', color: 'blue' }} content={item.tenLoaiVanBan} />
                        </>}
                        <TableCell type='text' contentClassName='multiple-lines' contentStyle={{ width: '100%', minWidth: '250px' }} content={<div style={{ display: 'inline-block' }}>{item.maDoKhanVanBan && item.maDoKhanVanBan != 'THUONG' ? <div className='blinking badge badge-pill badge-danger m-0'><h6 className='m-0 p-0'>({item.doKhanVanBan}) </h6></div> : null} {item.trichYeu || ''}</div>} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', color: item.trangThaiColor }} content={<div><i className={`fa fa-lg ${item.statusIcon}`} />&nbsp; &nbsp;{item.tenTrangThai}</div>}></TableCell>
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={
                            <>
                                {
                                    item.ngayGui ? (<>
                                        <span>Ngày gửi:</span><span style={{ color: 'blue' }}> {T.dateToText(item.ngayGui, 'dd/mm/yyyy')}</span>
                                    </>) : null
                                }
                                {item.ngayKy && item.ngayKy ? <br /> : null}
                                {
                                    item.ngayKy ? (<>
                                        <span>Ngày ký:</span><span style={{ color: 'red' }}> {T.dateToText(item.ngayKy, 'dd/mm/yyyy')}</span>
                                    </>) : null
                                }
                            </>
                        } />
                        <TableCell type='text' contentClassName='multiple-lines' content={item.tenDonViGui ? item.tenDonViGui.normalizedName() : ''} />
                        {this.state.detail && <TableCell type='text' style={{}} contentStyle={{ width: '12rem' }} content={
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
                                        <b>{item?.normalizedName()}</b>
                                        <br />
                                    </span>
                                )) : null
                                }</span>
                                <span>{danhSachDonViNhanNgoai && danhSachDonViNhanNgoai.length > 0 ? danhSachDonViNhanNgoai.map((item, index) => (
                                    <span key={index}>
                                        <b>{item?.normalizedName()}</b>
                                        <br />
                                    </span>
                                )) : null
                                }</span>
                            </>
                        } />}
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', fontWeight: 'bold' }} content={item.hoTenCanBoTao?.normalizedName() || ''} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', fontWeight: 'bold' }} content={item.hoTenCanBoKy?.normalizedName() || ''} />

                        <TableCell type='checkbox' style={{ textAlign: 'center' }} content={item.isPhysical} />

                        <TableCell type='buttons' style={{ textAlign: 'left' }} content={item} permission={{ ...permission, delete: permission.delete && item.trangThai == '1' }}
                            onEdit={`${baseUrl}/${item.id}`}
                            onDelete={(e) => this.onDelete(e, item)} permissions={currentPermissions} >
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
                            <Tooltip arrow title='Theo dõi tiến độ'>
                                <button className='btn btn-warning' onClick={(e) => e.preventDefault() || this.timeLineModal.show(item)}> <i className='fa fa-lg fa-feed' /></button>
                            </Tooltip>
                            {item.isDeletable == 1 && <Tooltip arrow title='Xóa văn bản>'>
                                <button className='btn btn-danger' onClick={e => this.onDelete(e, item)}>
                                    <i className='fa fa-lg fa-trash' />
                                </button>
                            </Tooltip>}
                        </TableCell>
                    </tr>

                );
            }
        });

        return this.renderPage({
            icon: 'fa fa-caret-square-o-left',
            title: 'Văn bản đi',
            breadcrumb: breadcrumb,
            onCreate: ((unitManagePermission && unitManagePermission.manage) || (hcthManagePermission && hcthManagePermission.manage) || (unitEditPermission && unitEditPermission.edit)) ? () => (window.location.pathname.startsWith('/user/hcth') ? this.props.history.push('/user/hcth/van-ban-di/new') : this.props.history.push('/user/van-ban-di/new')) : null,
            header: <>
                <FormSelect style={{ width: '200px', marginBottom: '0', marginRight: '8px' }} ref={e => this.congVanYear = e} placeholder="Năm" data={yearSelector} allowClear={true} onChange={() => this.changeAdvancedSearch()} />
                <FormSelect style={{ width: '200px', marginBottom: '0', marginRight: '8px' }} ref={e => this.capVanBan = e} placeholder="Cấp văn bản" data={SelectAdapter_HcthCapVanBan} allowClear={true} onChange={() => this.changeAdvancedSearch()} />
            </>,
            content: <>
                <div className='tile' style={{}}>
                    <div className='tile-body row'>
                        <div className='col-md-12 d-flex' style={{ gap: 10 }}>
                            <FormCheckbox label='Hiển thị chi tiết' ref={e => this.detail = e} onChange={value => this.setState({ detail: value })} />
                        </div>
                        <FormTabs className='col-md-12' ref={e => this.tabs = e} tabs={[{ title: 'Tất cả văn bản', disabled: this.state.loading }, { title: 'Văn bản chờ xử lý', disabled: this.state.loading }, { title: 'Văn bản đã xử lý', disabled: this.state.loading }]} id={TAB_ID} onChange={() => this.setState({ loading: true }, this.changeAdvancedSearch)} />
                        <div className='col-md-12'>{table}</div>
                    </div>
                </div>
                <VanBanHorizontalTimeTine ref={e => this.timeLineModal = e} />
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
            </>,
            backRoute: backRoute,
            advanceSearch: <>
                <div className="row">
                    <FormSelect allowClear={true} className='col-md-4' ref={e => this.donViGui = e} label='Đơn vị gửi' data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect allowClear={true} className='col-md-4' ref={e => this.donViNhan = e} label='Đơn vị nhận' data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect allowClear={true} className='col-md-4' ref={e => this.donViNhanNgoai = e} label='Đơn vị nhận bên ngoài' data={SelectAdapter_DmDonViGuiCongVan} onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect allowClear={true} className='col-md-4' ref={e => this.canBoNhan = e} label='Cán bộ nhận' data={SelectAdapter_FwCanBo} onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect allowClear={true} className='col-md-4' ref={e => this.loaiVanBan = e} label='Loại văn bản' data={SelectAdapter_DmLoaiVanBan} onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect allowClear={true} className='col-md-4' ref={e => this.status = e} label='Trạng thái' data={SelectAdapter_HcthVanBanDiStatus} onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect allowClear={true} className='col-md-4' ref={e => this.timeType = e} label='Theo thời gian' data={timeList} onChange={() => this.changeAdvancedSearch()} />
                    {this.timeType?.value() && (<>
                        <FormDatePicker type='date' className='col-md-4' ref={e => this.fromTime = e} label='Từ ngày' onChange={() => this.changeAdvancedSearch()} />
                        <FormDatePicker type='date' className='col-md-4' ref={e => this.toTime = e} label='Đến ngày' onChange={() => this.changeAdvancedSearch()} />
                    </>)}
                </div>
            </>,
            onExport: (e) => {
                e.preventDefault();
                let filter = T.stringify(this.state.filter);

                if (filter.includes('%')) filter = '{}';
                T.download(`/api/hcth/van-ban-di/download-excel/${filter}`, 'CONG_VAN_CAC_PHONG.xlsx');
            },
            buttons: this.getButtons(),
        });
    }
}


const mapStateToProps = state => ({ system: state.system, hcthCongVanDi: state.hcth.hcthCongVanDi });
const mapActionsToProps = {
    createHcthCongVanDi,
    updateHcthCongVanDi,
    deleteHcthCongVanDi,
    getHcthCongVanDiSearchPage,
    seenUpdate
};
export default connect(mapStateToProps, mapActionsToProps)(HcthCongVanDi);
