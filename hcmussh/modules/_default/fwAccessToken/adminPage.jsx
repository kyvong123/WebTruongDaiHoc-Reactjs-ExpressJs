import React from 'react';
import { connect } from 'react-redux';
import { getAllAccessToken, createAccessToken, updateAccessToken, deleteAccessToken } from './redux';
import { AdminPage, AdminModal, FormTextBox, FormSelect, TableCell, renderTable, getValue } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = {
        token: ''
    }

    componentDidMount() {
        this.onShown(() => this.tokenName.focus());
    }

    onShow = (item) => {
        this.token.value(item?.token || '');
        this.tokenName.value(item?.tokenName || '');
        this.permissions.value((item?.permissions || '').split(','));

        this.setState({ token: item?.token });
    }

    onSubmit = () => {
        const changes = {
            tokenName: getValue(this.tokenName),
            permissions: getValue(this.permissions).join(',')
        };

        if (this.state.token) {
            this.props.update(this.state.token, changes, this.hide);
        } else {
            this.props.create(changes, this.hide);
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Access token info',
            body: <>
                <FormTextBox ref={e => this.token = e} label='Token' readOnly />
                <FormTextBox ref={e => this.tokenName = e} label='Token Name' required />
                <FormSelect ref={e => this.permissions = e} data={[
                    { id: 'cluster:manage', text: 'cluster:manage' },
                    { id: 'cluster:write', text: 'cluster:write' },
                    { id: 'cluster:delete', text: 'cluster:delete' },
                ]} label='Permissions' multiple required />
            </>
        });
    }
}

class AccessTokenPage extends AdminPage {
    state = {};

    componentDidMount() {
        T.ready('/user/settings');
        this.props.getAllAccessToken();
    }

    render() {
        const permission = this.getUserPermission('developer', ['login']);
        const list = this.props.accessToken?.items || [];

        permission.write = permission.login;
        permission.delete = permission.login;

        const table = renderTable({
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '50%' }}>Token</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Permissions</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Actions</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={item.token} />
                    <TableCell type='text' content={item.permissions} />
                    <TableCell type='buttons' content={item} style={{ textAlign: 'center' }} permission={permission} onEdit={() => this.modal.show(item)} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-flag',
            title: 'Access token',
            breadcrumb: ['Access token'],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} create={this.props.createAccessToken} update={this.props.updateAccessToken} />
            </>,
            onCreate: permission.write ? () => this.modal.show() : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, accessToken: state.framework.accessToken });
const mapActionsToProps = { getAllAccessToken, createAccessToken, updateAccessToken, deleteAccessToken };
export default connect(mapStateToProps, mapActionsToProps)(AccessTokenPage);