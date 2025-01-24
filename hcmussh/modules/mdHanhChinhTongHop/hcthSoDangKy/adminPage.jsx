import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormCheckbox, FormDatePicker, FormSelect, FormTabs, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';

import Pagination from 'view/component/Pagination';

import { SelectAdapter_DmDonViFilter, SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmLoaiVanBan } from 'modules/mdDanhMuc/dmLoaiVanBan/redux/dmLoaiVanBan';
import { createSoNhapTay, createSoTuDong, getDangKySearchPage, deleteSoVanBan } from './redux/soDangKy';
import { ExportModal } from './components/exportModal';
import HcthEditSoDangKyModal from './components/adminEditModal';
import { SelectAdapter_HcthQuySo } from '../hcthPhanCapQuySo/redux/quySo';
const { capVanBan, MA_HCTH } = require('../constant.js');
const TAB_ID = 'soDangKyTabs';


export class CreateModal extends AdminModal {
    state = { soTuDong: true };

    onShow = () => {
        this.soDangKy?.value('');
        this.soTuDong?.value(this.state.soTuDong);
        this.capVanBan?.value(this.props.capVanBan || capVanBan.DON_VI.id);
        this.loaiVanBan?.value('');
        this.donViGui?.value(this.props.listDonVi[0] || '');
        this.ngayLui?.value('');
    }

    onSubmit = (e) => {
        e.preventDefault();
        const data = {
            soDangKy: this.soDangKy?.value(),
            capVanBan: this.capVanBan?.value(),
            loaiVanBan: this.loaiVanBan?.value(),
            donViGui: this.donViGui?.value(),
            tuDong: Number(this.soTuDong?.value()),
            nguoiTao: this.props.system?.user?.shcc,
            inVanBanGiay: this.props.inVanBanGiay,
            inVanBan: this.props.inVanBan,
            soLuiNgay: Number(this.soLuiNgay.value())
        };
        if (data.soLuiNgay) {
            const toDay = new Date().setHours(0, 0, 0, 0);
            let ngayLui = this.ngayLui.value();
            if (!ngayLui) {
                throw 'Ngày lùi không hợp lệ';
            } else {
                ngayLui = new Date(ngayLui).setHours(23, 59, 59, 999);
                if (ngayLui > toDay)
                    throw 'Ngày lùi không hợp lệ';
                data.ngayLui = ngayLui;
            }
        } else {
            data.ngayLui = null;
        }

        if (!data.soDangKy && !this.state.soTuDong) {
            T.notify('Số cần đăng ký bị trống!', 'danger');
            this.soDangKy.focus();
        } else if (!data.donViGui) {
            T.notify('Đơn vị gửi bị trống', 'danger');
            this.donViGui.focus();
        } else if (!data.capVanBan) {
            T.notify('Cấp văn bản bị trống', 'danger');
            this.capVanBan.focus();
        }
        else {
            if (this.props.inVanBan || this.props.inVanBanGiay) {
                this.props.create(data, this.hide());
            } else {
                if (data.tuDong) {
                    this.props.createSoTuDong(data, this.hide());
                } else {
                    this.props.createSoNhapTay(data, this.hide());
                }
            }
        }
    }

    render = () => {
        const capVanBanArr = Object.values(capVanBan);
        return this.renderModal({
            title: 'Đăng ký số',
            body: <div className='row'>
                <FormCheckbox isSwitch className='col-md-12' label='Số tự động' ref={e => this.soTuDong = e} onChange={value => this.setState({ soTuDong: value })} />
                {!this.state.soTuDong && <>
                    <FormTextBox ref={e => this.soDangKy = e} className='col-md-12' label='Chọn số đăng ký' type='text' required />
                </>
                }
                <FormSelect className='col-md-6' label='Loại văn bản' placeholder='Chọn loại văn bản' ref={e => this.loaiVanBan = e} data={SelectAdapter_DmLoaiVanBan} allowClear={true} />
                <FormSelect className='col-md-6' disabled={!this.props.isHcthSelector || this.props.canReadOnly} label='Cấp văn bản' placeholder='Chọn cấp văn bản' ref={e => this.capVanBan = e} data={capVanBanArr} required />
                <FormSelect ref={e => this.donViGui = e} className='col-md-12' label='Đơn vị gửi' data={this.props.isHcthSelector ? SelectAdapter_DmDonVi : SelectAdapter_DmDonViFilter(this.props.listDonVi)} required />
                <FormCheckbox ref={e => this.soLuiNgay = e} isSwitch label={'Số lùi ngày'} className={'col-md-12'} onChange={(value) => this.setState({ soLuiNgay: value })} />
                <FormDatePicker ref={e => this.ngayLui = e} label={'Ngày lấy số'} className={'col-md-12'} style={this.state.soLuiNgay ? {} : { display: 'none' }} />
            </div>
        });
    }
}

