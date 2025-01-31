import React from 'react';
import { connect } from 'react-redux';
import { getTccbDanhGiaNamAll } from 'modules/mdTccb/tccbDanhGiaNam/redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';

class TccbDanhGiaPheDuyetDonViPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/tccb', () => {
            this.props.getTccbDanhGiaNamAll(items => this.setState({ items }));
        });
    }

    render() {
        const list = this.state?.items || [];
        let table = renderTable({
            emptyTable: 'Không có dữ liệu phê duyệt',
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right', verticalAlign: 'middle' }}>#</th>
                    <th style={{ width: '50%', textAlign: 'center', whiteSpace: 'nowrap' }}>Năm</th>
                    <th style={{ width: '50%', textAlign: 'center', whiteSpace: 'nowrap' }}>Thời hạn phê duyệt của đơn vị</th>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                    <TableCell type='link' url={`/user/tccb/danh-gia-phe-duyet-don-vi/${item.nam}`} style={{ textAlign: 'center' }} content={item.nam} />
                    <TableCell style={{ textAlign: 'center', color: `${Date.now() >= item.donViBatDauPheDuyet && Date.now() <= item.donViKetThucPheDuyet && 'green'}` }} content={item.donViBatDauPheDuyet ? `${T.dateToText(item.donViBatDauPheDuyet, 'dd/mm/yyyy HH:MM')} - ${T.dateToText(item.donViKetThucPheDuyet, 'dd/mm/yyyy HH:MM')}` : 'Chưa có thời hạn phê duyệt'} />
                    <TableCell style={{ textAlign: 'center' }} type='buttons'>
                        {
                            (Date.now() >= item.donViBatDauPheDuyet && Date.now() <= item.donViKetThucPheDuyet) ?
                                <Tooltip title='Phê duyệt' arrow>
                                    <button className='btn btn-success' onClick={() => this.props.history.push(`/user/tccb/danh-gia-phe-duyet-don-vi/${item.nam}`)}>
                                        <i className='fa fa-lg fa-info' />
                                    </button>
                                </Tooltip> :
                                <Tooltip title='Xem danh sách phê duyệt' arrow>
                                    <button className='btn btn-info' onClick={() => this.props.history.push(`/user/tccb/danh-gia-phe-duyet-don-vi/${item.nam}`)}>
                                        <i className='fa fa-lg fa-info' />
                                    </button>
                                </Tooltip>
                        }
                    </TableCell>
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-pencil',
            title: 'Đơn vị phê duyệt',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Đơn vị phê duyệt'
            ],
            content: <div className='tile'>{table}</div>,
            backRoute: '/user/tccb',
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getTccbDanhGiaNamAll };
export default connect(mapStateToProps, mapActionsToProps)(TccbDanhGiaPheDuyetDonViPage);