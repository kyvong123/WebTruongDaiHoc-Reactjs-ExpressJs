import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, renderDataTable, TableHead, TableCell, FormCheckbox, FormTextBox } from 'view/component/AdminPage';
import { getDmLoaiVanBanTccbPage, updateLoaiVanBanTccb, createLoaiVanBanTccb } from './redux';
import Pagination from 'view/component/Pagination';

class EditModal extends AdminModal {
    state = {
        id: null,
        ma: null,
        ten: '',
        kyHieu: '',
        capBac: '',
        kichHoat: false,
    };
    onShow = (item) => {
        let { id, ma, ten, kyHieu, capBac, kichHoat } = item ? item : { id: '', ma: '', ten: '', kyHieu: '', capBac: '', kichHoat: 0 };
        this.setState({ id, ma, ten, kyHieu, capBac, kichHoat },
            () => {
                this.ma.value(ma);
                this.ten.value(ten);
                this.kyHieu.value(kyHieu);
                this.capBac.value(capBac);
                this.kichHoat.value(kichHoat);
            }
        );
    };

    changeKichHoat = (value) => this.kichHoat.value(Number(value));

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: this.ma.value(),
            ten: this.ten.value(),
            kyHieu: this.kyHieu.value(),
            capBac: this.capBac.value(),
            kichHoat: Number(this.kichHoat.value()),
        };
        if (!this.ten.value()) {
            T.notify('Tên loại văn bản bị trống', 'danger');
            this.ten.focus();
        } else {
            this.props.update(this.state.id, changes, this.hide);
        }
    };
    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Cập nhật loại văn bản TCCB',
            size: 'elarge',
            body: (
                <div className='row'>
                    <FormTextBox className='col-md-12' ref={e => this.ma = e} label='Mã' readOnly={readOnly} />
                    <FormTextBox className='col-md-6' ref={e => this.ten = e} label='Tên' readOnly={readOnly} required />
                    <FormTextBox className='col-md-6' ref={e => this.kyHieu = e} label='Ký hiệu' readOnly={readOnly} />
                    <FormTextBox className='col-md-6' ref={e => this.capBac = e} label='Cấp bậc' readOnly={readOnly} />
                    <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }} onChange={(value) => this.changeKichHoat(value ? 1 : 0)} />
                </div>
            ),
        });
    };
}

class CreateModal extends AdminModal {
    state = {
        id: null,
        ma: null,
        ten: '',
        kyHieu: '',
        capBac: '',
        kichHoat: false,
    };

    onShow = () => {
        this.ma.value('');
        this.ten.value('');
        this.kyHieu.value('');
        this.capBac.value('');
        this.kichHoat.value('');
    };

    changeKichHoat = (value) => this.kichHoat.value(Number(value));

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: this.ma.value(),
            ten: this.ten.value(),
            kyHieu: this.kyHieu.value(),
            capBac: this.capBac.value(),
            kichHoat: Number(this.kichHoat.value()),
        };
        if (!this.ma.value().length) {
            T.notify('Mã loại văn bản bị trống', 'danger');
            this.ma.focus();
        } else if (!this.ten.value()) {
            T.notify('Tên loại văn bản bị trống', 'danger');
            this.ten.focus();
        } else {
            this.props.create(changes, this.hide);
        }
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Tạo mới loại văn bản TCCB',
            size: 'elarge',
            body: (
                <div className='row'>
                    <FormTextBox className='col-md-6' ref={e => this.ma = e} label='Mã' readOnly={readOnly} required placeholder='Nhập mã' />
                    <FormTextBox className='col-md-6' ref={e => this.ten = e} label='Tên' readOnly={readOnly} required placeholder='Nhập tên' />
                    <FormTextBox className='col-md-6' ref={e => this.kyHieu = e} label='Ký hiệu' readOnly={readOnly} placeholder='Ký hiệu' />
                    <FormTextBox className='col-md-6' ref={e => this.capBac = e} label='Cấp bậc' readOnly={readOnly} placeholder='Cấp bậc' />
                    <FormCheckbox className='col-md-6' ref={(e) => (this.kichHoat = e)} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }} onChange={(value) => this.changeKichHoat(value ? 1 : 0)} />
                </div>
            ),
        });
    };
}

