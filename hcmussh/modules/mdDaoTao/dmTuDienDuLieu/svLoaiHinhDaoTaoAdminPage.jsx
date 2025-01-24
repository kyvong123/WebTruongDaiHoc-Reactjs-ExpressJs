import React from 'react';
import { connect } from 'react-redux';
import { getDmSvLoaiHinhDaoTaoPage, deleteDmSvLoaiHinhDaoTao, createDmSvLoaiHinhDaoTao, updateDmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormCheckbox, FormTextBox, getValue, FormTabs } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import NganhHeModal from './NganhHeModal';
import { Tooltip } from '@mui/material';

class EditModal extends AdminModal {
    componentDidMount() {
        this.onShown(() => {
            !this.maLoaiHinh.value() ? this.maLoaiHinh.focus() : this.ten.focus();
        });
    }

    onShow = (item) => {
        let { ma, ten, maLop, kichHoat, tenTiengAnh } = item ? item : { ma: '', ten: '', maLop: '', kichHoat: true, tenTiengAnh: '', };

        this.setState({ ma, item });
        this.maLoaiHinh.value(ma);
        this.ten.value(ten);
        this.maLop.value(maLop);
        this.kichHoat.value(kichHoat);
        this.tenTiengAnh.value(tenTiengAnh || '');
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: getValue(this.maLoaiHinh),
            ten: getValue(this.ten),
            maLop: getValue(this.maLop),
            kichHoat: Number(getValue(this.kichHoat)),
            tenTiengAnh: getValue(this.tenTiengAnh),
        };

        this.state.item ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);

    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật loại hình đào tạo' : 'Tạo mới loại hình đào tạo',
            body: <div className='row'>
                <FormTextBox className='col-12' ref={e => this.maLoaiHinh = e} label='Mã' readOnly={this.state.ma ? true : readOnly} placeholder='Mã' required />
                <FormTabs className='col-12' tabs={[
                    { title: 'Tên', component: <FormTextBox ref={e => this.ten = e} readOnly={readOnly} placeholder='Tên' required /> },
                    { title: 'Tên tiếng anh', component: <FormTextBox ref={e => this.tenTiengAnh = e} readOnly={readOnly} placeholder='Tên' required /> },
                ]} />
                <FormTextBox className='col-12' ref={e => this.maLop = e} label='Mã lớp' readOnly={readOnly} type='number' required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex' }}
                    onChange={value => this.changeKichHoat(value)} required />
            </div>
        });
    }
}

class DmSvLoaiHinhDaoTaoPage extends AdminPage {
    componentDidMount() {
        let route = T.routeMatcher('/user/:menu/he-dao-tao').parse(window.location.pathname);
        this.menu = route.menu == 'dao-tao' ? 'dao-tao' : 'category';
        T.ready(`/user/${this.menu}`);
        T.onSearch = (searchText) => this.props.getDmSvLoaiHinhDaoTaoPage(undefined, undefined, searchText || '');
        T.showSearchBox();
        this.props.getDmSvLoaiHinhDaoTaoPage();
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa loại hình đào tạo', `Bạn có chắc bạn muốn xóa loại hình đào tạo ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDmSvLoaiHinhDaoTao(item.ma);
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmSvLoaiHinhDaoTao', ['read', 'write', 'delete']);

        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmSvLoaiHinhDaoTao && this.props.dmSvLoaiHinhDaoTao.page ?
            this.props.dmSvLoaiHinhDaoTao.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        const table = !(list && list.length > 0) ? 'Không có dữ liệu loại hình đào tạo' :
            renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>#</th>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '50%' }}>Tên</th>
                        <th style={{ width: '50%' }}>Tên tiếng anh</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã lớp</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' content={item.ma} onClick={() => this.modal.show(item)} />
                        <TableCell content={item.ten} />
                        <TableCell content={item.tenTiengAnh} />
                        <TableCell content={item.maLop} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmSvLoaiHinhDaoTao(item.ma, { kichHoat: Number(value) })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} >
                            <Tooltip title='Cập nhật ngành' arrow>
                                <button className='btn btn-info' onClick={e => e.preventDefault() || this.nganhHe.show(item)}>
                                    <i className='fa fa-lg fa-repeat' />
                                </button>
                            </Tooltip>
                        </TableCell>
                    </tr>
                ),
            });


        return this.renderPage({
            icon: this.menu == 'dao-tao' ? 'fa fa-tasks' : 'fa fa-list-alt',
            title: 'Hệ đào tạo',
            breadcrumb: [
                <Link key={0} to={`/user/${this.menu}`}>{this.menu == 'dao-tao' ? 'Đào tạo' : 'Danh mục'}</Link>,
                <Link key={1} to='/user/dao-tao/data-dictionary'>Từ điển dữ liệu</Link>,
                'Hệ đào tạo'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <NganhHeModal ref={e => this.nganhHe = e} />
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDmSvLoaiHinhDaoTaoPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmSvLoaiHinhDaoTao} update={this.props.updateDmSvLoaiHinhDaoTao} permissions={currentPermissions} />
            </>,
            backRoute: this.menu == 'dao-tao' ? '/user/dao-tao/data-dictionary' : '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmSvLoaiHinhDaoTao: state.danhMuc.dmSvLoaiHinhDaoTao });
const mapActionsToProps = { getDmSvLoaiHinhDaoTaoPage, deleteDmSvLoaiHinhDaoTao, createDmSvLoaiHinhDaoTao, updateDmSvLoaiHinhDaoTao };
export default connect(mapStateToProps, mapActionsToProps)(DmSvLoaiHinhDaoTaoPage);