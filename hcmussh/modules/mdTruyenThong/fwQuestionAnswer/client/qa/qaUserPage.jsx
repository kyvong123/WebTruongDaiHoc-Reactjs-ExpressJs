import React from 'react';
import { connect } from 'react-redux';
import { getFwQuestionAnswerUserPage, createUserFwQuestionAnswer, cancelFwQuestionAnswer } from '../../redux/qa/qaUserRedux';
import { getDmChuDeFormSelect } from '../../redux/qa/redux';
import { clearUnsaveImagesFwQAMessage } from '../../redux/chatbox/chatDetailRedux';
import { AdminModal, AdminPage, FormSelect, renderDataTable, TableHead, TableCell, FormRichTextBoxV2 } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import Pagination from '../../../../../view/component/Pagination';

class CreateQAModal extends AdminModal {
    state = {
        maDonVi: null,
        chuDeList: []
    };

    onSubmit = () => {
        const dmChuDe = this.loaiDmChuDe.value();
        // const chuDe = this.chuDe.value();
        const noiDung = this.noiDung.value();

        if (dmChuDe == null) {
            T.notify('Loại chủ đề bị trống!', 'danger');
        }
        // else if (chuDe.length == 0) {
        //     T.notify('Tên chủ đề bị trống!', 'danger');
        // } 
        else if (noiDung.length == 0) {
            T.notify('Nội dung bị trống!', 'danger');
        } else {
            this.props.create({ dmChuDe, chuDe: '', noiDung }, () => {
                this.loaiDmChuDe.value('');
                // this.chuDe.value('');
                this.noiDung.value('');
                // this.imageMultiBox.clear();
            });
        }
    }

    clearImage = () => {
        // this.props.clearUnsaveImage();
    }

    resetChuDeFormSelect = (value) => {
        this.loaiDmChuDe.value('');
        this.setState({
            maDonVi: value.id,
            chuDeList: (this.props.dmChuDeFormSelect.filter((item) => item.maDonVi == value.id)).map(item => ({ id: item.id, text: item.ten }))
        });
    }

    render = () => {
        return this.renderModal({
            title: 'Gửi Chủ Đề Liên Hệ - Hỏi Đáp',
            size: 'elarge',
            body: <div className='row'>
                <FormSelect ref={e => this.maDonVi = e} required={true} data={this.props.dmDonViChuDeFormSelect} label='Đơn vị liên hệ' className='col-12' onChange={(value) => this.resetChuDeFormSelect(value)} />
                <FormSelect key={this.state.maDonVi} ref={e => this.loaiDmChuDe = e} required={true} data={[...this.state.chuDeList]} label='Loại chủ đề' className='col-12' />
                {/* <FormTextBox maxLength={160} ref={e => this.chuDe = e} type='text' className='col-12' required={true} label={'Chủ đề liên hệ - Hỏi đáp'} /> */}
                <FormRichTextBoxV2 maxLen={1600} rows={10} ref={e => this.noiDung = e} type='text' className='col-12' required={true} label={'Nội dung liên hệ - Hỏi đáp'} />
                {/* <FormImageMultiBox className='col-12' ref={e => this.imageMultiBox = e} label='Tải hình đính kèm tại đây' postUrl='/user/upload?category=ttLienHeUploadFile' uploadType='ttLienHeUploadFile' userData='ttLienHeUploadFile' maxImgNum={4} /> */}
            </div>
        });
    }
}

class FwQuestionAnswerUserPage extends AdminPage {
    state = { filter: {} };
    componentDidMount() {
        T.ready('/user/tt/lien-he/home', () => {
            // T.onSearch = (searchText) => {};
            // T.showSearchBox();
            T.socket.on('fwQaRefreshUser', () => { this.getPage(); });
            window.addEventListener('beforeunload', this.componentCleanup);
            this.getPage();
        });
    }

    componentCleanup = () => {
        // this.createModal.clearImage();
    }

    componentWillUnmount() {
        T.socket.off('fwQaRefreshUser');
        this.createModal.clearImage();
        window.removeEventListener('beforeunload', this.componentCleanup);
        super.componentWillUnmount();
    }

    showModal = (e) => {
        e.preventDefault();
        this.createModal.show();
    }
    getPage = (pageN, pageS, pageC, done) => {
        this.props.getFwQuestionAnswerUserPage(pageN, pageS, pageC, this.state.filter, done);
        this.props.getDmChuDeFormSelect();
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    cancel = (e, item) => {
        e.preventDefault();
        T.confirm('Hủy hộp thư', `Bạn có chắc bạn muốn hủy hộp thư ${item.noiDung ? `<b> ${item.noiDung}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.cancelFwQuestionAnswer(item.id);
        });
    }

