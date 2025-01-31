import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getDtDmCefrAll, createDtDmCefr, updateDtDmCefr, deleteDtDmCefr } from './redux';
import { AdminPage, AdminModal, TableCell, renderDataTable, FormTextBox } from 'view/component/AdminPage';
class EditModal extends AdminModal {
    componentDidMount() {
        this.onShown(() => {
            this.ma.focus();
        });
    }
    onShow = (item) => {
        let { ma, description, student } = item ? item : { ma: '', description: '', student: '' };
        this.setState({ ma, item });
        this.ma.value(ma);
        this.description.value(description);
        this.student.value(student);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: this.ma.value(),
            description: this.description.value(),
            student: this.student.value(),
        };
        if (changes.ma == '') {
            T.notify('Chưa nhập mã!', 'danger');
            this.ma.focus();
        } else if (changes.description == '') {
            T.notify('Chưa nhập trình độ!', 'danger');
            this.description.focus();
        } else this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật khung trình độ' : 'Tạo mới khung trình độ',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ma = e} label='Mã' readOnly={this.state.ma ? true : false} required />
                <FormTextBox type='text' className='col-12' ref={e => this.description = e} label='Trình độ' readOnly={readOnly} required />
                <FormTextBox type='text' className='col-12' ref={e => this.student = e} label='User' isSwitch={true} readOnly={readOnly} />
            </div>
        }
        );
    };
}

class DtDmCefrPage extends AdminPage {
    componentDidMount() {
        T.showSearchBox();
        this.props.getDtDmCefrAll();
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeActive = item => this.props.updateDtDmCefr(item.ma, { kichHoat: !item.kichHoat });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa khung trình độ', 'Bạn có chắc bạn muốn xóa khung trình độ này?', true, isConfirm =>
            isConfirm && this.props.deleteDtDmCefr(item.ma));
    }

    render() {
        const permission = this.getUserPermission('dtDmCefr', ['manage', 'write', 'delete']);
        let items = this.props.dtDmCefr ? this.props.dtDmCefr.items : [];
        const table = renderDataTable({
            data: items,
            header: 'thead-light',
            stickyHead: items && items.length > 10 ? true : false,
            emptyTable: 'Chưa có khung trình độ',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Mã</th>
                    <th style={{ width: '40%', textAlign: 'center', whiteSpace: 'nowrap' }}>Trình độ</th>
                    <th style={{ width: '40%', textAlign: 'center', whiteSpace: 'nowrap' }}>User</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ textAlign: 'center' }} content={item.ma} />
                    <TableCell content={item.description} />
                    <TableCell content={item.student} />
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                </tr>
            )
        });
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh sách khung trình độ',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/certificate-management'>Quản lý chứng chỉ</Link>,
                'Khung trình độ'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createDtDmCefr} update={this.props.updateDtDmCefr} />
            </>,
            backRoute: '/user/dao-tao/certificate-management',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtDmCefr: state.daoTao.dtDmCefr });
const mapActionsToProps = { getDtDmCefrAll, createDtDmCefr, updateDtDmCefr, deleteDtDmCefr };
export default connect(mapStateToProps, mapActionsToProps)(DtDmCefrPage);