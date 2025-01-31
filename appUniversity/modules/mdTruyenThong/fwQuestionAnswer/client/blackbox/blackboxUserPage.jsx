import React from 'react';
import { connect } from 'react-redux';
import { getDmChuDeFormSelect, updateDmChuDeDonVi } from '../../redux/qa/redux';
import { cancelFwQuestionAnswer } from '../../redux/qa/qaUserRedux';
import { clearUnsaveImagesFwQAMessage } from '../../redux/chatbox/chatDetailRedux';
import { getFwQuestionAnswerUserBlackBoxPage, createUserBlackBoxFwQuestionAnswer } from '../../redux/blackbox/blackboxUserRedux';
import { SelectAdapter_DmChuDeBlackbox_ByDoiTuong } from 'modules/mdTruyenThong/dmChuDeBlackbox/redux';
import { FormSelect, AdminModal, AdminPage, FormTextBox, renderDataTable, TableHead, TableCell, FormRichTextBoxV2, FormCheckbox } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import Pagination from '../../../../../view/component/Pagination';

class CreateQAModal extends AdminModal {
  onSubmit = () => {
    const chuDe = this.chuDe.value();
    const dmChuDe = this.loaiDmChuDe.value();
    const noiDung = this.noiDung.value();
    const incognito = this.incognito.value();

    if (dmChuDe == null) {
      T.notify('Loại chủ đề bị trống!', 'danger');
    } else if (chuDe.length == 0) {
      T.notify('Tên chủ đề bị trống!', 'danger');
    } else if (noiDung.length == 0) {
      T.notify('Nội dung bị trống!', 'danger');
    } else {
      this.props.create({ dmChuDe, chuDe, noiDung, incognito }, () => {
        this.loaiDmChuDe.value('');
        this.chuDe.value('');
        this.noiDung.value('');
        this.incognito.value(false);
        // this.imageMultiBox.clear();
      });
    }
  }

  clearImage = () => {
    // this.props.clearUnsaveImage();
  }

  render = () => {
    return this.renderModal({
      title: 'Tạo Hộp Thư Blackbox (Ẩn danh)',
      size: 'elarge',
      body: <div className='row'>
        {/* SelectAdapter_DmChuDeBlackbox_ByDoiTuong */}
        <FormCheckbox ref={e => this.incognito = e} className='col-12' label='Gửi ẩn danh' />
        <FormSelect ref={e => this.loaiDmChuDe = e} required={true} data={SelectAdapter_DmChuDeBlackbox_ByDoiTuong} label='Loại chủ đề' className='col-12' />
        <FormTextBox maxLength={160} ref={e => this.chuDe = e} type='text' className='col-12' required={true} label={'Chủ đề Hộp thư Blackbox'} />
        <FormRichTextBoxV2 maxLen={1600} rows={10} ref={e => this.noiDung = e} type='text' className='col-12' required={true} label={'Nội dung'} />
        {/* <FormImageMultiBox className='col-12' ref={e => this.imageMultiBox = e} label='Tải hình đính kèm tại đây' postUrl='/user/upload?category=ttLienHeUploadFile' uploadType='ttLienHeUploadFile' userData='ttLienHeUploadFile' maxImgNum={4} /> */}
      </div>
    });
  }
}

class FwQuestionAnswerUserBlackBoxPage extends AdminPage {
  state = { filter: {} };
  componentDidMount() {
    T.ready('/user/tt/lien-he/blackbox/home', () => {
      // T.onSearch = (searchText) => {};
      // T.showSearchBox();
      T.socket.on('fwBlackboxRefreshUser', () => { this.getPage(); });
      window.addEventListener('beforeunload', this.componentCleanup);
      this.getPage();
    });
  }

  componentCleanup = () => { // this will hold the cleanup code whatever you want to do when the component is unmounted or page refreshes
    this.createModal.clearImage();
  }

  componentWillUnmount() {
    T.socket.off('fwBlackboxRefreshUser');
    this.createModal.clearImage();
    window.removeEventListener('beforeunload', this.componentCleanup);
    super.componentWillUnmount();
  }

  showModal = (e) => {
    e.preventDefault();
    this.createModal.show();
  }

  getPage = (pageN, pageS, pageC, done) => {
    this.props.getFwQuestionAnswerUserBlackBoxPage(pageN, pageS, pageC, this.state.filter, done);
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
    const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.fwBlackboxUser && this.props.fwBlackboxUser.userBlackBoxPage ?
      this.props.fwBlackboxUser.userBlackBoxPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
    const table = list && list.length > 0 ? renderDataTable({
      data: list,
      stickyHead: false,
      renderHead: () => (
        <tr>
          <TableHead ref={e => this.ks_noiDung = e} style={{ width: '500px', whiteSpace: 'nowrap' }} content='Nội dung' onKeySearch={(ks) => this.handleKeySearch(ks)} keyCol='noiDung' />
          <TableHead ref={e => this.ks_tenChuDe = e} style={{ width: '200px', whiteSpace: 'nowrap' }} content='Chủ đề' onKeySearch={(ks) => this.handleKeySearch(ks)} keyCol='tenChuDe' />
          <th style={{ width: '150px', whiteSpace: 'nowrap' }}>Ngày tạo</th>
          <th style={{ width: '150px', whiteSpace: 'nowrap' }}>Ngày đóng</th>
          <th style={{ width: '150px', whiteSpace: 'nowrap' }}>Ngày phản hồi</th>
          <th style={{ width: '200px', whiteSpace: 'nowrap' }}>Trạng thái</th>
          <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
        </tr>
      ),
      renderRow: (item, index) => (
        <tr key={index}>
          <TableCell type='text' content={item.noiDung ? <Link to={`/user/tt/lien-he/box-detail/${item.id}`}>{item.noiDung}</Link> : ''} />
          <TableCell type='text' content={item.tenChuDe ? item.tenChuDe : ''} />
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
    }) : 'Bạn chưa tạo hộp thư blackbox nào!';

    return this.renderPage({
      icon: 'fa fa fa-graduation-cap',
      title: 'Hộp thư Blackbox của bạn',
      breadcrumb: [
        < Link key={0} to='/user' >Cá nhân</Link>,
        'Hộp thư Blackbox của bạn'
      ],
      backRoute: '/user',
      content: <div className='tile'>
        <div className='tile-title-w-btn' style={{ marginBottom: '5' }}>
          <div className='btn-group'>
            <Pagination style={{ position: '', marginBottom: '0' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition} getPage={this.getPage} pageRange={3} />
          </div>
        </div>
        <div>{table}</div>
        <CreateQAModal ref={(e) => this.createModal = e} create={this.props.createUserBlackBoxFwQuestionAnswer} clearUnsaveImage={this.props.clearUnsaveImagesFwQAMessage} />
      </div>,
      onCreate: userPermission && userPermission.login ? (e) => this.showModal(e) : null
    });
  }
}

const mapStateToProps = state => ({ system: state.system, fwBlackboxUser: state.lienHe.fwBlackboxUser });
const mapActionsToProps = { getFwQuestionAnswerUserBlackBoxPage, createUserBlackBoxFwQuestionAnswer, cancelFwQuestionAnswer, clearUnsaveImagesFwQAMessage, getDmChuDeFormSelect, updateDmChuDeDonVi };
export default connect(mapStateToProps, mapActionsToProps)(FwQuestionAnswerUserBlackBoxPage);