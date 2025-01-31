import React from 'react';
import { connect } from 'react-redux';
import { getPage, create, update, deleteItem } from './redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { active: false }

    onShow = (item) => {
        let { ma, ten, kichHoat } = item || {};
        this.setState({ ma, ten, kichHoat }, () => {
            this.ma.value(ma || '');
            this.ten.value(ten || '');
            this.kichHoat.value(kichHoat);
        });
    };

    onSubmit = (e) => {
        try {
            e.preventDefault();
            const data = {};
            ['ma', 'ten', 'kichHoat'].forEach(key => {
                const target = this[key];
                if (!target) throw new Error('Invalid keyword');
                if (target.props.disabled) return;
                else {
                    data[key] = target.value();
                    if (!data[key]) {
                        if (target.props.required) {
                            throw target;
                        }
                    }
                }
            });
            this.setState({ isLoading: true }, () => {
                if (this.state.ma)
                    this.props.update(this.state.ma, data, this.hide, () => this.setState({ isLoading: false }));
                else
                    this.props.create(data, this.hide, () => this.setState({ isLoading: false }));
            });
        } catch (e) {
            if (e.props?.label)
                T.notify(e.props.label + ' trống', 'danger');
            else
                console.error(e);
        }
    };

    changeKichHoat = value => this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật thể loại ký' : 'Tạo mới thể loại ký',
            size: 'large',
            isLoading: this.state.isLoading,
            body: <div className='row'>
                <FormTextBox className='col-md-3' ref={e => this.ma = e} label='Mã' readOnly={readOnly} disabled={this.state.ma} required />
                <FormTextBox className='col-md-9' ref={e => this.ten = e} label='Tên' readOnly={readOnly} required />
                <FormCheckbox className='col-md-12' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true}
                    readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        });
    }
}

class DmDoKhanVanBan extends AdminPage {
    state = { filter: {} }
    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.getPage(0, 50, '');
        });
    }

    getPage = (pageNumber, pageSize, pageCondition, done) => {
        this.props.getPage(pageNumber, pageSize, this.state.filter, pageCondition, done);
    };

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    };

    delete = (e, item) => {
        e.preventDefault();
        //TODO
        T.confirm('Xóa độ khẩn văn bản', 'Xác nhận xóa độ khẩn văn bản?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteItem(item.ma));
    };

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('hcthSignType', ['manage', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmDoKhanVanBan && this.props.dmDoKhanVanBan.page ?
            this.props.dmDoKhanVanBan.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };

        let table = renderTable({
            getDataSource: () => list, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>STT</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Mã</th>
                    <th style={{ width: '80%', whiteSpace: 'nowrap' }}>Tên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={pageSize * (pageNumber - 1) + index + 1} />
                    <TableCell type="link" content={item.ma} onClick={() => this.modal.show(item)} />
                    <TableCell content={item.ten} />
                    <TableCell type='checkbox' style={{ textAlign: 'center' }} content={item.kichHoat} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} ></TableCell>
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-thermometer-full',
            title: 'Danh mục độ khẩn văn bản',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Độ khẩn văn bản'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.create} update={this.props.update} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmDoKhanVanBan: state.danhMuc.dmDoKhanVanBan });
const mapActionsToProps = { getPage, create, update, deleteItem };
export default connect(mapStateToProps, mapActionsToProps)(DmDoKhanVanBan);
