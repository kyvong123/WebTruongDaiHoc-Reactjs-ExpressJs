import React from 'react';
import { connect } from 'react-redux';
import { getPage, create, update, deleteCapVanBan } from './redux/hcthCapVanBan';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { active: false }

    onShow = (item) => {
        let { ma, ten } = item || {};
        this.setState({ ma, ten }, () => {
            this.ma.value(ma || '');
            this.ten.value(ten || '');
        });
    };

    onSubmit = (e) => {
        try {
            e.preventDefault();
            const data = {};
            ['ma', 'ten'].forEach(key => {
                const target = this[key];
                if (!target) throw new Error('Invalid keyword');
                if (target.props.disabled) return;
                else {
                    data[key] = target.value();
                    if (data[key] == '') {
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


    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật cấp văn bản' : 'Tạo mới cấp văn bản',
            size: 'large',
            isLoading: this.state.isLoading,
            body: <div className='row'>
                <FormTextBox className='col-md-3' ref={e => this.ma = e} label='Mã' readOnly={readOnly} disabled={this.state.ma} required />
                <FormTextBox className='col-md-9' ref={e => this.ten = e} label='Tên' readOnly={readOnly} required />
            </div>
        });
    }
}

class HcthCapVanBan extends AdminPage {
    state = { filter: {} }
    componentDidMount() {
        T.ready('/user/hcth', () => {
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
        T.confirm('Xóa cấp văn bản', 'Xác nhận xóa cấp văn bản ?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteCapVanBan(item.ma));
    };

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('hcthCapVanBan', ['manage', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.hcthCapVanBan && this.props.hcthCapVanBan.page ?
            this.props.hcthCapVanBan.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };

        let table = renderTable({
            getDataSource: () => list, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>STT</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Mã</th>
                    <th style={{ width: '80%', whiteSpace: 'nowrap' }}>Tên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={pageSize * (pageNumber - 1) + index + 1} />
                    <TableCell type="link" content={item.ma} onClick={() => this.modal.show(item)} />
                    <TableCell content={item.ten} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} ></TableCell>
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-window-restore',
            title: 'Danh mục cấp văn bản',
            breadcrumb: [
                <Link key={0} to='/user/hcth'>Hành chính tổng hợp</Link>,
                'Cấp văn bản'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.create} update={this.props.update} permissions={currentPermissions} />
            </>,
            backRoute: '/user/hcth',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcthCapVanBan: state.hcth.hcthCapVanBan });
const mapActionsToProps = { getPage, create, update, deleteCapVanBan };
export default connect(mapStateToProps, mapActionsToProps)(HcthCapVanBan);