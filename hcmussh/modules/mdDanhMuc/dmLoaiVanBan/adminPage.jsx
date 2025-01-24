import React from 'react';
import { connect } from 'react-redux';
import { createDmLoaiVanBan, getDmLoaiVanBanPage, updateDmLoaiVanBan, deleteDmLoaiVanBan } from './redux/dmLoaiVanBan';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

export class EditModal extends AdminModal {
    state = { active: true };

    componentDidMount() {
        T.ready(() => this.onShown(() => this.ten.focus()));
    }

    onShow = (item) => {
        const { id, ten, tenVietTat, kichHoat, ma } = item ? item : { id: null, ten: '', tenVietTat: '', kichHoat: true, ma: '' };
        this.setState({ id, item });
        this.ten.value(ten);
        this.tenVietTat.value(tenVietTat);
        this.kichHoat.value(kichHoat);
        this.ma.value(ma || '');
    }

    onSubmit = (e) => {
        const changes = {
            ten: this.ten.value(),
            tenVietTat: this.tenVietTat.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0,
            ma: this.ma.value()
        };
        if (changes.ten == '') {
            T.notify('Tên đơn vị văn bản bị trống!', 'danger');
            this.ten.focus();
        } else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
        e.preventDefault();
    }

    changeKichHoat = value => this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật loại văn bản' : 'Tạo mới loại văn bản',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên loại văn bản' readOnly={readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ma = e} label='Mã loại văn bản' readOnly={readOnly || this.state.id} required />

                <FormTextBox type='text' className='col-md-12' ref={e => this.tenVietTat = e} label='Tên viết tắt ' readOnly={readOnly} />

                <FormCheckbox className='col-md-12' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true}
                    readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />

            </div>
        });
    }
}

class DmLoaiVanBanPage extends AdminPage {
    state = { searching: false, loaiDonVi: [] };

    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmLoaiVanBanPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmLoaiVanBanPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeActive = item => this.props.updateDmLoaiVanBan(item.id, { id: item.id, kichHoat: item.kichHoat ? 0 : 1 });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục loại văn bản', 'Bạn có chắc bạn muốn xóa loại văn bản này?', true, isConfirm =>
            isConfirm && this.props.deleteDmLoaiVanBan(item.id));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [], permission = this.getUserPermission('dmLoaiVanBan', ['read', 'write', 'delete']);

        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmLoaiVanBan && this.props.dmLoaiVanBan.page ?
            this.props.dmLoaiVanBan.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };

        let table = 'Không có danh sách loại văn bản!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '100%', textAlign: 'center' }}>Tên</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Tên viết tắt</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Mã nhóm</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' content={item.ten ? item.ten : ''} />
                        <TableCell type='text' style={{ 'textAlign': 'center' }} content={item.tenVietTat ? item.tenVietTat : ''} />
                        <TableCell type='text' style={{ 'textAlign': 'center' }} content={item.nhom || ''} />
                        <TableCell type='checkbox' style={{ textAlign: 'center' }} content={item.kichHoat} permission={permission}
                            onChanged={() => this.changeActive(item)} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} ></TableCell>
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục loại văn bản',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục loại văn bản'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDmLoaiVanBanPage} />
                <EditModal ref={e => this.modal = e}
                    permission={permission}
                    create={this.props.createDmLoaiVanBan}
                    update={this.props.updateDmLoaiVanBan}
                    permissions={currentPermissions}
                />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
            buttons: permission && permission.write ? [
                { className: 'btn-secondary', icon: 'fa-cogs', tooltip: 'Phân nhóm', onClick: e => e.preventDefault() || this.props.history.push('/user/category/loai-van-ban/nhom') }
            ] : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmLoaiVanBan: state.danhMuc.dmLoaiVanBan });
const mapActionsToProps = { getDmLoaiVanBanPage, createDmLoaiVanBan, updateDmLoaiVanBan, deleteDmLoaiVanBan };
export default connect(mapStateToProps, mapActionsToProps)(DmLoaiVanBanPage);
