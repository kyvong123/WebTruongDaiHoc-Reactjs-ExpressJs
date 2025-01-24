import React from 'react';
import { connect } from 'react-redux';
import { getAllFwParameter, deleteFwParameter, createFwParameter, updateFwParameter } from './redux';
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
        ['model', 'col', 'bien', 'chuThich', 'kichHoat', 'mapCol', 'mapModel', 'loaiGiaTri', 'mapColValue'].forEach(key => this[key].value(item ? item[key] : ''));

    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            model: getValue(this.model),
            col: getValue(this.col),
            bien: getValue(this.bien),
            chuThich: getValue(this.chuThich),
            mapModel: getValue(this.mapModel),
            mapCol: getValue(this.mapCol),
            mapColValue: getValue(this.mapColValue),
            loaiGiaTri: getValue(this.loaiGiaTri),
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
                <FormTextBox className='col-6' ref={e => this.model = e} label='Model' readOnly={this.state.item} required />
                <FormTextBox className='col-6' ref={e => this.col = e} label='Cột' readOnly={readOnly} required />
                <FormTextBox className='col-4' ref={e => this.mapModel = e} label='Model map' readOnly={readOnly} />
                <FormTextBox className='col-4' ref={e => this.mapCol = e} label='Cột map' readOnly={readOnly} />
                <FormTextBox className='col-4' ref={e => this.mapColValue = e} label='Cột giá trị map' readOnly={readOnly} />
                <FormTextBox className='col-12' ref={e => this.chuThich = e} label='Chú thích' readOnly={readOnly} />
                <FormTextBox className='col-12' ref={e => this.loaiGiaTri = e} label='Loại giá trị' readOnly={readOnly} />
                <FormCheckbox isSwitch ref={e => this.kichHoat = e} label='Kích hoạt' className='col-12' multiple />
            </div>
        }
        );
    }
}

class fwParameterPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/settings', () => {
            T.onSearch = (searchText) => this.props.getAllFwParameter(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getAllFwParameter();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa tham số', `Bạn có chắc bạn muốn xóa tham số ${item.bien ? `<b>${item.bien}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteFwParameter(item.bien, error => {
                if (error) T.notify(error.message ? error.message : `Xoá tham số ${item.bien} bị lỗi!`, 'danger');
                else T.alert(`Xoá tham số ${item.bien} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('fwParameter', ['manage', 'write', 'delete']);
        const items = this.props.fwParameter && this.props.fwParameter.items ? this.props.fwParameter.items : [];
        const table = renderTable({
            getDataSource: () => items,
            stickyHead: false,
            emptyTable: 'Không có dữ liệu',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Biến</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Model</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cột</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.bien} onClick={() => this.modal.show(item)} />
                    <TableCell content={item.chuThich || ''} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={<>{item.model}<br />{item.mapModel ? <span className='text-danger'>{item.mapModel}</span> : ''}</>} />
                    <TableCell content={<>{item.col}<br />{item.mapCol ? <span className='text-danger'>{item.mapCol} → {item.mapColValue}</span> : ''}</>} />
                    <TableCell type='checkbox' permission={permission} content={item.kichHoat} onChanged={value => this.props.updateFwParameter(item.bien, { kichHoat: value })} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-indent',
            title: 'Tham số',
            breadcrumb: [
                <Link key={0} to='/user/settings'>Cấu hình</Link>,
                'Tham số'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission} readOnly={!permission.write} create={this.props.createFwParameter} update={this.props.updateFwParameter} />
            </>,
            backRoute: '/user/settings',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, fwParameter: state.framework.fwParameter });
const mapActionsToProps = { getAllFwParameter, deleteFwParameter, createFwParameter, updateFwParameter };
export default connect(mapStateToProps, mapActionsToProps)(fwParameterPage);