import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, renderDataTable, TableHead, TableCell, FormCheckbox, FormTextBox } from 'view/component/AdminPage';
import { getDmBacDonViPage, updateBacDonVi, createBacDonVi } from './redux';
import Pagination from 'view/component/Pagination';

class EditModal extends AdminModal {
    state = {
        ma: null,
        ten: '',
        doUuTien: '',
        kichHoat: false,
    };
    onShow = (item) => {
        let { ma, ten, doUuTien, kichHoat } = item ? item : { ma: '', ten: '', doUuTien: '', kichHoat: 0 };
        this.setState({ ma, ten, doUuTien, kichHoat, },
            () => {
                this.ma.value(ma);
                this.ten.value(ten);
                this.doUuTien.value(doUuTien);
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
            doUuTien: this.doUuTien.value(),
            kichHoat: this.kichHoat.value(),
        };
        if (!this.ten.value()) {
            T.notify('Tên bậc đơn vị bị trống', 'danger');
            this.ten.focus();
        } else {
            this.props.update(this.state.ma, changes, this.hide);
        }
    };
    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Cập nhật bậc đơn vị',
            size: 'elarge',
            body: (
                <div className='row'>
                    <FormTextBox className='col-md-12' ref={(e) => (this.ma = e)} label='Mã bậc đơn vị' readOnly={this.state.ma} />
                    <FormTextBox className='col-md-6' ref={(e) => (this.ten = e)} label='Tên bậc đơn vị' readOnly={readOnly} required />
                    <FormTextBox className='col-md-6' ref={(e) => (this.doUuTien = e)} label='Độ ưu tiên' readOnly={readOnly} />
                    <FormCheckbox className='col-md-6' ref={(e) => (this.kichHoat = e)} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }} onChange={(value) => this.changeKichHoat(value ? 1 : 0)} />
                </div>
            ),
        });
    };
}

class CreateModal extends AdminModal {
    state = {
        ma: null,
        ten: '',
        doUuTien: '',
        kichHoat: false,
    };

    onShow = () => {
        this.ma.value('');
        this.ten.value('');
        this.doUuTien.value('');
        this.kichHoat.value('');
    };

    changeKichHoat = (value) => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: this.ma.value(),
            ten: this.ten.value(),
            doUuTien: this.doUuTien.value(),
            kichHoat: this.kichHoat.value(),
        };
        if (!this.ma.value().length) {
            T.notify('Mã bậc đơn vị bị trống', 'danger');
            this.ma.focus();
        } else if (!this.ten.value()) {
            T.notify('Tên bậc đơn vị bị trống', 'danger');
            this.ten.focus();
        } else {
            this.props.create(changes, this.hide);
        }
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Tạo mới bậc đơn vị',
            size: 'elarge',
            body: (
                <div className='row'>
                    <FormTextBox className='col-md-6' ref={(e) => (this.ma = e)} label='Mã bậc đơn vị' readOnly={readOnly} required placeholder='Nhập mã đơn vị' />
                    <FormTextBox className='col-md-6' ref={(e) => (this.ten = e)} label='Tên bậc đơn vị' readOnly={readOnly} required placeholder='Nhập tên đơn vị' />
                    <FormTextBox className='col-md-6' ref={(e) => (this.doUuTien = e)} label='Độ ưu tiên' readOnly={readOnly} placeholder='Nhập độ ưu tiên' />
                    <FormCheckbox className='col-md-6' ref={(e) => (this.kichHoat = e)} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }} onChange={(value) => this.changeKichHoat(value ? 1 : 0)} />
                </div>
            ),
        });
    };
}

class DmBacDonViPage extends AdminPage {
    state = { filter: {} };
    componentDidMount() {
        T.ready('/user/category', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.props.getDmBacDonViPage(undefined, undefined, searchText || '');
        });
        this.props.getDmBacDonViPage();
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
        const permission = this.getUserPermission('dmBacDonVi', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmBacDonVi && this.props.dmBacDonVi.page ? this.props.dmBacDonVi.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu',
            data: list,
            divStyle: { height: '80vh' },
            header: 'thead-light',
            className: this.state.isFixCol ? 'table-fix-col' : '',
            renderHead: () => (
                <tr>
                    <TableHead style={{ width: '240px', textAlign: 'center' }} content='STT' />
                    <TableHead style={{ width: '240px', textAlign: 'center' }} content='Mã bậc đơn vị' />
                    <TableHead style={{ width: '240px', textAlign: 'center' }} content='Tên bậc đơn vị' />
                    <TableHead style={{ width: '240px', textAlign: 'center' }} content='Độ ưu tiên' />
                    <TableHead style={{ width: '240px', textAlign: 'center' }} content='Kích hoạt' />
                    <TableHead style={{ width: '240px', textAlign: 'center' }} content='Thao tác' />
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ma} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.doUuTien} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission} onChanged={(value) => this.props.updateBacDonVi(item.ma, { kichHoat: value ? 1 : 0 })} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission} onEdit={() => (permission.write ? this.modal.show(item) : T.notify('Vui lòng liên hệ phòng Tổ chức - Cán bộ', 'warning'))} onDelete={() => (permission.write ? this.delete : T.notify('Vui lòng liên hệ phòng Tổ chức - Cán bộ', 'warning'))} ></TableCell>
                </tr>
            ),
        });
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Bậc đơn vị',
            breadcrumb: [
                <Link key={0} to='/user/category'>
                    Danh mục
                </Link>,
                'Bậc đơn vị',
            ],
            content: (
                <>
                    <div className='tile'>
                        <div style={{ marginBottom: '10px' }}>Kết quả: {<b>{totalItem}</b>} bậc đơn vị</div>
                        <div className='tile-title-w-btn' style={{ marginBottom: '5' }}>
                            <div className='title'>
                                <div style={{ gap: 10, display: 'inline-flex' }}>
                                    <FormCheckbox label='Thao tác nhanh' onChange={(value) => this.setState({ isFixCol: value })} style={{ marginBottom: '0' }} />
                                </div>
                            </div>
                            <div className='btn-group'>
                                <Pagination style={{ position: '', marginBottom: '0' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getDmBacDonViPage} />
                                <EditModal ref={(e) => (this.modal = e)} readOnly={!permission.write} update={this.props.updateBacDonVi} />
                                <CreateModal ref={(e) => (this.createModal = e)} readOnly={!permission.write} create={this.props.createBacDonVi} />
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

const mapStateToProps = (state) => ({ system: state.system, dmBacDonVi: state.danhMuc.dmBacDonVi });
const mapActionsToProps = { getDmBacDonViPage, updateBacDonVi, createBacDonVi };
export default connect(mapStateToProps, mapActionsToProps)(DmBacDonViPage);
