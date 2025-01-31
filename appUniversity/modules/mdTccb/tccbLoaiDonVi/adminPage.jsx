import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, renderDataTable, TableHead, TableCell, FormCheckbox, FormTextBox } from 'view/component/AdminPage';
import { getLoaiDonViPage, updateLoaiDonVi, createLoaiDonVi, deleteLoaiDonVi } from './redux';
import Pagination from 'view/component/Pagination';

class CreateModal extends AdminModal {
    state = {
        ten: '',
        ma: '',
        kichHoat: 0,
        moTa: ''
    };
    onShow = (item) => {
        let { ten, ma, kichHoat, moTa } = item ? item : {
            ten: '',
            ma: '',
            kichHoat: 0,
            moTa: ''
        };
        this.setState({ ten, ma, kichHoat, moTa },
            () => {
                this.ten.value(ten || '');
                this.ma.value(ma || '');
                this.kichHoat.value(kichHoat || 0);
                this.moTa.value(moTa || '');
            }
        );
    };

    changeKichHoat = (value) => this.kichHoat.value(Number(value));

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ten: this.ten.value(),
            ma: this.ma.value(),
            kichHoat: this.kichHoat.value(),
            moTa: this.moTa.value()
        };
        if (!this.ten.value()) {
            T.notify('Tên loại đơn vị bị trống', 'danger');
            this.ten.focus();
        }
        else if (!this.ma.value()) {
            T.notify('Tên mã loại đơn vị bị trống', 'danger');
            this.ma.focus();
        }
        else {
            this.props.create(changes, this.hide);
        }
    };
    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Tạo mới loại đơn vị',
            size: 'elarge',
            body: (
                <div className='row'>
                    <FormTextBox className='col-md-6' ref={(e) => (this.ten = e)} label='Tên' required />
                    <FormTextBox className='col-md-6' ref={(e) => (this.ma = e)} label='Mã' required />
                    <FormTextBox className='col-md-6' ref={(e) => (this.moTa = e)} label='Mô tả' />
                    <FormCheckbox className='col-md-3' ref={(e) => (this.kichHoat = e)} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }} onChange={(value) => this.changeKichHoat(value ? 1 : 0)} />
                </div>
            ),
        });
    };
}

class EditModal extends AdminModal {
    state = {
        id: null,
        ten: '',
        ma: '',
        kichHoat: 0,
        moTa: ''
    };
    onShow = (item) => {
        let { id, ten, ma, kichHoat, moTa } = item ? item : {
            id: null,
            ten: '',
            ma: '',
            kichHoat: 0,
            moTa: ''
        };
        this.setState(
            {
                id, ten, ma, kichHoat, moTa
            },
            () => {
                this.ten.value(ten || '');
                this.ma.value(ma || '');
                this.kichHoat.value(kichHoat || 0);
                this.moTa.value(moTa || '');
            }
        );
    };

    changeKichHoat = (value) => this.kichHoat.value(Number(value));

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ten: this.ten.value(),
            ma: this.ma.value(),
            kichHoat: this.kichHoat.value(),
            moTa: this.moTa.value()
        };
        if (!this.ten.value()) {
            T.notify('Tên loại đơn vị bị trống', 'danger');
            this.ten.focus();
        }
        else if (!this.ma.value()) {
            T.notify('Tên mã loại đơn vị bị trống', 'danger');
            this.ma.focus();
        }
        else {
            this.props.update(this.state.id, changes, this.hide);
        }
    };
    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Cập nhật loại đơn vị',
            size: 'elarge',
            body: (
                <div className='row'>
                    <FormTextBox className='col-md-6' ref={(e) => (this.ten = e)} label='Tên' required />
                    <FormTextBox className='col-md-6' ref={(e) => (this.ma = e)} label='Mã' required />
                    <FormTextBox className='col-md-6' ref={(e) => (this.moTa = e)} label='Mô tả' />
                    <FormCheckbox className='col-md-3' ref={(e) => (this.kichHoat = e)} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }} onChange={(value) => this.changeKichHoat(value ? 1 : 0)} />
                </div>
            ),
        });
    };
}

