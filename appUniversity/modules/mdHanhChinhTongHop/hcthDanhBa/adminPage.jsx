import React from 'react';
import { connect } from 'react-redux';
import {
    AdminPage,
    TableCell,
    FormCheckbox,
    AdminModal,
    FormTextBox,
    FormRichTextBox,
    TableHead,
    renderDataTable,
    FormTabs,
    FormSelect
} from 'view/component/AdminPage';
import SearchCanBoModal from './modal/SearchCanBoModal';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import {Tooltip} from '@mui/material';
import {
    createHcthDanhBa,
    getHcthDanhBaUserPage,
    updateHcthDanhBa,
    getHcthDanhBaPublicPage,
    deleteHcthDanhBa
} from './redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import T from 'view/js/common.js';


class EditModal extends AdminModal {
    state = {}

    onShow = (item) => {
        const { ma, isPublic, kichHoat, ten, moTa, danhBaItemShccs } = item ? item : { ma: null, isPublic: 0, kichHoat: 0, ten: '', moTa: '', danhBaItemShccs: [] };
        this.setState({ isPublic, kichHoat, ten, moTa, ma }, () => {
            this.isPublic.value(isPublic || 0);
            this.kichHoat.value(kichHoat || 0);
            this.ten.value(ten || '');
            this.moTa.value(moTa || '');
            if (!ma) {
                this.mulCanBo.value(danhBaItemShccs || []);
            }
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        const isPublic = this.isPublic.value();
        const kichHoat = this.kichHoat.value();
        const ten = this.ten.value();
        const moTa = this.moTa.value();

        if (ten == '') {
            this.ten.focus();
            T.notify('Không được để trống tên', 'danger');
        } else {
            if (this.state.ma) {
                this.props.update(this.state.ma, { ten, moTa, isPublic, kichHoat });
            } else {
                let canBoList = this.mulCanBo.value();
                this.props.create({ ten, moTa, isPublic, kichHoat, canBoList });
            }
            this.hide();
        }
    };

    changeKichHoat = (value) => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);
    changeIsPublic = (value) => this.isPublic.value(value ? 1 : 0) || this.isPublic.value(value);

    render = () => {
        return this.renderModal({
            title: this.state.ma ? 'Chỉnh sửa thông tin danh bạ' : 'Tạo danh bạ mới',
            size: 'elarge',
            body: <>
                <div className='row'>
                    <FormTextBox className='col-12' ref={(e) => (this.ten = e)} label='Tên danh bạ' required placeholder='Nhập tên danh bạ' />
                    <FormRichTextBox className='col-12' ref={(e) => (this.moTa = e)} label='Mô tả' />
                    <FormCheckbox className='col-6' ref={(e) => (this.kichHoat = e)} label='Kích hoạt' required isSwitch={true} onChange={(value) => this.changeKichHoat(value ? 1 : 0)} />
                    <FormCheckbox className='col-6' ref={(e) => (this.isPublic = e)} label='Công khai' required isSwitch={true} onChange={(value) => this.changeIsPublic(value ? 1 : 0)} />
                    {!this.state.ma && <FormSelect className='col-12' multiple={true} ref={e => this.mulCanBo = e} label='Danh sách cán bộ' data={SelectAdapter_FwCanBo} allowClear={true} minimumResultsForSearch={-1} />}
                </div>
            </>
        });
    };
}

class HcthDanhBa extends AdminPage {
    state = {
        currentEditDanhBa: null
    };

    componentDidMount() {
        T.ready('/user/vpdt/danh-ba', () => {
            this.getUserPage();
            this.getPublicPage();
        });
    }

