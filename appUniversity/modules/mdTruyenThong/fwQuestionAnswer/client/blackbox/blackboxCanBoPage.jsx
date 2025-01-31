import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getFwQuestionAnswerBlackBoxPage, getFwQuestionAnswerPhuTrachBlackBoxPage, acceptBlackBoxFwQuestionAnswerCanBo } from '../../redux/blackbox/blackboxCanBoRedux';
import { AdminPage, TableCell, renderDataTable, FormTabs, TableHead } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { Tooltip } from '@mui/material';

class FwQuestionAnswerBlackBoxPage extends AdminPage {
    state = { filter: {} };
    componentDidMount() {
        T.ready('/user/tt/lien-he', () => {
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.getPage(1, 50, '');
            T.socket.on('fwBlackboxRefreshHopThuDen', () => this.getPage());
            T.socket.on('fwBlackboxRefreshPhuTrach', () => this.getPage());
        });
    }

    componentWillUnmount() {
        T.socket.off('fwBlackboxRefreshHopThuDen');
        T.socket.off('fwBlackboxRefreshPhuTrach');
        super.componentWillUnmount();
    }

    accept = (item) => {
        T.confirm('Nhận trả lời Blackbox', `Bạn có chắc bạn muốn nhận trả lời hộp thư Blackbox ${item.noiDung ? `<b> ${item.noiDung}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.acceptBlackBoxFwQuestionAnswerCanBo(item.id);
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getFwQuestionAnswerBlackBoxPage(pageN, pageS, pageC, this.state.filter, done);
        this.props.getFwQuestionAnswerPhuTrachBlackBoxPage(pageN, pageS, pageC, this.state.filter, done);
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    render() {
        const devPermission = this.getUserPermission('developer', ['login']);

        const STATUS_MAPPER = {
            0: <span className='text-danger'><i className='fa fa-ban' /> Đã đóng</span>,
            1: <span className='text-warning'><i className='fa fa-exclamation-circle' /> Đang chờ</span>,
            2: <span className='text-success'><i className='fa fa-check-circle' /> Đã nhận</span>,
            3: <span className='text-danger'><i className='fa fa-ban' /> Đã hủy</span>,
        };

        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.fwBlackboxCanBo && this.props.fwBlackboxCanBo.blackBoxPage ?
            this.props.fwBlackboxCanBo.blackBoxPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };

        const { pageNumber: phuTrachPageNumber, pageSize: phuTrachPageSize, pageTotal: phuTrachPageTotal, totalItem: phuTrachTotalItem, pageCondition: phuTrachPageCondition, list: phuTrachList
        } = this.props.fwBlackboxCanBo && this.props.fwBlackboxCanBo.phuTrachBlackBoxPage ? this.props.fwBlackboxCanBo.phuTrachBlackBoxPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };


        const table = list && list.length > 0 ? renderDataTable({
            data: list, stickyHead: false,
            renderHead: () => (
                <tr>
                    {/* <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã cán bộ/MSSV</th> */}
                    {/* <TableHead ref={e => this.ks_tenDonVi = e} style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Đơn vị phụ trách' onKeySearch={(ks) => this.handleKeySearch(ks)} keyCol='tenDonVi' /> */}
                    <TableHead ref={e => this.ks_canBoPhuTrach = e} style={{ width: '30%', whiteSpace: 'nowrap' }} content='Cán bộ phụ trách' onKeySearch={(ks) => this.handleKeySearch(ks)} keyCol='canBoPhuTrach' />
                    <TableHead ref={e => this.ks_tenChuDe = e} style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Chủ đề' onKeySearch={(ks) => this.handleKeySearch(ks)} keyCol='tenChuDe' />
                    <TableHead ref={e => this.ks_noiDung = e} style={{ width: '60%', whiteSpace: 'nowrap' }} content='Nội dung' onKeySearch={(ks) => this.handleKeySearch(ks)} keyCol='noiDung' />
                    <th style={{ width: '150px', whiteSpace: 'nowrap' }}>Ngày tạo</th>
                    <th style={{ width: '150px', whiteSpace: 'nowrap' }}>Ngày đóng</th>
                    <th style={{ width: '150px', whiteSpace: 'nowrap' }}>Ngày phản hồi</th>
                    <th style={{ width: '150px', whiteSpace: 'nowrap' }}>Trạng thái</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    {/* <TableCell type='text' content={item.maDoiTuong ? item.maDoiTuong : ''} /> */}
                    {/* <TableCell type='text' content={item.tenDonVi ? item.tenDonVi : ''} /> */}
                    <TableCell type='text' content={item.maNguoiPhuTrach == null ? 'Chưa có cán bộ phụ trách' : <>
                        <span>{item.hoNguoiPhuTrach + ' ' + item.tenNguoiPhuTrach}</span><br />
                        <span>{item.maNguoiPhuTrach}</span>
                    </>
                    } />
                    <TableCell type='text' content={item.tenChuDe ? item.tenChuDe : ''} />
                    <TableCell type='text' content={item.noiDung ? item.noiDung : (item.firstMessage ?? '')} />
                    <TableCell type='text' content={item.createdAt ? T.convertDate(item.createdAt) : 'Chưa có'} />
                    <TableCell type='text' content={item.closedAt ? T.convertDate(item.closedAt) : 'Chưa có'} />
                    <TableCell type='text' content={item.responsedAt ? T.convertDate(item.responsedAt) : 'Chưa có'} />
                    <TableCell type='text' content={item.isActive == 0 ? STATUS_MAPPER[0] : item.isAssigned == 1 ? STATUS_MAPPER[2] : item.isCancelled == 0 ? STATUS_MAPPER[1] : STATUS_MAPPER[3]} />
                    <TableCell type='buttons'>
                        {
                            <>
                                {item.isAssigned == 0 && item.isActive == 1 && item.isCancelled == 0 && < Tooltip title='Nhận phụ trách hộp thư' arrow>
                                    <button className='btn btn-primary' onClick={() => this.accept(item)}>
                                        <i className='fa-lg fa fa-envelope-open-o' />
                                    </button>
                                </Tooltip>}
                                {devPermission.login && item.isAssigned == 0 && item.isActive == 1 && item.isCancelled == 0 && < Tooltip title='Chọn cán bộ phụ trách hộp thư' arrow>
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
                getPage={this.props.getFwQuestionAnswerBlackBoxPage} />
        </>;

        const phuTrachTable = phuTrachList && phuTrachList.length > 0 ? renderDataTable({
            data: phuTrachList, stickyHead: false,
            renderHead: () => (
                <tr>
                    {/* <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã cán bộ/MSSV</th> */}
                    {/* <TableHead ref={e => this.ks_tenDonVi = e} style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Đơn vị phụ trách' onKeySearch={(ks) => this.handleKeySearch(ks)} keyCol='tenDonVi' /> */}
                    <TableHead ref={e => this.ks_tenChuDe = e} style={{ width: '200px', whiteSpace: 'nowrap' }} content='Chủ đề' onKeySearch={(ks) => this.handleKeySearch(ks)} keyCol='tenChuDe' />
                    <TableHead ref={e => this.ks_noiDung = e} style={{ width: '400px', whiteSpace: 'nowrap' }} content='Nội dung' onKeySearch={(ks) => this.handleKeySearch(ks)} keyCol='noiDung' />
                    <TableHead ref={e => this.ks_canBoPhuTrach = e} style={{ width: '300px', whiteSpace: 'nowrap' }} content='Cán bộ phụ trách' onKeySearch={(ks) => this.handleKeySearch(ks)} keyCol='canBoPhuTrach' />
                    <th style={{ width: '150px', whiteSpace: 'nowrap' }}>Ngày tạo</th>
                    <th style={{ width: '150px', whiteSpace: 'nowrap' }}>Ngày đóng</th>
                    <th style={{ width: '150px', whiteSpace: 'nowrap' }}>Ngày phản hồi</th>
                    <th style={{ width: '200px', whiteSpace: 'nowrap' }}>Trạng thái</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    {/* <TableCell type='text' content={item.maDoiTuong ? item.maDoiTuong : ''} /> */}
                    {/* <TableCell type='text' content={item.tenDonVi ? item.tenDonVi : ''} /> */}
                    <TableCell type='text' content={item.tenChuDe ? item.tenChuDe : ''} />
                    <TableCell type='text' content={item.noiDung ? item.noiDung : (item.firstMessage ?? '')} />
                    <TableCell type='text' content={item.maNguoiPhuTrach == null ? 'Chưa có cán bộ phụ trách' : <>
                        <span>{item.hoNguoiPhuTrach + ' ' + item.tenNguoiPhuTrach}</span><br />
                        <span>{item.maNguoiPhuTrach}</span>
                    </>} />
                    <TableCell type='text' content={item.createdAt ? T.convertDate(item.createdAt) : 'Chưa có'} />
                    <TableCell type='text' content={item.closedAt ? T.convertDate(item.closedAt) : 'Chưa có'} />
                    <TableCell type='text' content={item.responsedAt ? T.convertDate(item.responsedAt) : 'Chưa có'} />
                    <TableCell type='text' content={item.isActive == 0 ? STATUS_MAPPER[0] : item.isAssigned == 1 ? STATUS_MAPPER[2] : item.isCancelled == 0 ? STATUS_MAPPER[1] : STATUS_MAPPER[3]} />
                    <TableCell type='buttons'>
                        {
                            item.isAssigned == 1 && item.isActive == 1 && item.isCancelled == 0 && < Tooltip title='Mở hộp thư này' arrow>
                                <button className='btn btn-secondary' onClick={() => {
                                    this.props.history.push(`/user/tt/lien-he/box-detail/${item.id}`);
                                }}>
                                    <i className='fa-lg fa fa-envelope-open-o' />
                                </button>
                            </Tooltip>
                        }
                    </TableCell>
                </tr >
            )
        }) : 'Chưa có blackbox nào được bạn nhận phụ trách!';

        let phuTrachTab = <>
            <div className='tile'>{phuTrachTable}</div>
            <Pagination style={{ marginLeft: '70px' }} pageNumber={phuTrachPageNumber} pageSize={phuTrachPageSize} pageTotal={phuTrachPageTotal} totalItem={phuTrachTotalItem} pageCondition={phuTrachPageCondition}
                getPage={this.props.getFwQuestionAnswerPhuTrachBlackBoxPage} />
        </>;

        let tabs = [
            {
                title: 'Blackbox đến',
                component: generalTab
            },
            {
                title: 'Blackbox bạn phụ trách',
                component: phuTrachTab
            }
        ];

        return this.renderPage({
            icon: 'fa fa fa-graduation-cap',
            title: 'Quản lý Blackbox đơn vị',
            breadcrumb: [
                < Link key={0} to='/user/tt/lien-he' > Liên hệ</Link >,
                'Quản lý Blackbox đơn vị'
            ],
            content: <>
                <FormTabs tabs={tabs} />
            </>,
            backRoute: '/user/tt/lien-he',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, fwBlackboxCanBo: state.lienHe.fwBlackboxCanBo });
const mapActionsToProps = { getFwQuestionAnswerBlackBoxPage, getFwQuestionAnswerPhuTrachBlackBoxPage, acceptBlackBoxFwQuestionAnswerCanBo };
export default connect(mapStateToProps, mapActionsToProps)(FwQuestionAnswerBlackBoxPage);