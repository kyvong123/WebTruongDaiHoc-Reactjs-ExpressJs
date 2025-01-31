import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getFwQuestionAnswerPage, acceptFwQuestionAnswer, getFwQuestionAnswerPhuTrachPage } from '../../redux/qa/qaCanBoRedux';
import { AdminPage, TableCell, renderDataTable, TableHead, FormTabs } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { Tooltip } from '@mui/material';

class FwQuestionAnswerPage extends AdminPage {
    state = { filter: {} };
    componentDidMount() {
        T.ready('/user/tt/lien-he', () => {
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.getPage();
            const user = this.props.system.user;
            if (user.isStaff) {
                T.socket.on('fwQaRefreshHopThuDen', () => { this.getPage(); });
                T.socket.on('fwQaRefreshPhuTrach', () => { this.getPage(); });
            }
        });
    }

    componentWillUnmount() {
        T.socket.off('fwQaRefreshHopThuDen');
        T.socket.off('fwQaRefreshPhuTrach');
        super.componentWillUnmount();
    }

    accept = (e, item) => {
        e.preventDefault();
        T.confirm('Nhận hộp thư', `Bạn có chắc bạn muốn nhận hộp thư ${item.noiDung ? `<b> ${item.noiDung}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.acceptFwQuestionAnswer(item.id);
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getFwQuestionAnswerPage(pageN, pageS, pageC, this.state.filter, done);
        this.props.getFwQuestionAnswerPhuTrachPage(pageN, pageS, pageC, done);
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

        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.fwQaCanBo && this.props.fwQaCanBo.page ?
            this.props.fwQaCanBo.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };

        const {
            pageNumber: phuTrachPageNumber,
            pageSize: phuTrachPageSize,
            pageTotal: phuTrachPageTotal,
            totalItem: phuTrachTotalItem,
            pageCondition: phuTrachPageCondition,
            list: phuTrachList
        } = this.props.fwQaCanBo && this.props.fwQaCanBo.phuTrachPage ? this.props.fwQaCanBo.phuTrachPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };


