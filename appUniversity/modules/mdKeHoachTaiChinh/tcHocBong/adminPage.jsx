import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
// import { gettcHocBongPage } from 'modules/mdCongTacSinhVien/tcHocBong/redux/redux';
import { getPageTcDotHocBong } from './redux';
import Pagination from 'view/component/Pagination';

class TcHocBongAdminPage extends AdminPage {
    state = { filter: {}, sort: null }
    componentDidMount() {
        T.ready('/user/finance', () => {
            this.props.getPageTcDotHocBong();
        });
    }

    // getPage = (pageN, pageS, pageC, done) => {
    //     this.props.getPageTcDotHocBong(pageN, pageS, pageC, done);
    // }

    render() {
        const permission = this.getUserPermission('tcHocBong');
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.tcHocBong?.page || { pageNumber: 1, pageSize: 50, pageTotal: 0, totalItem: 0, list: null };
        return this.renderPage({
            title: 'Học bổng khuyến khích',
            icon: 'fa fa-star',
            content: <>
                <div className='tile'>
                    <div className='d-flex justify-content-between align-items-baseline'>
                        <h5>Danh sách đợt học bổng</h5>
                        <div><Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem }}
                            getPage={this.props.getPageTcDotHocBong} pageRange={5} /></div>
                    </div>
                    {renderTable({
                        emptyTable: 'Không tìm thấy đợt xét học bổng khuyến khích',
                        getDataSource: () => list,
                        header: 'thead-light',
                        stickyHead: list && list.length > 12 ? true : false,
                        renderHead: () => (
                            <tr>
                                <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                                <th style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }}>Tên đợt</th>
                                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Năm học</th>
                                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Học kỳ</th>
                                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                            </tr>),
                        renderRow: (item, index) => {
                            let indexOfItem = (pageNumber - 1) * pageSize + index + 1;
                            return (
                                <tr key={index}>
                                    <TableCell style={{ textAlign: 'center' }} content={indexOfItem} />
                                    <TableCell type='link' style={{ whiteSpace: 'nowrap' }} content={item.tenDot} onClick={(e) => e.preventDefault() || this.props.history.push({ pathname: `/user/finance/hoc-bong/detail/${item.id}` })} />
                                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.namHoc} />
                                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.hocKy} />
                                    <TableCell style={{ textAlign: 'center' }} type='buttons' content={item} permission={permission} onEdit={(e) => e.preventDefault() || this.props.history.push({ pathname: `/user/finance/hoc-bong/detail/${item.id}` })}>
                                    </TableCell>
                                </tr >
                            );
                        }
                    })}
                </div>
            </>,
            backroute: '/user/finance',
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, tcHocBong: state.finance.tcHocBong });

const mapDispatchToProps = { getPageTcDotHocBong };

export default connect(mapStateToProps, mapDispatchToProps)(TcHocBongAdminPage);