import React from 'react';
import { connect } from 'react-redux';
import { getDmNganHangPage, getDmNganHangAll, deleteDmNganHang, createDmNganHang, updateDmNganHang, createMultipleThongTinNganHangSinhVien } from './redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox, getValue } from 'view/component/AdminPage';
import UploadNganHangSinhVienModal from './modal/UploadNganHangSinhVienModal';

class EditModal extends AdminModal {
    state = { kichHoat: true };

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, kichHoat } = item ? item : { ma: '', ten: '', kichHoat: true };
        this.ma.value(ma);
        this.ten.value(ten);
        this.kichHoat.value(kichHoat);
        this.setState({ ma, item });
    };

    onSubmit = (e) => {
        try {
            e.preventDefault();
            const changes = {
                ma: getValue(this.ma),
                ten: getValue(this.ten),
                kichHoat: getValue(this.kichHoat) ? 1 : 0
            };
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
        catch (error) {
            if (error.props)
                T.notify(error.props.label + ' bị trống', 'danger');
        }
    }
    changeKichHoat = value => this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật danh mục ngân hàng' : 'Tạo mới danh mục ngân hàng',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.ma = e} readOnly={this.state.ma ? true : readOnly} label='Mã' required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên ngân hàng' required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} style={{ display: 'inline-flex', margin: 0 }} onChange={value => this.changeKichHoat(value)} />
            </div>
        });
    }
}

class DmNganHangPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmNganHangPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmNganHangPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeActive = item => this.props.updateDmNganHang(item.ma, { kichHoat: Number(!item.kichHoat) })

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa ngân hàng', 'Bạn có chắc bạn muốn xóa danh mục này?', true, isConfirm =>
            isConfirm && this.props.deleteDmNganHang(item.ma));
    }

    render() {
        const permission = this.getUserPermission('dmNganHang', ['read', 'write', 'delete']);
        let buttons = [];
        permission.write && buttons.push({ type: 'primary', icon: 'fa fa-plus-square', className: 'btn-success', tooltip: 'Tải lên ngân hàng', onClick: e => e.preventDefault() || this.uploadNganHangSinhVienModal.show() });
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmNganHang && this.props.dmNganHang.page ?
            this.props.dmNganHang.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        let table = renderTable({
            getDataSource: () => list,
            stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '25%', whiteSpace: 'nowrap' }} >Mã</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tên ngân hàng</th>
                    <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Kích Hoạt</th>
                    <th style={{ width: 'auto' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' content={item.ma} onClick={() => this.modal.show(item)} />
                    <TableCell type='text' content={item.ten} />
                    <TableCell type='checkbox' style={{ textAlign: 'center' }} content={item.kichHoat} permission={permission} onChanged={() => this.changeActive(item)} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission} onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục ngân hàng',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục ngân hàng'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getDmNganHangPage} />
                <EditModal ref={e => this.modal = e} permission={permission} create={this.props.createDmNganHang} update={this.props.updateDmNganHang} />
                <UploadNganHangSinhVienModal ref={e => this.uploadNganHangSinhVienModal = e} createMultipleThongTinNganHangSinhVien={this.props.createMultipleThongTinNganHangSinhVien} getDmNganHangPage={this.props.getDmNganHangPage} />
            </>,
            backRoute: '/user/category',
            buttons,
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmNganHang: state.danhMuc.dmNganHang });
const mapActionsToProps = { getDmNganHangPage, getDmNganHangAll, deleteDmNganHang, createDmNganHang, updateDmNganHang, createMultipleThongTinNganHangSinhVien };
export default connect(mapStateToProps, mapActionsToProps)(DmNganHangPage);
