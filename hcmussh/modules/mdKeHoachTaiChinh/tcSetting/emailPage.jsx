import React from 'react';
import { connect } from 'react-redux';
import { getAllMail, getMailUrl } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { active: false }

    onShow = (item) => {
        let { email } = item || {};
        this.setState({ email, isLoading: false }, () => {
            this.mail.value(email || '');
        });
    };

    onSubmit = (e) => {
        try {
            e.preventDefault();
            const data = {};
            ['mail'].forEach(key => {
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
                this.props.getMailUrl(data.mail, (url) => {
                    this.hide();
                    window.location.href = url;
                }, () => this.setState({ isLoading: false }));
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
            title: this.state.id ? 'Biểu thúc chính quy #' + this.state.id : 'Tạo mới thể loại ký',
            isLoading: this.state.isLoading,
            body: <div className='row'>
                <FormTextBox className='col-md-12' ref={e => this.mail = e} label='Địa chỉ email' readOnly={readOnly} disabled={this.state.id} required />
            </div>
        });
    }
}

class emailPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/finance', () => {
            this.getData();
        });
    }

    getData = (done) => {
        this.props.getAll(done);
    };

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa', 'Xác bộ biểu thức chính quy?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteSignType(item.ma));
    };

    render() {
        const currentPermissions = this.getCurrentPermissions();
        const items = this.props.mails;

        let table = renderTable({
            getDataSource: () => items, stickyHead: true,
            loadingClassName: 'd-flex justify-content-center align-items-center',
            loadingOverlay: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>STT</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Email</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell content={item.email} />
                    <TableCell type='buttons' permission={{ write: true, delete: true }} onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} >
                    </TableCell>
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-window-restore',
            title: 'Danh mục email',
            breadcrumb: [
                <Link key={0} to='/user/finance'>Kế hoạch tài chính</Link>,
                'Danh sách email'
            ],
            content: <>
                <div className='tile'>
                    <div className='tile-body row'>
                        <div className='col-md-12'>
                            {table}
                        </div>
                    </div>
                </div>
                <EditModal ref={e => this.modal = e} create={this.props.createItem} getMailUrl={this.props.getMailUrl} permissions={currentPermissions} />
            </>,
            backRoute: '/user/finance',
            onCreate: (e) => this.showModal(e),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, mails: state.finance.TcSetting?.mails });
const mapActionsToProps = { getAll: getAllMail, getMailUrl };
export default connect(mapStateToProps, mapActionsToProps)(emailPage);