class HcthSoDangKy extends AdminPage {
    state = { filter: {}, tab: 0 };

    componentDidMount() {
        T.ready(this.getSiteSetting().readyUrl, () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
        });
    }

    getDonViQuanLy = () => {
        return this.props.system?.user?.staff?.donViQuanLy || [];
    }

    getDonVi = () => this.props.system?.user?.staff?.maDonVi;

    getListDonVi = () => {
        const donVi = this.getDonViQuanLy().map(item => item.maDonVi);
        if (this.getDonVi()) donVi.push(this.getDonVi());
        return [...new Set(donVi)];
    }

    getSiteSetting = () => {
        const pathName = window.location.pathname;
        if (pathName.startsWith('/user/hcth'))
            return {
                readyUrl: '/user/hcth',
                breadcrumb: [
                    <Link key={0} to='/user/hcth'>Hành chính tổng hợp</Link>,
                    'Danh sách số văn bản',
                ],
                backRoute: '/user/hcth',
                baseUrl: '/user/hcth/so-dang-ky',
            };
        else
            return {
                readyUrl: '/user',
                breadcrumb: [
                    <Link key={0} to='/user/'>...</Link>,
                    <Link key={1} to='/user/van-phong-dien-tu'>Văn phòng điện tử</Link>,
                    'Danh sách số văn bản',
                ],
                backRoute: '/user/van-phong-dien-tu',
                baseUrl: '/user/so-dang-ky',
            };
    }


    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.hcthSoDangKy && this.props.hcthSoDangKy.page ? this.props.hcthSoDangKy.page : { pageNumber: 1, pageSize: 50 };

        let tab = this.tabs?.selectedTabIndex();
        let donViGuiSelector = this.donViGuiSelector?.value() || null;
        const quySo = this.quySo.value() || '';

        const pageFilter = isInitial ? {} : { tab, donViGuiSelector, quySo: quySo?.toString() };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                this.setState({ loading: false });
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.donViGuiSelector?.value(filter.donViGuiSelector || '');
                }
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getDangKySearchPage(pageN, pageS, pageC, this.state.filter, done);
    }

    delete = (item) => {
        this.props.deleteSoVanBan(item.id);
    }

    render() {
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition } = this.props.hcthSoDangKy && this.props.hcthSoDangKy.page ? this.props.hcthSoDangKy.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: null };

        const currentPermissions = this.getCurrentPermissions();
        const permission = this.getUserPermission('hcthSoVanBan');

        const { breadcrumb, backRoute } = this.getSiteSetting();
        const buttons = [];
        const permissions = this.getCurrentPermissions();
        if (permissions.includes('donViCongVanDi:edit')) {
            buttons.push({ tooltip: 'Yêu cầu cấp số văn bản', icon: 'fa-tags', className: 'btn-primary', onClick: () => this.props.history.push('/user/so-van-ban/request') });
        }
        if (permissions.includes('hcthSoVanBan:write')) {
            buttons.push({ tooltip: 'Xuất số văn bản', icon: 'fa-download', className: 'btn-success', onClick: () => this.exportModal.show() });
        }
        const canEdit = permissions.includes('donViCongVanDi:manage') || permissions.includes('hcthCongVanDi:manage');
        const table = renderTable({
            getDataSource: () => this.state.loading ? null : this.props.hcthSoDangKy?.page?.list,
            style: { marginTop: '8px' },
            emptyTable: 'Không có dữ liệu số đăng ký',
            stickyHead: true,
            renderHead: () => {
                return (<tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số văn bản</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }} >Cấp văn bản</th>
                    <th style={{ width: '40%', whiteSpace: 'nowrap' }} >Đơn vị lấy số</th>
                    <th style={{ width: '60%', whiteSpace: 'nowrap' }} >Thông tin số văn bản</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }} >Người tạo</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }} >Năm hành chính</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }} >Ngày tạo</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }} >Thao tác</th>
                </tr>);
            },
            renderRow: (item, index) => {
                let capVanBanItem = item.capVanBan && capVanBan[item.capVanBan];
                return (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'center' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', color: 'blue', fontWeight: 'bold' }} content={`${item.soCongVan}`} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', color: capVanBanItem ? capVanBanItem.color : 'blue' }} content={capVanBanItem?.text} />
                        <TableCell type='text' contentClassName='multiple-lines' content={item.tenDonViGui} />
                        <TableCell type='text' contentClassName='multiple-lines' contentStyle={{ width: '100%' }} content={<div className='d-flex flex-column'>
                            {!!item.noiDung && <span><span className='text-primary'> Nội dung lấy số :&nbsp;</span> {item.noiDung} </span>}
                            {!!item.trichYeu && <span><span className='text-primary'> Trích yếu (<Link target='_blank' rel='noreferrer noopener' to={`/user/van-ban-di/${item.idVanBan}`}>{`Văn bản #${item.idVanBan}`}</Link>):&nbsp;</span> {item.trichYeu} </span>}
                        </div>} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', fontWeight: 'bold' }} content={item.hoTenCanBo?.normalizedName() || ''} />
                        <TableCell type='text' style={{ textAlign: 'center', fontWeight: 'bold', whiteSpace: 'nowrap', color: 'blue' }} content={item.namHanhChinh} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', color: 'blue' }} content={T.dateToText(item.ngayTao, 'dd/mm/yyyy')} />
                        <TableCell type='buttons' permission={{ ...permission, write: canEdit }} onDelete={() => this.delete(item)} onEdit={() => this.adminEditModal.show(item)} />
                    </tr>
                );
            }
        });

        let tabList = {
            all: {
                title: 'Tất cả'
            },
            truong: {
                title: 'Văn bản cấp trường'
            },
            donVi: {
                title: 'Văn bản cấp đơn vị'
            }
        };

        const tabs = [tabList.all, tabList.truong, tabList.donVi];

        return this.renderPage({
            icon: 'fa fa-sign-in',
            title: 'Quản lý số văn bản',
            stickyHead: true,
            content: <>
                <div className='tile'>
                    <FormTabs ref={e => this.tabs = e} tabs={tabs} id={TAB_ID} onChange={() => this.setState({ loading: true }, this.changeAdvancedSearch())} />
                    {table}
                </div>
                <HcthEditSoDangKyModal ref={e => this.adminEditModal = e} />
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <CreateModal ref={e => this.createModal = e} {...this.props} listDonVi={this.getListDonVi()} isHcthSelector={this.getListDonVi().includes(MA_HCTH) && currentPermissions.includes('hcthSoVanBan:write')} />
                <ExportModal ref={e => this.exportModal = e} />
            </>,
            header: <>
                <FormSelect allowClear={true} style={{ width: '200px', marginBottom: '0', marginRight: '8px' }} ref={e => this.donViGuiSelector = e} placeholder='Đơn vị gửi' data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} />
                <FormSelect allowClear={true} multiple style={{ width: '200px', marginBottom: '0', marginRight: '8px' }} ref={e => this.quySo = e} placeholder='Năm hành chính' data={SelectAdapter_HcthQuySo} onChange={() => this.changeAdvancedSearch()} />
            </>,
            backRoute,
            breadcrumb,
            onCreate: (currentPermissions.includes('hcthSoVanBan:write') || currentPermissions.includes('donViCongVanDi:edit')) ? (e) => {
                e.preventDefault();
                this.createModal.show(null);
            } : null,
            buttons,
        });
    }

}

const mapStateToProps = state => ({ system: state.system, hcthSoDangKy: state.hcth.hcthSoDangKy });
const mapActionsToProps = { getDangKySearchPage, createSoTuDong, createSoNhapTay, deleteSoVanBan };
export default connect(mapStateToProps, mapActionsToProps)(HcthSoDangKy);
