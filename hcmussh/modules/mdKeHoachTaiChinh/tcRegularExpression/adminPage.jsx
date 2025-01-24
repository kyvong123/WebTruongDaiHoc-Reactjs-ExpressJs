import React from 'react';
import { connect } from 'react-redux';
import { getAll, createItem, updateItem } from './redux/regularExpressionSet';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { active: false }

    onShow = (item) => {
        let { id, ten } = item || {};
        this.setState({ id, ten }, () => {
            this.ten.value(ten || '');
        });
    };

    onSubmit = (e) => {
        try {
            e.preventDefault();
            const data = {};
            ['ten'].forEach(key => {
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
                if (this.state.id)
                    this.props.update(this.state.id, data, this.hide, () => this.setState({ isLoading: false }));
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
            title: this.state.id ? 'Biểu thúc chính quy #' + this.state.id : 'Tạo mới thể loại ký',
            isLoading: this.state.isLoading,
            body: <div className='row'>
                <FormTextBox className='col-md-12' ref={e => this.ten = e} label='Tên bộ biểu thức chính quy' readOnly={readOnly} disabled={this.state.id} required />
            </div>
        });
    }
}

class tcRegularExpression extends AdminPage {

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
        const items = this.props.tcRegularExpression && this.props.tcRegularExpression.items;

        let table = renderTable({
            getDataSource: () => items, stickyHead: true,
            loadingClassName: 'd-flex justify-content-center align-items-center',
            loadingOverlay: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>STT</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Tên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell type='link' content={item.ten} onClick={() => this.props.history.push('/user/finance/regular-expression/' + item.id)} />
                    <TableCell type='buttons' permission={{ write: true, delete: true }} onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} >
                    </TableCell>
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-window-restore',
            title: 'Danh mục biểu thức chính quy',
            breadcrumb: [
                <Link key={0} to='/user/finance'>Kế hoạch tài chính</Link>,
                'Danh mục biểu thức chính quy'
            ],
            content: <>
                <div className='tile'>
                    <div className='tile-body row'>
                        <div className='col-md-12'>
                            {table}
                        </div>
                    </div>
                </div>
                <EditModal ref={e => this.modal = e} create={this.props.createItem} update={this.props.updateItem} permissions={currentPermissions} />
            </>,
            backRoute: '/user/finance',
            onCreate: (e) => this.showModal(e),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tcRegularExpression: state.finance.tcRegularExpression });
const mapActionsToProps = { getAll, createItem, updateItem };
export default connect(mapStateToProps, mapActionsToProps)(tcRegularExpression);