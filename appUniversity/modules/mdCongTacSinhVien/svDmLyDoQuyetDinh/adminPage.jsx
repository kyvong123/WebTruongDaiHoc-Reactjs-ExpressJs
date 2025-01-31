import React from 'react';
import { connect } from 'react-redux';
import { createSvDmLyDoQuyetDinh, updateSvDmLyDoQuyetDinh, deleteSvDmLyDoQuyetDinh, getSvDmLyDoQuyetDinhPage } from './redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, TableCell, renderTable, getValue, FormCheckbox, FormRichTextBox, FormSelect } from 'view/component/AdminPage';

class EditModal extends AdminModal {

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { id, ten, loaiQuyetDinh, kichHoat } = item ? item : { id: '', ten: '', kichHoat: 1, loaiQuyetDinh: null };
        this.setState({ id, item });
        this.ten.value(ten);
        this.loaiQuyetDinh.value(loaiQuyetDinh);
        this.kichHoat.value(kichHoat ? 1 : 0);
    };

    onSubmit = (e) => {
        const changes = {
            ten: getValue(this.ten),
            loaiQuyetDinh: getValue(this.loaiQuyetDinh),
            kichHoat: this.kichHoat.value() ? 1 : 0,
        };
        this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        e.preventDefault();
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật lý do' : 'Tạo mới lý do',
            body: <div className='row'>
                <FormRichTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên'
                    readOnly={readOnly} required />
                <FormSelect className='col-md-12' ref={e => this.loaiQuyetDinh = e} data={[{id: '1', text: 'Quyết định ra'}, {id: '2', text: 'Quyết định vào'}, {id: '3', text: 'Quyết định khác'} ]} label='Loại quyết định' required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />

            </div>
        });
    }
}

class SvDmLyDoQuyetDinhPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/ctsv', () => {
            T.onSearch = (searchText) => this.props.getSvDmLyDoQuyetDinhPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getSvDmLyDoQuyetDinhPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa lý do', 'Bạn có chắc bạn muốn xóa lý do này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteSvDmLyDoQuyetDinh(item.id));
    };

    changeActive = item => this.props.updateSvDmLyDoQuyetDinh(item.id, { kichHoat: Number(!item.kichHoat) });


    render() {
        const permission = this.getUserPermission('dmLyDoQuyetDinh');
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmLyDoQuyetDinh && this.props.dmLyDoQuyetDinh.page ?
            this.props.dmLyDoQuyetDinh.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };

        let table = renderTable({
            getDataSource: () => list, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }} >Mã</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap' }} >Tên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} >Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={item.id ? item.id : 0} />
                    <TableCell type="link" content={item.ten ? item.ten : ''}
                        onClick={() => this.modal.show(item)} />
                    <TableCell type='checkbox' style={{ textAlign: 'center' }} content={item.kichHoat} permission={permission}
                        onChanged={() => this.changeActive(item)} />
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục lý do quyết định',
            breadcrumb: [
                <Link key={0} to='/user/ctsv'>Công tác sinh viên</Link>,
                'Danh mục lý do quyết định'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '60px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getSvDmLyDoQuyetDinhPage} />
                <EditModal ref={e => this.modal = e} readOnly={!permission.write}
                    create={this.props.createSvDmLyDoQuyetDinh} update={this.props.updateSvDmLyDoQuyetDinh} />
            </>,
            backRoute: '/user/ctsv',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const idpStateToProps = state => ({ system: state.system, dmLyDoQuyetDinh: state.ctsv.dmLyDoQuyetDinh });
const idpActionsToProps = { createSvDmLyDoQuyetDinh, updateSvDmLyDoQuyetDinh, deleteSvDmLyDoQuyetDinh, getSvDmLyDoQuyetDinhPage };
export default connect(idpStateToProps, idpActionsToProps)(SvDmLyDoQuyetDinhPage);