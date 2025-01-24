import React from 'react';
import { connect } from 'react-redux';
import { getDmNoiCapCccdAll, createDmNoiCapCccd, updateDmNoiCapCccd, deleteDmNoiCapCccd, getDmNoiCapCccdPage } from './redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox, getValue } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { active: false }

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, moTa, kichHoat } = item ? item : { ma: null, ten: '', moTa: '', kichHoat: 1 };
        this.setState({ ma, item });
        this.ten.value(ten);
        this.moTa.value(moTa);
        this.kichHoat.value(kichHoat);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ten: getValue(this.ten),
            moTa: getValue(this.moTa),
            kichHoat: this.kichHoat.value() ? 1 : 0,
        };

        if (this.state.ma) {
            this.props.update(this.state.ma, changes, this.hide);
        }
        else {
            this.props.create(changes, this.hide);
        }
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật nơi cấp cccd' : 'Tạo mới nơi cấp cccd',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên nơi cấp CCCD'
                    readOnly={readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.moTa = e} label='Mô tả'
                    readOnly={readOnly} />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true}
                    readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        });

    }
}

class DmNoiCapCccdPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmNoiCapCccdPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmNoiCapCccdPage();
        });

    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Nơi cấp CCCD', 'Bạn có chắc bạn muốn xóa nơi cấp cccd này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDmNoiCapCccd(item.ma));
    };

    changeActive = item => this.props.updateDmNoiCapCccd(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 });

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmNoiCapCccd', ['read', 'write', 'delete']);

        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmNoiCapCccd && this.props.dmNoiCapCccd.page ?
            this.props.dmNoiCapCccd.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };

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
                        <TableCell type='link' style={{ textAlign: 'center' }} content={item.ma ? item.ma : ''}
                            onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.ten ? item.ten : ''} />
                        <TableCell type='checkbox' style={{ textAlign: 'center' }} content={item.kichHoat} permission={permission}
                            onChanged={() => this.changeActive(item)} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} contetn={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} />
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục nơi cấp cccd',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục nơi cấp cccd'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDmNoiCapCccdPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmNoiCapCccd} update={this.props.updateDmNoiCapCccd} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmNoiCapCccd: state.danhMuc.dmNoiCapCccd });
const mapActionsToProps = { getDmNoiCapCccdPage, getDmNoiCapCccdAll, createDmNoiCapCccd, updateDmNoiCapCccd, deleteDmNoiCapCccd };
export default connect(mapStateToProps, mapActionsToProps)(DmNoiCapCccdPage);