class LoaiDonViPage extends AdminPage {
    state = { filter: {} };
    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
        });
        this.getPage();
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getLoaiDonViPage(pageN, pageS, pageC, this.state.filter, done);
    };

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    };

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    };

    showCreateModal = (e) => {
        e.preventDefault();
        this.createModal.show();
    };

    delete = (e, id) => {
        T.confirm('Xóa loại đơn vị', 'Bạn có chắc bạn muốn xóa đơn vị này?', 'warning', true, (isConfirm) => isConfirm &&
            this.props.deleteLoaiDonVi(id, (error) => {
                if (error) T.notify(error.message ? error.message : 'Xoá đơn vị bị lỗi!', 'danger');
                else T.alert('Xoá loại đơn vị thành công!', 'success', false, 800);
            })
        );
        e.preventDefault();
    };

    render() {
        const onKeySearch = this.state.isKeySearch ? this.handleKeySearch : null;
        const permission = this.getUserPermission('tccbLoaiDonVi', ['read', 'write', 'delete', 'manage', 'export']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.loaiDonVi && this.props.loaiDonVi.page ? this.props.loaiDonVi.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };

        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu',
            data: list,
            divStyle: { height: '80vh' },
            header: 'thead-light',
            className: this.state.isFixCol ? 'table-fix-col' : '',
            renderHead: () => (
                <tr>
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='STT' />
                    <TableHead style={{ width: '30%', textAlign: 'nowrap' }} keyCol='ma' content='Mã' onKeySearch={onKeySearch} />
                    <TableHead style={{ width: '30%', textAlign: 'nowrap' }} keyCol='ten' content='Tên loại đơn vị' onKeySearch={onKeySearch} />
                    <TableHead style={{ width: '40%', textAlign: 'nowrap' }} keyCol='moTa' content='Mô tả' onKeySearch={onKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'nowrap' }} typeSearch='select' data={[{ id: 0, text: 'Chưa kích hoạt' }, { id: 1, text: 'Đã kích hoạt' }]} keyCol='kichHoat' content='Kích hoạt' onKeySearch={onKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'nowrap' }} content='Thao tác' />
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ma} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.moTa} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission} onChanged={(value) => T.confirm('Cập nhật đơn vị', 'Bạn có chắc bạn muốn cập nhật đơn vị này?', 'warning', true, (isConfirm) => { isConfirm && this.props.updateLoaiDonVi(item.id, { kichHoat: value ? 1 : 0 }); })} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission} onEdit={() => (permission.write ? this.modal.show(item) : T.notify('Vui lòng liên hệ phòng Tổ chức - Cán bộ', 'warning'))} onDelete={(e) => permission.delete ? this.delete(e, item.id) : T.notify('Vui lòng liên hệ phòng Tổ chức - Cán bộ', 'warning')}></TableCell>
                </tr>
            )

        });
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục loại đơn vị',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>
                    Tổ chức cán bộ
                </Link>,
                'Loại đơn vị',
            ],
            content: (
                <>
                    <div className='tile'>
                        <div style={{ marginBottom: '10px' }}>Kết quả: {<b>{totalItem}</b>} loại đơn vị</div>
                        <div className='tile-title-w-btn' style={{ marginBottom: '5' }}>
                            <div className='title'>
                                <div style={{ gap: 10, display: 'inline-flex' }}>
                                    <FormCheckbox label='Tìm theo cột' onChange={(value) => this.setState({ isKeySearch: value })} style={{ marginBottom: '0' }} />
                                    <FormCheckbox label='Thao tác nhanh' onChange={(value) => this.setState({ isFixCol: value })} style={{ marginBottom: '0' }} />
                                </div>
                            </div>
                            <div className='btn-group'>
                                <Pagination style={{ position: '', marginBottom: '0' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.getPage} pageRange={3} />
                                <EditModal ref={(e) => (this.modal = e)} readOnly={!permission.write} update={this.props.updateLoaiDonVi} />
                                <CreateModal ref={(e) => (this.createModal = e)} readOnly={!permission.write} create={this.props.createLoaiDonVi} />
                            </div>
                        </div>
                        {table}
                    </div>
                </>
            ),
            backRoute: '/user/tccb',
            onCreate: permission && permission.write ? (e) => this.showCreateModal(e) : null,
        });
    }
}

const mapStateToProps = (state) => {
    return { system: state.system, loaiDonVi: state.tccb.ldv };
};
const mapActionsToProps = { getLoaiDonViPage, updateLoaiDonVi, createLoaiDonVi, deleteLoaiDonVi };
export default connect(mapStateToProps, mapActionsToProps)(LoaiDonViPage);