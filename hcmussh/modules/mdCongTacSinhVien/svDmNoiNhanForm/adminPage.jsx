import React from 'react';
import { connect } from 'react-redux';
import { createSvDmNoiNhanForm, updateSvDmNoiNhanForm, deleteSvDmNoiNhanForm, getSvDmNoiNhanFormPage } from './redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, getValue, FormCheckbox, FormRichTextBox } from 'view/component/AdminPage';

class EditModal extends AdminModal {

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.id.value() ? this.id.focus() : this.tenHienThi.focus();
        }));
    }

    onShow = (item) => {
        let { id, tenHienThi, ghiChu, kichHoat } = item ? item : { id: '', tenHienThi: '', ghiChu: '', kichHoat: 1 };
        this.setState({ id, item });
        this.id.value(id);
        this.tenHienThi.value(tenHienThi);
        this.ghiChu.value(ghiChu);
        this.kichHoat.value(kichHoat ? 1 : 0);
    };

    onSubmit = (e) => {
        const changes = {
            id: getValue(this.id),
            tenHienThi: getValue(this.tenHienThi),
            ghiChu: getValue(this.ghiChu),
            kichHoat: this.kichHoat.value() ? 1 : 0,
        };

        this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        e.preventDefault();
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật nơi nhận form' : 'Tạo mới nơi nhận form',
            body: <div className='row'>
                <FormTextBox type='number' className='col-md-12' ref={e => this.id = e} label='Mã'
                    readOnly={this.state.id ? true : readOnly} required />
                <FormRichTextBox type='text' className='col-md-12' ref={e => this.tenHienThi = e} label='Tên'
                    readOnly={readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ghiChu = e} label='Ghi chú'
                    readOnly={readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        });
    }
}

class SvDmNoiNhanFormPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/ctsv', () => {
            T.onSearch = (searchText) => this.props.getSvDmNoiNhanFormPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getSvDmNoiNhanFormPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa nơi nhận form', 'Bạn có chắc bạn muốn xóa nơi nhận form này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteSvDmNoiNhanForm(item.id));
    };

    changeActive = item => this.props.updateSvDmNoiNhanForm(item.id, { kichHoat: Number(!item.kichHoat) });


    render() {
        const permission = this.getUserPermission('dmNoiNhanForm');
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmNoiNhanForm && this.props.dmNoiNhanForm.page ?
            this.props.dmNoiNhanForm.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };

        let table = renderTable({
            getDataSource: () => list, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }} >Mã</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }} >Tên</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }} >Ghi chú</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} >Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={item.id ? item.id : 0} />
                    <TableCell type="link" content={item.tenHienThi ? item.tenHienThi : ''}
                        onClick={() => this.modal.show(item)} />
                    <TableCell type='text' style={{ textAlign: 'left' }} content={item.ghiChu ? item.ghiChu : ''} />
                    <TableCell type='checkbox' style={{ textAlign: 'center' }} content={item.kichHoat} permission={permission}
                        onChanged={() => this.changeActive(item)} />
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục nơi nhận form',
            breadcrumb: [
                <Link key={0} to='/user/ctsv'>Công tác sinh viên</Link>,
                'Danh mục nơi nhận form'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '60px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getSvDmNoiNhanFormPage} />
                <EditModal ref={e => this.modal = e} readOnly={!permission.write}
                    create={this.props.createSvDmNoiNhanForm} update={this.props.updateSvDmNoiNhanForm} />
            </>,
            backRoute: '/user/ctsv',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const idpStateToProps = state => ({ system: state.system, dmNoiNhanForm: state.ctsv.dmNoiNhanForm });
const idpActionsToProps = { createSvDmNoiNhanForm, updateSvDmNoiNhanForm, deleteSvDmNoiNhanForm, getSvDmNoiNhanFormPage };
export default connect(idpStateToProps, idpActionsToProps)(SvDmNoiNhanFormPage);