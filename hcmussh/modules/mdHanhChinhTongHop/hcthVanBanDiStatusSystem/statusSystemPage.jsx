import React from 'react';
import { connect } from 'react-redux';
import { getPage, createSystem, copySystem, updateSystem, deleteSystem } from './redux/statusSystem';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, TableCell, renderTable, FormCheckbox, FormSelect, FormTextBox } from 'view/component/AdminPage';
import { SelectAdapter_HcthCapVanBan } from './redux/hcthCapVanBan';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { Tooltip } from '@mui/material';

class EditModal extends AdminModal {
    state = { active: false }
    onShow = (item) => {
        let { maCapVanBan, maDonVi, isPhysical, tenQuyTrinh } = item || {};
        if (item)
            this.setState({ ...item, isLoading: false }, () => {
                this.capVanBan.value(maCapVanBan || '');
                this.donVi.value(maDonVi || '');
                this.isPhysical.value(isPhysical || false);
                this.tenQuyTrinh.value(tenQuyTrinh || '');
            });
        else {
            this.setState({ id: null, maCapVanBan: null, maDonVi: null, sourceId: null, isLoading: false, tenQuyTrinh: null }, () => {
                this.capVanBan.value('');
                this.donVi.value('');
                this.isPhysical.value(false);
                this.tenQuyTrinh.value('');
            });
        }
    };

    onSubmit = (e) => {
        try {
            e.preventDefault();
            const changes = {
                capVanBan: this.capVanBan.value(),
                donVi: this.donVi.value(),
                isPhysical: Number(this.isPhysical.value()),
                isConverted: Number(this.isConverted.value()),
                tenQuyTrinh: this.tenQuyTrinh.value()
            };
            if (!changes.capVanBan) {
                T.notify('Cấp văn bản trống!', 'danger');
                this.ma.focus();
            } else {
                this.setState({ isLoading: true }, () => {
                    if (this.state.id)
                        this.props.update(this.state.id, changes, this.hide, () => this.setState({ isLoading: false }));
                    else if (this.state.sourceId) {
                        this.props.copy({ ...changes, sourceId: this.state.sourceId }, this.hide, () => this.setState({ isLoading: false }));
                    } else
                        this.props.create(changes, this.hide, () => this.setState({ isLoading: false }));
                });
            }
        } catch (e) {
            console.error(e);
        }
    };


    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            isLoading: this.state.isLoading,
            title: this.state.ma ? 'Cập nhật hệ thống' : 'Tạo mới hệ thống',
            body: <div className='row'>
                <FormTextBox className='col-md-12' ref={e => this.tenQuyTrinh = e} label='Tên quy trình' readOnly={readOnly} />
                <FormCheckbox className='col-md-6' ref={e => this.isPhysical = e} label='Văn bản giấy' isSwitch={true} readOnly={readOnly} />
                <FormCheckbox className='col-md-6' ref={e => this.isConverted = e} label='Chuyển đổi văn bản đã được phát hành' isSwitch={true} readOnly={readOnly} />
                <FormSelect className='col-md-6' ref={e => this.capVanBan = e} label='Cấp văn bản' data={SelectAdapter_HcthCapVanBan} readOnly={readOnly} />
                <FormSelect allowClear={true} className='col-md-6' ref={e => this.donVi = e} label='Đơn vị' data={SelectAdapter_DmDonVi} readOnly={readOnly} />
            </div>
        });
    }
}

class HcthVanBanDiStatusSystem extends AdminPage {
    state = { filter: {} }
    componentDidMount() {
        T.ready('/user/hcth', () => {
            T.onSearch = (searchText) => this.props.getPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.getPage(0, 50, '');
        });
    }

    getPage = (pageNumber, pageSize, pageCondition, done) => {
        this.props.getPage(pageNumber, pageSize, this.state.filter, pageCondition, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    };

    delete = (e, item) => {
        e.preventDefault();
        //TODO
        T.confirm('Xóa hệ thống trạng thái', 'Xác nhận xóa hệ thống trạng thái?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteSystem(item.id, () => this.getPage()));
    };

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('hcthVanBanDiStatusSystem', ['manage', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.statusSystem && this.props.statusSystem.page ?
            this.props.statusSystem.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };

        let table = 'Không có dữ liệu!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>STT</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tên quy trình</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Cấp văn bản</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tên đơn vị</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Vản bản giấy</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Văn bản chuyển đổi</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type="link" content={item.R} onClick={() => this.modal.show(item)} />
                        <TableCell type="link" content={item.tenQuyTrinh} onClick={() => this.modal.show(item)} />
                        <TableCell content={item.tenCapVanBan} />
                        <TableCell content={item.tenDonVi} />
                        <TableCell type='checkbox' content={item.isPhysical} />
                        <TableCell type='checkbox' content={item.isConverted} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} >
                            {permission.write && <>
                                <Tooltip arrow title='Cấu hình'>
                                    <button className='btn btn-success' onClick={() => this.props.history.push('/user/hcth/trang-thai-van-ban-di/' + item.id)}><i className='fa fa-lg fa-cog' /></button>
                                </Tooltip>
                                <Tooltip arrow title='Sao chép'>
                                    <button className='btn btn-warning' onClick={() => this.modal.show({ sourceId: item.id })}><i className='fa fa-lg fa-copy' /></button>
                                </Tooltip>
                            </>}
                        </TableCell>
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-window-restore',
            title: 'Hệ thống trạng thái văn bản đi',
            breadcrumb: [
                <Link key={0} to='/user/hcth'>Hành chính tổng hợp</Link>,
                'Trạng thái văn bản đi'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    copy={this.props.copySystem} create={this.props.createSystem} update={this.props.updateSystem} permissions={currentPermissions} />
            </>,
            backRoute: '/user/hcth',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, statusSystem: state.hcth.hcthVanBanDiStatusSystem });
const mapActionsToProps = { getPage, createSystem, copySystem, updateSystem, deleteSystem };
export default connect(mapStateToProps, mapActionsToProps)(HcthVanBanDiStatusSystem);