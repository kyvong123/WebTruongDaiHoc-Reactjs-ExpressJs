import React from 'react';
import { connect } from 'react-redux';
import { getItem } from './redux/regularExpressionSet';
import { createItem, updateItem, deleteSetItem } from './redux/regularExpressionItem';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';

class TestModal extends AdminModal {
    state = { active: false }

    onShow = (items) => {
        // let { regularExpression, startAt, endAt } = item || {};
        this.setState({ items }, () => {
            this.content.value('');
            this.regex.value('');
            this.ret.value('');
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        const content = this.content.value() || '';
        if (!content) {
            this.ret.value('');
            this.regex.value('');
            return T.notify('Nội dung trống', 'danger');
        }
        let ret = '';
        for (const regularExpressionItem of this.state.items) {
            const regex = new RegExp(regularExpressionItem.regularExpression, 'g');
            if (regex.test(content)) {
                if (regularExpressionItem.endAt)
                    ret = (content.match(regex)[0].slice(regularExpressionItem.startAt, regularExpressionItem.endAt));
                else
                    ret = (content.match(regex)[0].slice(regularExpressionItem.startAt));
                this.regex.value(regularExpressionItem.regularExpression);
                break;
            }
        }
        if (!ret) {
            this.ret.value('');
            this.regex.value('');
            T.notify('Nội dung không khớp biểu thức chính quy', 'warning');
        } else {
            this.ret.value(ret);
        }
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Test biểu thức chính quy',
            isLoading: this.state.isLoading,
            body: <div className='row'>
                <FormTextBox className='col-md-12' ref={e => this.content = e} label='Nội dung' readOnly={readOnly} disabled={this.state.isLoading} required />
                <FormTextBox className='col-md-12' ref={e => this.regex = e} label='Biểu thức sử dụng' readOnly={readOnly} disabled />
                <FormTextBox className='col-md-12' ref={e => this.ret = e} label='Kết quả' readOnly={readOnly} disabled />
            </div>
        });
    }
}

class EditModal extends AdminModal {
    state = { active: false }

    onShow = (item) => {
        let { id, regularExpression, startAt, endAt, isLoading = false } = item || {};
        this.setState({ id, regularExpression, startAt, endAt, isLoading }, () => {
            this.regularExpression.value(regularExpression || '');
            this.startAt.value(startAt || '');
            this.endAt.value(endAt || '');
        });
    };

    onSubmit = (e) => {
        try {
            e.preventDefault();
            const data = { ma: this.props.ma };
            ['regularExpression', 'startAt', 'endAt'].forEach(key => {
                const target = this[key];
                if (!target) throw new Error('Invalid keyword');
                if (target.props.disabled) return;
                else {
                    data[key] = target.value();
                    if (data[key] == null) {
                        if (target.props.required) {
                            throw target;
                        }
                    }
                }
            });
            this.setState({ isLoading: true }, () => {
                if (this.state.id)
                    this.props.update(this.state.id, data, () => this.hide() || (this.props.onSuccessCallback && this.props.onSuccessCallback()), () => this.setState({ isLoading: false }));
                else
                    this.props.create(data, () => this.hide() || (this.props.onSuccessCallback && this.props.onSuccessCallback()), () => this.setState({ isLoading: false }));
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
                <FormTextBox className='col-md-12' ref={e => this.regularExpression = e} label='biểu thức' readOnly={readOnly} disabled={this.state.isLoading} required />
                <FormTextBox className='col-md-6' type='number' ref={e => this.startAt = e} label='Giá trị biếu thức bắt đầu tại' readOnly={readOnly} disabled={this.state.isLoading} required />
                <FormTextBox className='col-md-6' type='number' ref={e => this.endAt = e} label='Giá trị biếu thức kết thúc tại' readOnly={readOnly} disabled={this.state.isLoading} required />
            </div>
        });
    }
}

class tcRegularExpressionEdit extends AdminPage {

    componentDidMount() {
        T.ready('/user/finance', () => {
            const params = T.routeMatcher('/user/finance/regular-expression/:id').parse(window.location.pathname);
            this.setState({ id: params.id }, () => {
                this.getData();
            });
        });
    }

    getData = (done) => {
        this.props.getItem(this.state.id, done);
    };

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa', 'Xác bộ biểu thức chính quy?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteSetItem(item.id, this.getData));
    };

    render() {
        const currentPermissions = this.getCurrentPermissions();
        const items = this.props.tcRegularExpression && this.props.tcRegularExpression.item && this.props.tcRegularExpression.item.regularExpressions;

        let table = renderTable({
            getDataSource: () => items, stickyHead: true,
            loadingClassName: 'd-flex justify-content-center align-items-center',
            loadingOverlay: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>STT</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Biểu thức</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Giá trị đầu ra bắt đầu tại</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Giá trị đầu ra kết thúc tại</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell content={item.regularExpression} />
                    <TableCell content={item.startAt} />
                    <TableCell content={item.endAt} />
                    <TableCell type='buttons' permission={{ write: true, delete: true }} onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} >
                        <Tooltip arrow title='Test'>
                            <button onClick={(e) => e.preventDefault() || this.testModal.show([item])} className='btn btn-warning'><i className='fa fa-play' /></button>
                        </Tooltip>
                    </TableCell>
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-window-restore',
            title: 'Danh mục biểu thức chính quy',
            breadcrumb: [
                <Link key={0} to='/user/finance'>Kế hoạch tài chính</Link>,
                <Link key={1} to='/user/finance/regular-expression'>Danh mục biểu thức chính quy</Link>,
                'Biểu thức chính quy'
            ],
            content: <>
                <div className='tile'>
                    <div className='tile-body row'>
                        <div className='col-md-12'>
                            {table}
                        </div>
                    </div>
                </div>
                <TestModal ref={e => this.testModal = e} />
                <EditModal ref={e => this.modal = e} ma={this.state.id} onSuccessCallback={this.getData} create={this.props.createItem} update={this.props.updateItem} permissions={currentPermissions} />
            </>,
            backRoute: '/user/finance',
            onCreate: (e) => this.showModal(e),
            buttons: [{ className: 'btn-warning', icon: 'fa-play', tooltip: 'Test', onClick: (e) => e.preventDefault() || this.testModal.show(items) }]
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tcRegularExpression: state.finance.tcRegularExpression });
const mapActionsToProps = { createItem, updateItem, getItem, deleteSetItem };
export default connect(mapStateToProps, mapActionsToProps)(tcRegularExpressionEdit);