class DmLoaiVanBanTccbPage extends AdminPage {
    state = { filter: {} };
    componentDidMount() {
        T.ready('/user/category', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.props.getDmLoaiVanBanTccbPage(undefined, undefined, searchText || '');
        });
        this.props.getDmLoaiVanBanTccbPage();
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    };

    showCreateModal = (e) => {
        e.preventDefault();
        this.createModal.show();
    };

    render() {
        const permission = this.getUserPermission('dmLoaiVanBanTccb', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmLoaiVanBanTccb && this.props.dmLoaiVanBanTccb.page ? this.props.dmLoaiVanBanTccb.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu',
            data: list,
            divStyle: { height: '80vh' },
            header: 'thead-light',
            className: this.state.isFixCol ? 'table-fix-col' : '',
            renderHead: () => (
                <tr>
                    <TableHead style={{ width: '240px', textAlign: 'center' }} content='STT' />
                    <TableHead style={{ width: '240px', textAlign: 'center' }} content='Mã loại văn bản' />
                    <TableHead style={{ width: '240px', textAlign: 'center' }} content='Tên loại văn bản' />
                    <TableHead style={{ width: '240px', textAlign: 'center' }} content='Ký hiệu' />
                    <TableHead style={{ width: '240px', textAlign: 'center' }} content='Cấp bậc' />
                    <TableHead style={{ width: '240px', textAlign: 'center' }} content='Kích hoạt' />
                    <TableHead style={{ width: '240px', textAlign: 'center' }} content='Thao tác' />
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ma} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.kyHieu} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.capBac} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission} onChanged={(value) => this.props.updateLoaiVanBanTccb(item.id, { kichHoat: value ? 1 : 0 })} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission} onEdit={() => (permission.write ? this.modal.show(item) : T.notify('Vui lòng liên hệ phòng Tổ chức - Cán bộ', 'warning'))} onDelete={() => (permission.write ? this.delete : T.notify('Vui lòng liên hệ phòng Tổ chức - Cán bộ', 'warning'))} ></TableCell>
                </tr>
            ),
        });
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Loại văn bản TCCB',
            breadcrumb: [
                <Link key={0} to='/user/category'>
                    Danh mục
                </Link>,
                'Loại văn bản TCCB',
            ],
            content: (
                <>
                    <div className='tile'>
                        <div style={{ marginBottom: '10px' }}>Kết quả: {<b>{totalItem}</b>} loại văn bản</div>
                        <div className='tile-title-w-btn' style={{ marginBottom: '5' }}>
                            <div className='title'>
                                <div style={{ gap: 10, display: 'inline-flex' }}>
                                    <FormCheckbox label='Thao tác nhanh' onChange={(value) => this.setState({ isFixCol: value })} style={{ marginBottom: '0' }} />
                                </div>
                            </div>
                            <div className='btn-group'>
                                <Pagination style={{ position: '', marginBottom: '0' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getDmLoaiVanBanTccbPage} />
                                <EditModal ref={(e) => (this.modal = e)} readOnly={!permission.write} update={this.props.updateLoaiVanBanTccb} />
                                <CreateModal ref={(e) => (this.createModal = e)} readOnly={!permission.write} create={this.props.createLoaiVanBanTccb} />
                            </div>
                        </div>
                        {table}
                    </div>
                </>
            ),
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showCreateModal(e) : null,
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, dmLoaiVanBanTccb: state.danhMuc.dmLoaiVanBanTccb });
const mapActionsToProps = { getDmLoaiVanBanTccbPage, updateLoaiVanBanTccb, createLoaiVanBanTccb };
export default connect(mapStateToProps, mapActionsToProps)(DmLoaiVanBanTccbPage);
