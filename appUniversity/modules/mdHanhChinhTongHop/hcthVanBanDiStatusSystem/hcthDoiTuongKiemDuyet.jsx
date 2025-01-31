import React from 'react';
import { connect } from 'react-redux';
import { getPage, create, update, deleteDoiTuong } from './redux/hcthDoiTuongKiemDuyet';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox, FormSelect } from 'view/component/AdminPage';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';

class EditModal extends AdminModal {
    state = { active: false }

    onShow = (item) => {
        let { ma, ten, permissionList, shcc, isDepartment, isCreator, isRecipient, isRector, isPresident, isManager } = item || {};
        this.setState({ ma, ten, permissionList, shcc, isDepartment, isCreator, isRecipient, isRector, isPresident, isManager }, () => {
            shcc = T.parse(shcc, [], true);
            this.ma.value(ma || '');
            this.ten.value(ten || '');
            this.permissionList.value(permissionList || '');
            this.shcc.value(Array.isArray(shcc) ? shcc : []);
            this.isDepartment.value(isDepartment || '');
            this.isCreator.value(isCreator || '');
            this.isRecipient.value(isRecipient || '');
            this.isRector.value(isRector || '');
            this.isPresident.value(isPresident || '');
            this.isManager.value(isManager || '');
        });
    };

    onSubmit = (e) => {
        try {
            e.preventDefault();
            const data = {};
            ['ma', 'ten', 'isDepartment', 'permissionList', 'shcc', 'isCreator', 'isRecipient', 'isRector', 'isPresident', 'isManager'].forEach(key => {
                const target = this[key];
                if (!target) throw new Error('Invalid keyword');
                if (target.props.disabled) return;
                else {
                    data[key] = target.value();
                    if (!data[key] || (Array.isArray(data[key]) && !data[key].length)) {
                        if (target.props.required) {
                            throw target;
                        }
                    }
                }
                if (['isDepartment', 'isCreator', 'isRecipient', 'isRector', 'isPresident', 'isManager'].includes(key)) {
                    data[key] = Number(data[key]) || 0;
                }
            });
            this.setState({ isLoading: true }, () => {
                if (this.state.ma)
                    this.props.update(this.state.ma, data, this.hide, () => this.setState({ isLoading: false }));
                else
                    this.props.create(data, this.hide, () => this.setState({ isLoading: false }));
            });
        } catch (e) {
            if (e.props?.label)
                T.notify(e.props?.label + ' trống', 'danger');
            else
                console.error(e);
        }
    };


    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật đối tượng kiểm duyệt' : 'Tạo mới đối tượng kiểm duyệt',
            size: 'large',
            isLoading: this.state.isLoading,
            body: <div className='row'>
                <FormCheckbox className='col-md-6' ref={e => this.isDepartment = e} label='Đối tượng thuộc đơn vị' readOnly={readOnly} />
                <FormCheckbox className='col-md-6' ref={e => this.isCreator = e} label='Người tạo' readOnly={readOnly} />
                <FormCheckbox className='col-md-6' ref={e => this.isRecipient = e} label='Người nhận' readOnly={readOnly} />
                <FormCheckbox className='col-md-6' ref={e => this.isRector = e} label='Ban giám hiệu' readOnly={readOnly} />
                <FormCheckbox className='col-md-6' ref={e => this.isPresident = e} label='Hiệu trưởng' readOnly={readOnly} />
                <FormCheckbox className='col-md-6' ref={e => this.isManager = e} label='Quản lý' readOnly={readOnly} />
                <FormTextBox className='col-md-3' ref={e => this.ma = e} label='Mã' readOnly={readOnly} disabled={this.state.ma} required />
                <FormTextBox className='col-md-9' ref={e => this.ten = e} label='Tên' readOnly={readOnly} required />
                <FormTextBox className='col-md-12' ref={e => this.permissionList = e} label='permission' readOnly={readOnly} />
                <FormSelect className='col-md-12' ref={e => this.shcc = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={readOnly} multiple />
            </div>
        });
    }
}

class HcthDoiTuongKiemDuyet extends AdminPage {
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
    };

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    };

    delete = (e, item) => {
        e.preventDefault();
        //TODO
        T.confirm('Xóa đối tượng', 'Xác nhận xóa đối tượng?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDoiTuong(item.ma));
    };

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('hcthDoiTuongKiemDuyet', ['manage', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.doiTuong && this.props.doiTuong.page ?
            this.props.doiTuong.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };

        let table = renderTable({
            getDataSource: () => list, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>STT</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Mã</th>
                    <th style={{ width: '80%', whiteSpace: 'nowrap' }}>Tên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Đối tượng đơn vị</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={pageSize * (pageNumber - 1) + index + 1} />
                    <TableCell type="link" content={item.ma} onClick={() => this.modal.show(item)} />
                    <TableCell content={item.ten} />
                    <TableCell type='checkbox' content={item.isDepartment} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} ></TableCell>
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-window-restore',
            title: 'Danh mục đối tượng kiểm duyệt',
            breadcrumb: [
                <Link key={0} to='/user/hcth'>Hành chính tổng hợp</Link>,
                'Trạng thái văn bản đi'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.create} update={this.props.update} permissions={currentPermissions} />
            </>,
            backRoute: '/user/hcth',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, doiTuong: state.hcth.hcthDoiTuongKiemDuyet });
const mapActionsToProps = { getPage, create, update, deleteDoiTuong };
export default connect(mapStateToProps, mapActionsToProps)(HcthDoiTuongKiemDuyet);