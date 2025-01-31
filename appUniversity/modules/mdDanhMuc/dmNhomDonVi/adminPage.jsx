import React from 'react';
import { connect } from 'react-redux';
import { getDmNhomDonViPage, createDmNhomDonVi, updateDmNhomDonVi, deleteDmNhomDonVi, deleteDmNhomDonViItem, updateDmNhomDonViKichHoat } from './redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox, FormSelect } from 'view/component/AdminPage';
import { SelectAdapter_DmDonVi } from '../dmDonVi/redux';

class EditModal extends AdminModal {

    onShow = (item) => {
        let { id, ten, donVi, kichHoat } = item ? item : { id: '', ten: '', kichHoat: 1, donVi: null };
        this.setState({ id, ten, donVi, kichHoat }, () => {
            this.ten.value(ten);
            if (donVi) {
                donVi = T.parse(donVi);
            } else
                donVi = [];
            this.donVi.value(donVi.map(item => item.ma));
            this.kichHoat.value(kichHoat);
        });
    };

    onSubmit = () => {
        const changes = {
            ten: this.ten.value(),
            kichHoat: Number(this.kichHoat.value()),
            donVi: this.donVi.value(),
        };
        if (!changes.ten) {
            T.notify('Tên không được trống!', 'danger');
            this.moTa.focus();
        } else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
    };


    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật kinh phí trong nước' : 'Tạo mới kinh phí trong nước',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên' readOnly={readOnly} required />
                <FormSelect closeOnSelect={false} multiple data={SelectAdapter_DmDonVi} className='col-md-12' ref={e => this.donVi = e} label='Danh sách đơn vị' readOnly={readOnly} />
                <FormCheckbox className='col-md-12' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }} />

            </div>
        }
        );
    }
}

class DmNhomDonVi extends AdminPage {
    state = { searching: false, visible: false, visibleList: [] };

    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmNhomDonViPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmNhomDonViPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa nhóm đơn vị', `Bạn có chắc bạn muốn xóa nhóm đơn vị <b>${item.ten}</b> này?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDmNhomDonVi(item.id);
        });
    }

    deleteItem = (e, item, donViItem) => {
        e.preventDefault();
        T.confirm('Xóa nhóm đơn vị', `Bạn có chắc bạn muốn xóa đơn vị <b>${donViItem.ten}</b> khỏi <b>${item.ten}</b>?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDmNhomDonViItem(item.id, donViItem.ma);
        });
    }

    onChangeVisible = (value) => {
        if (value) {
            this.setState({ visible: value });
        } else {
            this.setState({ visible: value, visibleList: [] });
        }
    }

    show = (item) => {
        this.setState({
            visibleList: [...this.state.visibleList, item.id]
        });
    }

    hide = (item) => {
        this.setState({
            visibleList: this.state.visibleList.filter(i => i != item.id)
        });
    }

    render() {
        const currentPermissions = this.getCurrentPermissions(), permission = this.getUserPermission('dmNhomDonVi');
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmNhomDonVi && this.props.dmNhomDonVi.page ?
            this.props.dmNhomDonVi.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: null };

        const table = renderTable({
            hover: false,
            emptyTable: 'Chưa có dữ liệu nhóm đơn vị',
            loadingClassName: 'd-flex justify-content-center align-items-center',
            loadingOverlay: false,
            getDataSource: () => list, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }} colSpan={2}>Tên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }} colSpan={1} > Kích hoạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => {
                const isVisible = this.state.visible || this.state.visibleList.includes(item.id);
                const donVi = T.parse(item.donVi, []) || [];
                return <React.Fragment key={index}>
                    <tr >
                        <TableCell type='number' content={item.R} style={{ textAlign: 'right' }} rowSpan={1 + (isVisible ? donVi.length : 0)} />
                        <TableCell type='link' content={item.ten} onClick={() => this.modal.show(item)} colSpan={2} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission} colSpan={1}
                            onChanged={value => this.props.updateDmNhomDonViKichHoat(item.id, Number(value))} rowSpan={1 + (isVisible ? donVi.length : 0)} />
                        <TableCell type='buttons' permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={() => this.delete(item)} rowSpan={1 + (isVisible ? donVi.length : 0)} >
                            {!this.state.visible && <>
                                {!isVisible ? <button className="btn btn-warning" onClick={() => this.show(item)}><i className='fa fa-large fa-eye' /></button>
                                    : <button className="btn btn-warning" onClick={() => this.hide(item)}><i className='fa fa-large fa-eye-slash' /></button>
                                }
                            </>}
                        </TableCell>
                    </tr>
                    {donVi && donVi.length > 0 && isVisible && donVi.map((donViItem, i) => {
                        return <tr key={i}>
                            <TableCell style={{ borderRight: 0 }} colSpan={1} />
                            <TableCell content={<div className='d-flex justify-content-between align-items-center'>
                                <span>
                                    {`${item.R}. ${i + 1} ${donViItem.ten}`}
                                </span>
                                <button className="btn btn-danger" onClick={(e) => this.deleteItem(e, item, donViItem)}><i className='fa fa-large fa-times' /></button>
                            </div>} colSpan={1} style={{ borderLeft: 0 }} />
                        </tr>;
                    })}
                </React.Fragment>;
            },
        });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Nhóm đơn vị',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Nhóm đơn vị'
            ],
            content: <>
                <div className='tile'>
                    <div className="tile-header d-flex justify-content-end"><FormCheckbox label='Mở rộng tất cả' onChange={this.onChangeVisible} /></div>
                    <div className='tile-body'>
                        {table}
                    </div>
                </div>
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getDmNhomDonViPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmNhomDonVi} update={this.props.updateDmNhomDonVi} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmNhomDonVi: state.danhMuc.dmNhomDonVi });
const mapActionsToProps = { getDmNhomDonViPage, createDmNhomDonVi, updateDmNhomDonVi, deleteDmNhomDonVi, deleteDmNhomDonViItem, updateDmNhomDonViKichHoat };
export default connect(mapStateToProps, mapActionsToProps)(DmNhomDonVi);