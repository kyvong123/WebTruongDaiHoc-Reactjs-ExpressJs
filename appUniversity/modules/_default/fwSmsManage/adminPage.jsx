import React from 'react';
import { connect } from 'react-redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';
import { getSmsManagePage, sendSms } from './redux';
import { Tooltip } from '@mui/material';


class SmsManagePage extends AdminPage {
    mapperStatus = {
        '1': <><span className='text-secondary font-weight-bold'> Đang gửi</span></>,
        '2': <><span className='text-success font-weight-bold'> Gửi thành công</span></>,
        '3': <><span className='text-danger font-weight-bold'> Gửi thất bại</span></>,
        '4': <><span className='text-warning font-weight-bold'> Đã gửi lại</span></>,
    }

    componentDidMount() {
        T.ready('/user/settings', () => {
            this.getPage();
        });
    }

    getPage = (pageN, pageS, done) => {
        this.props.getSmsManagePage(pageN, pageS, done);
    }

    render() {
        const { pageNumber, pageSize, list, pageTotal, totalItem } = this.props.smsManage && this.props.smsManage.page ?
            this.props.smsManage.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        const table = renderTable({
            emptyTable: 'Chưa có dữ liệu hướng dẫn sử dụng',
            getDataSource: () => list,
            stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }} >#</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} >Ngày gửi</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} >Người gửi</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} >SĐT người nhận</th>
                    <th style={{ width: '100%', textAlign: 'center', whiteSpace: 'nowrap' }} >Nội dung</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} >Trạng thái</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} >Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => {
                return (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={T.dateToText(item.timeSent, 'HH:MM dd/mm/yy')} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.sender} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.receiver} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.content} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={this.mapperStatus[item.status]} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item}>
                            <Tooltip title='Gửi lại SMS' arrow>
                                <span><button disabled={item.status != '3'} className='btn btn-warning' onClick={(e) => e.preventDefault() || this.props.sendSms(item)}>
                                    <i className='fa fa-lg fa-envelope' />
                                </button></span>
                            </Tooltip>
                        </TableCell>
                    </tr>
                );
            }
        });

        return this.renderPage({
            title: 'Quản lý SMS',
            icon: 'fa fa-commenting',
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem }} getPage={this.getPage} />
            </>,
            backRoute: '/user/settings'
        });
    }
}

const mapStateToProps = state => ({ system: state.system, smsManage: state.framework.smsManage });
const mapActionsToProps = { getSmsManagePage, sendSms };
export default connect(mapStateToProps, mapActionsToProps)(SmsManagePage);
