import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getDmDichVuCungCapPage, createDmDichVuCungCap, updateDmDichVuCungCap, deleteDmDichVuCungCap } from './redux';
import { AdminPage, TableCell, renderTable, AdminModal, FormCheckbox, FormTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class EditModal extends AdminModal {
    componentDidMount() {
        this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        });
    }

    onShow = (item) => {
        let { ma, ten, kichHoat } = item ? item : { ma: '', ten: '', kichHoat: true };

        this.setState({ ma });
        this.ma.value(ma);
        this.ten.value(ten);
        this.kichHoat.value(kichHoat);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: this.ma.value().toUpperCase(),
            ten: this.ten.value(),
            kichHoat: Number(this.kichHoat.value())
        };

        if (changes.ma == '') {
            T.notify('Mã dịch vụ bị trống!', 'danger');
            this.ma.focus();
        } else if (changes.ten == '') {
            T.notify('Tên dịch vụ bị trống!', 'danger');
            this.ten.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật dịch vụ' : 'Tạo mới dịch vụ',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' maxLength={10} ref={e => this.ma = e} label='Mã dịch vụ'
                    readOnly={this.state.ma ? true : readOnly} required />
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên dịch vụ' readOnly={readOnly} placeholder='Tên dịch vụ' required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex' }}
                    onChange={value => this.changeKichHoat(value)} required />
            </div>
        });
    }
}
class DmDichVuCungCapPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            T.onSearch = (searchText) => this.props.getDmDichVuCungCapPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmDichVuCungCapPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa dịch vụ', `Bạn có chắc bạn muốn xóa dịch vụ ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDmDichVuCungCap(item.ma);
        });
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('dmDichVuCungCap', ['read', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmDichVuCungCap && this.props.dmDichVuCungCap.page ?
            this.props.dmDichVuCungCap.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        let table = 'Không có dữ liệu dịch vụ cung cấp!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Tên dịch vụ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={item.ma ? item.ma : ''} />
                        <TableCell type='link' content={item.ten} onClick={() => this.modal.show(item)} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmDichVuCungCap(item.ma, { kichHoat: Number(value) })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>
                )
            });
        }
        return this.renderPage({
            icon: 'fa fa fa-graduation-cap',
            title: 'Dịch vụ sinh viên',
            breadcrumb: [
                < Link key={0} to='/user/dao-tao' > Đào tạo</Link >,
                'Dịch vụ sinh viên'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDmDichVuCungCapPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmDichVuCungCap} update={this.props.updateDmDichVuCungCap} />
            </>,
            backRoute: '/user/dao-tao',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmDichVuCungCap: state.danhMuc.dmDichVuCungCap });
const mapActionsToProps = { getDmDichVuCungCapPage, createDmDichVuCungCap, updateDmDichVuCungCap, deleteDmDichVuCungCap };
export default connect(mapStateToProps, mapActionsToProps)(DmDichVuCungCapPage);