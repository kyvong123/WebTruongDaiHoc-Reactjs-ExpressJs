import React from 'react';
import { connect } from 'react-redux';
import { getDtDmNgoaiNguAll, createDtDmNgoaiNgu, deleteDtDmNgoaiNgu, updateDtDmNgoaiNgu } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderDataTable, FormTextBox, FormCheckbox } from 'view/component/AdminPage';
class EditModal extends AdminModal {
    state = { active: true, kichHoat: true };

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, kichHoat } = item ? item : { ma: '', ten: '', kichHoat: true };
        this.setState({ ma, item });
        this.ma.value(ma);
        this.ten.value(ten ? ten : '');
        this.kichHoat.value(kichHoat);
    }

    onSubmit = (e) => {
        const changes = {
            ma: this.ma.value(),
            ten: this.ten.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0,
        };
        if (changes.ma == '') {
            T.notify('Mã ngoại ngữ bị trống!', 'danger');
            this.ma.focus();
        } else if (changes.ten == '') {
            T.notify('Chưa nhập tên ngoại ngữ!', 'danger');
            this.ten.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
        e.preventDefault();
    }

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật ngoại ngữ' : 'Tạo mới ngoại ngữ',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-6' ref={e => this.ma = e} label='Mã ngoại ngữ'
                    readOnly={this.state.ma ? true : readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên ngoại ngữ'
                    readOnly={readOnly} />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true}
                    readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        });
    }
}

class DmNgoaiNguPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            T.showSearchBox();
            this.props.getDtDmNgoaiNguAll();
        });
    }
    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin', 'Bạn có chắc bạn muốn xóa ngoại ngữ này?', true, isConfirm => isConfirm && this.props.deleteDtDmNgoaiNgu(item.ma));
        e.preventDefault();
    }

    changeKichHoat = item => this.props.updateDtDmNgoaiNgu(item.ma, { kichHoat: Number(!item.kichHoat) })

    render() {
        const permission = this.getUserPermission('dtDmNgoaiNgu', ['read', 'write', 'delete']);
        let items = this.props.dtDmNgoaiNgu ? this.props.dtDmNgoaiNgu.items : [];

        const table = renderDataTable({
            data: items,
            header: 'thead-light',
            stickyHead: items && items.length > 10 ? true : false,
            emptyTable: 'Chưa có ngoại ngữ',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>Mã</th>
                    <th style={{ width: '100%' }}>Tên ngoại ngữ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index} >
                    <TableCell type='text' content={item.ma ? item.ma : ''} />
                    <TableCell type='link' style={{ whiteSpace: 'nowrap' }} content={item.ten ? item.ten : ''}
                        onClick={() => this.modal.show(item)} />
                    <TableCell type='checkbox' style={{ textAlign: 'center' }} content={item.kichHoat} permission={permission}
                        onChanged={() => this.changeKichHoat(item)} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} />
                </tr>
            )
        });


        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh sách Ngoại ngữ',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/certificate-management'>Quản lý chứng chỉ</Link>,
                'Danh sách Ngoại ngữ'
            ],
            content: <>
                <div className='tile'>{table}</div>

                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDtDmNgoaiNgu} update={this.props.updateDtDmNgoaiNgu} />
            </>,
            backRoute: '/user/dao-tao/certificate-management',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtDmNgoaiNgu: state.daoTao.dtDmNgoaiNgu });
const mapActionsToProps = {
    getDtDmNgoaiNguAll, createDtDmNgoaiNgu, deleteDtDmNgoaiNgu, updateDtDmNgoaiNgu
};
export default connect(mapStateToProps, mapActionsToProps)(DmNgoaiNguPage);