    render() {
        const STATUS_MAPPER = {
            0: <span className='text-danger'><i className='fa fa-ban' /> Đã đóng</span>,
            1: <span className='text-warning'><i className='fa fa-exclamation-circle' /> Đang chờ</span>,
            2: <span className='text-success'><i className='fa fa-check-circle' /> Đã nhận</span>,
            3: <span className='text-danger'><i className='fa fa-ban' /> Đã hủy</span>,
        };

        const userPermission = this.getUserPermission('user', ['login']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.fwQaUser && this.props.fwQaUser.userPage ?
            this.props.fwQaUser.userPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        const dmChuDeFormSelect = this.props.fwQuestionAnswer && this.props.fwQuestionAnswer.dmChuDeFormSelect;
        const dmDonViChuDeFormSelect = this.props.fwQuestionAnswer && this.props.fwQuestionAnswer.dmDonViChuDeFormSelect;

        const table = renderDataTable({
            data: list,
            stickyHead: false,
            renderHead: () => (
                <tr>
                    <TableHead ref={e => this.ks_tenDonVi = e} style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Đơn vị phụ trách' onKeySearch={(ks) => this.handleKeySearch(ks)} keyCol='tenDonVi' />
                    <TableHead ref={e => this.ks_canBoPhuTrach = e} style={{ width: '200px', whiteSpace: 'nowrap' }} content='Cán bộ phụ trách' onKeySearch={(ks) => this.handleKeySearch(ks)} keyCol='canBoPhuTrach' />
                    <TableHead ref={e => this.ks_tenChuDe = e} style={{ width: '100px', whiteSpace: 'nowrap' }} content='Chủ đề' onKeySearch={(ks) => this.handleKeySearch(ks)} keyCol='tenChuDe' />
                    <TableHead ref={e => this.ks_noiDung = e} style={{ width: '400px', whiteSpace: 'nowrap' }} content='Nội dung' onKeySearch={(ks) => this.handleKeySearch(ks)} keyCol='noiDung' />
                    <th style={{ width: '150px', whiteSpace: 'nowrap' }}>Ngày tạo</th>
                    <th style={{ width: '150px', whiteSpace: 'nowrap' }}>Ngày đóng</th>
                    <th style={{ width: '150px', whiteSpace: 'nowrap' }}>Ngày phản hồi</th>
                    <th style={{ width: '200px', whiteSpace: 'nowrap' }}>Trạng thái</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={item.tenDonVi ? item.tenDonVi : ''} />
                    <TableCell type='text' content={item.maNguoiPhuTrach == null ? 'Chưa có cán bộ phụ trách' : <>
                        <span>{item.hoNguoiPhuTrach + ' ' + item.tenNguoiPhuTrach}</span><br />
                        <span>{item.maNguoiPhuTrach}</span>
                    </>
                    } />
                    <TableCell type='text' content={item.tenChuDe ? item.tenChuDe : ''} />
                    <TableCell type='text' content={item.noiDung ? <Link to={`/user/tt/lien-he/box-detail/${item.id}`}>{item.noiDung}</Link> : ''} />
                    <TableCell type='text' content={item.createdAt ? T.convertDate(item.createdAt) : 'Chưa có'} />
                    <TableCell type='text' content={item.closedAt ? T.convertDate(item.closedAt) : 'Chưa có'} />
                    <TableCell type='text' content={item.responsedAt ? T.convertDate(item.responsedAt) : 'Chưa có'} />
                    <TableCell type='text' content={item.isActive == 0 ? STATUS_MAPPER[0] : item.isAssigned == 1 ? STATUS_MAPPER[2] : item.isCancelled == 0 ? STATUS_MAPPER[1] : STATUS_MAPPER[3]} />
                    <TableCell type='buttons'>
                        {
                            <>
                                <Tooltip title='Mở hộp thư này' arrow>
                                    <button className='btn btn-secondary' onClick={() => {
                                        this.props.history.push(`/user/tt/lien-he/box-detail/${item.id}`);
                                    }}>
                                        <i className='fa-lg fa fa-envelope-open-o' />
                                    </button>
                                </Tooltip>
                                {item.isAssigned == 0 && item.isActive == 1 && item.isCancelled == 0 && <Tooltip title="Hủy hộp thư này?" arrow>
                                    <button className="btn btn-danger" onClick={(e) => this.cancel(e, item)}>
                                        <i className="fa-lg fa fa-times" />
                                    </button>
                                </Tooltip>}
                            </>
                        }
                    </TableCell>
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa fa-graduation-cap',
            title: 'Liên hệ - Hỏi đáp',
            breadcrumb: [
                < Link key={0} to='/user' >Cá nhân</Link >,
                'Liên hệ - Hỏi đáp'
            ],
            backRoute: '/user',
            content: <div className='tile'>
                <div className='tile-title-w-btn' style={{ marginBottom: '5' }}>
                    <div className='btn-group'>
                        <Pagination style={{ position: '', marginBottom: '0' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition} getPage={this.getPage} pageRange={3} />
                    </div>
                </div>
                <div>{table}</div>
                <CreateQAModal dmChuDeFormSelect={dmChuDeFormSelect} dmDonViChuDeFormSelect={dmDonViChuDeFormSelect} ref={(e) => this.createModal = e} create={this.props.createUserFwQuestionAnswer} clearUnsaveImage={this.props.clearUnsaveImagesFwQAMessage} />
            </div>,
            onCreate: userPermission && userPermission.login ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, fwQaUser: state.lienHe.fwQaUser, fwQuestionAnswer: state.lienHe.fwQuestionAnswer });
const mapActionsToProps = { getFwQuestionAnswerUserPage, createUserFwQuestionAnswer, cancelFwQuestionAnswer, clearUnsaveImagesFwQAMessage, getDmChuDeFormSelect };
export default connect(mapStateToProps, mapActionsToProps)(FwQuestionAnswerUserPage);