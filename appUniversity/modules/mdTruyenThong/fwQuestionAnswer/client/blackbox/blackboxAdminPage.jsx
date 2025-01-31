import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { } from '../../redux/blackbox/blackboxAdminRedux';
import { AdminPage, TableCell, renderDataTable, FormTabs, TableHead, AdminModal, FormSelect } from 'view/component/AdminPage';
import { getFwQuestionAnswerBlackBoxAdminPage, assignBlackBoxFwQuestionAnswerAdmin, acceptBlackBoxFwQuestionAnswerAdmin } from '../../redux/blackbox/blackboxAdminRedux';
import { SelectAdapter_FwBlackbox_SearchCanBoTraLoi } from '../../redux/qa/redux';
import Pagination from 'view/component/Pagination';
import { Tooltip } from '@mui/material';

class AssignCanBoModal extends AdminModal {
    onShow = item => {
        let { id } = item;
        if (id) {
            this.setState({ id });
        } else {
            T.notify('Lỗi không lấy được mã của blackbox', 'danger');
        }
    }

    onSubmit = () => {
        const canBo = this.canBo.value();
        if (canBo == null) {
            T.notify('Vui lòng chọn cán bộ', 'danger');
        } else {
            this.props.update(this.state.id, canBo, () => {
                this.canBo.value('');
            });
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Chọn cán bộ phụ trách Blackbox này',
            size: 'elarge',
            body: <div className='row'>
                <FormSelect ref={e => this.canBo = e} required={true} data={SelectAdapter_FwBlackbox_SearchCanBoTraLoi} label='Cán bộ phụ trách Blackbox' className='col-12' />
            </div>
        });
    }
}

class FwQuestionAnswerBlackBoxAdminPage extends AdminPage {
    state = { filter: {} };
    componentDidMount() {
        T.ready('/user/tt/lien-he', () => {
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.getPage(1, 50, '');
            T.socket.on('fwBlackboxRefreshAdmin', () => this.getPage());
        });
    }

    componentWillUnmount() {
        T.socket.off('fwBlackboxRefreshAdmin');
        super.componentWillUnmount();
    }

