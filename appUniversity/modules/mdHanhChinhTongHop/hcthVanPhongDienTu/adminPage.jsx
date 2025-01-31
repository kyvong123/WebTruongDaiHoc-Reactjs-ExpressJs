import { Tooltip } from '@mui/material';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import { getList, seenUpdate } from './redux';
class PendingPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/van-phong-dien-tu', () => {
            this.getData();
        });
    }

    getData = () => {
        this.setState({ items: null }, () => {
            this.props.getList((items) => {
                this.setState({ items });
            });
        });
    }


    updateSeen = (item) => {
        this.props.seenUpdate(item.id, { seen: item.seen, loai: item.loai }, this.getData);
    }


    render() {

        const table = renderTable({
            getDataSource: () => this.state.items,
            emptyTable: 'Bạn hiện chưa có danh sách văn bản cần xử lý',
            header: 'thead-light',
            renderHead: () => <tr>
                <th style={{ width: 'auto', textAlign: 'center' }}></th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Loại văn bản</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số văn bản</th>
                <th style={{ width: '100%', }}>Trích yếu</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Đơn vị gửi</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>,
            renderRow: (item, index) => {
                return <tr key={index + 1} className={item.seen ? '' : 'font-weight-bold'} style={item.mauDoKhanVanBan ? { background: item.mauDoKhanVanBan } : {}}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={<div><a target='_blank' rel="noreferer noopener noreferrer" href={item.loai == 'DI' ? `/user/van-ban-di/${item.id}` : `/user/van-ban-den/${item.id}`}>{item.soVanBan || 'Văn bản chưa có số'}{item.loai == 'DEN' ? item.daChiDao ? <p>(Đã chỉ đạo)</p> : <p>(Chưa chỉ đạo)</p> : null}</a></div>} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.loai == 'DI' ? 'Văn bản đi' : 'Văn bản đến'} />
                    <TableCell style={{ minWidth: '500px' }} content={<div style={{ display: 'inline-block' }}>
                        {item.isUrgent ? <div className='blinking badge badge-pill badge-danger m-0'><h6 className='m-0 p-0'>(Gấp) </h6></div> : null}&nbsp;
                        {item.doKhanVanBan && item.doKhanVanBan != 'THUONG' ? <div className='blinking badge badge-pill badge-danger m-0'><h6 className='m-0 p-0'>({item.tenDoKhanVanBan}) </h6></div> : null}&nbsp;
                        {item.trichYeu || ''}
                    </div>} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.donViGui} />
                    <TableCell type='buttons'>
                        {item.seen == 1 && <Tooltip arrow title='Đánh dấu chưa đọc'>
                            <button className='btn btn-danger' onClick={(e) => e.preventDefault() || this.updateSeen(item)}>
                                <i className='fa fa-envelope' />
                            </button>
                        </Tooltip>}
                        {item.seen == 0 && <Tooltip arrow title='Đánh dấu đã đọc'>
                            <button className='btn btn-success' onClick={(e) => e.preventDefault() || this.updateSeen(item)}>
                                <i className='fa fa-envelope-open' />
                            </button>
                        </Tooltip>}
                    </TableCell>
                </tr>;
            }
        });

        return this.renderPage({
            title: 'Văn bản chờ xử lý',
            icon: 'fa fa-check-square',
            content: <div className="tile">
                <div className="tile-body row">
                    <div className="col-md-12">
                        {table}
                    </div>
                </div>
            </div>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionToProps = { getList, seenUpdate };
export default connect(mapStateToProps, mapActionToProps)(PendingPage);