    handleKeySearchUser = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getUserPage(pageNumber, pageSize, pageCondition);
        });
    };

    handleKeySearchPublic = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ publicFilter: { ...this.state.publicFilter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPublicPage(pageNumber, pageSize, pageCondition);
        });
    };


    getUserPage = (pageN, pageS, pageC, done) => {
        this.props.getHcthDanhBaUserPage(pageN, pageS, pageC, this.state.filter, done);
    }

    getPublicPage = (pageN, pageS, pageC, done) => {
        this.props.getHcthDanhBaPublicPage(pageN, pageS, pageC, this.state.publicFilter, done);
    }

    delete = (e, ma) => {
        e.preventDefault();
        T.confirm('Xóa danh bạ', 'Bạn có chắc bạn muốn xóa danh bạ này?', 'warning', true, (isConfirm) => {
            isConfirm && this.props.deleteHcthDanhBa(ma, (error) => {
                if (error) {
                    T.notify(error.message ? error.message : 'Xóa danh bạ thành công!', 'danger');
                } else {
                    T.alert('Xóa danh bạ thành công!', 'success', false, 800);
                }
            });
        });
    }

    render() {
        const currentUser = this.props.system.user ? this.props.system.user : {};
        const permission = this.getUserPermission('staff', ['login']);
        const devPermission = this.getUserPermission('hcthDanhBa', ['read', 'write', 'delete']);

        let { pageNumber: userPageNumber, pageSize: userPageSize, pageTotal: userPageTotal, totalItem: userTotalItem, pageCondition: userPageCondition, list: userList } = this.props.hcthDanhBa && this.props.hcthDanhBa.userPage ? this.props.hcthDanhBa.userPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let { pageNumber: publicPageNumber, pageSize: publicPageSize, pageTotal: publicPageTotal, totalItem: publicTotalItem, pageCondition: publicPageCondition, list: publicList } = this.props.hcthDanhBa && this.props.hcthDanhBa.publicPage ? this.props.hcthDanhBa.publicPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };

        let myDanhBaTable = renderDataTable({
            data: userList, stickyHead: true,
            divStyle: { height: '68vh' },
            className: this.state.isFixCol ? 'table-fix-col' : '',
            renderHead: () => (
                <tr>
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='STT' />
                    <TableHead style={{ width: '30%', textAlign: 'center' }} content='Tên danh bạ' keyCol='tenUserDanhBa' onKeySearch={this.handleKeySearchUser} />
                    <TableHead style={{ width: '70%', textAlign: 'center' }} content='Mô tả' keyCol='moTaDanhBa' onKeySearch={this.handleKeySearchUser}/>
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Kích hoạt' keyCol='kichHoat'/>
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Công khai' keyCol='isPublic'/>
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Thao tác' />
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }}
                        content={(userPageNumber - 1) * userPageSize + index + 1} />
                    <TableCell type='link' url={`/user/vpdt/danh-ba/${item.ma}`} style={{ whiteSpace: 'nowrap' }} content={item.ten} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.moTa} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission.login ? { write: true } : {}}
                        onChanged={(value) => T.confirm('Cập nhật danh bạ', 'Bạn có chắc bạn muốn cập nhật danh bạ này?', 'warning', true, (isConfirm) => {
                            isConfirm && this.props.updateHcthDanhBa(item.ma, { kichHoat: value ? 1 : 0 });
                        })} />
                    <TableCell type='checkbox' content={item.isPublic} permission={permission.login ? { write: true } : {}}
                        onChanged={(value) => T.confirm('Cập nhật danh bạ', 'Bạn có chắc bạn muốn cập nhật danh bạ này?', 'warning', true, (isConfirm) => {
                            isConfirm && this.props.updateHcthDanhBa(item.ma, { isPublic: value ? 1 : 0 });
                        })} />
                    <TableCell permission={permission.login ? { write: true, delete: true } : {}} type='buttons' style={{ textAlign: 'center' }} content={item}
                        onEdit={() => permission.login || devPermission.write ? this.modal.show(item) : T.notify('Vui lòng đăng nhập tài khoản cán bộ', 'warning')}
                        onDelete={(e) => permission.login || devPermission.delete ? this.delete(e, item.ma) : T.notify('Vui lòng đăng nhập tài khoản cán bộ', 'warning')}
                    >
                        {<Tooltip title='Thêm hoặc xóa cán bộ khỏi danh bạ' arrow>
                            <button className='btn btn-secondary' onClick={() => {
                                this.setState({ currentEditDanhBa: item.ma }, () => this.searchCanBo.show(item.danhBaItemShccs));
                            }}>
                                <i className='fa fa-lg fa-user-plus' />
                            </button>
                        </Tooltip>}
                    </TableCell>
                </tr>
            )
        });
        const myDanhBaPage = <div className='tile'>
            <h3>Danh bạ của tôi</h3>
            <div style={{ marginBottom: '10px' }}>Kết quả: {<b>{userTotalItem}</b>} danh bạ</div>
            <div className='tile-title-w-btn' style={{ marginBottom: '5' }}>
                <div className='title'>
                    <FormCheckbox label='Thao tác nhanh' onChange={(value) => this.setState({ isFixCol: value })} style={{ marginBottom: 0 }} />
                </div>
                <div className='btn-group'>
                    <Pagination style={{ position: '', marginBottom: '0' }} pageNumber={userPageNumber} pageSize={userPageSize} pageTotal={userPageTotal} totalItem={userTotalItem} pageCondition={userPageCondition} getPage={this.getUserPage} />
                </div>
            </div>
            {myDanhBaTable}
        </div>;


        const publicDanhBaTable = renderDataTable({
            data: publicList, stickyHead: true,
            divStyle: { height: '68vh' },
            className: this.state.isFixPublicCol ? 'table-fix-col' : '',
            renderHead: () => (
                <tr>
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='STT' />
                    <TableHead style={{ width: '30%', textAlign: 'center' }} content='Tên danh bạ' keyCol='tenPublicDanhBa' onKeySearch={this.handleKeySearchPublic} />
                    <TableHead style={{ width: '20%', textAlign: 'center' }} content='Người tạo' keyCol='owner' onKeySearch={this.handleKeySearchPublic} />
                    <TableHead style={{ width: '50%', textAlign: 'center' }} content='Mô tả' keyCol='moTaDanhBa' onKeySearch={this.handleKeySearchPublic} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Thao tác' />
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={(publicPageNumber - 1) * publicPageSize + index + 1} />
                    <TableCell type='link' url={`/user/vpdt/danh-ba/${item.ma}`} style={{ whiteSpace: 'nowrap' }} content={item.ten} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={<>
                        <span>{`${item.hoCanBo} ${item.tenCanBo}`}</span> <br />
                        <span>{`${item.shcc}`}</span>
                    </>} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.moTa} />
                    <TableCell permission={(permission.login && currentUser.shcc == item.shcc || devPermission.write) ? { write: true, delete: true } : {}} type='buttons' style={{ textAlign: 'center' }} content={item}
                        onEdit={() => (permission.login && currentUser.shcc == item.shcc) || devPermission.write ? this.modal.show(item) : T.notify('Bạn không được phép chỉnh sửa danh bạ của người khác', 'warning')}
                        onDelete={(e) => (permission.login && currentUser.shcc == item.shcc) || devPermission.delete ? this.delete(e, item.ma) : T.notify('Vui lòng đăng nhập tài khoản cán bộ', 'warning')}
                    >
                        {(permission.login && currentUser.shcc == item.shcc || devPermission.write) && <Tooltip title='Thêm hoặc xóa cán bộ khỏi danh bạ' arrow>
                            <button className='btn btn-secondary' onClick={() => {
                                this.setState({ currentEditDanhBa: item.ma }, () => this.searchCanBo.show(item.danhBaItemShccs));
                            }}>
                                <i className='fa fa-lg fa-user-plus' />
                            </button>
                        </Tooltip>}
                    </TableCell>
                </tr>
            )
        });
        const publicDanhBaPage = <div className='tile'>
            <h3>Danh bạ công khai</h3>
            <div style={{ marginBottom: '10px' }}>Kết quả: {<b>{publicTotalItem}</b>} danh bạ</div>
            <div className='tile-title-w-btn' style={{ marginBottom: '5' }}>
                <div className='title'>
                    <FormCheckbox label='Thao tác nhanh' onChange={(value) => this.setState({ isFixPublicCol: value })} style={{ marginBottom: 0 }} />
                </div>
                <div className='btn-group'>
                    <Pagination style={{ position: '', marginBottom: '0' }} pageNumber={publicPageNumber} pageSize={publicPageSize} pageTotal={publicPageTotal} totalItem={publicTotalItem} pageCondition={publicPageCondition} getPage={this.getPublicPage} pageRange={3} />
                </div>
            </div>
            {publicDanhBaTable}
        </div>;

        return this.renderPage({
            icon: 'fa fa-envelope-o',
            title: 'Danh bạ cán bộ',
            className: this.state.isFixPublicCol ? 'table-fix-col' : '',
            breadcrumb: [
                <Link key={0} to='/user/'>...</Link>,
                <Link key={1} to='/user/van-phong-dien-tu'>Văn phòng điện tử</Link>,
                'Danh bạ cán bộ',
            ],
            backRoute: '/user/van-phong-dien-tu',
            onCreate: () => permission.login || devPermission.write ? this.modal.show() : T.notify('Hệ thống ghi nhận bạn chưa đăng nhập tài khoản cán bộ', 'danger'),
            content: <>
                <FormTabs
                    tabs={[
                        { title: 'Danh bạ của tôi', component: myDanhBaPage },
                        { title: 'Danh bạ công khai', component: publicDanhBaPage }
                    ]}
                />
                <EditModal ref={e => this.modal = e} create={this.props.createHcthDanhBa} update={this.props.updateHcthDanhBa} />
                <SearchCanBoModal title='Thêm hoặc bớt cán bộ khỏi danh bạ' ref={e => this.searchCanBo = e} onSubmit={(value) => this.props.updateHcthDanhBa(this.state.currentEditDanhBa, {canBoList: value})}/>
            </>,
        });
    }
}

const mapActionsToProps = { getHcthDanhBaUserPage, createHcthDanhBa, getHcthDanhBaPublicPage, updateHcthDanhBa, deleteHcthDanhBa };
const mapStateToProps = state => ({ system: state.system, hcthDanhBa: state.hcth.hcthDanhBa });
export default connect(mapStateToProps, mapActionsToProps)(HcthDanhBa);