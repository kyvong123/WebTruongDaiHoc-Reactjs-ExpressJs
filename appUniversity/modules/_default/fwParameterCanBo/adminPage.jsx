import React from 'react';
import { connect } from 'react-redux';
import { getAllFwParameterCanBo, deleteFwParameterCanBo, createFwParameterCanBo, updateFwParameterCanBo } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, getValue, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            this.bien.focus();
        }));
    }

    onShow = (item) => {
        this.setState({ item });
        ['bien', 'chuThich', 'kichHoat'].forEach(key => this[key].value(item ? item[key] : ''));

    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            bien: getValue(this.bien),
            chuThich: getValue(this.chuThich),
            kichHoat: Number(this.kichHoat.value())
        };
        this.state.item ? this.props.update(this.state.item.bien, changes, this.hide) : this.props.create({ ...changes }, this.hide);
    };

    changeKichHoat = value => this.kichHoat.value(Number(value));

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: !this.state.item ? 'Tạo mới' : 'Cập nhật',
            size: 'large',
            body: <div className='row'>
                <FormTextBox className='col-12' ref={e => this.bien = e} label='Biến' readOnly={readOnly} required smallText='e.g. {ten_bien}' />
                <FormTextBox className='col-12' ref={e => this.chuThich = e} label='Chú thích' readOnly={readOnly} />
                <FormCheckbox isSwitch ref={e => this.kichHoat = e} label='Kích hoạt' className='col-12' multiple />
            </div>
        }
        );
    }
}

class fwParameterCanBoPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/settings', () => {
            T.onSearch = (searchText) => this.props.getAllFwParameterCanBo(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getAllFwParameterCanBo();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa tham số', `Bạn có chắc bạn muốn xóa tham số ${item.bien ? `<b>${item.bien}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteFwParameterCanBo(item.bien, error => {
                if (error) T.notify(error.message ? error.message : `Xoá tham số ${item.bien} bị lỗi!`, 'danger');
                else T.alert(`Xoá tham số ${item.bien} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('fwParameterCanBo', ['manage', 'write', 'delete']);
        const items = this.props.fwParameterCanBo && this.props.fwParameterCanBo.items ? this.props.fwParameterCanBo.items : [];
        const table = renderTable({
            getDataSource: () => items,
            stickyHead: false,
            emptyTable: 'Không có dữ liệu',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Biến</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.bien} onClick={() => this.modal.show(item)} />
                    <TableCell content={item.chuThich || ''} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='checkbox' permission={permission} content={item.kichHoat} onChanged={value => this.props.updateFwParameterCanBo(item.bien, { kichHoat: value })} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-indent',
            title: 'Tham số cán bộ',
            breadcrumb: [
                <Link key={0} to='/user/settings'>Cấu hình</Link>,
                'Tham số cán bộ'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission} readOnly={!permission.write} create={this.props.createFwParameterCanBo} update={this.props.updateFwParameterCanBo} />
            </>,
            backRoute: '/user/settings',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, fwParameterCanBo: state.framework.fwParameterCanBo });
const mapActionsToProps = { getAllFwParameterCanBo, deleteFwParameterCanBo, createFwParameterCanBo, updateFwParameterCanBo };
export default connect(mapStateToProps, mapActionsToProps)(fwParameterCanBoPage);