        const table = renderDataTable({
            data: list, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Người tạo</th>
                    <TableHead ref={e => this.ks_tenDonVi = e} style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Đơn vị phụ trách' onKeySearch={(ks) => this.handleKeySearch(ks)} keyCol='tenDonVi' />
                    <TableHead ref={e => this.ks_canBoPhuTrach = e} style={{ width: '150px', whiteSpace: 'nowrap' }} content='Cán bộ phụ trách' onKeySearch={(ks) => this.handleKeySearch(ks)} keyCol='canBoPhuTrach' />
                    <TableHead ref={e => this.ks_tenChuDe = e} style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Chủ đề' onKeySearch={(ks) => this.handleKeySearch(ks)} keyCol='tenChuDe' />
                    <TableHead ref={e => this.ks_noiDung = e} style={{ width: '200px', whiteSpace: 'nowrap' }} content='Hộp thư' onKeySearch={(ks) => this.handleKeySearch(ks)} keyCol='noiDung' />
                    <TableHead style={{ width: '400px', whiteSpace: 'nowrap' }} content='Câu hỏi' />
                    <TableHead style={{ width: '100px', whiteSpace: 'nowrap' }} content='Số điện thoại' />
                    <th style={{ width: '100px', whiteSpace: 'nowrap' }}>Ngày tạo</th>
                    <th style={{ width: '100px', whiteSpace: 'nowrap' }}>Ngày đóng</th>
                    <th style={{ width: '100px', whiteSpace: 'nowrap' }}>Ngày phản hồi</th>
                    <th style={{ width: '100px', whiteSpace: 'nowrap' }}>Trạng thái</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={item.maDoiTuong ? <p>{`${item.hoNguoiTao} ${item.tenNguoiTao}`}<br />({item.maDoiTuong})</p> : ''} />
                    <TableCell type='text' content={item.tenDonVi ? item.tenDonVi : ''} />
                    <TableCell type='text' content={item.maNguoiPhuTrach == null ? 'Chưa có cán bộ phụ trách' : <>
                        <span>{item.hoNguoiPhuTrach + ' ' + item.tenNguoiPhuTrach}</span><br />
                        <span>{item.maNguoiPhuTrach}</span>
                    </>
                    } />
                    <TableCell type='text' content={item.tenChuDe ? item.tenChuDe : ''} />
                    <TableCell type='text' content={item.noiDung ? item.noiDung : ''} />
                    <TableCell type='text' content={item.firstMessage ? item.firstMessage : ''} />
                    <TableCell type='text' content={item.phone ? item.phone : 'Chưa có'} />
                    <TableCell type='text' content={item.createdAt ? T.convertDate(item.createdAt) : 'Chưa có'} />
                    <TableCell type='text' content={item.closedAt ? T.convertDate(item.closedAt) : 'Chưa có'} />
                    <TableCell type='text' content={item.responsedAt ? T.convertDate(item.responsedAt) : 'Chưa có'} />
                    <TableCell type='text' content={item.isActive == 0 ? STATUS_MAPPER[0] : item.isAssigned == 1 ? STATUS_MAPPER[2] : item.isCancelled == 0 ? STATUS_MAPPER[1] : STATUS_MAPPER[3]} />
                    <TableCell type='buttons'>
                        {
                            item.isAssigned == 0 && item.isActive == 1 && item.isCancelled == 0 && < Tooltip title='Nhận phụ trách hộp thư này' arrow>
                                <button className='btn btn-primary' onClick={(e) => { this.accept(e, item); }}>
                                    <i className='fa-lg fa fa-envelope-open-o' />
                                </button>
                            </Tooltip>
                        }
                    </TableCell>
                </tr >
            )
        });

        let generalTab = <>
            <div className='tile'>{table}</div>
            <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                getPage={this.props.getFwQuestionAnswerPage} />
        </>;

        const phuTrachTable = renderDataTable({
            data: phuTrachList, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Người tạo</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Đơn vị phụ trách</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Loại chủ đề</th>
                    <th style={{ width: '70%', whiteSpace: 'nowrap' }}>Nội dung</th>
                    <TableHead style={{ width: '100px', whiteSpace: 'nowrap' }} content='Số điện thoại' />
                    <th style={{ width: '150px', whiteSpace: 'nowrap' }}>Ngày tạo</th>
                    <th style={{ width: '150px', whiteSpace: 'nowrap' }}>Ngày đóng</th>
                    <th style={{ width: '150px', whiteSpace: 'nowrap' }}>Ngày phản hồi</th>
                    <th style={{ width: '150px', whiteSpace: 'nowrap' }}>Trạng thái</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={item.maDoiTuong ? <p>{`${item.hoNguoiTao} ${item.tenNguoiTao}`}<br />({item.maDoiTuong})</p> : ''} />
                    <TableCell type='text' content={item.tenDonVi ? item.tenDonVi : ''} />
                    <TableCell type='text' content={item.tenChuDe ? item.tenChuDe : ''} />
                    <TableCell type='text' content={item.noiDung ? item.noiDung : ''} />
                    <TableCell type='text' content={item.phone ? item.phone : 'Chưa có'} />
                    <TableCell type='text' content={item.createdAt ? T.convertDate(item.createdAt) : 'Chưa có'} />
                    <TableCell type='text' content={item.closedAt ? T.convertDate(item.closedAt) : 'Chưa có'} />
                    <TableCell type='text' content={item.responsedAt ? T.convertDate(item.responsedAt) : 'Chưa có'} />
                    <TableCell type='text' content={item.isActive == 0 ? STATUS_MAPPER[0] : item.isAssigned == 1 ? STATUS_MAPPER[2] : item.isCancelled == 0 ? STATUS_MAPPER[1] : STATUS_MAPPER[3]} />
                    <TableCell type='buttons'>
                        <Tooltip title='Mở hộp thư này' arrow>
                            <button className='btn btn-secondary' onClick={() => {
                                this.props.history.push(`/user/tt/lien-he/box-detail/${item.id}`);
                            }}>
                                <i className='fa-lg fa fa-envelope-open-o' />
                            </button>
                        </Tooltip>
                    </TableCell>
                </tr>
            )
        });

        let phuTrachTab = <>
            <div className='tile'>{phuTrachTable}</div>
            <Pagination style={{ marginLeft: '70px' }} pageNumber={phuTrachPageNumber} pageSize={phuTrachPageSize} pageTotal={phuTrachPageTotal} totalItem={phuTrachTotalItem} pageCondition={phuTrachPageCondition}
                getPage={this.props.getFwQuestionAnswerPhuTrachPage} />
        </>;

        let tabs = [
            {
                title: 'Hộp thư Q&A đang chờ',
                component: generalTab
            },
            {
                title: 'Hộp thư Q&A do bạn phụ trách',
                component: phuTrachTab
            }
        ];

        return this.renderPage({
            icon: 'fa fa fa-graduation-cap',
            title: 'Trả lời Q&A',
            breadcrumb: [
                < Link key={0} to='/user/tt/lien-he' > Liên hệ</Link >,
                'Trả lời Q&A'
            ],
            content: <>
                <FormTabs tabs={tabs} />
            </>,
            backRoute: '/user/tt/lien-he',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, fwQaCanBo: state.lienHe.fwQaCanBo });
const mapActionsToProps = { getFwQuestionAnswerPage, acceptFwQuestionAnswer, getFwQuestionAnswerPhuTrachPage };
export default connect(mapStateToProps, mapActionsToProps)(FwQuestionAnswerPage);