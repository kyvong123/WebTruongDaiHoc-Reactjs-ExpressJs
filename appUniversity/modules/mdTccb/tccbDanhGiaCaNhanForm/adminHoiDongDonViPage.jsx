import React from 'react';
import { connect } from 'react-redux';
import { getTccbDanhGiaNamAllByHoiDong } from 'modules/mdTccb/tccbDanhGiaNam/redux';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';

class AdminHoiDongDonViPage extends AdminPage {
    state = { items: [] };

    componentDidMount() {
        T.ready('/user/tccb', () => {
            this.props.getTccbDanhGiaNamAllByHoiDong(items => this.setState({ items }));
        });
    }

    render() {
        const table = renderTable({
            getDataSource: () => this.state.items,
            emptyTable: 'Bạn không nằm trong hội đồng đánh giá đơn vị nào',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                    <th style={{ width: '25%', textAlign: 'left', whiteSpace: 'nowrap' }}>Năm</th>
                    <th style={{ width: '75%', textAlign: 'center', whiteSpace: 'nowrap' }}>Thời gian hội đồng</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                    <TableCell content={item.nam} type='link' url={'/user/tccb/hoi-dong-danh-gia-don-vi/' + item.nam} />
                    <TableCell style={{ textAlign: 'center' }} content={
                        (item.donViBatDauDanhGia ? T.dateToText(new Date(item.donViBatDauDanhGia), 'dd/mm/yyyy HH:MM') : 'Chưa xác định') + ' - ' +
                        (item.donViKetThucDanhGia ? T.dateToText(new Date(item.donViKetThucDanhGia), 'dd/mm/yyyy HH:MM') : 'Chưa xác định')} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} onEdit={'/user/tccb/hoi-dong-danh-gia-don-vi/' + item.nam} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-gavel',
            title: 'Hội đồng đánh giá cấp đơn vị',
            content: <>
                <div className='tile'>{table}</div>
            </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionToProps = { getTccbDanhGiaNamAllByHoiDong };
export default connect(mapStateToProps, mapActionToProps)(AdminHoiDongDonViPage);