    accept = (e, item) => {
        e.preventDefault();
        T.confirm('Nhận trả lời Blackbox', `Bạn có chắc bạn muốn nhận trả lời hộp thư Blackbox ${item.noiDung ? `<b> ${item.noiDung}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.acceptBlackBoxFwQuestionAnswerAdmin(item.id);
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getFwQuestionAnswerBlackBoxAdminPage(pageN, pageS, pageC, this.state.filter, done);
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    render() {
        const STATUS_MAPPER = {
            0: <span className='text-danger'><i className='fa fa-ban' /> Đã đóng</span>,
            1: <span className='text-warning'><i className='fa fa-exclamation-circle' /> Đang chờ</span>,
            2: <span className='text-success'><i className='fa fa-check-circle' /> Đã nhận</span>,
            3: <span className='text-danger'><i className='fa fa-ban' /> Đã hủy</span>,
        };

        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.fwBlackboxAdmin && this.props.fwBlackboxAdmin.blackBoxAdminPage ?
            this.props.fwBlackboxAdmin.blackBoxAdminPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };

        const table = list && list.length > 0 ? renderDataTable({
            data: list, stickyHead: false,
            renderHead: () => (
                <tr>
                    <TableHead ref={e => this.ks_canBoPhuTrach = e} style={{ width: '150px', whiteSpace: 'nowrap' }} content='Cán bộ phụ trách' onKeySearch={(ks) => this.handleKeySearch(ks)} keyCol='canBoPhuTrach' />
                    <TableHead ref={e => this.ks_tenChuDe = e} style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Chủ đề' onKeySearch={(ks) => this.handleKeySearch(ks)} keyCol='tenChuDe' />
                    <TableHead ref={e => this.ks_noiDung = e} style={{ width: '300px', whiteSpace: 'nowrap' }} content='Nội dung' onKeySearch={(ks) => this.handleKeySearch(ks)} keyCol='noiDung' />
                    <TableHead ref={e => this.ks_tenDonVi = e} style={{ width: '150px', whiteSpace: 'nowrap' }} content='Tên đơn vị' onKeySearch={(ks) => this.handleKeySearch(ks)} keyCol='tenDonVi' />
                    <th style={{ width: '150px', whiteSpace: 'nowrap' }}>Ngày tạo</th>
                    <th style={{ width: '150px', whiteSpace: 'nowrap' }}>Ngày đóng</th>
                    <th style={{ width: '150px', whiteSpace: 'nowrap' }}>Ngày phản hồi</th>
                    <th style={{ width: '150px', whiteSpace: 'nowrap' }}>Trạng thái</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={item.maNguoiPhuTrach == null ? 'Chưa có cán bộ phụ trách' : <>
                        <span>{item.hoNguoiPhuTrach + ' ' + item.tenNguoiPhuTrach}</span><br />
                        <span>{item.maNguoiPhuTrach}</span>
                    </>
                    } />
                    <TableCell type='text' content={item.tenChuDe ? item.tenChuDe : ''} />
                    <TableCell type='text' content={item.noiDung ? item.noiDung : (item.firstMessage ?? '')} />
                    <TableCell type='text' content={item.tenDonVi ? item.tenDonVi : ''} />
                    <TableCell type='text' content={item.createdAt ? T.convertDate(item.createdAt) : 'Chưa có'} />
                    <TableCell type='text' content={item.closedAt ? T.convertDate(item.closedAt) : 'Chưa có'} />
                    <TableCell type='text' content={item.responsedAt ? T.convertDate(item.responsedAt) : 'Chưa có'} />
                    <TableCell type='text' content={item.isActive == 0 ? STATUS_MAPPER[0] : item.isAssigned == 1 ? STATUS_MAPPER[2] : item.isCancelled == 0 ? STATUS_MAPPER[1] : STATUS_MAPPER[3]} />
                    <TableCell type='buttons'>
                        {
                            <>
                                {item.isAssigned == 0 && item.isActive == 1 && item.isCancelled == 0 && < Tooltip title='Nhận phụ trách hộp thư' arrow>
                                    <button className='btn btn-primary' onClick={(e) => this.accept(e, item)}>
                                        <i className='fa-lg fa fa-envelope-open-o' />
                                    </button>
                                </Tooltip>}
                                {item.isAssigned == 0 && item.isActive == 1 && item.isCancelled == 0 && < Tooltip title='Chọn cán bộ phụ trách hộp thư' arrow>
                                    <button className='btn btn-secondary' onClick={() => { this.modal.show(item); }}>
                                        <i className='fa-lg fa fa-envelope-open-o' />
                                    </button>
                                </Tooltip>}
                            </>
                        }
                    </TableCell>
                </tr >
            )
        }) : 'Chưa có hộp thư Blackbox đến!';

        let generalTab = <>
            <div className='tile'>{table}</div>
            <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                getPage={this.props.getFwQuestionAnswerBlackBoxAdminPage} />
        </>;

        let tabs = [
            {
                title: 'Blackbox đến',
                component: generalTab
            }
        ];

        return this.renderPage({
            icon: 'fa fa fa-graduation-cap',
            title: 'Quản lý Blackbox Admin',
            breadcrumb: [
                < Link key={0} to='/user/tt/lien-he' > Liên hệ</Link >,
                'Quản lý Blackbox Admin'
            ],
            content: <>
                <FormTabs tabs={tabs} />
                <AssignCanBoModal ref={(e) => this.modal = e} update={this.props.assignBlackBoxFwQuestionAnswerAdmin} />
            </>,
            backRoute: '/user/tt/lien-he',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, fwBlackboxAdmin: state.lienHe.fwBlackboxAdmin });
const mapActionsToProps = { getFwQuestionAnswerBlackBoxAdminPage, acceptBlackBoxFwQuestionAnswerAdmin, assignBlackBoxFwQuestionAnswerAdmin };
export default connect(mapStateToProps, mapActionsToProps)(FwQuestionAnswerBlackBoxAdminPage);