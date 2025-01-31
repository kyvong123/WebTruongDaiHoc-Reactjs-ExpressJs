import React from 'react';
import { connect } from 'react-redux';
import { createDmTinhTrangHocPhi, updateDmTinhTrangHocPhi, deleteDmTinhTrangHocPhi, getDmTinhTrangHocPhiPage } from './redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { active: false }

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.tinhTrangHocPhi.focus();
        }));
    }

    onShow = (item) => {
        let { ma, tinhTrangHocPhi, active } = item ? item : { ma: '', tinhTrangHocPhi: '', active: 1 };
        this.setState({ ma, item });
        this.ma.value(ma);
        this.tinhTrangHocPhi.value(tinhTrangHocPhi);
        this.active.value(active);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: this.ma.value(),
            tinhTrangHocPhi: this.tinhTrangHocPhi.value(),
            active: Number(this.active.value()),
        };
        if (changes.ma == '') {
            T.notify('Mã tình trạng học phí bị trống!', 'danger');
            this.ma.focus();
        } else if (changes.tinhTrangHocPhi == '') {
            T.notify('Tên tình trạng học phi bị trống!', 'danger');
            this.tinhTrangHocPhi.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }

    };




    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật tình trạng học phí' : 'Tạo mới tình trạng học phí',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.ma = e} label='Mã tình trạng học phí'
                    readOnly={this.state.ma ? true : readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.tinhTrangHocPhi = e} label='Tình trạng học phí'
                    readOnly={readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.active = e} label='Kích hoạt' isSwitch={true}
                    readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                />
            </div>
        });
    }
}

class DmTinhTrangHocPhiPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmTinhTrangHocPhiPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmTinhTrangHocPhiPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Tình trạng học phí', 'Bạn có chắc bạn muốn xóa loại tình trạng học phí này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDmTinhTrangHocPhi(item.ma));
    };

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmTinhTrangHocPhi', ['read', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmTinhTrangHocPhi && this.props.dmTinhTrangHocPhi.page ?
            this.props.dmTinhTrangHocPhi.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };

        let table = 'Không có dữ liệu!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '100%' }}>Tên</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={item.ma ? item.ma : ''} />
                        <TableCell type="link" content={item.tinhTrangHocPhi ? item.tinhTrangHocPhi : ''}
                            onClick={() => this.modal.show(item)} />
                        <TableCell type='checkbox' content={item.active} permission={permission}
                            onChanged={(value) => this.props.updateDmTinhTrangHocPhi(item.ma, { active: Number(value) })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} />
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục tình trạng học phí',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục tình trạng học phí'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getTinhTrangHocPhiPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmTinhTrangHocPhi} update={this.props.updateDmTinhTrangHocPhi} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmTinhTrangHocPhi: state.danhMuc.dmTinhTrangHocPhi });
const mapActionsToProps = { createDmTinhTrangHocPhi, updateDmTinhTrangHocPhi, deleteDmTinhTrangHocPhi, getDmTinhTrangHocPhiPage };
export default connect(mapStateToProps, mapActionsToProps)(DmTinhTrangHocPhiPage);