import React from 'react';
import { connect } from 'react-redux';
import { getTccbDanhGiaNamAll } from 'modules/mdTccb/tccbDanhGiaNam/redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';

class TccbDanhGiaCaNhanFormAdminPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/tccb', () => {
            this.props.getTccbDanhGiaNamAll(items => this.setState({ items }));
        });
    }

    render() {
        const list = this.state?.items || [];
        let table = renderTable({
            emptyTable: 'Không có dữ liệu năm',
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right', verticalAlign: 'middle' }}>#</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Năm</th>
                    <th style={{ width: '40%', textAlign: 'center', whiteSpace: 'nowrap' }}>Thời hạn phân công</th>
                    <th style={{ width: '40%', textAlign: 'center', whiteSpace: 'nowrap' }}>Thời hạn đánh giá</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                    <TableCell type='link' url={`/user/tccb/danh-gia-ca-nhan-form/${item.nam}`} style={{ textAlign: 'center' }} content={item.nam} />
                    <TableCell style={{ textAlign: 'center', color: `${Date.now() >= item.donViBatDauPhanCongChuyenVien && Date.now() <= item.donViKetThucPhanCongChuyenVien && 'green'}` }} content={item.donViBatDauPhanCongChuyenVien ? `${T.dateToText(item.donViBatDauPhanCongChuyenVien, 'dd/mm/yyyy HH:MM')} - ${T.dateToText(item.donViBatDauPhanCongChuyenVien, 'dd/mm/yyyy HH:MM')}` : 'Chưa có thời hạn phân công'} />
                    <TableCell style={{ textAlign: 'center', color: `${Date.now() >= item.donViBatDauDanhGia && Date.now() <= item.donViKetThucDanhGia && 'green'}` }} content={item.donViBatDauDanhGia ? `${T.dateToText(item.donViBatDauDanhGia, 'dd/mm/yyyy HH:MM')} - ${T.dateToText(item.donViKetThucDanhGia, 'dd/mm/yyyy HH:MM')}` : 'Chưa có thời hạn phân công'} />
                    <TableCell style={{ textAlign: 'center' }} type='buttons' content={item}>
                        <Tooltip title='Xem thông tin phân công' arrow>
                            <button className='btn btn-info' onClick={() => this.props.history.push(`/user/tccb/danh-gia-ca-nhan-form/${item.nam}`)}>
                                <i className='fa fa-lg fa-info' />
                            </button>
                        </Tooltip>
                    </TableCell>
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-pencil',
            title: 'Đơn vị đánh giá cá nhân',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Đơn vị đánh giá cá nhân'
            ],
            content: <div className='tile'>{table}</div>,
            backRoute: '/user/tccb',
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getTccbDanhGiaNamAll };
export default connect(mapStateToProps, mapActionsToProps)(TccbDanhGiaCaNhanFormAdminPage);