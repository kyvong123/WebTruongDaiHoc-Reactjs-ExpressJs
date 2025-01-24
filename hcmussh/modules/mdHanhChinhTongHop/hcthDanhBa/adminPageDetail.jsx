import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import Pagination from 'view/component/Pagination';
import SearchCanBoModal from './modal/SearchCanBoModal';
import { deleteHcthDanhBaItem, getHcthDanhBaItemPage, updateHcthDanhBa, getHcthDanhBaItemAll } from './redux';
import {
    AdminModal,
    AdminPage, FormCheckbox,
    FormRichTextBox,
    //  FormSelect,
    FormTextBox,
    renderDataTable,
    TableCell,
    TableHead
} from 'view/component/AdminPage';
// import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';

class EditModal extends AdminModal {
    state = {}

    onShow = (danhBaInfo) => {
        const { isPublic, kichHoat, ten, moTa, ma } = danhBaInfo;
        this.setState({ isPublic, kichHoat, ten, moTa, ma }, () => {
            this.isPublic.value(isPublic || 0);
            this.kichHoat.value(kichHoat || 0);
            this.ten.value(ten || '');
            this.moTa.value(moTa || '');
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
                T.notify('Mã danh bạ không hợp lệ', 'danger');
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
                </div>
            </>
        });
    };
}

class HcthDanhBaDetail extends AdminPage {
    componentDidMount() {
        const route = T.routeMatcher('/user/vpdt/danh-ba/:ma'),
            params = route.parse(window.location.pathname);
        this.setState({ ma: params.ma }, () => {
            this.getPage();
        });
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    };

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getHcthDanhBaItemPage(this.state.ma, pageN, pageS, pageC, this.state.filter, done);
        this.props.getHcthDanhBaItemAll(this.state.ma);
    }

    removeCanBo = (e, maDanhBa, shcc) => {
        e.preventDefault();
        T.confirm('Xóa cán bộ khỏi danh bạ', 'Bạn có chắc bạn muốn xóa cán bộ này ra khỏi danh bạ ?', 'warning', (isConfirm) => {
            isConfirm && this.props.deleteHcthDanhBaItem(maDanhBa, shcc);
        });
    }

    render() {
        const currentUser = this.props.system.user ? this.props.system.user : {};
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list, danhBaInfo, danhBaOwner } = this.props.hcthDanhBa && this.props.hcthDanhBa.itemPage ? this.props.hcthDanhBa.itemPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [], danhBaInfo: {}, danhBaOwner: {} };
        let allDanhBaItems = this.props.hcthDanhBa && this.props.hcthDanhBa.itemAll ? this.props.hcthDanhBa.itemAll : [];
        const devPermission = this.getUserPermission('hcthDanhBa', ['read', 'write', 'delete']);
        let danhBaItemTable = renderDataTable({
            data: list, stickyHead: true,
            divStyle: { height: '68vh' },
            renderHead: () => (
                <tr>
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='STT' />
                    <TableHead style={{ width: '50%', textAlign: 'center' }} content='Họ tên cán bộ' keyCol='canBo' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: '50%', textAlign: 'center' }} content='Tên đơn vị' keyCol='tenDonVi' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Thao tác' />
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }}
                        content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={<>
                        <span>{`${item.hoCanBo} ${item.tenCanBo}`}</span> <br />
                        <span>{`${item.shcc}`}</span>
                    </>} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenDonVi} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }}>
                        {(currentUser.shcc == danhBaOwner.shcc || devPermission.delete) && <Tooltip title='Xóa cán bộ khỏi danh bạ' arrow>
                            <button className='btn btn-secondary' onClick={e => this.removeCanBo(e, danhBaInfo.ma, item.shcc)}>
                                <i className='fa fa-lg fa-user-times' />
                            </button>
                        </Tooltip>}
                    </TableCell>
                </tr>
            )
        });

        return this.renderPage({
            title: 'Danh sách cán bộ thuộc danh bạ',
            backRoute: '/user/vpdt/danh-ba',
            breadcrumb: [
                <Link key={0} to='/user/'>...</Link>,
                <Link key={1} to='/user/van-phong-dien-tu'>Văn phòng điện tử</Link>,
                <Link key={2} to='/user/vpdt/danh-ba'>Danh bạ cán bộ</Link>,
                'Danh sách cán bộ thuộc danh bạ',
            ],
            content: <>
                <div className='tile'>
                    <h3>Danh sách cán bộ thuộc danh bạ <span style={{ color: 'red' }}>{danhBaInfo.ten}</span></h3>
                    <div>Người tạo: <span style={{ color: 'red' }}>{`${danhBaOwner.ho} ${danhBaOwner.ten} (MSCB: ${danhBaOwner.shcc})`}</span></div>
                    <div>Kết quả: {<b>{totalItem}</b>} cán bộ</div>
                    <div className='tile-title-w-btn mt-2'>
                        <div className='title'>
                            {currentUser.shcc == danhBaOwner.shcc && <>
                                <Tooltip title={'Chỉnh sửa thông tin danh bạ'}>
                                    <button type="button" className="btn btn-primary mr-2" onClick={() => this.modal.show(danhBaInfo)}><i className='fa fa-lg fa-edit' /></button>
                                </Tooltip>
                                <Tooltip title='Thêm hoặc xóa cán bộ khỏi danh bạ' arrow>
                                    <button className='btn btn-secondary' onClick={() => this.searchCanBo.show(allDanhBaItems.map(item => item.shcc))}>
                                        <i className='fa fa-lg fa-user-plus' />
                                    </button>
                                </Tooltip>
                            </>}
                        </div>
                        <div className='btn-group'>
                            <Pagination style={{ position: '', marginBottom: '0' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.getPage} pageRange={3} />
                        </div>
                    </div>
                    {danhBaItemTable}
                    <EditModal ref={e => this.modal = e} update={this.props.updateHcthDanhBa} />
                    <SearchCanBoModal title='Thêm hoặc bớt cán bộ khỏi danh bạ' ref={e => this.searchCanBo = e} onSubmit={(value) => this.props.updateHcthDanhBa(this.state.ma, { canBoList: value })} />
                </div>
            </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcthDanhBa: state.hcth.hcthDanhBa });
const mapActionsToProps = { getHcthDanhBaItemPage, deleteHcthDanhBaItem, updateHcthDanhBa, getHcthDanhBaItemAll };
export default connect(mapStateToProps, mapActionsToProps)(HcthDanhBaDetail);