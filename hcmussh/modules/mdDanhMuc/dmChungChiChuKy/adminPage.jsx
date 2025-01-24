import React from 'react';
import { connect } from 'react-redux';
import { getDmChungChiPage, updateDmChungChi, createDmChungChi, deleteDmChungChi } from './redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import FileBox from 'view/component/FileBox';


export class EditModal extends AdminModal {
    onShow = (item) => {
        const { id, ten, kichHoat } = item ? item : { id: null, ten: '', kichHoat: 1 };
        this.setState({ id, item }, () => {
            this.ten.value(ten);
            this.kichHoat.value(kichHoat);
            this.fileBox.setData('dmChungChiChuKyFile', this.state.id ? false : true);
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        const data = {
            ten: this.ten.value(),
            kichHoat: this.kichHoat.value(),
        };
        if (!data.ten) {
            T.notify('Tên chứng chỉ bị trống', 'danger');
            this.ten.focus();
        } else {
            if (this.state.id && !this.fileBox.getFile()) {
                this.props.update(this.state.id, data, this.hide);
            } else {
                this.fileBox.onUploadFile({ id: this.state.id });
            }
        }
    }

    changeKichHoat = value => this.kichHoat.value(value);

    onSuccess = (data) => {
        try {
            if (data.error) {
                return T.notify('Tải lên tập tin thất bại', 'danger');
            }
            const changes = {
                ten: this.ten.value(),
                kichHoat: this.kichHoat.value(),
                tenFile: data.originalFilename,
                isCrl: data.isCrl
            };

            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);

        } catch (error) {
            console.error(error);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật chứng chỉ' : 'Tạo mới chứng chỉ',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên chứng chỉ' required readOnly={readOnly} />
                <FormCheckbox className='col-md-12' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} style={{ display: 'inline-flex', margin: 0 }} onChange={value => this.changeKichHoat(value ? 1 : 0)} readOnly={readOnly}
                />
                <FileBox ref={e => this.fileBox = e} className='col-md-12' postUrl='/user/upload' uploadType='dmChungChiChuKyFile' userData='dmChungChiChuKyFile' pending={true} success={this.onSuccess} />
            </div>
        });
    }
}

class DmChungChiChuKyPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/category', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.props.getDmChungChiPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmChungChiPage();
        });
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xoá chứng chỉ', 'Bạn có chắc chắn muốn xoá chứng chỉ này không', true, isConfirm => isConfirm && this.props.deleteDmChungChi(item.id));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmChungChiChuKy', ['read', 'write']);

        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmChungChiChuKy && this.props.dmChungChiChuKy.page ? this.props.dmChungChiChuKy.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };

        let table = renderTable({
            emptyTable: 'Chưa có dữ liệu',
            getDataSource: () => list,
            stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Tên chứng chỉ chữ ký</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'center' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='text' content={item.ten || ''} />
                    <TableCell type='checkbox' style={{ textAlign: 'center' }} content={item.kichHoat} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={{ ...permission, delete: permission.write && currentPermissions.includes('manager:write') }} onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục chứng chỉ chữ ký',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục chứng chỉ chữ ký'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getDmChungChiPage} />
                <EditModal ref={e => this.modal = e} permission={permission} permissions={currentPermissions} update={this.props.updateDmChungChi} create={this.props.createDmChungChi} readOnly={!currentPermissions.includes('dmChungChiChuKy:write')} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => {
                e.preventDefault();
                this.modal.show(null);
            } : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmChungChiChuKy: state.danhMuc.dmChungChiChuKy });
const mapActionsToProps = { getDmChungChiPage, updateDmChungChi, createDmChungChi, deleteDmChungChi };
export default connect(mapStateToProps, mapActionsToProps)(DmChungChiChuKyPage);